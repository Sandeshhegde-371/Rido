'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to verify admin access
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Not authorized')
  
  return supabase
}

export async function grantAccess(formData: FormData) {
  const supabase = await verifyAdmin()
  const email = formData.get('email') as string
  const planId = formData.get('plan_id') as string | null
  const resourceId = formData.get('resource_id') as string | null

  // Get user by email
  const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single()
  if (!user) throw new Error('User not found')

  const { error } = await supabase.from('purchases').insert({
    user_id: user.id,
    plan_id: planId || null,
    resource_id: resourceId || null,
    amount: 0,
    status: 'completed',
    payment_id: 'manual_grant'
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/payments')
}

export async function revokeAccess(purchaseId: string) {
  const supabase = await verifyAdmin()
  const { error } = await supabase.from('purchases').delete().eq('id', purchaseId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/payments')
}

export async function refundAccess(purchaseId: string) {
  const supabase = await verifyAdmin()
  // Mark as refunded
  const { error } = await supabase.from('purchases').update({ status: 'refunded' }).eq('id', purchaseId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/payments')
}
