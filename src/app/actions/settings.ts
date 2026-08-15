'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Not authorized')
  
  return supabase
}

export async function saveSettings(formData: FormData) {
  const supabase = await verifyAdmin()
  
  const platformName = formData.get('platform_name') as string
  const primaryColor = formData.get('primary_color') as string
  const logoUrl = formData.get('logo_url') as string

  await supabase.from('settings').upsert({ key: 'platform_name', value: platformName })
  await supabase.from('settings').upsert({ key: 'primary_color', value: primaryColor })
  await supabase.from('settings').upsert({ key: 'logo_url', value: logoUrl })

  revalidatePath('/', 'layout') // Revalidate everything so layout picks up new settings
}
