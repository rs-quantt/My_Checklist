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
      return 'bg-green-100 text-green-800';
    case 'incomplete':
      return 'bg-yellow-100 text-yellow-800';
    case 'na':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
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
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
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
    <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto">
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
         {checklist.commitMessage && (
          <div className="mt-4">
              <p className="text-sm text-gray-600 font-semibold">Commit Message:</p>
              <p className="text-sm text-gray-800 bg-gray-100 p-2 mt-1 rounded-md whitespace-pre-wrap">
                  {checklist.commitMessage}
              </p>
          </div>
        )}
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
        <motion.ul
          className="space-y-6"
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
                ? 'bg-red-200 text-red-900'
                : priority === '2'
                  ? 'bg-yellow-200 text-yellow-900'
                  : 'bg-blue-200 text-blue-900';

            return (
              <motion.li
                key={item._key || index}
                variants={itemVariants}
                className={`relative overflow-hidden rounded-lg bg-white transition-shadow duration-200 ease-in-out border border-gray-200`}
              >
                {/* REMOVED THE COLOR BAR DIV */}
                <div className="p-4"> {/* Adjusted padding from pl-6 to p-4 */}
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleItem(item._key)}
                  >
                    <p className="font-semibold text-lg text-gray-800 flex-grow">
                      {item.title}
                    </p>
                    {priority && (
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full mr-4 ${priorityClass}`}
                      >
                        {priorityText}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                        item.status,
                      )} mr-4`}
                    >
                      {item.status.toUpperCase()}
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
                    {isExpanded && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: 'auto',
                          opacity: 1,
                          marginTop: '16px',
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
                        <div className="space-y-3">
                          {item.description && (
                            <div className="prose max-w-none">
                              <hr className="my-4 border-gray-200" />
                              <PortableText
                                value={item.description}
                                components={ptComponents}
                              />
                              <hr className="my-4 border-gray-200" />
                            </div>
                          )}
                          {item.note && (
                            <div>
                              <label
                                htmlFor={`note-${item._key}`}
                                className="block text-sm font-medium text-gray-700 mt-3"
                              >
                                Reason / Note
                              </label>
                              <textarea
                                id={`note-${item._key}`}
                                value={item.note}
                                readOnly
                                className={`w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 text-sm`}
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
