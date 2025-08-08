'use client';

import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';

type ChartDataItem = {
  name: string;
  value: number;
};

type ChecklistPieChartProps = {
  data: ChartDataItem[];
};

const generateColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash % 360);
  const saturation = 70;
  const lightness = 55;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props;

  // Adjusted text position for a more compact layout
  const textY = cy - outerRadius - 35;
  const shadowColor = fill.replace('hsl', 'hsla').replace(')', ', 0.6)');
  const darkerTextColor = fill.replace(/, \d+%\)/, ', 25%)');

  return (
    <g>
      <motion.g
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ filter: `drop-shadow(0px 8px 16px ${shadowColor})` }}
      >
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={3}
          stroke="#fff"
          strokeWidth={2}
        />
      </motion.g>

      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <text
          x={cx}
          y={textY - 5}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-lg font-extrabold"
          fill={darkerTextColor}
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={textY + 14}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-base font-medium"
          fill={darkerTextColor}
        >
          {`${(percent * 100).toFixed(0)}% (${payload.value} completions)`}
        </text>
      </motion.g>
    </g>
  );
};

export default function ChecklistPieChart({ data }: ChecklistPieChartProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = useCallback(
    (_: unknown, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex],
  );

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, [setActiveIndex]);

  return (
    // Reduced padding for a more compact card
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 h-full flex flex-col">
      <div className="flex items-center mb-2">
        <FaClipboardList className="text-green-500 text-2xl mr-3 mb-3" />
        <h3 className="text-xl font-semibold text-gray-800">
          Checklist Completion
        </h3>
      </div>
      {totalValue > 0 ? (
        // Reduced height of the container
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              // @ts-expect-error - Recharts has incorrect types for the Pie component
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Adjusted for new size
              outerRadius={100} // Adjusted for new size
              dataKey="value"
              nameKey="name"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              paddingAngle={0}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={generateColorFromName(entry.name)}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <FaClipboardList className="text-gray-300 text-6xl mb-4" />
            <p className="text-gray-500 font-medium">
              No checklist completions recorded yet.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Start a new task to see data here.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
