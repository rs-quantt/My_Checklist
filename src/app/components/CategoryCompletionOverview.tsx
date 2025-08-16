'use client';

import { motion, Variants } from 'framer-motion';

interface CategoryCompletionOverviewProps {
  title: string;
  description?: string;
  overallCompletionPercentage: number;
  checklistsCompletedCount: number;
  totalChecklistsCount: number;
}

export default function CategoryCompletionOverview({
  title,
  description,
  overallCompletionPercentage,
  checklistsCompletedCount,
  totalChecklistsCount,
}: CategoryCompletionOverviewProps) {
  const size = 150; // Reduced size for a more compact look
  const strokeWidth = 12; // Slightly thinner stroke
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallCompletionPercentage / 100) * circumference;

  const circleVariants: Variants = {
    hidden: { strokeDashoffset: circumference },
    visible: {
      strokeDashoffset: offset,
      transition: {
        duration: 1.5,
        ease: 'easeOut',
        delay: 0.2,
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        delay: 0.5,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 lg:p-6 flex flex-col items-center text-center lg:items-start lg:text-left"> 
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight"> 
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-md text-gray-600 mb-4">{description}</p> 
      )}

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Overall Completion</h2> 

      {totalChecklistsCount > 0 ? (
        <div className="flex flex-col items-center w-full">
          <div className={`relative h-[${size}px] w-[${size}px] mb-4`}> 
            <svg
              width={size}
              height={size}
              className="h-full w-full -rotate-90"
              viewBox={`0 0 ${size} ${size}`}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                className="stroke-gray-100"
                fill="transparent"
              />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                className={overallCompletionPercentage < 40 ? 'stroke-rose-500' : overallCompletionPercentage < 75 ? 'stroke-amber-500' : 'stroke-emerald-500'} 
                fill="transparent"
                strokeDasharray={circumference}
                strokeLinecap="round"
                variants={circleVariants}
                initial="hidden"
                animate="visible"
              />
            </svg>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              <span className={`text-4xl lg:text-5xl font-extrabold ${overallCompletionPercentage < 40 ? 'text-rose-500' : overallCompletionPercentage < 75 ? 'text-amber-500' : 'text-emerald-500'}`}> 
                {overallCompletionPercentage.toFixed(0)}
              </span>
              <span className={`text-2xl lg:text-3xl font-extrabold ${overallCompletionPercentage < 40 ? 'text-rose-500' : overallCompletionPercentage < 75 ? 'text-amber-500' : 'text-emerald-500'}`}>%</span> 
            </motion.div>
          </div>

          <p className="text-md text-gray-700 mb-4"> 
            <span className="font-semibold text-gray-900">{checklistsCompletedCount}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalChecklistsCount}</span> checklists completed.
          </p>

        </div>
      ) : (
        <p className="text-md text-gray-500 text-center p-3 rounded-lg bg-gray-50/20 w-full">No checklists in this category yet.</p> 
      )}
    </div>
  );
}
