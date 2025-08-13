'use client';

import BackButton from '@/app/components/BackButton';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import ptComponents from '@/app/components/ptComponents';
import { ChecklistItem } from '@/types/checklist';
import { PortableText } from '@portabletext/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Checklist = {
  _id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
};

export default function ChecklistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [expandedItems, setExpandedItems] = useState<{
    [itemId: string]: boolean;
  }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/checklists/${id}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch checklist details: ${response.statusText}`,
          );
        }
        const data = await response.json();
        setChecklist(data.checklist);
      } catch (err) {
        console.error(err);
        setError('Could not load checklist data. Please try again later.');
      }
    };

    fetchData();
  }, [id]);

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!checklist) return <LoadingSpinner text="Loading checklist..." />;

  return (
    <div className="antialiased bg-gray-50 min-h-screen relative">
      <div className="min-h-screen py-8 px-2 sm:px-4 lg:px-6">
        <div className="container mx-auto max-w-5xl bg-white text-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <BackButton />
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center">
              <img
                src="/check.png"
                alt="Checkmark icon"
                className="w-6 h-6 mr-2 mb-2"
              />
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight mb-3">
                {checklist.title}
              </h1>
            </div>
            {checklist.description && (
              <p className="mt-2 text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
                {checklist.description}
              </p>
            )}
          </div>

          <ul className="space-y-6">
            {checklist.items.map((item) => {
              const isExpanded = expandedItems[item._id] || false;
              const priority = item.priority;
              const priorityText =
                priority === '1' ? 'High' : priority === '2' ? 'Medium' : 'Low';
              const priorityClass =
                priority === '1'
                  ? 'bg-red-200 text-red-900'
                  : priority === '2'
                    ? 'bg-yellow-200 text-yellow-900'
                    : 'bg-blue-200 text-blue-900';

              return (
                <li
                  key={item._id}
                  className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out border border-gray-200"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-2 bg-gray-400"></div>
                  <div className="pl-6 p-4">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleItem(item._id)}
                    >
                      <p className="font-semibold text-lg text-gray-800 flex-grow">
                        {item.label}
                      </p>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full mr-4 ${priorityClass}`}
                      >
                        {priorityText}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && item.description && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: 'auto',
                            opacity: 1,
                            marginTop: '16px',
                          }}
                          exit={{ height: 0, opacity: 0, marginTop: '0px' }}
                          transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className="prose max-w-none">
                            <hr className="my-4 border-gray-200" />
                            <PortableText
                              value={item.description}
                              components={ptComponents}
                            />
                            <hr className="my-4 border-gray-200" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
