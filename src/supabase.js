import { createClient } from '@supabase/supabase-js'
import { clearConfigCache } from 'prettier'


const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

export { supabase }


