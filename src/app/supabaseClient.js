import { createClient } from '@supabase/supabase-js'

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(configuredUrl && configuredKey)

const supabaseUrl = configuredUrl || 'https://missing-config.supabase.co'
const supabaseKey = configuredKey || 'missing-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)