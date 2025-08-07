'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { FaSearch, FaTimes, FaQuestionCircle, FaPlus } from 'react-icons/fa';
import { ChecklistTour } from '@/app/components/tour/ChecklistTour';

type Checklist = {
  _id: string;
  title: string;
  description?: string;
  type: 'Coding Rule' | 'Test Case' | 'Experience';
  itemCount: number;
};

const getTypeColor = (type: Checklist['type']) => {
  switch (type) {
    case 'Coding Rule':
      return 'bg-blue-100 text-blue-800';
    case 'Test Case':
      return 'bg-green-100 text-green-800';
    case 'Experience':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: (isEvenRow: boolean) => ({
    opacity: 0,
    x: isEvenRow ? -100 : 100,
  }),
  visible: () => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
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
    return <LoadingSpinner text="Loading checklist list..." />;
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
      <ChecklistTour />
      <div className="bg-blue-600 text-white py-12 text-center shadow-md relative">
        <button
          id="start-tour-button"
          className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors"
          aria-label="Start page tour"
        >
          <FaQuestionCircle size={24} />
        </button>
        <div className="flex items-center justify-center">
            <img src="/check.png" alt="Check Icon" className="mr-3 h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                My Checklist
            </h1>
        </div>
        <p className="mt-3 text-lg opacity-90 max-w-2xl mx-auto">
          Manage tasks and track progress easily.
        </p>

        <div id="search-bar" className="mt-8 mx-auto w-full max-w-md px-4 sm:px-0 relative">
          <input
            type="text"
            placeholder="Search checklists by name or description..."
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
        
        <div className="mt-6 text-center">
            <Link href="/my-checklist" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out !text-blue-700">
                <FaPlus className="mr-2 -ml-1" />
                Start a New Task
            </Link>
            <p className="mt-3 text-sm text-blue-100 opacity-80 max-w-md mx-auto">
              Select a checklist template, enter your task code, and start your review.
            </p>
        </div>

      </div>

      <div className="container mx-auto px-4 py-10">
        {filteredChecklists.length === 0 && searchQuery !== '' ? (
          <div className="text-center text-gray-500 text-xl py-10">
            <FaSearch className="mx-auto text-5xl mb-4 text-gray-400" />
            No checklists found matching &quot;{searchQuery}&quot;. Please try a
            different keyword.
          </div>
        ) : filteredChecklists.length === 0 && searchQuery === '' ? (
          <div className="text-center text-gray-500 text-xl py-10 animate-fadeIn">
            <img
              src="/check.png"
              alt="Checkmark icon"
              className="w-6 h-6 mr-2 mb-2 inline-block"
            />
            You don&apos;t have any checklists yet. Let&apos;s create a new one!
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredChecklists.map((checklist, index) => {
              const isEvenRow = Math.floor(index / 3) % 2 === 0;
              const hasItems = checklist.itemCount > 0;
              const cardClasses = `
                block
                bg-white border border-gray-200 rounded-xl shadow-md p-6
                flex flex-col justify-between h-full
                ${
                  hasItems
                    ? 'cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:border-blue-300'
                    : 'opacity-60 cursor-not-allowed bg-gray-50'
                }
                ${index === 0 ? 'checklist-card' : ''}
              `;
              const typeTagClasses = `
                text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full 
                ${getTypeColor(checklist.type)}
                ${index === 0 ? 'checklist-type-tag' : ''}
              `;

              const cardContent = (
                <div
                  className={cardClasses.trim()}
                >
                  <div className="flex-grow">
                    <div className="flex items-center mb-4">
                      <img
                        src="/check.png"
                        alt="Checkmark icon"
                        className="w-6 h-6 mr-3"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 leading-tight">
                          {checklist.title}
                        </h2>
                        {checklist.description && (
                          <p className="text-gray-600 text-base line-clamp-3 mt-1">
                            {checklist.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className={typeTagClasses.trim()}>
                      {checklist.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {checklist.itemCount} item{checklist.itemCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={checklist._id}
                  variants={itemVariants}
                  custom={isEvenRow}
                >
                  {hasItems ? (
                    <Link href={`/checklists/${checklist._id}`}>
                      {cardContent}
                    </Link>
                  ) : (
                    <div>{cardContent}</div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
