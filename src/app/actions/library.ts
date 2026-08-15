'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateReadingProgress(resourceId: string, page: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('reading_progress')
    .upsert(
      { user_id: user.id, resource_id: resourceId, current_page: page, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,resource_id' }
    )
    
  revalidatePath('/library')
  revalidatePath(`/reader/${resourceId}`)
}

export async function recordResourceView(resourceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('resource_views')
    .insert({ user_id: user.id, resource_id: resourceId, viewed_at: new Date().toISOString() })
    
  revalidatePath('/library')
}
