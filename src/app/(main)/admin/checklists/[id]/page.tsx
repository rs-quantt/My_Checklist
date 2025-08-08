'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import BackButton from '@/app/components/BackButton';

// Define the types directly in the file
interface ChecklistItem {
  _key: string;
  title: string;
  isCompleted: boolean;
  status: 'done' | 'incomplete' | 'na'; // status is non-optional
  note?: string;
}

interface UserChecklist {
  _id: string;
  taskCode: string;
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

// Helper to determine badge color based on status
const getStatusBadgeColor = (status: 'done' | 'incomplete' | 'na') => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'incomplete':
      return 'bg-yellow-100 text-yellow-800';
    case 'na':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ChecklistDetailPage() {
  const [checklist, setChecklist] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchChecklist = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/checklists/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          } else {
            throw new Error('Failed to fetch checklist data');
          }
        }
        const data = await response.json();
        setChecklist(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading Checklist..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl py-10">
        Error: {error}
      </div>
    );
  }

  if (!checklist) {
    return null; // Should be handled by notFound() in fetch logic
  }

  const { items } = checklist.checklist;
  const totalItems = items.length;

  const statusCounts = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<'done' | 'incomplete' | 'na', number>,
  );

  const doneCount = statusCounts.done || 0;
  const incompleteCount = statusCounts.incomplete || 0;
  const naCount = statusCounts.na || 0;

  const donePercentage = totalItems > 0 ? (doneCount / totalItems) * 100 : 0;
  const incompletePercentage = totalItems > 0 ? (incompleteCount / totalItems) * 100 : 0;
  const naPercentage = totalItems > 0 ? (naCount / totalItems) * 100 : 0;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <BackButton />
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {checklist.checklist.title}
          </h1>
          <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">User:</span> {checklist.user.name}
            </p>
            <p>
              <span className="font-semibold">Task Code:</span> {checklist.taskCode}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Completion Status
          </h2>
          {totalItems > 0 ? (
            <>
              <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                <div
                  className="bg-green-500 h-6"
                  style={{ width: `${donePercentage}%` }}
                  title={`Done: ${donePercentage.toFixed(1)}%`}
                />
                <div
                  className="bg-yellow-500 h-6"
                  style={{ width: `${incompletePercentage}%` }}
                   title={`Incomplete: ${incompletePercentage.toFixed(1)}%`}
                />
                <div
                  className="bg-gray-400 h-6"
                  style={{ width: `${naPercentage}%` }}
                   title={`N/A: ${naPercentage.toFixed(1)}%`}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                   <span>Done ({doneCount}): {donePercentage.toFixed(1)}%</span>
                 </div>
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                   <span>Incomplete ({incompleteCount}): {incompletePercentage.toFixed(1)}%</span>
                 </div>
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                   <span>N/A ({naCount}): {naPercentage.toFixed(1)}%</span>
                 </div>
              </div>
            </>
          ) : (
             <p className="text-gray-500">No items in this checklist.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Checklist Items
          </h2>
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li
                key={item._key || index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="flex-grow text-gray-800 font-medium">
                    {item.title}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                      item.status,
                    )}`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>
                {item.note && (
                  <div className="mt-2 pl-4 border-l-4 border-gray-300">
                    <p className="text-sm text-gray-600 italic">
                      <span className="font-semibold">Note:</span> {item.note}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
