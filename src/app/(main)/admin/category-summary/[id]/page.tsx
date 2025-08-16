'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import BackButton from '@/app/components/BackButton';
import PublicChecklistDetail from '@/app/components/PublicChecklistDetail';
import CategoryCompletionOverview from '@/app/components/CategoryCompletionOverview'; // Import the new component
import { MyCategorySummaryDetail } from '@/services/categoryService';
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
  status: Status;
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
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

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

        const checklistDetailsPromises = categoryData.items.map(async (item) => {
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

  if (!categorySummaryDetail) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <BackButton />
        <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Category Summary
          </h1>
          <p className="text-gray-500">No category summary data available.</p>
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
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <BackButton />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Completion Overview */}
        <div className="lg:col-span-1">
          <CategoryCompletionOverview
            title={categorySummaryDetail.title}
            description={categorySummaryDetail.description}
            overallCompletionPercentage={overallCompletionPercentage}
            checklistsCompletedCount={categorySummaryDetail.checklistsCompletedCount}
            totalChecklistsCount={categorySummaryDetail.totalChecklistsCount}
          />
        </div>

        {/* Checklist Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Checklist Details</h2>

          {fetchedChecklistDetails.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4 p-3 border border-gray-100 rounded-md bg-gray-50">
                <button
                  onClick={handlePrevious}
                  disabled={currentChecklistIndex === 0}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150" 
                >
                  Previous
                </button>
                <span className="text-md font-medium text-gray-700">
                  {currentChecklistIndex + 1} / {fetchedChecklistDetails.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentChecklistIndex === fetchedChecklistDetails.length - 1}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150" 
                >
                  Next
                </button>
              </div>
              <div className="space-y-6">
                {currentChecklist && (
                  <PublicChecklistDetail key={currentChecklist._id} checklist={currentChecklist} />
                )}
              </div>
            </>
          ) : (
            <p className="text-md text-gray-500 text-center p-3 rounded-md bg-gray-50/10">No checklists available for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
