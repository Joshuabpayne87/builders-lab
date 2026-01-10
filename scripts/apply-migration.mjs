#!/usr/bin/env node
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read migration file
const migrationPath = join(__dirname, '../supabase/migrations/20260110_user_powerups_rls.sql');
const migrationSQL = readFileSync(migrationPath, 'utf8');

console.log('Applying migration: 20260110_user_powerups_rls.sql');
console.log('This will update RLS policies to allow user-owned powerups...\n');

// Split by semicolon and filter out comments/empty lines
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  if (!statement) continue;

  try {
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

    if (error) {
      // Try direct execution via REST API if RPC fails
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: statement + ';' })
      });

      if (!response.ok) {
        // If both fail, we need to use pg connection or dashboard
        console.warn(`⚠️  Could not execute via RPC, needs manual application`);
        errorCount++;
        continue;
      }
    }

    successCount++;
  } catch (err) {
    console.error(`❌ Error on statement ${i + 1}:`, err.message);
    errorCount++;
  }
}

console.log(`\n✅ Migration complete: ${successCount} statements executed successfully`);
if (errorCount > 0) {
  console.log(`⚠️  ${errorCount} statements need manual application via Supabase SQL Editor`);
  console.log('\nTo apply manually:');
  console.log('1. Go to: https://supabase.com/dashboard/project/ezmasjohcortyqxzwkbc/sql/new');
  console.log('2. Copy the contents of: supabase/migrations/20260110_user_powerups_rls.sql');
  console.log('3. Paste and run in SQL Editor');
}
