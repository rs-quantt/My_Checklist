'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env.client';
import { FaRegCheckSquare, FaTimes } from 'react-icons/fa';

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

type Status = 'OK' | 'notOK' | 'na';

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
    if (!selectedUserId || !taskCode) {
      alert('Vui lòng chọn người làm và nhập mã task.'); // Use alert for user visibility
      return;
    }

    // Validate notes for 'notOK' and 'na' statuses
    const validationErrors: string[] = [];
    checklist?.items.forEach(item => {
      const state = itemStates[item._id] || { status: 'na', note: '' }; // Ensure state is initialized
      if ((state.status === 'notOK' || state.status === 'na') && !state.note.trim()) {
        validationErrors.push(`Mục "${item.label}" yêu cầu ghi chú.`);
      }
    });

    if (validationErrors.length > 0) {
      alert('Vui lòng điền đầy đủ ghi chú cho các mục bắt buộc:\n' + validationErrors.join('\n'));
      return;
    }

    const payload = {
      userId: selectedUserId,
      taskCode,
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
      alert('Lưu checklist thất bại. Vui lòng thử lại.'); // Provide user feedback
    } else {
      console.log('Lưu thành công!');
      alert('Lưu checklist thành công!'); // Provide user feedback
    }
  };

  const handleStatusChange = (itemId: string, status: Status) => {
    const newState = { ...itemStates[itemId], status };
    setItemStates((prev) => ({ ...prev, [itemId]: newState }));
  };

  const handleNoteChange = (itemId: string, note: string) => {
    const newState = { ...itemStates[itemId], note };
    setItemStates((prev) => ({ ...prev, [itemId]: newState }));
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Utility function to render description with code blocks
  const renderDescriptionContent = (text: string) => {
    if (!text) return null;

    const elements = [];
    let lastIndex = 0;
    const regex = /```([\s\S]*?)```/g; // Changed to capture content directly

    let match;
    while ((match = regex.exec(text)) !== null) {
      // Add text before the current code block
      if (match.index > lastIndex) {
        const preCodeText = text.substring(lastIndex, match.index);
        preCodeText.split('\n').forEach((paragraph, pIndex) => {
          elements.push(
            <p key={`text-${lastIndex}-${pIndex}`} className="text-sm text-gray-700 leading-relaxed mb-1">
              {paragraph}
            </p>
          );
        });
      }

      // Add the code block
      const codeContent = match[1].trim(); // Captured group is the content inside backticks
      elements.push(
        <pre key={`code-${match.index}`} className="bg-gray-100 p-3 rounded-md overflow-auto text-sm my-2 border border-gray-200">
          <code className="text-gray-800 font-mono">
            {codeContent}
          </code>
        </pre>
      );

      lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last code block
    if (lastIndex < text.length) {
      const postCodeText = text.substring(lastIndex);
      postCodeText.split('\n').forEach((paragraph, pIndex) => {
        elements.push(
          <p key={`text-end-${lastIndex}-${pIndex}`} className="text-sm text-gray-700 leading-relaxed mb-1">
            {paragraph}
          </p>
        );
      });
    }

    return elements;
  };

  if (!checklist)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-4xl text-blue-600 font-bold">
        <div className="relative w-24 h-24 flex justify-center items-center">
          <div className="absolute w-full h-full border-8 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
          <FaRegCheckSquare className="text-blue-500 text-4xl" />
        </div>
        <p className="mt-4">Đang tải checklist...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white py-8 px-2 sm:px-4 lg:px-6">
      <div className="container mx-auto max-w-2xl bg-white text-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-8 border border-gray-200">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <svg
            className="w-4 h-4 mr-1" 
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight mb-3">
            {checklist.title}
          </h1>
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
              Chọn người làm:
            </label>
            <div className="relative">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-800 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out shadow-sm text-base"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Chọn người --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-base font-semibold text-gray-700">
              Mã task:
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
          {checklist.items.map((item, index) => {
            const state = itemStates[item._id] || { status: 'na', note: '' };
            const isExpanded = expandedItems[item._id] || false;

            let barColorClass = 'bg-gray-400'; // Default color for 'na' or unselected
            let statusButtonClasses = '';

            if (state.status === 'OK') {
              barColorClass = 'bg-green-500';
              statusButtonClasses = 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
            } else if (state.status === 'notOK') {
              barColorClass = 'bg-red-500';
              statusButtonClasses = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
            } else if (state.status === 'na') {
              barColorClass = 'bg-gray-400';
              statusButtonClasses = 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300';
            }

            return (
              <li
                key={item._id}
                className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 ease-in-out border border-gray-200"
              >
                {/* Colored left bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-2 ${barColorClass} rounded-l-lg`}
                ></div>

                <div className="pl-6 p-4">
                  {/* Item Title - Clickable */}
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleItem(item._id)}
                  >
                    <p className="font-semibold text-lg text-gray-800">
                      {index + 1}. {item.label}
                    </p>
                    <svg
                      className={`w-4 h-4 text-gray-500 transform transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>

                  {/* Item Details - Conditionally rendered */}
                  <div
                    className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
                      isExpanded ? 'max-h-[1000px]' : 'max-h-0'
                    }`}
                  >
                    <div className="mt-4 space-y-3">
                      {item.description && (
                        <div>
                          {renderDescriptionContent(item.description)}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-sm font-medium text-gray-700">
                          Trạng thái:
                        </span>
                        {[ 'OK', 'notOK', 'na' ].map((statusOption) => {
                          const isSelected = state.status === statusOption;
                          const baseClasses = `px-3 py-1 rounded-full font-medium text-xs transition-all duration-200 ease-in-out border `;
                          const selectedRing = isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : '';

                          let optionClasses = '';
                          if (statusOption === 'OK') {
                            optionClasses = isSelected
                              ? `bg-green-600 text-white`
                              : `bg-green-100 text-green-800 border-green-200 hover:bg-green-200`;
                          } else if (statusOption === 'notOK') {
                            optionClasses = isSelected
                              ? `bg-red-600 text-white`
                              : `bg-red-100 text-red-800 border-red-200 hover:bg-red-200`;
                          } else if (statusOption === 'na') {
                            optionClasses = isSelected
                              ? `bg-gray-700 text-white`
                              : `bg-gray-300 text-gray-800 border-gray-400 hover:bg-gray-400`;
                          }

                          return (
                            <button
                              key={statusOption}
                              onClick={() =>
                                handleStatusChange(item._id, statusOption as Status)
                              }
                              className={`${baseClasses} ${optionClasses} ${selectedRing}`}
                            >
                              {statusOption === 'OK'
                                ? 'Đạt'
                                : statusOption === 'notOK'
                                  ? 'Không đạt'
                                  : 'Không áp dụng'}
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        value={state.note}
                        onChange={(e) =>
                          handleNoteChange(item._id, e.target.value)
                        }
                        placeholder={state.status === 'OK' ? "Lý do / ghi chú (không bắt buộc)" : "Lý do / ghi chú (bắt buộc)"}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition duration-200 ease-in-out"
                        rows={2}
                        required={state.status === 'notOK' || state.status === 'na'}
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
                     shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={saveChecklist}
        >
          Lưu Checklist
        </button>
      </div>
    </div>
  );
}
