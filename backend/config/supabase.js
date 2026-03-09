import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// ✅ FIXED: Throw a hard error instead of silently using placeholders
// Placeholders cause confusing failures deep in the app — fail fast instead
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Missing Supabase credentials!\n' +
    'Please add these to your backend/.env file:\n' +
    '  SUPABASE_URL=https://your-project.supabase.co\n' +
    '  SUPABASE_ANON_KEY=your-anon-key-here\n' +
    'Find these at: https://supabase.com/dashboard → Project Settings → API'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);