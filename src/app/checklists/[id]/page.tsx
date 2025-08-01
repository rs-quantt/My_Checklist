'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env.client';

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
  type: string;
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
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [taskCode, setTaskCode] = useState<string>('');
  const [itemStates, setItemStates] = useState<ItemStateMap>({});
  const [expandedItems, setExpandedItems] = useState<{
    [itemId: string]: boolean;
  }>({}); // State to track expanded items

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const checklistResult = await client.fetch(
        `*[_type == "checklist" && _id == $id][0]{
          _id,
          title,
          type,
          "items": *[_type == "checklistItem" && checklist._ref == ^._id] | order(order asc){
            _id,
            label,
            description,
            order
          }
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
      console.warn('Chưa chọn user hoặc chưa nhập mã task.');
      return;
    }

    // Assuming you want to save all items when the button is clicked
    for (const itemId in itemStates) {
      const { note, status } = itemStates[itemId];
      const res = await fetch('/api/save-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          taskCode,
          itemId,
          note,
          status,
        }),
      });

      if (!res.ok) {
        console.error('Lưu thất bại:', await res.text());
      }
    }
  };

  const handleStatusChange = async (itemId: string, status: Status) => {
    const newState = { ...itemStates[itemId], status };
    setItemStates((prev) => ({ ...prev, [itemId]: newState }));
  };

  const handleNoteChange = async (itemId: string, note: string) => {
    const newState = { ...itemStates[itemId], note };
    setItemStates((prev) => ({ ...prev, [itemId]: newState }));
  };

  // Function to toggle item expansion
  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (!checklist)
    return (
      <div className="p-8 text-center text-gray-800">Đang tải checklist...</div>
    );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-gray-100 text-gray-800 rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold tracking-tight text-center text-blue-800 sm:text-5xl">
        {checklist.title}
      </h1>
      <div className="flex justify-center items-center mt-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {checklist.type}
        </span>
      </div>

      {/* Select user */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Chọn người làm:
        </label>
        <select
          className="border border-gray-300 bg-white text-gray-800 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      </div>

      {/* Task code */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Mã task:
        </label>
        <input
          className="border border-gray-300 bg-white text-gray-800 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="text"
          placeholder="Nhập mã task (VD: TASK-001)"
          value={taskCode}
          onChange={(e) => setTaskCode(e.target.value)}
        />
      </div>

      {/* Checklist items */}
      <ul className="space-y-6">
        {checklist.items.map((item, index) => {
          const state = itemStates[item._id] || { status: 'na', note: '' };
          const isExpanded = expandedItems[item._id] || false; // Check if item is expanded

          return (
            <li
              key={item._id}
              className="border border-gray-300 p-4 rounded-md bg-white shadow-sm cursor-pointer"
            >
              {/* Item Title - Clickable */}
              <div
                className="flex justify-between items-center"
                onClick={() => toggleItem(item._id)}
              >
                <p className="font-semibold text-gray-800">
                  {index + 1}. {item.label}
                </p>
                {/* Optional: Add an arrow icon to indicate expanded/collapsed state */}
                <svg
                  className={
                    `w-5 h-5 text-gray-600 transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`
                  }
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
                className={`overflow-hidden transition-max-height duration-1000 ease-in-out ${
                  isExpanded ? 'max-h-[500px]' : 'max-h-0'
                }`}
              >
                <div className="mt-4 space-y-3">
                  {item.description && (
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-medium text-gray-700">
                      Trạng thái:
                    </span>
                    {['OK', 'notOK', 'na'].map((status) => (
                      <label
                        key={status}
                        className={`flex items-center gap-1 text-gray-800 text-sm cursor-pointer relative 
                          ${status === 'OK' ? 'text-green-600' : status === 'notOK' ? 'text-red-600' : 'text-gray-600'}
                        `}
                      >
                        <input
                          type="radio"
                          value={status}
                          checked={state.status === status}
                          onChange={() =>
                            handleStatusChange(item._id, status as Status)
                          }
                          className="sr-only peer"
                        />
                        <div className={
                          `w-5 h-5 border-2 rounded-full peer-checked:bg-current peer-checked:border-transparent flex items-center justify-center transition-all duration-200 ease-in-out
                          ${status === 'OK' ? 'border-green-600' : status === 'notOK' ? 'border-red-600' : 'border-gray-600'}
                          `
                        }>
                           <div className={
                             `w-2 h-2 rounded-full bg-white transition-all duration-200 ease-in-out ${
                               state.status === status ? 'scale-100' : 'scale-0'
                             }`
                           }></div>
                        </div>

                        {status === 'OK'
                          ? 'OK'
                          : status === 'notOK'
                            ? 'Not OK'
                            : 'N/A'}
                      </label>
                    ))}
                  </div>
                  {state.status !== 'OK' && (
                    <textarea
                      value={state.note}
                      onChange={(e) =>
                        handleNoteChange(item._id, e.target.value)
                      }
                      placeholder="Lý do / ghi chú"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      rows={3}
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {/* Save Button */}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md w-full transition-colors duration-200 shadow-md"
        onClick={saveChecklist}
      >
        Lưu Checklist
      </button>
    </div>
  );
}
