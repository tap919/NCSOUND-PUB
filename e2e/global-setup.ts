import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

const TEST_USERS = [
  { email: 'testartist@ncsound.test', password: 'test123', role: 'artist', id: 'a1111111-1111-1111-1111-111111111111' },
  { email: 'testadmin@ncsound.test', password: 'test123', role: 'admin', id: 'b2222222-2222-2222-2222-222222222222' },
];

async function createTestUsers() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Missing Supabase credentials for admin API, skipping user creation');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Creating test users via Supabase Admin API...');

  for (const user of TEST_USERS) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.role === 'artist' ? 'Test Artist' : 'Test Admin' },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`User ${user.email} already exists`);
        } else {
          console.error(`Failed to create auth user ${user.email}:`, authError.message);
        }
      } else {
        console.log(`Created auth user: ${user.email}`);
      }

      // Create public.users profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.role === 'artist' ? 'Test Artist' : 'Test Admin',
          role: user.role,
        });

      if (profileError) {
        console.error(`Failed to create profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`Created profile for ${user.email}`);
      }
    } catch (err: any) {
      console.error(`Error creating user ${user.email}:`, err.message);
    }
  }
}

async function seedDatabase() {
  console.log('Seeding database...');
  try {
    execSync('npm run seed', { stdio: 'inherit' });
    console.log('Database seeding complete');
  } catch (err) {
    console.error('Seeding failed:', err);
    throw err;
  }
}

export default async function globalSetup() {
  console.log('=== E2E Global Setup ===');
  
  // First create test users via Admin API
  await createTestUsers();
  
  // Then seed the database with test data
  await seedDatabase();
  
  console.log('=== E2E Setup Complete ===');
}