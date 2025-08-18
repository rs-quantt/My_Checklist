import { PortableTextBlock } from "@portabletext/types";
import { Status } from "./enum";

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
  isCommon?: boolean;
}

export interface ChecklistItemState {
  status: Status;
  note: string;
};

export interface ItemState {
  status: Status;
  note: string;
};

export interface ItemStateMap {
  [itemId: string]: ItemState;
};

// New interface for individual user checklist items within a summary
export interface UserChecklistItem {
  itemId: string;
  status: Status;
  note?: string;
  checklistId: string; // Add checklistId here
}

export interface ChecklistSummary {
  _id: string;
  userId: string;
  checklistId: string;
  checklistTitle: string;
  taskCode: string;
  commitMessage?: string;
  createdAt: string;
  updatedAt: string;
  items: UserChecklistItem[]; // Use the new interface here
};