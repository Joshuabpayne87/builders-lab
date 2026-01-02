// Quick script to set up CRM database tables in Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔄 Reading SQL file...');
    const sqlFile = fs.readFileSync(path.join(__dirname, 'CRM_SETUP.sql'), 'utf8');

    console.log('🔄 Executing SQL in Supabase...');
    console.log('Note: This may take a moment...\n');

    // Split by semicolons and execute each statement
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.trim().startsWith('--')) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { query: statement });

        if (error) {
          console.error(`❌ Error on statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          successCount++;
          process.stdout.write(`✅ Executed ${successCount}/${statements.length} statements\r`);
        }
      } catch (err) {
        console.error(`❌ Error on statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n\n✅ Database setup complete!`);
    console.log(`   - Successful: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`   - Errors: ${errorCount} statements`);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nPlease run the SQL manually in Supabase SQL Editor:');
    console.error('https://supabase.com/dashboard/project/ezmasjohcortyqxzwkbc/sql/new');
    process.exit(1);
  }
}

setupDatabase();
