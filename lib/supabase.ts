import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// STEP 1: Yahan apne Supabase credentials paste karein
// ------------------------------------------------------------------

const SUPABASE_URL = 'https://qnjpivgydmufvxogiknz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuanBpdmd5ZG11ZnZ4b2dpa256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDU4NTYsImV4cCI6MjA3OTU4MTg1Nn0.Clyw_KAuYOGQsR_ru9OqXtCP0u6-x-wcXklFTrtiJb4';

// ------------------------------------------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);