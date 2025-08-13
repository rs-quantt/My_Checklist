export type User = {
  hashedPassword?: string | null;
  role: 'admin' | 'user';
  _id: string;
  name: string;
  email: string;
  image?: string;
  checklistCompletion?: Record<string, boolean>;
  _createdAt?: string;
};
