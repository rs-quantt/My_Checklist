'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Checklist {
  _id: string;
  title: string;
  isCommon: boolean;
}

export default function TransferChecklistItemsPage() {
  const [commonChecklists, setCommonChecklists] = useState<Checklist[]>([]);
  const [nonCommonChecklists, setNonCommonChecklists] = useState<Checklist[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const res = await fetch('/api/checklists');
        if (!res.ok) {
          throw new Error('Failed to fetch checklists');
        }
        const allChecklists: Checklist[] = await res.json();
        setCommonChecklists(allChecklists.filter((c) => c.isCommon));
        setNonCommonChecklists(allChecklists.filter((c) => !c.isCommon));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  const handleDestinationChange = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleTransfer = async () => {
    if (!selectedSource || selectedDestinations.length === 0) {
      setError('Please select a source and at least one destination.');
      return;
    }

    setIsTransferring(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: selectedSource,
          destinationIds: selectedDestinations,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Transfer failed');
      }

      setSuccessMessage('Items transferred successfully!');
      setSelectedSource('');
      setSelectedDestinations([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong!');
    } finally {
      setIsTransferring(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading checklists..." />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Transfer Checklist Items</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success:</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Source Checklist (Common)</h2>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a source</option>
            {commonChecklists.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Destination Checklists (Non-Common)</h2>
          <div className="border rounded p-2 max-h-60 overflow-y-auto">
            {nonCommonChecklists.map((c) => (
              <div key={c._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={c._id}
                  checked={selectedDestinations.includes(c._id)}
                  onChange={() => handleDestinationChange(c._id)}
                  className="mr-2"
                />
                <label htmlFor={c._id}>{c.title}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleTransfer}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isTransferring || !selectedSource || selectedDestinations.length === 0}
        >
          {isTransferring ? 'Transferring...' : 'Transfer Items'}
        </button>
      </div>
    </div>
  );
}
