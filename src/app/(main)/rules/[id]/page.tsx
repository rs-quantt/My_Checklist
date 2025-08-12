'use client';

import { useEffect, useState } from 'react';
import { PortableText } from '@portabletext/react';
import { useParams } from 'next/navigation';

import BackButton from '@/app/components/BackButton';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { portableTextComponents } from '@/app/components/PortableTextComponents';
import { Rule } from '@/types/rule';

const RuleDetailPage = () => {
  const params = useParams();
  const id = params.id as string;

  const [rule, setRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRule = async () => {
      try {
        const response = await fetch(`/api/rules/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch rule');
        }
        const data = await response.json();
        setRule(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRule();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Rule not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>
          <article className="bg-white rounded-lg shadow-lg p-8">
            <header className="mb-6">
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                {rule.title}
              </h1>
              {rule.description && (
                <p className="text-lg text-gray-600">{rule.description}</p>
              )}
            </header>
            <div className="prose prose-lg max-w-none prose-indigo">
              <PortableText
                value={rule.content}
                components={portableTextComponents}
              />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default RuleDetailPage;
