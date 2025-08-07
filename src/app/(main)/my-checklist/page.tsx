'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import CommonSelect from '@/app/components/CommonSelect';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { urlFor } from '@/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { PortableTextBlock } from '@portabletext/types';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import { InitialTour, ChecklistItemsTour } from '@/app/components/tour/MyChecklistTour';
import { FaQuestionCircle } from 'react-icons/fa';

const ptComponents: PortableTextComponents = {
  types: {
    code: ({ value }) => {
      if (!value || !value.code) return null;
      return (
        <div className="my-4 rounded-lg overflow-hidden">
          <SyntaxHighlighter language={value.language || 'text'} style={coldarkDark} showLineNumbers>
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
            src={urlFor(value as SanityImageSource).auto('format').url()}
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

type ChecklistTemplate = {
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
  const router = useRouter();
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [taskCode, setTaskCode] = useState<string>('');
  const [itemStates, setItemStates] = useState<ItemStateMap>({});
  const [expandedItems, setExpandedItems] = useState<{ [itemId: string]: boolean }>({});
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState(false);
  const templateHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const headerEl = templateHeaderRef.current;
    if (!headerEl) {
      setIsStickyHeaderVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStickyHeaderVisible(!entry.isIntersecting);
      },
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 },
    );

    observer.observe(headerEl);

    return () => {
      if (headerEl) {
        observer.unobserve(headerEl);
      }
    };
  }, [selectedTemplate]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setError(null);
        const [checklistRes, usersRes] = await Promise.all([
          fetch('/api/checklists'),
          fetch('/api/users'),
        ]);

        if (!checklistRes.ok) throw new Error('Failed to fetch checklist templates');
        if (!usersRes.ok) throw new Error('Failed to fetch users');

        const checklistData = await checklistRes.json();
        const usersData = await usersRes.json();

        setChecklistTemplates(checklistData);
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        setError('Could not load initial data. Please try again later.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleTemplateChange = async (templateId: string) => {
    if (!templateId) {
      setSelectedTemplate(null);
      setItemStates({});
      return;
    }
    
    setIsTemplateLoading(true);
    setSelectedTemplate(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch(`/api/checklists/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch checklist details');
      const data = await response.json();
      setSelectedTemplate(data.checklist);
      setItemStates({});
    } catch (err) {
      console.error(err);
      setError('Could not load the selected checklist. Please try again.');
    } finally {
      setIsTemplateLoading(false);
    }
  };

  useEffect(() => {
    const allItemsChecked =
      selectedTemplate?.items.every((item) => itemStates[item._id]?.status) ?? false;
    setIsSaveButtonDisabled(!selectedUserId || !taskCode || !selectedTemplate || !allItemsChecked);
  }, [selectedUserId, taskCode, itemStates, selectedTemplate]);
  
  const resetForm = () => {
    setSelectedTemplate(null);
    setSelectedUserId('');
    setTaskCode('');
    setItemStates({});
    setExpandedItems({});
  };

  const saveChecklist = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    const validationErrors: string[] = [];
    selectedTemplate.items.forEach((item) => {
      const state = itemStates[item._id] || { status: '', note: '' };
      if (!state.status) {
        validationErrors.push(`Item "${item.label}" status has not been selected.`);
      }
      if ((state.status === 'notOK' || state.status === 'na') && !state.note?.trim()) {
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
      checklistId: selectedTemplate._id,
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

      if (!res.ok) throw new Error('Save failed: ' + (await res.text()));

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
    setItemStates((prev) => ({ ...prev, [itemId]: { ...prev[itemId], status } }));
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleNoteChange = (itemId: string, note: string) => {
    setItemStates((prev) => ({ ...prev, [itemId]: { ...prev[itemId], note } }));
  };

  if (initialLoading) return <LoadingSpinner text="Loading page..." />;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="antialiased bg-gray-50 min-h-screen relative">
      {!selectedTemplate ? <InitialTour /> : <ChecklistItemsTour />}
      <LoadingOverlay isLoading={isSaving} text="Saving..." />
      <AnimatePresence>
        {isStickyHeaderVisible && selectedTemplate && (
          <motion.div
            className="fixed top-16 left-0 right-0 z-20"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="container mx-auto max-w-5xl px-2 sm:px-4 lg:px-6">
              <div className="flex items-center p-3 bg-white/90 backdrop-blur-md rounded-b-lg shadow-md border-x border-b border-gray-200">
                <img src="/check.png" alt="Check Icon" className="w-6 h-6 mr-3 flex-shrink-0" />
                <h3 className="font-bold text-gray-800 text-lg truncate">{selectedTemplate.title}</h3>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen py-8 px-2 sm:px-4 lg:px-6">
        <motion.div 
          className="container mx-auto max-w-5xl bg-white text-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-8 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <motion.button
              onClick={() => router.push('/checklists')}
              className="flex items-center bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200 text-sm font-medium border border-blue-200 py-2 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              variants={itemVariants}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to list
            </motion.button>
            {!selectedTemplate && (
              <button
                id="start-my-checklist-tour-button"
                className="text-blue-500 hover:text-blue-700 transition-colors"
                aria-label="Start page tour"
              >
                <FaQuestionCircle size={24} />
              </button>
            )}
          </div>

          <motion.div className="text-center mb-6" variants={itemVariants}>
            <div className="flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Start a New Task
              </h1>
            </div>
            <p className="mt-2 text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Select a checklist template, fill in the details, and save your progress.
            </p>
          </motion.div>
          
          <div className="space-y-8">
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div id="template-select-container" className="space-y-2 md:col-span-1" variants={itemVariants}>
                  <label className="block text-base font-semibold text-gray-700">Checklist Template <span className="text-red-500">*</span></label>
                  <CommonSelect
                      options={checklistTemplates.map(t => ({ _id: t._id, name: t.title }))}
                      value={selectedTemplate?._id || ''}
                      onChange={handleTemplateChange}
                      placeholder="-- Select a template --"
                  />
              </motion.div>
              <motion.div id="developer-select-container" className="space-y-2" variants={itemVariants}>
                <label className="block text-base font-semibold text-gray-700">Developer <span className="text-red-500">*</span></label>
                <CommonSelect options={users} value={selectedUserId} onChange={setSelectedUserId} placeholder="-- Select user --"/>
              </motion.div>
              <motion.div id="task-code-input-container" className="space-y-2 text-base" variants={itemVariants}>
                <label className="block text-base font-semibold text-gray-700">Task Code <span className="text-red-500">*</span></label>
                <input
                  className="appearance-none block w-full bg-white border border-gray-300 text-gray-800 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out shadow-sm text-base"
                  type="text"
                  placeholder="Enter task code (e.g., TASK-001)"
                  value={taskCode}
                  onChange={(e) => setTaskCode(e.target.value)}
                />
              </motion.div>
            </motion.div>
            
            <div className="relative min-h-[5rem]">
              <AnimatePresence mode="wait">
                {isTemplateLoading && (
                  <motion.div
                    key="template-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-15 flex justify-center items-center"
                  >
                    <LoadingSpinner text="" />
                  </motion.div>
                )}

                {selectedTemplate && (
                  <motion.div
                    key={selectedTemplate._id}
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <div ref={templateHeaderRef} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <img src="/check.png" alt="Check Icon" className="w-6 h-6 mr-3 flex-shrink-0" />
                          <div className="min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 truncate">{selectedTemplate.title}</h2>
                            {selectedTemplate.description && <p className="text-gray-600 mt-1 truncate">{selectedTemplate.description}</p>}
                          </div>
                        </div>
                        <button
                          id="start-checklist-items-tour-button"
                          className="text-blue-500 hover:text-blue-700 transition-colors ml-4 flex-shrink-0"
                          aria-label="Start checklist items tour"
                        >
                          <FaQuestionCircle size={24} />
                        </button>
                      </div>
                    </div>
                    <motion.ul className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                      {selectedTemplate.items.map((item, index) => {
                        const state = itemStates[item._id] || { status: '', note: '' };
                        const isExpanded = expandedItems[item._id] || false;
                        const isNoteRequired = state.status === 'notOK' || state.status === 'na';
                        let barColorClass = 'bg-gray-400';
                        if (state.status === 'OK') barColorClass = 'bg-green-500';
                        else if (state.status === 'notOK') barColorClass = 'bg-red-500';
                        else if (state.status === 'na') barColorClass = 'bg-slate-400';

                        const priority = item.priority;
                        const priorityText = priority === '1' ? 'High' : priority === '2' ? 'Medium' : 'Low';
                        const priorityClass = priority === '1' ? 'bg-red-200 text-red-900' : priority === '2' ? 'bg-yellow-200 text-yellow-900' : 'bg-blue-200 text-blue-900';

                        const itemTourClass = index === 0 ? 'my-checklist-item' : '';

                        return (
                          <motion.li key={item._id} variants={itemVariants} className={`relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out border border-gray-200 ${itemTourClass}`}>
                            <div className={`absolute top-0 left-0 bottom-0 w-2 ${barColorClass} transition-colors`}></div>
                            <div className="pl-6 p-4">
                              <div className="flex items-center cursor-pointer" onClick={() => toggleItem(item._id)}>
                                <p className="font-semibold text-lg text-gray-800 flex-grow">{item.label}</p>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full mr-4 ${priorityClass}`}>{priorityText}</span>
                                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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
                                          <PortableText value={item.description} components={ptComponents} />
                                          <hr className="my-4 border-gray-200" />
                                        </div>
                                      )}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <div className={`flex flex-wrap items-center gap-2 ${index === 0 ? 'my-checklist-status-buttons' : ''}`}>
                                          {['OK', 'notOK', 'na'].map((statusOption) => (
                                            <button
                                              key={statusOption}
                                              onClick={() => handleStatusChange(item._id, statusOption as Status)}
                                              className={`px-4 py-2 rounded-md font-medium text-xs transition-all duration-200 ease-in-out border ${state.status === statusOption ? (statusOption === 'OK' ? 'bg-green-600 text-white border-green-600' : statusOption === 'notOK' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-600 text-white border-slate-600') : (statusOption === 'OK' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : statusOption === 'notOK' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300')}`}
                                            >
                                              {statusOption === 'OK' ? 'OK' : statusOption === 'notOK' ? 'Not OK' : 'N/A'}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <label htmlFor={`note-${item._id}`} className="block text-sm font-medium text-gray-700 mt-3">
                                        Reason / Note <span className={`text-red-500 ${isNoteRequired ? '' : 'hidden'}`}>*</span>
                                      </label>
                                      <textarea
                                        id={`note-${item._id}`}
                                        value={state.note}
                                        onChange={(e) => handleNoteChange(item._id, e.target.value)}
                                        placeholder={isNoteRequired ? 'Required' : 'Optional'}
                                        className={`w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition ${index === 0 ? 'my-checklist-note-input' : ''}`}
                                        rows={2}
                                        required={isNoteRequired}
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                    <motion.div variants={itemVariants}>
                      <button
                        id="save-checklist-button"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-md w-full text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={isSaveButtonDisabled || isSaving}
                        onClick={saveChecklist}
                      >
                        {isSaving ? 'Saving...' : 'Save Checklist'}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Success!</h3>
            <p className="text-gray-700 mb-6">Your checklist has been saved successfully.</p>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                resetForm();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out"
            >
              Start Another Task
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
