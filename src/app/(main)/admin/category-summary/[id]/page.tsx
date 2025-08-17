'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import BackButton from '@/app/components/BackButton';
import PublicChecklistDetail from '@/app/components/PublicChecklistDetail';
import { Status } from '@/types/enum';
import CategoryCompletionOverview from '@/app/components/CategoryCompletionOverview';

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

export default function AdminCategorySummaryDetailPage() {
  const [categorySummary, setCategorySummary] =
    useState<CategorySummary | null>(null);
  const [fetchedChecklistDetails, setFetchedChecklistDetails] = useState<
    UserChecklist[]
  >([]);
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

        const categoryResponse = await fetch(
          `/api/admin/category-summary/${id}`,
        );
        if (!categoryResponse.ok) {
          if (categoryResponse.status === 404) {
            notFound();
          } else {
            throw new Error(
              `Failed to fetch category summary detail data: ${categoryResponse.statusText}`,
            );
          }
        }
        const categoryData: CategorySummary =
          await categoryResponse.json();
        setCategorySummary(categoryData);

        const checklistDetailsPromises = categoryData.items.map(
          async (item) => {
            const checklistResponse = await fetch(
              `/api/public-checklists/${item._id}`,
            );
            if (!checklistResponse.ok) {
              console.error(
                `Failed to fetch checklist ${item._id}:`,
                checklistResponse.statusText,
              );
              return null;
            }
            return checklistResponse.json();
          },
        );

        const allChecklistDetails = await Promise.all(checklistDetailsPromises);
        setFetchedChecklistDetails(
          allChecklistDetails.filter(Boolean) as UserChecklist[],
        );
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

  if (!categorySummary || fetchedChecklistDetails.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 lg:p-12 max-w-7xl mx-auto mt-4 relative">
          <div className="absolute top-4 left-4">
            <BackButton />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight pt-8">
            {categorySummary?.title || 'Category Summary'}
          </h1>
          <p className="text-lg text-gray-600">
            No checklist summaries available for this category or failed to load
            checklist details.
          </p>
        </div>
      </div>
    );
  }

  const overallCompletionPercentage =
    categorySummary.totalChecklistsCount > 0
      ? (categorySummary.checklistsCompletedCount /
          categorySummary.totalChecklistsCount) *
        100
      : 0;

  const handlePrevious = () => {
    setCurrentChecklistIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentChecklistIndex((prevIndex) =>
      Math.min(fetchedChecklistDetails.length - 1, prevIndex + 1),
    );
  };

  const currentChecklist = fetchedChecklistDetails[currentChecklistIndex];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 lg:p-12 max-w-7xl mx-auto mt-4 relative">
        <div className="absolute top-4 left-4">
          <BackButton />
        </div>
        <div className="border-b border-gray-200 pb-6 mb-8 lg:hidden pt-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {categorySummary.title}
          </h1>
          {categorySummary.description && (
            <p className="mt-2 text-lg text-gray-600">
              {categorySummary.description}
            </p>
          )}
        </div>
        <div className="lg:flex lg:space-x-8 lg:items-start lg:pt-8">
          <CategoryCompletionOverview
            title={categorySummary.title}
            description={categorySummary.description}
            overallCompletionPercentage={overallCompletionPercentage}
            checklistsCompletedCount={categorySummary.checklistsCompletedCount}
            totalChecklistsCount={categorySummary.totalChecklistsCount}
            userName={currentChecklist?.user?.name || ''}
            taskCode={currentChecklist?.taskCode || ''}
          />
          <div className="lg:w-2/3 lg:border-l lg:border-gray-200 lg:pl-8 lg:pt-0">
            {currentChecklist && currentChecklist.commitMessage && (
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                  Commit Message
                </h3>
                <p className="text-base font-semibold text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">
                  {currentChecklist.commitMessage}
                </p>
              </div>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">
              Checklist Details
            </h3>
            {fetchedChecklistDetails.length > 0 ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                  <button
                    onClick={handlePrevious}
                    disabled={currentChecklistIndex === 0}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Previous
                  </button>
                  <span className="text-base font-semibold text-gray-700">
                    Checklist {currentChecklistIndex + 1} of{' '}
                    {fetchedChecklistDetails.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={
                      currentChecklistIndex ===
                      fetchedChecklistDetails.length - 1
                    }
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                    <svg
                      className="-mr-1 ml-2 h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 010-1.06L10.94 10 7.21 6.29a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="space-y-8">
                  {currentChecklist && (
                    <PublicChecklistDetail
                      key={currentChecklist._id}
                      checklist={currentChecklist}
                    />
                  )}
                </div>
              </>
            ) : (
              <p className="text-lg text-gray-500">
                No checklist summaries available for this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}