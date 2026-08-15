import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const resourceId = params.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Fetch the resource to get the pdf_url
  const { data: resource } = await supabase
    .from('resources')
    .select('pdf_url, is_premium, is_active')
    .eq('id', resourceId)
    .single()

  if (!resource || !resource.is_active) {
    return new NextResponse('Not found', { status: 404 })
  }

  // If premium, check if user has purchased it or is admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (resource.is_premium && profile?.role !== 'admin') {
    // 1. Check if they bought the Placement Vault plan (assume its name is 'Placement Vault' or we just check if they have ANY plan_id that grants full access. Let's check plan name by joining).
    const { data: vaultPurchase } = await supabase
      .from('purchases')
      .select('id, plans!inner(name)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .eq('plans.name', 'Placement Vault')
      .limit(1)

    // 2. Check if they bought this specific resource
    const { data: resourcePurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_id', resourceId)
      .eq('status', 'completed')
      .limit(1)

    if (!vaultPurchase?.length && !resourcePurchase?.length) {
      return new NextResponse('Payment required', { status: 403 })
    }
  }

  try {
    // Fetch the actual PDF from the external URL
    // NOTE: In production, pdf_url could be a presigned S3 URL or Supabase Storage URL
    const response = await fetch(resource.pdf_url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch PDF from source')
    }

    const pdfBuffer = await response.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="document.pdf"',
        // Prevent caching to ensure DRM
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('PDF fetch error:', error)
    return new NextResponse('Internal Server Error fetching document', { status: 500 })
  }
}
