'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar'; // Import AdminSidebar
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface User {
  _id: string;
  name: string;
}

interface Summary {
  _id: string;
  taskCode: string;
  totalItems: number;
  passedItems: number;
  user: User;
}

interface GroupedChecklistSummary {
  _id: string;
  title: string;
  summaries: Summary[];
}

export default function ChecklistsSummaryPage() {
  const [groupedSummaries, setGroupedSummaries] = useState<
    GroupedChecklistSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch('/api/checklists-summary');
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.statusText}`);
        }
        const data: GroupedChecklistSummary[] = await res.json();
        setGroupedSummaries(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '');
        console.error('Error fetching checklist summaries:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, []); // Empty dependency array means this effect runs once on mount

  if (isLoading) {
    return <LoadingSpinner text="Đang tải dữ liệu tóm tắt checklist..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl py-10">Lỗi: {error}</div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Quản lý Checklist
        </h1>

        {groupedSummaries.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-10">
            Không có dữ liệu tóm tắt checklist nào.
          </div>
        ) : (
          <div className="space-y-8">
            {groupedSummaries.map((checklistGroup) => (
              <div
                key={checklistGroup._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  Checklist: {checklistGroup.title}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Developer
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Mã Task
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tổng mục
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Mục OK
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tỷ lệ hoàn thành (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {checklistGroup.summaries.map((summary) => (
                        <tr key={summary._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {summary.user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {summary.taskCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {summary.totalItems}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {summary.passedItems}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {summary.totalItems > 0
                              ? (
                                  (summary.passedItems / summary.totalItems) *
                                  100
                                ).toFixed(2)
                              : 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
