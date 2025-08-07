'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CommonSelect from '@/app/components/CommonSelect';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { urlFor } from '@/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { PortableTextBlock } from '@portabletext/types';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import { ChecklistDetailTour } from '@/app/components/tour/ChecklistDetailTour'; // Import the tour
import { FaQuestionCircle } from 'react-icons/fa';

const ptComponents: PortableTextComponents = {
  types: {
    code: ({ value }) => {
      if (!value || !value.code) return null;
      return (
        <div className="my-4 rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language={value.language || 'text'}
            style={coldarkDark}
            showLineNumbers
          >
            {value.code}
          </SyntaxHighlighter>
        </div>
      );
    },
    image: ({ value }) => {
      if (!value?.asset?._ref) return null;
      return (
        <div className="flex justify-center my-6">
          <img
            alt={value.alt || ' '}
            loading="lazy"
            src={urlFor(value as SanityImageSource)
              .auto('format')
              .url()}
            className="rounded-lg shadow-lg max-w-full h-auto"
          />
        </div>
      );
    },
  },
};

type ChecklistItem = {
  _id: string;
  label: string;
  description?: PortableTextBlock[];
  priority?: '1' | '2' | '3';
};

type Checklist = {
  _id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
};

type User = {
  _id: string;
  name: string;
};

type Status = 'OK' | 'notOK' | 'na' | '';

type ItemState = {
  status: Status;
  note: string;
};

type ItemStateMap = {
  [itemId: string]: ItemState;
};

export default function ChecklistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [taskCode, setTaskCode] = useState<string>('');
  const [itemStates, setItemStates] = useState<ItemStateMap>({});
  const [expandedItems, setExpandedItems] = useState<{
    [itemId: string]: boolean;
  }>({});
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allItemsChecked =
      checklist?.items.every((item) => itemStates[item._id]?.status) ?? false;
    setIsSaveButtonDisabled(!selectedUserId || !taskCode || !allItemsChecked);
  }, [selectedUserId, taskCode, itemStates, checklist]);

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
        setUsers(data.users);
      } catch (err) {
        console.error(err);
        setError('Could not load checklist data. Please try again later.');
      }
    };

    fetchData();
  }, [id]);

  const saveChecklist = async () => {
    setIsSaving(true);
    const validationErrors: string[] = [];
    checklist?.items.forEach((item) => {
      const state = itemStates[item._id] || { status: '', note: '' };
      if (!state.status) {
        validationErrors.push(
          `Item "${item.label}" status has not been selected.`,
        );
      }
      if (
        (state.status === 'notOK' || state.status === 'na') &&
        !state.note?.trim()
      ) {
        validationErrors.push(`Item "${item.label}" requires a note.`);
      }
    });

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      setIsSaving(false);
      return;
    }

    const payload = {
      userId: selectedUserId,
      taskCode,
      checklistId: id,
      items: Object.entries(itemStates).map(([itemId, state]) => ({
        itemId,
        ...state,
      })),
    };

    try {
      const res = await fetch('/api/save-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Save failed: ' + (await res.text()));
      }

      setShowSuccessPopup(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (itemId: string, status: Status) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], status },
    }));
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleNoteChange = (itemId: string, note: string) => {
    setItemStates((prev) => ({ ...prev, [itemId]: { ...prev[itemId], note } }));
  };

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!checklist) return <LoadingSpinner text="Loading checklist..." />;

  return (
    <div className="antialiased bg-gray-50 min-h-screen relative">
      <ChecklistDetailTour />
      <LoadingOverlay isLoading={isSaving} text="Saving..." />
      <div className={`min-h-screen py-8 px-2 sm:px-4 lg:px-6`}>
        <div className="container mx-auto max-w-5xl bg-white text-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200 text-sm font-medium border border-blue-200 py-2 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Back to list
            </button>
            <button
              id="start-detail-tour-button"
              className="text-blue-500 hover:text-blue-700 transition-colors"
              aria-label="Start page tour"
            >
              <FaQuestionCircle size={24} />
            </button>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-base font-semibold text-gray-700">
                Developer <span className="text-red-500">*</span>
              </label>
              <CommonSelect
                options={users}
                value={selectedUserId}
                onChange={setSelectedUserId}
                placeholder="-- Select user --"
              />
            </div>
            <div className="space-y-2 text-base" id="task-code-input">
              <label className="block text-base font-semibold text-gray-700">
                Task Code <span className="text-red-500">*</span>
              </label>
              <input
                className="appearance-none block w-full bg-white border border-gray-300 text-gray-800 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out shadow-sm text-base"
                type="text"
                placeholder="Enter task code (e.g., TASK-001)"
                value={taskCode}
                onChange={(e) => setTaskCode(e.target.value)}
              />
            </div>
          </div>

          <ul className="space-y-6">
            {checklist.items.map((item, index) => {
              const state = itemStates[item._id] || { status: '', note: '' };
              const isExpanded = expandedItems[item._id] || false;
              const isNoteRequired = state.status === 'notOK' || state.status === 'na';
              let barColorClass = 'bg-gray-400';
              if (state.status === 'OK') barColorClass = 'bg-green-500';
              else if (state.status === 'notOK') barColorClass = 'bg-red-500';
              else if (state.status === 'na') barColorClass = 'bg-slate-400';

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
                  className={`relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out border border-gray-200 ${index === 0 ? 'checklist-item-row' : ''}`}
                >
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-2 ${barColorClass} transition-colors`}
                  ></div>
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
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
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
                          animate={{ height: 'auto', opacity: 1, marginTop: '16px' }}
                          exit={{ height: 0, opacity: 0, marginTop: '0px' }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
                              <div className={`flex flex-wrap items-center gap-2 ${index === 0 ? 'status-buttons' : ''}`}>
                                {['OK', 'notOK', 'na'].map((statusOption) => (
                                  <button
                                    key={statusOption}
                                    onClick={() =>
                                      handleStatusChange(
                                        item._id,
                                        statusOption as Status,
                                      )
                                    }
                                    className={`px-4 py-2 rounded-md font-medium text-xs transition-all duration-200 ease-in-out border ${
                                      state.status === statusOption
                                        ? statusOption === 'OK'
                                          ? 'bg-green-600 text-white border-green-600'
                                          : statusOption === 'notOK'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-slate-600 text-white border-slate-600'
                                        : statusOption === 'OK'
                                          ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                          : statusOption === 'notOK'
                                            ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                            : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                                    }`}
                                  >
                                    {statusOption === 'OK'
                                      ? 'OK'
                                      : statusOption === 'notOK'
                                        ? 'Not OK'
                                        : 'N/A'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <label
                              htmlFor={`note-${item._id}`}
                              className="block text-sm font-medium text-gray-700 mt-3"
                            >
                              Reason / Note{' '}
                              <span
                                className={`text-red-500 ${isNoteRequired ? '' : 'hidden'}`}
                              >
                                *
                              </span>
                            </label>
                            <textarea
                              id={`note-${item._id}`}
                              value={state.note}
                              onChange={(e) =>
                                handleNoteChange(item._id, e.target.value)
                              }
                              placeholder={isNoteRequired ? 'Required' : 'Optional'}
                              className={`w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition ${index === 0 ? 'note-input' : ''}`}
                              rows={2}
                              required={isNoteRequired}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            id="save-progress-button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-md w-full text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSaveButtonDisabled || isSaving}
            onClick={saveChecklist}
          >
            {isSaving ? 'Saving...' : 'Save Checklist'}
          </button>
        </div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto text-center border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Success!
            </h3>
            <p className="text-gray-700 mb-6">
              Your checklist has been saved successfully.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
