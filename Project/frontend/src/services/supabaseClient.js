import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flzbgvhampusyphopqax.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsemJndmhhbXB1c3lwaG9wcWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDkxNjAsImV4cCI6MjEwNTMyNTE2MH0.AZvpmsLdxU3QSXc9NPoR8TNVNiRsn6yqqx26adu0oZU';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
