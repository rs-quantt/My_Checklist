import urlBuilder from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import React from 'react';

const builder = urlBuilder(client);

interface CodeBlock {
  language: string;
  code: string;
}

interface TableBlock {
  rows: {
    cells: string[];
  }[];
}

interface BlockProps {
    children?: React.ReactNode;
}

export const portableTextComponents = {
  types: {
    image: ({ value }: { value: SanityImageSource & { alt?: string } }) => (
      <img
        src={builder.image(value).url()}
        alt={value.alt || ' '}
        loading="lazy"
        className="my-4 rounded-lg shadow-md"
      />
    ),
    code: ({ value }: { value: CodeBlock }) => {
      const { language, code } = value;
      return (
        <SyntaxHighlighter
          style={coldarkDark}
          language={language || 'text'}
          showLineNumbers
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'inherit',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
    },
    table: ({ value }: { value: TableBlock }) => {
      const { rows } = value;
      if (!rows || rows.length === 0) return null;

      const [headerRow, ...bodyRows] = rows;

      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                {headerRow.cells.map((cell: string, cellIndex: number) => (
                  <th
                    key={cellIndex}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bodyRows.map(
                (row: { cells: string[] }, rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.cells.map((cell: string, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      );
    },
  },
  block: {
    h1: ({ children }: BlockProps) => <h1 className="text-4xl font-bold my-4">{children}</h1>,
    h2: ({ children }: BlockProps) => <h2 className="text-3xl font-bold my-4">{children}</h2>,
    h3: ({ children }: BlockProps) => <h3 className="text-2xl font-bold my-4">{children}</h3>,
    h4: ({ children }: BlockProps) => <h4 className="text-xl font-bold my-4">{children}</h4>,
    h5: ({ children }: BlockProps) => <h5 className="text-lg font-bold my-4">{children}</h5>,
    h6: ({ children }: BlockProps) => <h6 className="text-base font-bold my-4">{children}</h6>,
    blockquote: ({ children }: BlockProps) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic">
        {children}
      </blockquote>
    ),
  },
};
