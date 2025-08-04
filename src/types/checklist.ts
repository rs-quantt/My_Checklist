export interface ChecklistItem {
  _id: string;
  label: string;
  description?: string;
  order?: number;
}

export interface Checklist {
  _id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}