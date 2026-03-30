import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SVC_KEY  = import.meta.env.VITE_SUPABASE_SERVICE_KEY

export const supabase      = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SVC_KEY || SUPABASE_ANON_KEY)
