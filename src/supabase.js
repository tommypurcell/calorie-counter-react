import { createClient } from '@supabase/supabase-js'
import { clearConfigCache } from 'prettier'

console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL)
console.log('Supabase Anon Key:', process.env.REACT_APP_SUPABASE_ANON_KEY)

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

export { supabase }


