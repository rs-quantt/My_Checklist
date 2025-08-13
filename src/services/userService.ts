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

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const query = `*[_type == "user" && email == $email][0]{..., "hashedPassword": hashedPassword}`;
    const user = await client.fetch<User>(query, { email });
    return user || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function countUsers(searchQuery?: string): Promise<number> {
  try {
    let query = `count(*[_type == "user"`;
    if (searchQuery) {
      query += ` && (name match $searchQuery || email match $searchQuery)`;
    }
    query += `])`;
    const params = { searchQuery: `*${searchQuery}*` };
    const count = await client.fetch<number>(query, params);
    return count || 0;
  } catch (error) {
    console.error('Error counting users:', error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  await client.delete(userId);
}

export async function getUsers(
  offset: number = 0,
  limit: number = 10,
  searchQuery?: string,
): Promise<User[]> {
  try {
    let query = `*[_type == "user"`;
    if (searchQuery) {
      query += ` && (name match $searchQuery || email match $searchQuery)`;
    }
    query += `] | order(role asc, _createdAt desc) [${offset}...${offset + limit}] {
      _id,
      name,
      email,
      image,
      _createdAt,
      role
    }`;
    const params = { searchQuery: `*${searchQuery}*` };
    const users = await client.fetch(query, params);
    return users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function updateUser(
  userId: string,
  userData: Partial<Omit<User, '_id'>> & { isAdmin?: boolean },
): Promise<User> {
  try {
    const { isAdmin, ...restUserData } = userData;

    const updatePayload: Partial<User> = { ...restUserData };

    if (typeof isAdmin === 'boolean') {
      updatePayload.role = isAdmin ? 'admin' : 'user';
    }

    const updatedUser = await client
      .patch(userId)
      .set(updatePayload)
      .commit<User>();
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
