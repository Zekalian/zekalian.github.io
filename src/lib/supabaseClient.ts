import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://jyrshsnbomfjxubsemfs.supabase.co';

const SUPABASE_ANON_KEY =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cnNoc25ib21manh1YnNlbWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTUyMTEsImV4cCI6MjEwMjk5MTIxMX0.kw8YXXZUARgAvjx5PnLDxZFcKAAxd6hiNOXh_d4TD64';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
