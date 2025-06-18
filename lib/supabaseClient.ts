import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://TUPROYECTO.supabase.co'  // <-- pon aquí tu URL de Supabase
const supabaseAnonKey = 'TU_ANON_KEY'                // <-- pon aquí tu anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
