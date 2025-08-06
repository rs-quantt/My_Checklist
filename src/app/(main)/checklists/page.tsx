'use client'; // Nếu App Router
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
// Import thêm icon tìm kiếm và xóa
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { FaSearch, FaTimes } from 'react-icons/fa';

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
    );
  }, [checklists, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <LoadingSpinner text="Đang tải danh sách checklist..." />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-3xl text-red-600">
        <FaTimes className="text-red-500 mr-2 text-6xl mb-3" /> Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="antialiased bg-gray-50 min-h-screen">
      <div className="bg-blue-600 text-white py-12 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Danh sách Checklist
        </h1>
        <p className="mt-3 text-lg opacity-90 max-w-2xl mx-auto">
          Quản lý công việc và theo dõi tiến độ một cách dễ dàng.
        </p>

        <div className="mt-8 mx-auto w-full max-w-md px-4 sm:px-0 relative">
          <input
            type="text"
            placeholder="Tìm kiếm checklist theo tên hoặc mô tả..."
            className="
              w-full p-3 pl-10 rounded-lg border border-blue-300 shadow-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white
              text-gray-800 placeholder-gray-500
              transition-all duration-200 ease-in-out
              focus:shadow-xl focus:scale-[1.005]
            "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none text-lg"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {filteredChecklists.length === 0 && searchQuery !== '' ? (
          <div className="text-center text-gray-500 text-xl py-10">
            <FaSearch className="mx-auto text-5xl mb-4 text-gray-400" />
            Không tìm thấy checklist nào phù hợp với &quot;{searchQuery}&quot;.
            Hãy thử từ khóa khác.
          </div>
        ) : filteredChecklists.length === 0 && searchQuery === '' ? (
          <div className="text-center text-gray-500 text-xl py-10 animate-fadeIn">
            <img
              src="/check.png"
              alt="Checkmark icon"
              className="w-6 h-6 mr-2 mb-2"
            />
            Bạn chưa có checklist nào. Hãy tạo một cái mới!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist, index) => {
              const hasItems = checklist.items && checklist.items.length > 0;
              const cardContent = (
                <div
                  className={`
                    block
                    bg-white border border-gray-200 rounded-xl shadow-md p-6
                    flex flex-col justify-between
                    ${hasItems 
                      ? 'cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:border-blue-300'
                      : 'opacity-60 cursor-not-allowed bg-gray-50'
                    }
                  `}
                  style={{ animationDelay: `${index * 0.05}s` }} // Giảm delay để nhanh hơn
                >
                  <div>
                    <div className="flex items-start mb-4">
                      <img
                        src="/check.png"
                        alt="Checkmark icon"
                        className="w-6 h-6 mr-2 mt-0.5"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">
                          {checklist.title}
                        </h2>
                        {checklist.description && (
                          <p className="text-gray-600 text-base line-clamp-3">
                            {checklist.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-4 text-right">
                    {hasItems
                      ? `${checklist.items.length} mục`
                      : 'Không có mục nào'}
                  </div>
                </div>
              );

              return hasItems ? (
                <Link key={checklist._id} href={`/checklists/${checklist._id}`}>
                  {cardContent}
                </Link>
              ) : (
                <div key={checklist._id}>
                  {cardContent}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
