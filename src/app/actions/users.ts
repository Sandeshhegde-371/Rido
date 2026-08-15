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

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const supabase = await verifyAdmin()
  const { error } = await supabase.from('profiles').update({ is_disabled: !currentStatus }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
}

export async function toggleAdminRole(userId: string, currentRole: string) {
  const supabase = await verifyAdmin()
  const newRole = currentRole === 'admin' ? 'student' : 'admin'
  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
}
