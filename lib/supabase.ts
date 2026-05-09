import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cyvcpyivbfrepfcequuf.supabase.co/rest/v1/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5dmNweWl2YmZyZXBmY2VxdXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzIwMDMsImV4cCI6MjA5Mzg0ODAwM30.6N1vTWGIkNwBtndHQ4-g40fj5Vf5S5DBqAm8qCWyWE0';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);