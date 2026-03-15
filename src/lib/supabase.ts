import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kzcteciteooytqxxphjr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6Y3RlY2l0ZW9veXRxeHhwaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTk2NTQsImV4cCI6MjA4OTA5NTY1NH0.Tcjmdk4VEuadNGxIcUBJ5GTT0ZuEpTrxV6c7-406GrA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
