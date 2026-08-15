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

// Category Actions
export async function createCategory(formData: FormData) {
  const supabase = await verifyAdmin()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { error } = await supabase.from('categories').insert({ name, description, slug })
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/categories')
  revalidatePath('/library')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await verifyAdmin()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { error } = await supabase.from('categories').update({ name, description, slug }).eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/categories')
  revalidatePath('/library')
}

export async function deleteCategory(id: string) {
  const supabase = await verifyAdmin()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/categories')
  revalidatePath('/library')
}

// Resource Actions
export async function createResource(formData: FormData) {
  const supabase = await verifyAdmin()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const cover_image = formData.get('cover_image') as string
  const pdf_url = formData.get('pdf_url') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const is_premium = formData.get('is_premium') === 'true'
  const is_active = formData.get('is_active') === 'true'

  const { error } = await supabase.from('resources').insert({
    title, description, category_id, cover_image, pdf_url, price, is_premium, is_active
  })
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/resources')
  revalidatePath('/library')
}

export async function updateResource(id: string, formData: FormData) {
  const supabase = await verifyAdmin()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const cover_image = formData.get('cover_image') as string
  const pdf_url = formData.get('pdf_url') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const is_premium = formData.get('is_premium') === 'true'
  const is_active = formData.get('is_active') === 'true'

  const { error } = await supabase.from('resources').update({
    title, description, category_id, cover_image, pdf_url, price, is_premium, is_active
  }).eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/resources')
  revalidatePath('/library')
}

export async function deleteResource(id: string) {
  const supabase = await verifyAdmin()
  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/resources')
  revalidatePath('/library')
}
