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

export async function sendNotification(formData: FormData) {
  const supabase = await verifyAdmin()
  
  const title = formData.get('title') as string
  const message = formData.get('message') as string
  const email = formData.get('email') as string

  let userId = null

  if (email) {
    const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single()
    if (!user) throw new Error('User with this email not found')
    userId = user.id
  }

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/notifications')
}

export async function deleteNotification(id: string) {
  const supabase = await verifyAdmin()
  await supabase.from('notifications').delete().eq('id', id)
  revalidatePath('/admin/notifications')
}
