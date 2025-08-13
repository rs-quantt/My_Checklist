'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '@/app/components/BackButton';
import { FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link'; // Import Link

type ChecklistSummary = {
  _id: string;
  userId: string;
  checklistId: string;
  checklistTitle: string;
  taskCode: string;
  commitMessage?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    itemId: string;
    status: 'done' | 'incomplete' | 'na' | '';
    note?: string;
  }>;
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function MyChecklistsSummaryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [summaries, setSummaries] = useState<ChecklistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      const fetchSummaries = async () => {
        try {
          const res = await fetch(`/api/checklists-summary?userId=${session.user?.id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch checklist summaries');
          }
          const data = await res.json();
          setSummaries(data);
        } catch (err) {
          console.error(err);
          setError('Could not load your saved checklists. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchSummaries();
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, session?.user?.id, router]);

  if (loading || sessionStatus === 'loading') {
    return <LoadingSpinner text="Loading your checklists..." />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="antialiased bg-gray-50 min-h-screen relative">
      <div className="min-h-screen py-8 px-2 sm:px-4 lg:px-6">
        <motion.div
          className="container mx-auto max-w-5xl bg-white text-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-8 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <BackButton />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              My Saved Checklists
            </h1>
            <p className="mt-2 text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Here are all the checklists you've saved.
            </p>
          </div>

          {summaries.length === 0 ? (
            <div className="text-center text-gray-600 py-10">
              <p className="text-lg">You haven't saved any checklists yet.</p>
              <p className="mt-4">
                <Link
                  href="/my-checklist"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-md !text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                >
                  Start a New Checklist
                </Link>
              </p>
            </div>
          ) : (
            <motion.ul
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {summaries.map((summary) => (
                <motion.li
                  key={summary._id}
                  variants={itemVariants}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex-grow mb-3 sm:mb-0">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {summary.checklistTitle}
                    </h2>
                    <p className="text-gray-700 text-sm mt-1">
                      <span className="font-medium">Task Code:</span> {summary.taskCode}
                    </p>
                    {summary.commitMessage && (
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Commit:</span> {summary.commitMessage}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      Saved on: {new Date(summary.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/public-checklists/${summary._id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    View Details
                    <FaExternalLinkAlt size={12} />
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
