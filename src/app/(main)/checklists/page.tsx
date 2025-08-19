'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, Variants } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import {
  FaSearch,
  FaTimes,
  FaQuestionCircle,
  FaPlus,
  FaStar,
  FaCode,
  FaVial,
  FaLightbulb,
  FaTh,
  FaList,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from 'react-icons/fa';
import { ChecklistTour } from '@/app/components/tour/ChecklistTour';

type Checklist = {
  _id: string;
  title: string;
  description?: string;
  type: 'Coding Rule' | 'Test Case' | 'Experience';
  itemCount: number;
  isCommon: boolean;
};

type ViewMode = 'grid' | 'list';
type SortOrder = 'asc' | 'desc';

const getTypeStyle = (type: Checklist['type']) => {
  switch (type) {
    case 'Coding Rule':
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: <FaCode />,
      };
    case 'Test Case':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: <FaVial />,
      };
    case 'Experience':
      return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        icon: <FaLightbulb />,
      };
    default:
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: null,
      };
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

const ChecklistCard = ({ checklist }: { checklist: Checklist }) => {
  const hasItems = checklist.itemCount > 0;
  const typeStyle = getTypeStyle(checklist.type);

  const cardClasses = `
    bg-white rounded-xl border border-gray-200
    flex flex-col h-full
    transition-all duration-300 ease-in-out
    ${
      hasItems
        ? 'cursor-pointer hover:shadow-lg hover:border-blue-400/50 hover:-translate-y-1'
        : 'opacity-70 cursor-not-allowed bg-gray-50/50'
    }
  `;

  const cardContent = (
    <div className={cardClasses.trim()}>
      <div className="p-6 flex-grow">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${typeStyle.bgColor} ${typeStyle.color}`}
        >
          {typeStyle.icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 leading-snug">
          {checklist.title}
        </h2>
        {checklist.isCommon && (
          <div
            className="absolute top-4 right-4 text-yellow-400"
            title="Common Checklist"
          >
            <FaStar size={20} />
          </div>
        )}
        {checklist.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mt-2">
            {checklist.description}
          </p>
        )}
      </div>
      <div className="px-6 py-4 flex justify-end items-center border-t border-gray-100">
        <span className="text-sm font-medium text-gray-500">
          {checklist.itemCount} item{checklist.itemCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div variants={itemVariants} className="relative h-full">
      {hasItems ? (
        <Link href={`/checklists/${checklist._id}`} className="h-full block">
          {cardContent}
        </Link>
      ) : (
        <div className="h-full">{cardContent}</div>
      )}
    </motion.div>
  );
};

const ChecklistListItem = ({ checklist }: { checklist: Checklist }) => {
  const hasItems = checklist.itemCount > 0;
  const typeStyle = getTypeStyle(checklist.type);

  const itemClasses = `
    bg-white rounded-lg border border-gray-200
    flex items-center w-full
    transition-all duration-300 ease-in-out
    p-4 relative
    ${
      hasItems
        ? 'cursor-pointer hover:shadow-md hover:border-blue-400/50 hover:-translate-y-0.5'
        : 'opacity-70 cursor-not-allowed bg-gray-50/50'
    }
  `;

  const content = (
    <div className={itemClasses}>
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg ${typeStyle.bgColor} ${typeStyle.color} mr-4 flex-shrink-0`}
      >
        {typeStyle.icon}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-800">{checklist.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-1">
          {checklist.description}
        </p>
      </div>
      <div className="flex items-center gap-6 mx-6 flex-shrink-0">
        <span className="text-sm font-medium text-gray-500 hidden md:block">
          {checklist.type}
        </span>
        <span className="text-sm font-medium text-gray-500">
          {checklist.itemCount} item{checklist.itemCount !== 1 ? 's' : ''}
        </span>
      </div>
      {checklist.isCommon && (
        <div className="text-yellow-400" title="Common Checklist">
          <FaStar size={18} />
        </div>
      )}
    </div>
  );

  return (
    <motion.div variants={itemVariants}>
      {hasItems ? (
        <Link href={`/checklists/${checklist._id}`} className="block">
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
    </motion.div>
  );
};

export default function ChecklistPage() {
  const { data: session } = useSession();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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

  const sortedChecklists = useMemo(() => {
    let filtered = checklists;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = checklists.filter(
        (checklist) =>
          checklist.title.toLowerCase().includes(lowercasedQuery) ||
          (checklist.description &&
            checklist.description.toLowerCase().includes(lowercasedQuery)),
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  }, [checklists, searchQuery, sortOrder]);

  const commonChecklists = useMemo(
    () => sortedChecklists.filter((c) => c.isCommon),
    [sortedChecklists],
  );

  const otherChecklists = useMemo(
    () => sortedChecklists.filter((c) => !c.isCommon),
    [sortedChecklists],
  );

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
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

  const renderChecklists = (list: Checklist[]) => {
    if (viewMode === 'grid') {
      return list.map((checklist) => (
        <ChecklistCard key={checklist._id} checklist={checklist} />
      ));
    }
    return list.map((checklist) => (
      <ChecklistListItem key={checklist._id} checklist={checklist} />
    ));
  };

  return (
    <div
      className="antialiased bg-gray-50 min-h-screen"
      
    >
      <ChecklistTour />
      <div className="bg-blue-600 text-white py-12 text-center shadow-md relative" style={{
        background:
          'url(https://images.pexels.com/photos/212323/pexels-photo-212323.jpeg)',
        backgroundSize: 'cover',
        backgroundPositionY: '-806px',
        backgroundRepeat: 'no-repeat'
      }}>
        <button
          id="start-tour-button"
          className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors"
          aria-label="Start page tour"
        >
          <FaQuestionCircle size={24} />
        </button>
        <div className="flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            My Checklist
          </h1>
        </div>
        <p className="mt-3 text-lg opacity-90 max-w-2xl mx-auto">
          Manage tasks and track progress easily.
        </p>

        <div
          id="search-bar"
          className="mt-8 mx-auto w-full max-w-md px-4 sm:px-0 relative"
        >
          <input
            type="text"
            placeholder="Search checklists by name or description..."
            className="
              w-full p-3 pl-10 rounded-lg border border-blue-300 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white
              text-gray-800 placeholder-gray-500
              transition-all duration-200 ease-in-out
              focus:shadow-lg
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="inline-block"
          >
            <Link
              id="start-new-task-button"
              href="/my-checklist"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out !text-blue-700"
            >
              <FaPlus className="mr-2 -ml-1" />
              Start a New Task
            </Link>
          </motion.div>
          <p className="mt-3 text-sm text-blue-100 opacity-80 max-w-md mx-auto">
            Select a checklist template, enter your task code, and start your
            review.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-end items-center mb-8 gap-4">
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            <span className="capitalize">
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </span>
          </button>
          <div className="flex items-center gap-1 rounded-lg bg-gray-200 p-1">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative`}
              animate={{ color: viewMode === 'grid' ? '#2563EB' : '#4B5563' }}
            >
              {viewMode === 'grid' && (
                <motion.div
                  layoutId="viewModeHighlight"
                  className="absolute inset-0 bg-white rounded-md shadow-sm"
                />
              )}
              <span className="relative z-10">
                <FaTh />
              </span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative`}
              animate={{ color: viewMode === 'list' ? '#2563EB' : '#4B5563' }}
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId="viewModeHighlight"
                  className="absolute inset-0 bg-white rounded-md shadow-sm"
                />
              )}
              <span className="relative z-10">
                <FaList />
              </span>
            </motion.button>
          </div>
        </div>
        {sortedChecklists.length === 0 && searchQuery !== '' ? (
          <div className="text-center text-gray-500 text-xl py-10">
            <FaSearch className="mx-auto text-5xl mb-4 text-gray-400" />
            No checklists found matching &quot;{searchQuery}&quot;.
          </div>
        ) : sortedChecklists.length === 0 && searchQuery === '' ? (
          <div className="text-center text-gray-500 text-xl py-10 animate-fadeIn">
            <img
              src="/check.png"
              alt="Checkmark icon"
              className="w-8 h-8 mr-2 mb-2 inline-block"
            />
            You don&apos;t have any checklists yet.
          </div>
        ) : (
          <>
            {commonChecklists.length > 0 && (
              <section className="mb-12 common-templates">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2.5">
                  <FaStar className="text-yellow-400" /> Common Templates
                </h2>
                <motion.div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                      : 'space-y-4'
                  }
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {renderChecklists(commonChecklists)}
                </motion.div>
              </section>
            )}

            {otherChecklists.length > 0 && (
              <section className="all-templates">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                  All Templates
                </h2>
                <motion.div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                      : 'space-y-4'
                  }
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {renderChecklists(otherChecklists)}
                </motion.div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
