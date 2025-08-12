import { PortableTextBlock } from '@portabletext/types';

export interface Rule {
  _id: string;
  title: string;
  description?: string;
  content: PortableTextBlock[];
}
