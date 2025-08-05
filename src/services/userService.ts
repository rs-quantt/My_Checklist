import { client } from '@/sanity/lib/client';
import { User } from '@/types/user';

export async function createUser(user: Omit<User, '_id'>): Promise<User> {
  try {
    const newUser = await client.create({
      _type: 'user',
      ...user,
    });
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function countUsers(): Promise<number> {
  try {
    const count = await client.fetch<number>(`count(*[_type == "user"])`);
    return count;
  } catch (error) {
    console.error('Error counting users:', error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  await client.delete(userId);
}

export async function getUsers(): Promise<User[]> {
  try {
    const users = await client.fetch(`*[_type == "user" && role == "user"]{
      _id,
      name,
      email,
    }`);
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
