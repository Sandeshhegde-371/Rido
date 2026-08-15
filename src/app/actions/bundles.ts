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

export async function createBundle(formData: FormData, resourceIds: string[]) {
  const supabase = await verifyAdmin()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = Number(formData.get('price'))
  const cover_image = formData.get('cover_image') as string

  // Insert bundle
  const { data: bundle, error: bundleError } = await supabase.from('bundles').insert({
    name,
    description,
    price,
    cover_image
  }).select('id').single()

  if (bundleError) throw new Error(bundleError.message)

  // Insert bundle resources
  if (resourceIds.length > 0) {
    const bundleResources = resourceIds.map(resourceId => ({
      bundle_id: bundle.id,
      resource_id: resourceId
    }))

    const { error: resourcesError } = await supabase.from('bundle_resources').insert(bundleResources)
    if (resourcesError) throw new Error(resourcesError.message)
  }

  revalidatePath('/admin/bundles')
  return bundle.id
}

export async function deleteBundle(id: string) {
  const supabase = await verifyAdmin()
  await supabase.from('bundles').delete().eq('id', id)
  revalidatePath('/admin/bundles')
}
