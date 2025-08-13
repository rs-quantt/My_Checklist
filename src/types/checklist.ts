import { PortableTextBlock } from "@portabletext/types";

export interface ChecklistItem {
  _id: string;
  label: string;
  description?: PortableTextBlock[]; // Corresponds to Sanity's portable text array
  priority?: '1' | '2' | '3'; // '1' for High, '2' for Medium, '3' for Low
  category?: string;
}

export interface Checklist {
  _id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}