import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ifrxylvoufncdxyltgqt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9a_w1rEdMOYAcgcT-7cu-g_SsmyxLui';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
