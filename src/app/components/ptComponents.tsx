import { urlFor } from '@/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { PortableTextComponents } from 'next-sanity';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ptComponents: PortableTextComponents = {
  types: {
    code: ({ value }) => {
      if (!value || !value.code) return null;
      return (
        <div className="my-4 rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language={value.language || 'text'}
            style={coldarkDark}
            showLineNumbers
          >
            {value.code}
          </SyntaxHighlighter>
        </div>
      );
    },
    image: ({ value }) => {
      if (!value?.asset?._ref) return null;
      return (
        <div className="flex justify-center my-6">
          <img
            alt={value.alt || ' '}
            loading="lazy"
            src={urlFor(value as SanityImageSource)
              .auto('format')
              .url()}
            className="rounded-lg shadow-lg max-w-full h-auto"
          />
        </div>
      );
    },
  },
};



export default ptComponents;
