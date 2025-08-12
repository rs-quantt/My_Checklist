'use client';

import { PortableText as PortableTextComponent } from '@portabletext/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypedObject } from '@portabletext/types';

const components = {
  types: {
    code: ({ value }: { value: { code: string; language: string } }) => (
      <SyntaxHighlighter language={value.language} style={vscDarkPlus}>
        {value.code}
      </SyntaxHighlighter>
    ),
  },
  marks: {
    color: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value?: { color?: string };
    }) => <span style={{ color: value?.color }}>{children}</span>,
  },
};

export const PortableText = ({ value }: { value: TypedObject | TypedObject[] }) => {
  return <PortableTextComponent value={value} components={components} />;
};
