import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: levels, error } = await supabase.from('niveles').select('*');
  if (error) {
    console.error('Error fetching levels:', error);
  } else {
    console.log('Levels in DB:', levels);
  }
}

check();
