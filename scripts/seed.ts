import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Should be used for seeding
);

async function seed() {
  console.log('Seeding database...');

  // 1. Seed Tracks
  const { error: trackError } = await supabase.from('tracks').upsert([
    { id: 'e5555555-5555-5555-5555-555555555555', title: 'Test Track One', genre: 'Hip-Hop', status: 'active' },
    { id: 'f6666666-6666-6666-6666-666666666666', title: 'Test Track Two', genre: 'R&B', status: 'active' },
  ]);

  if (trackError) console.error('Error seeding tracks:', trackError);
  else console.log('Tracks seeded successfully.');

  // 2. Seed Beats
  const { error: beatError } = await supabase.from('beat_store_products').upsert([
    { id: 'c3333333-3333-3333-3333-333333333333', title: 'Test Beat One', genre: 'Hip-Hop', status: 'active' },
    { id: 'd4444444-4444-4444-4444-444444444444', title: 'Test Beat Two', genre: 'R&B', status: 'active' },
  ]);

  if (beatError) console.error('Error seeding beats:', beatError);
  else console.log('Beats seeded successfully.');

  console.log('Seeding complete.');
}

seed().catch(console.error);
