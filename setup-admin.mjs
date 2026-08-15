import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://covlilxjsyiabuifbofq.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_6okW144p1u5l1BHNzRAplg_I_BU4xts'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function setup() {
  console.log('Signing up user...')
  const { data, error } = await supabase.auth.signUp({
    email: 'sandesh66622@gmail.com',
    password: 'Sandy371@529',
    options: {
      data: {
        name: 'Admin Sandesh'
      }
    }
  })

  if (error) {
    if (error.message.includes('already registered')) {
        console.log('User already exists in auth. Continuing to set admin role...')
    } else {
        console.error('Error signing up:', error.message)
        process.exit(1)
    }
  } else {
    console.log('User signed up successfully!')
  }
}

setup()
