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
            userName={fetchedChecklistDetails[0]?.user?.name || ''}
            taskCode={fetchedChecklistDetails[0]?.taskCode || ''}
          />
          <div className="lg:w-2/3 lg:border-l lg:border-gray-200 lg:pl-8 lg:pt-0">
            {fetchedChecklistDetails[0] && fetchedChecklistDetails[0].commitMessage && (
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                  Commit Message
                </h3>
                <p className="text-base font-semibold text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">
                  {fetchedChecklistDetails[0].commitMessage}
                </p>
              </div>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">
              Checklist Details
            </h3>
            {fetchedChecklistDetails.length > 0 ? (
              <div className="space-y-8">
                {fetchedChecklistDetails.map((checklist) => (
                  <PublicChecklistDetail
                    key={checklist._id}
                    checklist={checklist}
                  />
                ))}
              </div>
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