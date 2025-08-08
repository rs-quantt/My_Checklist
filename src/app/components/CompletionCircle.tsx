'use client';

import { motion, Variants } from 'framer-motion';

type CompletionCircleProps = {
  percentage: number;
};

// This component is now styled entirely with Tailwind CSS.
// The size is fixed for a consistent look within the table.
const CompletionCircle = ({ percentage }: CompletionCircleProps) => {
  const size = 40;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

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

  let color = 'text-green-500';
  if (percentage < 75) {
    color = 'text-yellow-500';
  }
  if (percentage < 40) {
    color = 'text-red-500';
  }

  return (
    <div className="flex items-center justify-start gap-1 w-20">
      <div className="relative h-10 w-10">
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
            className="stroke-gray-200"
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={`stroke-current ${color}`}
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
          <span className={`text-sm font-extrabold ${color}`}>
            {percentage.toFixed(0)}
          </span>
        </motion.div>
      </div>
      <span className={`text-sm font-extrabold ${color}`}>%</span>
    </div>
  );
};

export default CompletionCircle;
