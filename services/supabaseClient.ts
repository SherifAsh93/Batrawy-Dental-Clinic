import { createClient } from '@supabase/supabase-js';

// Derived from the provided ANON key payload ("iss": "supabase", "ref": "ihqpktzyioasmrwoqwbr")
const SUPABASE_URL = 'https://ihqpktzyioasmrwoqwbr.supabase.co';

// The provided ANON public key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlocXBrdHp5aW9hc21yd29xd2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTI3NDgsImV4cCI6MjA4MDI2ODc0OH0.qydI6DjMWd6d_9jcT2WJbXRtNNVa0Zj9gPu9sNKuYyA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
