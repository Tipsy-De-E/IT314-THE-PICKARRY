import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tnlppbtjwoqetoxjaxjx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubHBwYnRqd29xZXRveGpheGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzgzMDAsImV4cCI6MjA3NzY1NDMwMH0.sp1RFRkPtBEtdxwfLFXgITSdnEXrP9-2lMGWXmQb274';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
