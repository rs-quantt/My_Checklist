'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicChecklistDetail from '@/app/components/PublicChecklistDetail';
import { getChecklistSummaryById } from '@/services/checklistService';
import InlineLoadingSpinner from '@/app/components/InlineLoadingSpinner';
import { PortableTextBlock } from '@portabletext/types';
import { Status } from '@/types/enum'; // Import Status enum

interface ChecklistItem {
  _key: string;
  title: string;
  isCompleted: boolean;
  status: Status; // Changed to Status enum
  note?: string;
  description?: PortableTextBlock[];
  priority?: string;
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

export default function PublicChecklistsPage() {
  const params = useParams();
  const id = params.id as string;
  const [checklist, setChecklist] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChecklist() {
      try {
        setLoading(true);
        const data = await getChecklistSummaryById(id);
        setChecklist(data);
      } catch (err) {
        console.error('Failed to fetch checklist summary:', err);
        setError('Failed to load checklist. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchChecklist();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <InlineLoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>{error}</p>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <p>No checklist found for this ID.</p>
      </div>
    );
  }

  return <PublicChecklistDetail checklist={checklist} />;
}
