import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Create Supabase Admin client for server-side operations
 * Requires SERVICE_ROLE_KEY for admin access to auth.users
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Support both variable names for backward compatibility
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY environment variable is not set. ' +
        'Get this from your Supabase project settings: Settings > API > service_role key (secret)'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}




