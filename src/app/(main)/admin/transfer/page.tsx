'use client';

import CommonSelect from '@/app/components/CommonSelect';
import {
    ArrowRightIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Checklist {
  _id: string;
  title: string;
  isCommon: boolean;
}

export default function TransferChecklistItemsPage() {
  const [commonChecklists, setCommonChecklists] = useState<Checklist[]>([]);
  const [nonCommonChecklists, setNonCommonChecklists] = useState<Checklist[]>(
    [],
  );
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  const handleDestinationChange = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id],
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
        const { error: resError } = await res.json();
        throw new Error(resError || 'Transfer failed');
      }

      setSuccessMessage('Items transferred successfully!');
      setSelectedSource('');
      setSelectedDestinations([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during transfer');
      }
    } finally {
      setIsTransferring(false);
    }
  };

  if (isLoading) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="text-center">
                <svg
                    className="animate-spin h-12 w-12 text-blue-900 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-gray-700">Loading checklists...</p>
            </div>
        </div>
    );
  }

  const filteredDestinations = nonCommonChecklists.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Transfer Checklist Items
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Easily copy items from a common checklist to other specific
            checklists.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-6 rounded-md flex items-center"
            role="alert"
          >
            <ExclamationCircleIcon className="h-6 w-6 mr-3" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-6 rounded-md flex items-center"
            role="alert"
          >
            <CheckCircleIcon className="h-6 w-6 mr-3" />
            <div>
              <p className="font-bold">Success</p>
              <p>{successMessage}</p>
            </div>
          </motion.div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-11 gap-8 items-start">
          {/* Source Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Select Source
            </h2>
            <CommonSelect
              options={commonChecklists.map((c) => ({
                _id: c._id,
                name: c.title,
              }))}
              value={selectedSource}
              onChange={setSelectedSource}
              placeholder="Select a source checklist..."
            />
          </motion.div>

          {/* Arrow Divider */}
          <div className="hidden lg:flex justify-center items-center h-full lg:col-span-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <ArrowRightIcon className="h-12 w-12 text-gray-400" />
            </motion.div>
          </div>

          {/* Destination Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Select Destinations
            </h2>
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                spellCheck={false}
              />
            </div>
            <div className="space-y-3 border rounded-lg p-3 max-h-80 overflow-y-auto">
              {filteredDestinations.map((c) => (
                <motion.div
                  key={c._id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  onClick={() => handleDestinationChange(c._id)}
                  className="flex items-center p-3 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id={`dest-${c._id}`}
                    readOnly
                    checked={selectedDestinations.includes(c._id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-900 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`dest-${c._id}`}
                    className="ml-3 font-medium text-gray-700 cursor-pointer"
                  >
                    {c.title}
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={handleTransfer}
            className="flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-64 h-12"
            disabled={
              isTransferring || !selectedSource || selectedDestinations.length === 0
            }
          >
            {isTransferring ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Transferring...</span>
                </>
            ) : (
              <>
                <ArrowRightIcon className="h-6 w-6 mr-2" />
                Transfer Items Now ({selectedDestinations.length})
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
