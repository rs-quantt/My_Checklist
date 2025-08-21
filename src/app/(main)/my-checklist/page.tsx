'use client';

import BackButton from '@/app/components/BackButton';
import CommonSelect from '@/app/components/CommonSelect';
import InlineLoadingSpinner from '@/app/components/InlineLoadingSpinner';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useMyChecklistLogic } from '@/hooks/useMyChecklistLogic';
import { Status } from '@/types/enum';
import { PortableText } from '@portabletext/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { FaQuestionCircle, FaSave, FaTimesCircle } from 'react-icons/fa';
import ptComponents from '../../components/ptComponents';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: 'easeOut', duration: 0.3 },
  },
};

export default function MyChecklistPage() {
  const searchParams = useSearchParams();
  const categorySummaryId = searchParams.get('categorySummaryId') || undefined;

  const {
    sessionStatus,
    router,
    categories,
    selectedCategory,
    checklistTemplates,
    isTemplateLoading,
    taskCode,
    setTaskCode,
    taskCodeError,
    commitMessage,
    setCommitMessage,
    allChecklistsItemStates,
    allChecklistsExpandedStates,
    isSaveButtonDisabled,
    isSaving,
    showSuccessPopup,
    setShowSuccessPopup,
    error,
    initialLoading,
    handleCategoryChange,
    saveAllChecklists,
    handleStatusChange,
    toggleItem,
    handleNoteChange,
    handleTaskCodeBlur,
  } = useMyChecklistLogic(categorySummaryId);

  if (initialLoading || sessionStatus === 'loading')
    return <LoadingSpinner text="Loading page..." />;
  if (sessionStatus === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="antialiased bg-gray-100 min-h-screen relative">
      <div className="min-h-screen py-8 px-2 sm:px-4 lg:px-6">
        <motion.div
          className="container mx-auto max-w-5xl bg-white text-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-8 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <BackButton />
            {!selectedCategory && (
              <button
                id="start-my-checklist-tour-button"
                className="text-blue-500 hover:text-blue-700 transition-colors"
                aria-label="Start page tour"
              >
                <FaQuestionCircle size={24} />
              </button>
            )}
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <motion.div className="text-center mb-6" variants={itemVariants}>
            <div className="flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                {categorySummaryId ? 'Edit Task' : 'Start a New Task'}
              </h1>
            </div>
            <p className="mt-2 text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Select a category and complete checklists.
            </p>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                id="category-select-container"
                className="space-y-2"
                variants={itemVariants}
              >
                <label className="block text-base font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <CommonSelect
                  options={categories.map((c) => ({
                    _id: c._id,
                    name: c.title,
                  }))}
                  value={selectedCategory?._id || ''}
                  onChange={handleCategoryChange}
                  placeholder="-- Select a category --"
                  disabled={!!categorySummaryId}
                />
              </motion.div>
              <motion.div
                id="task-code-input-container"
                className="space-y-2 text-base"
                variants={itemVariants}
              >
                <label className="block text-base font-semibold text-gray-700">
                  Task Code <span className="text-red-500">*</span>
                </label>
                <input
                  className={`appearance-none block w-full border ${taskCodeError ? 'border-red-500' : 'border-gray-300'} text-gray-800 py-2 px-3 rounded-md leading-tight ${
                    !!categorySummaryId
                      ? 'bg-gray-200 opacity-100 cursor-not-allowed'
                      : 'bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  } transition duration-200 ease-in-out shadow-sm text-base`}
                  type="text"
                  placeholder="Enter task code (e.g., TASK-001)"
                  value={taskCode}
                  onChange={(e) => setTaskCode(e.target.value)}
                  onBlur={handleTaskCodeBlur}
                  disabled={!!categorySummaryId}
                />
                {taskCodeError && (
                  <p className="flex items-center text-red-500 font-medium text-sm mt-1">
                    <FaTimesCircle className="mr-2" /> {taskCodeError}
                  </p>
                )}
              </motion.div>
              <motion.div
                className="space-y-2 md:col-span-2"
                variants={itemVariants}
              >
                <label
                  htmlFor="commit-message"
                  className="block text-base font-semibold text-gray-700"
                >
                  Commit Message
                </label>
                <input
                  id="commit-message"
                  type="text"
                  className="appearance-none block w-full bg-white border border-gray-300 text-gray-800 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out shadow-sm text-base"
                  placeholder="Enter your commit message (optional)"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                />
              </motion.div>
            </motion.div>

            <div className="relative min-h-[5rem]">
              <AnimatePresence mode="wait">
                {isTemplateLoading && selectedCategory && (
                  <motion.div
                    key="template-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <InlineLoadingSpinner text="Loading checklists..." />
                  </motion.div>
                )}

                {selectedCategory && checklistTemplates.length > 0 && (
                  <motion.div
                    key="all-checklists"
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {checklistTemplates.map((checklist) => (
                      <div key={checklist._id}>
                        <div
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                              <img
                                src="/check.png"
                                alt="Check Icon"
                                className="w-6 h-6 mr-3 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <h2 className="text-2xl font-bold text-gray-900 truncate">
                                  {checklist.title}
                                </h2>
                                {checklist.description && (
                                  <p className="text-gray-600 mt-1 truncate">
                                    {checklist.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <motion.ul
                          className="space-y-6"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {checklist.items.map((item) => {
                            const state = allChecklistsItemStates[checklist._id]?.[item._id] || {
                              status: '',
                              note: '',
                            };
                            const isExpanded = allChecklistsExpandedStates[checklist._id]?.[item._id] || false;
                            const isNoteRequired =
                              state.status === 'incomplete' ||
                              state.status === 'na';
                            let barColorClass = 'bg-gray-400';
                            if (state.status === 'done')
                              barColorClass = 'bg-green-500';
                            else if (state.status === 'incomplete')
                              barColorClass = 'bg-red-500';
                            else if (state.status === 'na')
                              barColorClass = 'bg-slate-400';

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
                                key={item._id}
                                variants={itemVariants}
                                className={`relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out border border-gray-200`}
                              >
                                <div
                                  className={`absolute top-0 left-0 bottom-0 w-2 ${barColorClass} transition-colors`}
                                ></div>
                                <div className="pl-6 p-4">
                                  <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => toggleItem(checklist._id, item._id)}
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
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                  Status
                                                </label>
                                                <div
                                                  className={`flex flex-wrap items-center gap-2`}
                                                >
                                                  {['done', 'incomplete', 'na'].map(
                                                    (statusOption) => (
                                                      <button
                                                        key={statusOption}
                                                        onClick={() =>
                                                          handleStatusChange(
                                                            checklist._id,
                                                            item._id,
                                                            statusOption as Status,
                                                          )
                                                        }
                                                        className={`px-4 py-2 rounded-md font-medium text-xs transition-all duration-200 ease-in-out border ${state.status === statusOption
                                                            ? statusOption === 'done'
                                                              ? 'bg-green-600 text-white border-green-600'
                                                              : statusOption ===
                                                                'incomplete'
                                                                ? 'bg-red-600 text-white border-red-600'
                                                                : 'bg-slate-600 text-white border-slate-600'
                                                            : statusOption === 'done'
                                                              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                                              : statusOption ===
                                                                'incomplete'
                                                                ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                                                : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                                                          }`}
                                                      >
                                                        {statusOption === 'done'
                                                          ? 'Done'
                                                          : statusOption ===
                                                            'incomplete'
                                                            ? 'Incomplete'
                                                            : 'N/A'}
                                                      </button>
                                                    ),
                                                  )}
                                                </div>
                                              </div>
                                              <div>
                                                <label
                                                  htmlFor={`note-${item._id}`}
                                              className="block text-sm font-medium text-gray-700 mt-3"
                                                >
                                                  Reason / Note{' '}
                                                  <span
                                                    className={`text-red-500 ${isNoteRequired ? '' : 'hidden'
                                                      }`}
                                                  >
                                                    *
                                                  </span>
                                                </label>
                                                <textarea
                                                  id={`note-${item._id}`}
                                                  value={state.note}
                                                  onChange={(e) =>
                                                    handleNoteChange(
                                                      checklist._id,
                                                      item._id,
                                                      e.target.value,
                                                    )
                                                  }
                                                  placeholder={
                                                    isNoteRequired
                                                      ? 'Required'
                                                      : 'Optional'
                                                  }
                                                  className={`w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition`}
                                                  rows={2}
                                                  required={isNoteRequired}
                                                />
                                              </div>
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
                        ))}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <div className="flex justify-end">
                        <motion.button
                          id="action-button"
                          onClick={saveAllChecklists}
                          disabled={isSaveButtonDisabled || isSaving}
                          className="relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold shadow-md transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed w-48 h-10"
                          whileTap={
                            !isSaveButtonDisabled && !isSaving
                              ? { scale: 0.97 }
                              : {}
                          }
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isSaving ? (
                              <motion.div
                                key="saving"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute flex items-center justify-center"
                              >
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
                                <span>Saving...</span>
                              </motion.div>
                            ) : (
                              <motion.span
                                key="action-text"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute flex items-center justify-center"
                              >
                                <FaSave className="mr-2" /> Save Checklist
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {!selectedCategory && !isTemplateLoading && !error && (
                  <div className="text-center text-gray-500 mt-10">
                    Please select a category to start.
                  </div>
                )}
                {selectedCategory && !isTemplateLoading && checklistTemplates.length === 0 && (
                  <div className="text-center text-gray-500 mt-10">
                    No checklists found for this category.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div >
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/50 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto text-center border border-gray-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Success!
              </h3>
              <p className="text-gray-700 mb-6">
                Your checklist has been saved successfully.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
