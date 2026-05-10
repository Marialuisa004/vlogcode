import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  'https://cyvcpyivbfrepfcequuf.supabase.co/';

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5dmNweWl2YmZyZXBmY2VxdXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzIwMDMsImV4cCI6MjA5Mzg0ODAwM30.6N1vTWGIkNwBtndHQ4-g40fj5Vf5S5DBqAm8qCWyWE0';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);