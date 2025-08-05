
import { createClient } from 'next-sanity';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { userType } from '../src/sanity/schemaTypes/userType';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function seedAdminUser() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const adminUser = {
    _type: userType.name,
    name: 'Admin',
    email: ADMIN_EMAIL,
    hashedPassword,
    role: 'admin',
  };

  try {
    const existingUser = await client.fetch(`*[_type == "user" && email == $email][0]`, { email: ADMIN_EMAIL });

    if (existingUser) {
      console.log('Admin user already exists.');
      return;
    }

    const createdUser = await client.create(adminUser);
    console.log('Admin user created:', createdUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

seedAdminUser();
