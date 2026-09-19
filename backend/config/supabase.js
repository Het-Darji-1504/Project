const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://flzbgvhampusyphopqax.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsemJndmhhbXB1c3lwaG9wcWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDkxNjAsImV4cCI6MjEwNTMyNTE2MH0.AZvpmsLdxU3QSXc9NPoR8TNVNiRsn6yqqx26adu0oZU';

let supabase = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log(`[Supabase Connected]: Project URL -> ${supabaseUrl}`);
  } else {
    console.warn('[Supabase Warning]: Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }
} catch (error) {
  console.error('[Supabase Init Error]:', error.message);
}

module.exports = supabase;
