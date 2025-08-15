'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import BackButton from '@/app/components/BackButton';
import PublicChecklistDetail from '@/app/components/PublicChecklistDetail'; // Re-use this component
import { MyCategorySummaryDetail } from '@/services/categoryService'; // Import MyCategorySummaryDetail
import { Status } from '@/types/enum';

// Define the types directly in the file (copied from PublicChecklistDetail if needed, or import if available)
interface ChecklistSummaryItem {
  _id: string;
  title: string;
  passedItems: number;
  totalItems: number;
}

interface ChecklistItem {
  _key: string;
  title: string;
  isCompleted: boolean;
  status: Status; // status is non-optional
  note?: string;
}

interface UserChecklist {
  _id: string;
  taskCode: string;
  commitMessage?: string;
  user: {
    _id: string;
    name: string;
  };
  checklist: {
    _id: string;
    title: string;
    items: ChecklistItem[];
  };
}

export default function AdminCategorySummaryDetailPage() {
  const [categorySummaryDetail, setCategorySummaryDetail] = useState<MyCategorySummaryDetail | null>(null);
  const [fetchedChecklistDetails, setFetchedChecklistDetails] = useState<UserChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChecklistIndex, setCurrentChecklistIndex] = useState(0);
  const params = useParams();
  const id = params.id as string; // This 'id' is the _id of a specific categorySummary document

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch MyCategorySummaryDetail (which now works for any id if fetched by admin)
        const categoryResponse = await fetch(`/api/admin/category-summary/${id}`);
        if (!categoryResponse.ok) {
          if (categoryResponse.status === 404) {
            notFound();
          } else {
            throw new Error(`Failed to fetch category summary detail data: ${categoryResponse.statusText}`);
          }
        }
        const categoryData: MyCategorySummaryDetail = await categoryResponse.json();
        setCategorySummaryDetail(categoryData);

        // 2. Fetch details for each checklist item in this specific category summary
        // We need to fetch each checklist detail using its _id from categoryData.items
        const checklistDetailsPromises = categoryData.items.map(async (item) => {
          // Assuming a public-checklists/[id] API route exists and returns UserChecklist structure
          const checklistResponse = await fetch(`/api/public-checklists/${item._id}`);
          if (!checklistResponse.ok) {
            console.error(`Failed to fetch checklist ${item._id}:`, checklistResponse.statusText);
            return null; 
          }
          return checklistResponse.json();
        });

        const allChecklistDetails = await Promise.all(checklistDetailsPromises);
        setFetchedChecklistDetails(allChecklistDetails.filter(Boolean) as UserChecklist[]);
        setCurrentChecklistIndex(0);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading Category Summary and Checklists..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl py-10">
        Error: {error}
      </div>
    );
  }

  if (!categorySummaryDetail || fetchedChecklistDetails.length === 0) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <BackButton />
        <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {categorySummaryDetail?.title || 'Category Summary'}
          </h1>
          <p className="text-gray-500">No checklist summaries available for this category or failed to load checklist details.</p>
        </div>
      </div>
    );
  }

  const overallCompletionPercentage = categorySummaryDetail.totalChecklistsCount > 0
    ? (categorySummaryDetail.checklistsCompletedCount / categorySummaryDetail.totalChecklistsCount) * 100
    : 0;

  const handlePrevious = () => {
    setCurrentChecklistIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentChecklistIndex((prevIndex) => Math.min(fetchedChecklistDetails.length - 1, prevIndex + 1));
  };

  const currentChecklist = fetchedChecklistDetails[currentChecklistIndex];

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <BackButton />
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {categorySummaryDetail.title}
          </h1>
          {categorySummaryDetail.description && (
            <p className="mt-2 text-gray-600">{categorySummaryDetail.description}</p>
          )}
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Overall Completion
            </h2>
            {categorySummaryDetail.totalChecklistsCount > 0 ? (
              <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                <div
                  className="bg-green-500 h-6"
                  style={{ width: `${overallCompletionPercentage}%` }}
                  title={`Completed: ${overallCompletionPercentage.toFixed(1)}%`}
                />
              </div>
            ) : (
              <p className="text-gray-500">No checklists in this category.</p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              {categorySummaryDetail.checklistsCompletedCount} of {categorySummaryDetail.totalChecklistsCount} checklists completed.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Checklist Details
          </h2>
          {fetchedChecklistDetails.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentChecklistIndex === 0}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  {currentChecklistIndex + 1} / {fetchedChecklistDetails.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentChecklistIndex === fetchedChecklistDetails.length - 1}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="space-y-8">
                {currentChecklist && (
                  <PublicChecklistDetail key={currentChecklist._id} checklist={currentChecklist} />
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">No checklist summaries available for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
