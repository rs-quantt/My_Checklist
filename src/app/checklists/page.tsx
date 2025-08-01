'use client'; // Nếu App Router
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
// Import thêm icon tìm kiếm và xóa
import { FaRegCheckSquare, FaSearch, FaTimes } from 'react-icons/fa';

type ChecklistItem = {
  _id: string;
  label: string;
  description?: string;
  order?: number;
};

type Checklist = {
  _id: string;
  title: string;
  description?: string; // Giữ lại description
  // Đã xóa type: string;
  items: ChecklistItem[];
};

const cardBackgrounds = [
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-purple-50',
];

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/checklists');
        if (!response.ok) {
          throw new Error(`Error fetching checklists: ${response.statusText}`);
        }
        const result = await response.json();
        setChecklists(result);
      } catch (err) {
        console.error('Failed to fetch checklists:', err);
        setError('Failed to load checklists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredChecklists = useMemo(() => {
    if (!searchQuery) {
      return checklists;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return checklists.filter(
      (checklist) =>
        checklist.title.toLowerCase().includes(lowercasedQuery) ||
        (checklist.description &&
          checklist.description.toLowerCase().includes(lowercasedQuery)),
      // Logic tìm kiếm không còn tìm theo type
    );
  }, [checklists, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        <FaRegCheckSquare className="animate-spin text-blue-500 mr-3 text-3xl" />{' '}
        Loading checklists...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        <FaTimes className="mr-2 text-2xl" /> Error: {error}
      </div>
    );
  }

  return (
    <div className="antialiased">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
          Checklist Dashboard
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Manage your tasks and track your progress effortlessly.
        </p>

        <div className="mt-8 mx-auto w-full max-w-md px-4 sm:px-0 relative">
          <input
            type="text"
            placeholder="Search checklists by title or description..."
            className="
              w-full p-3 pl-10 rounded-lg border border-gray-200 shadow-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white
              text-gray-800 placeholder-gray-500
              transition-all duration-200 ease-in-out
              focus:shadow-xl focus:scale-[1.005]
            "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto p-8 mt-8">
        {filteredChecklists.length === 0 && searchQuery !== '' ? (
          <div className="text-center text-gray-500 text-xl py-10">
            <FaSearch className="mx-auto text-4xl mb-4 text-gray-400" />
            No checklists found matching "{searchQuery}". Try a different search
            term.
          </div>
        ) : filteredChecklists.length === 0 && searchQuery === '' ? (
          <div className="text-center text-gray-500 text-xl py-10">
            <FaRegCheckSquare className="mx-auto text-4xl mb-4 text-gray-400" />
            It looks like you don't have any checklists yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist, index) => (
              <Link
                key={checklist._id}
                href={`/checklists/${checklist._id}`}
                passHref
              >
                <div
                  className={`
                    block
                    ${cardBackgrounds[index % cardBackgrounds.length]}
                    border border-gray-200 rounded-xl shadow-sm p-6 cursor-pointer
                    transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-blue-500 hover:bg-opacity-80
                    flex flex-col justify-between
                    animate-fade-in-up
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div>
                    <div className="flex items-center mb-4">
                      <FaRegCheckSquare className="text-blue-600 text-2xl mr-4" />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 leading-tight">
                          {checklist.title}
                        </h2>
                        {checklist.description && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {checklist.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-4 text-right">
                    {checklist.items
                      ? `${checklist.items.length} items`
                      : '0 items'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
