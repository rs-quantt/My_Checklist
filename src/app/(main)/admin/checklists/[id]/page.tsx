'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import BackButton from '@/app/components/BackButton';
import PublicChecklistDetail from '@/app/components/PublicChecklistDetail';
import { Status } from '@/types/enum';

// Define the types needed for UserChecklist, copied from PublicChecklistDetail for clarity
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

export default function AdminChecklistDetailPage() {
  const [checklistDetail, setChecklistDetail] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchChecklistDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/checklists/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          } else {
            throw new Error(`Failed to fetch checklist details: ${response.statusText}`);
          }
        }

        const data: UserChecklist = await response.json();
        setChecklistDetail(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklistDetail();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading checklist details..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl py-10">
        Error: {error}
      </div>
    );
  }

  if (!checklistDetail) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <BackButton />
        <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Checklist Not Found
          </h1>
          <p className="text-gray-500">The requested checklist could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <BackButton />
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checklist Details</h1>
        <PublicChecklistDetail checklist={checklistDetail} />
      </div>
    </div>
  );
}
