'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env.client';
import CommonSelect from '@/app/components/CommonSelect';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

type ChecklistItem = {
  _id: string;
  label: string;
  description?: string;
  order?: number;
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
  const router = useRouter(); // Initialize router
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [taskCode, setTaskCode] = useState<string>('');
  const [itemStates, setItemStates] = useState<ItemStateMap>({});
  const [expandedItems, setExpandedItems] = useState<{
    [itemId: string]: boolean;
  }>({});
  // State to track if all required fields are filled for saving
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State for success popup

  // Effect to update save button disable state
  useEffect(() => {
    const allItemsChecked =
      checklist?.items.every((item) => itemStates[item._id]?.status !== '') ??
      false;
    setIsSaveButtonDisabled(!selectedUserId || !taskCode || !allItemsChecked);
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const checklistResult = await client.fetch(
        `*[_type == "checklist" && _id == $id][0]{\
          _id,\
          title,\
          description,\
          "items": *[_type == "checklistItem" && checklist._ref == ^._id] | order(order asc){\
            _id,\
            label,\
            description,\
            order\
          }\
        }`,
        { id },
      );

      const userResult = await client.fetch(`*[_type == "user"]{ _id, name }`);

      setChecklist(checklistResult);
      setUsers(userResult);
    };

    fetchData();
  }, [id]);

  const saveChecklist = async () => {
    const validationErrors: string[] = [];
    checklist?.items.forEach((item) => {
      const state = itemStates[item._id] || { status: '', note: '' };

      if (state.status === '') {
        validationErrors.push(`Mục "${item.label}" chưa được chọn trạng thái.`);
      }
      if (
        (state.status === 'notOK' || state.status === 'na') &&
        !state.note.trim()
      ) {
        validationErrors.push(`Mục "${item.label}" yêu cầu ghi chú.`);
      }
    });

    if (validationErrors.length > 0) {
      return;
    }

    const payload = {
      userId: selectedUserId,
      taskCode,
      checklistId: id, // Add checklistId from useParams
      items: Object.entries(itemStates).map(([itemId, state]) => ({
        itemId,
        ...state,
      })),
    };

    const res = await fetch('/api/save-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Lưu thất bại:', await res.text());
    } else {
      console.log('Lưu thành công!');
      // The API now handles saving the summary as part of the main payload
      setShowSuccessPopup(true); // Show success popup on success
      window.scrollTo(0, 0); // Scroll to the top of the page
    }
  };

  const handleStatusChange = (itemId: string, status: Status) => {
    const newState = { ...itemStates[itemId], status };
    setItemStates((prev) => ({ ...prev, [itemId]: newState }));
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Function to update item state and send summary
  const updateItemStateAndSaveSummary = async (
    itemId: string,
    updates: Partial<ItemState>,
  ) => {
    const newState = { ...itemStates[itemId], ...updates };
    const updatedItemStates = { ...itemStates, [itemId]: newState };
    setItemStates(updatedItemStates); // Update local state immediately

    // Calculate total and passed items for summary based on the updated state
    const totalItems = checklist?.items.length || 0;
    const passedItems =
      checklist?.items.filter(
        (item) => updatedItemStates[item._id]?.status === 'OK',
      ).length || 0;

    const summaryPayload = {
      _type: 'checklistSummary',
      user: { _ref: selectedUserId, _type: 'reference' },
      checklist: { _ref: id, _type: 'reference' },
      totalItems: totalItems,
      passedItems: passedItems,
    };
  };
  // Utility function to render description with code blocks
  const renderDescriptionContent = (text: string) => {
    if (!text) return null;

    const elements = [];
    let lastIndex = 0;
    const regex = /```([\s\S]*?)```/g;

    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const preCodeText = text.substring(lastIndex, match.index);
        preCodeText.split('\n').forEach((paragraph, pIndex) => {
          elements.push(
            <p
              key={`text-${lastIndex}-${pIndex}`}
              className="text-sm text-gray-700 leading-relaxed mb-1"
            >
              {paragraph}
            </p>,
          );
        });
      }

      const codeContent = match[1].trim();
      elements.push(
        <pre
          key={`code-${match.index}`}
          className="bg-gray-100 p-3 rounded-md overflow-auto text-sm my-4 border border-gray-300 shadow-sm"
        >
          <code className="text-gray-800 font-mono">{codeContent}</code>
        </pre>,
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      const postCodeText = text.substring(lastIndex);
      postCodeText.split('\n').forEach((paragraph, pIndex) => {
        elements.push(
          <p
            key={`text-end-${lastIndex}-${pIndex}`}
            className="text-sm text-gray-700 leading-relaxed mb-1"
          >
            {paragraph}
          </p>,
        );
      });
    }

    return elements;
  };

  const handleNoteChange = (itemId: string, note: string) => {
    const newState = { ...itemStates[itemId], note };
    setItemStates((prev) => ({ ...prev, [itemId]: newState }));
  };

  if (!checklist) return <LoadingSpinner text="Đang tải checklist..." />;

  return (
    <div className="antialiased bg-gray-50 min-h-screen">
      {/* Main content with blur effect */}
      <div
        className={`min-h-screen py-8 px-2 sm:px-4 lg:px-6`}
        style={showSuccessPopup ? { filter: 'blur(3px)' } : {}}
      >
        {' '}
        {/* Apply blur effect conditionally */}
        <div className="container mx-auto max-w-5xl bg-white text-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-8 border border-gray-200">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200 text-sm font-medium border border-blue-200 py-2 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Quay lại danh sách
          </button>

          <div className="text-center mb-6">
            {/* Wrap h1 and img in a flex container */}
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

          {/* User and Task Code Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-base font-semibold text-gray-700">
                Developer <span className="text-red-500">*</span>
              </label>
              <CommonSelect
                options={users}
                value={selectedUserId}
                onChange={setSelectedUserId}
                placeholder="-- Chọn người --"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-semibold text-gray-700">
                Mã task <span className="text-red-500">*</span>
              </label>
              <input
                className="appearance-none block w-full bg-white border border-gray-300 text-gray-800 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out shadow-sm text-base"
                type="text"
                placeholder="Nhập mã task (VD: TASK-001)"
                value={taskCode}
                onChange={(e) => setTaskCode(e.target.value)}
              />
            </div>
          </div>

          {/* Checklist items */}
          <ul className="space-y-6">
            {checklist.items.map((item) => {
              const state = itemStates[item._id] || { status: '', note: '' };
              const isExpanded = expandedItems[item._id] || false;

              let barColorClass = 'bg-gray-400'; // Default color
              if (state.status === 'OK') {
                barColorClass = 'bg-green-500';
              } else if (state.status === 'notOK') {
                barColorClass = 'bg-red-500';
              } else if (state.status === 'na') {
                barColorClass = 'bg-slate-400';
              }

              const isNoteRequired =
                state.status === 'notOK' || state.status === 'na';
              const isChecked = state.status !== '';

              return (
                <li
                  key={item._id}
                  className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 ease-in-out border border-gray-200"
                >
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-2 ${barColorClass} rounded-l-lg`}
                  ></div>

                  <div className="pl-6 p-4">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleItem(item._id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <p className="font-semibold text-lg text-gray-800 flex-grow">
                        {item.label}
                      </p>
                      <svg
                        className={`w-4 h-4 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
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
                    </div>

                    <div
                      className={`overflow-hidden transition-max-height duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
                    >
                      <div className="mt-4 space-y-3">
                        {item.description && (
                          <div>
                            <hr className="my-4 border-gray-200" />
                            {renderDescriptionContent(item.description)}
                            <hr className="my-4 border-gray-200" />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            {['OK', 'notOK', 'na'].map((statusOption) => {
                              const isSelected = state.status === statusOption;
                              let optionClasses = '';
                              if (statusOption === 'OK') {
                                optionClasses = isSelected
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
                              } else if (statusOption === 'notOK') {
                                optionClasses = isSelected
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
                              } else if (statusOption === 'na') {
                                optionClasses = isSelected
                                  ? 'bg-slate-600 text-white border-slate-600'
                                  : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300';
                              }
                              return (
                                <button
                                  key={statusOption}
                                  onClick={() =>
                                    handleStatusChange(
                                      item._id,
                                      statusOption as Status,
                                    )
                                  }
                                  className={`px-4 py-2 rounded-md font-medium text-xs transition-all duration-200 ease-in-out border ${optionClasses}`}
                                >
                                  {statusOption === 'OK'
                                    ? 'OK'
                                    : statusOption === 'notOK'
                                      ? 'Not OK'
                                      : 'N/A'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <label
                          htmlFor={`note-${item._id}`}
                          className="block text-sm font-medium text-gray-700 mt-3"
                        >
                          Lý do / Ghi chú{' '}
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
                          placeholder={
                            isNoteRequired ? 'Bắt buộc' : 'Không bắt buộc'
                          }
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
                          rows={2}
                          required={isNoteRequired}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {/* Save Button */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-md w-full text-base tracking-wide 
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 
                     shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSaveButtonDisabled}
            onClick={saveChecklist}
          >
            Lưu Checklist
          </button>
        </div>
      </div>

      {/* Success Popup - Rendered without overlay */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {' '}
          {/* Position fixed and centered */}
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto text-center border border-gray-200">
            {' '}
            {/* Popup content */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Thành công!
            </h3>
            <p className="text-gray-700 mb-6">
              Checklist của bạn đã được lưu thành công.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out"
            >
              OK
            </button>
          </div>{' '}
          {/* End Popup content */}
        </div>
      )}
    </div>
  );
}
