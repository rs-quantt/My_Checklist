'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import BackButton from '@/app/components/BackButton';
import PublicChecklistDetail from '@/app/components/PublicChecklistDetail';
import { Status } from '@/types/enum';

interface ChecklistSummaryItem {
  _id: string;
  title: string;
  passedItems: number;
  totalItems: number;
}

// Define the types directly in the file (copied from PublicChecklistDetail)
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

interface CategorySummary {
  _id: string;
  title: string;
  description?: string;
  slug: {
    current: string;
  };
  items: ChecklistSummaryItem[];
  checklistsCompletedCount: number;
  totalChecklistsCount: number;
}

export default function MyCategorySummaryDetailPage() {
  const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
  const [fetchedChecklistDetails, setFetchedChecklistDetails] = useState<UserChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChecklistIndex, setCurrentChecklistIndex] = useState(0);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Category Summary
        const categoryResponse = await fetch(`/api/my-category-summary/${id}`);
        if (!categoryResponse.ok) {
          if (categoryResponse.status === 404) {
            notFound();
          } else {
            throw new Error('Failed to fetch category summary data');
          }
        }
        const categoryData: CategorySummary = await categoryResponse.json();
        setCategorySummary(categoryData);

        // 2. Fetch details for each checklist item
        const checklistDetailsPromises = categoryData.items.map(async (item) => {
          const checklistResponse = await fetch(`/api/public-checklists/${item._id}`);
          if (!checklistResponse.ok) {
            // Log error but don't block the whole page if one checklist fails
            console.error(`Failed to fetch checklist ${item._id}:`, checklistResponse.statusText);
            return null; // Return null for failed fetches
          }
          return checklistResponse.json();
        });

        const allChecklistDetails = await Promise.all(checklistDetailsPromises);
        // Filter out any nulls from failed fetches
        setFetchedChecklistDetails(allChecklistDetails.filter(Boolean) as UserChecklist[]);

        setCurrentChecklistIndex(0); // Reset index when new data is loaded
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

  if (!categorySummary || fetchedChecklistDetails.length === 0) {
    // This condition handles cases where categorySummary is null or no checklists were fetched successfully
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <BackButton />
        <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {categorySummary?.title || 'Category Summary'}
          </h1>
          <p className="text-gray-500">No checklist summaries available for this category or failed to load checklist details.</p>
        </div>
      </div>
    );
  }

  const overallCompletionPercentage = categorySummary.totalChecklistsCount > 0
    ? (categorySummary.checklistsCompletedCount / categorySummary.totalChecklistsCount) * 100
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
            {categorySummary.title}
          </h1>
          {categorySummary.description && (
            <p className="mt-2 text-gray-600">{categorySummary.description}</p>
          )}
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Overall Completion
            </h2>
            {categorySummary.totalChecklistsCount > 0 ? (
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
              {categorySummary.checklistsCompletedCount} of {categorySummary.totalChecklistsCount} checklists completed.
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
