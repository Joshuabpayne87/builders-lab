// Quick script to set up Knowledge Base database tables in Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔄 Reading SQL file...');
    const sqlFile = fs.readFileSync(path.join(__dirname, 'KNOWLEDGE_BASE_SETUP.sql'), 'utf8');

    console.log('🔄 Executing SQL in Supabase...');
    console.log('Note: This will enable pgvector and create the knowledge base table.\n');

    // Split by semicolons and execute each statement
    // Note: Splitting SQL is tricky with functions ($$), so we'll try to run it as one block if possible,
    // or rely on the user running it manually if this simple split fails.
    // For this specific file, the function definition contains semicolons, so simple splitting might break it.
    // The safest way via client is often to just warn the user.
    
    // However, if we assume the standard "exec_sql" RPC exists:
    const { error } = await supabase.rpc('exec_sql', { query: sqlFile });

    if (error) {
      console.warn(`⚠️  Direct execution failed: ${error.message}`);
      console.warn('   Attempting to split statements (experimental)...');
      
      const statements = sqlFile
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        // Skip the function definition if splitting broke it, usually starts with CREATE FUNCTION
        if (statements[i].includes('CREATE OR REPLACE FUNCTION')) {
             console.log(`ℹ️  Skipping complex function statement ${i+1} (run manually)`);
             continue;
        }
        
        const { error: stmtError } = await supabase.rpc('exec_sql', { query: statements[i] });
        if (stmtError) console.error(`❌ Statement ${i+1} failed:`, stmtError.message);
        else console.log(`✅ Statement ${i+1} executed.`);
      }
    } else {
      console.log('✅ SQL executed successfully!');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    console.log('\nIMPORTANT: If you see errors above, please run the SQL in "KNOWLEDGE_BASE_SETUP.sql" manually in your Supabase SQL Editor.');
  }
}

setupDatabase();
