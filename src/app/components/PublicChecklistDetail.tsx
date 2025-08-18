'use client';

import { useState } from 'react';
import { Status } from '@/types/enum';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';
import ptComponents from '@/app/components/ptComponents';

interface ChecklistItem {
  _key: string;
  title: string;
  isCompleted: boolean;
  status: Status;
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

interface PublicChecklistDetailProps {
  checklist: UserChecklist;
}

const getStatusBadgeColor = (status: Status) => {
  switch (status) {
    case 'done':
      return 'bg-emerald-50 text-emerald-700'; // Softer green
    case 'incomplete':
      return 'bg-amber-50 text-amber-700'; // Softer yellow/amber
    case 'na':
      return 'bg-gray-50 text-gray-700'; // Softer gray
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 }, // Slightly less movement
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: 'easeOut', duration: 0.3 },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }, // Faster stagger
  },
};

export default function PublicChecklistDetail({ checklist }: PublicChecklistDetailProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (!checklist) {
    return null;
  }

  const { items } = checklist.checklist;
  const totalItems = items.length;

  const statusCounts = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<Status, number>,
  );

  const doneCount = statusCounts.done || 0;
  const incompleteCount = statusCounts.incomplete || 0;
  const naCount = statusCounts.na || 0;

  const donePercentage = totalItems > 0 ? (doneCount / totalItems) * 100 : 0;
  const incompletePercentage = totalItems > 0 ? (incompleteCount / totalItems) * 100 : 0;
  const naPercentage = totalItems > 0 ? (naCount / totalItems) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto border border-gray-100"> {/* Refined container styling */}
      <div className="border-b border-gray-100 pb-4 mb-5"> {/* Subtle border, refined margin */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 tracking-tight">
          {checklist.checklist.title}
        </h1>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3"> {/* Smaller heading, refined margin */}
          Completion Status
        </h2>
        {totalItems > 0 ? (
          <>
            <div className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden"> {/* Thinner progress bar */}
              <div
                className="bg-emerald-400 h-4" // Softer green
                style={{ width: `${donePercentage}%` }}
                title={`Done: ${donePercentage.toFixed(1)}%`}
              />
              <div
                className="bg-amber-400 h-4" // Softer yellow/amber
                style={{ width: `${incompletePercentage}%` }}
                 title={`Incomplete: ${incompletePercentage.toFixed(1)}%`}
              />
              <div
                className="bg-gray-300 h-4" // Softer gray
                style={{ width: `${naPercentage}%` }}
                 title={`N/A: ${naPercentage.toFixed(1)}%`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500"> {/* Smaller text, softer color */}
               <div className="flex items-center space-x-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-400"></span> {/* Smaller circles */}
                 <span>Done ({doneCount}): {donePercentage.toFixed(1)}%</span>
               </div>
               <div className="flex items-center space-x-1">
                 <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                 <span>Incomplete ({incompleteCount}): {incompletePercentage.toFixed(1)}%</span>
               </div>
               <div className="flex items-center space-x-1">
                 <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                 <span>N/A ({naCount}): {naPercentage.toFixed(1)}%</span>
               </div>
            </div>
          </>
        ) : (
           <p className="text-gray-500 text-sm">No items in this checklist.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Checklist Items
        </h2>
        <motion.ul
          className="space-y-4" // Reduced space
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {items.map((item, index) => {
            const isExpanded = expandedItems[item._key] || false;

            const priority = item.priority;
            const priorityText =
              priority === '1'
                ? 'High'
                : priority === '2'
                  ? 'Medium'
                  : 'Low';
            const priorityClass =
              priority === '1'
                ? 'bg-rose-50 text-rose-700' // Softer red
                : priority === '2'
                  ? 'bg-amber-50 text-amber-700' // Softer yellow
                  : 'bg-blue-50 text-blue-700'; // Softer blue

            return (
              <motion.li
                key={item._key || index}
                variants={itemVariants}
                className={`relative overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm transition-shadow duration-200 ease-in-out`} // Refined border and shadow
              >
                <div className="p-3"> {/* Reduced padding */}
                  <div
                    className="flex items-center cursor-pointer justify-between gap-2" // Added gap
                    onClick={() => toggleItem(item._key)}
                  >
                    <p className="font-medium text-md text-gray-800 flex-grow"> {/* Reduced text size, medium font weight */}
                      {item.title}
                    </p>
                    <div className="flex-shrink-0 flex items-center gap-2"> {/* Group badges, add gap */}
                      {priority && (
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityClass}`}
                        >
                          {priorityText}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          item.status,
                        )}`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg
                          className="w-3.5 h-3.5 text-gray-400" // Smaller icon
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
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: 'auto',
                          opacity: 1,
                          marginTop: '12px', // Reduced margin
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          marginTop: '0px',
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2"> {/* Reduced space */}
                          {item.description && (
                            <div className="prose prose-sm max-w-none"> {/* Added prose-sm for smaller text */}
                              <hr className="my-3 border-gray-100" /> {/* Lighter border */}
                              <PortableText
                                value={item.description}
                                components={ptComponents}
                              />
                              <hr className="my-3 border-gray-100" />
                            </div>
                          )}
                          {item.note && (
                            <div>
                              <label
                                htmlFor={`note-${item._key}`}
                                className="block text-xs font-medium text-gray-600 mt-2 pb-2" // Smaller label
                              >
                                Reason / Note
                              </label>
                              <textarea
                                id={`note-${item._key}`}
                                value={item.note}
                                readOnly
                                className={`w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm`} // Refined border and text color
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </div>
  );
}
