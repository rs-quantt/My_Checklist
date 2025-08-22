'use client';

import { getRules } from '@/services/ruleService';
import { Rule } from '@/types/rule';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import LoadingSpinner from '@/app/components/LoadingSpinner';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const RulesPage = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const fetchedRules = await getRules();
        setRules(fetchedRules);
      } catch (error) {
        console.error('Failed to fetch rules:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Rules</h1>
        <p className="mt-2 text-lg text-gray-600">
          Here you can find a list of all the rules.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {rules.map((rule) => (
            <Link href={`/rules/${rule._id}`} key={rule._id}>
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer border border-gray-200 h-full flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-blue-900 mr-4" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {rule.title}
                  </h2>
                </div>
                <p className="text-gray-700 flex-grow">{rule.description}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default RulesPage;
