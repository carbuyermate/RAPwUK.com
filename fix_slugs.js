
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

async function migrateTable(tableName, titleField) {
  console.log(`Migrating ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select(`id, ${titleField}, slug`);
  
  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return;
  }

  for (const item of data) {
    if (!item.slug || item.slug === 'null') {
      const newSlug = createSlug(item[titleField] || 'untitled');
      console.log(`Updating ${tableName} ${item.id}: ${newSlug}`);
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ slug: newSlug })
        .eq('id', item.id);
      
      if (updateError) {
        console.error(`Error updating ${item.id}:`, updateError);
      }
    }
  }
  console.log(`Finished ${tableName}`);
}

async function run() {
  await migrateTable('news', 'title');
  await migrateTable('events', 'title');
  await migrateTable('rappers', 'name');
  console.log('Migration complete!');
}

run();
