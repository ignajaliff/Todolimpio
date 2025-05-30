import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdusoqjnwueedmjcjjwm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdXNvcWpud3VlZWRtamNqandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDQ3MjMsImV4cCI6MjA2NDEyMDcyM30.TvY1RKmoGpm4HbXDfbNhj58Ern56fufrGWuXewji6-8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
}); 