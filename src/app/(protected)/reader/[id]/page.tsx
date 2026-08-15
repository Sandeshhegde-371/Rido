import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DRMProtection from '@/components/reader/drm-protection'
import PDFViewer from '@/components/reader/pdf-viewer'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ReaderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const resourceId = params.id
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('name, email, role').eq('id', user.id).single()

  const { data: resource } = await supabase
    .from('resources')
    .select('title, is_active, is_premium')
    .eq('id', resourceId)
    .single()

  if (!resource || !resource.is_active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-2xl font-bold mb-2">Resource Not Found</h1>
        <p className="text-muted-foreground mb-6">This resource may have been disabled or removed.</p>
        <Link href="/library" className="text-primary hover:underline flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Library
        </Link>
      </div>
    )
  }

  // Check access for premium resources
  if (resource.is_premium && profile?.role !== 'admin') {
    const { data: vaultPurchase } = await supabase
      .from('purchases')
      .select('id, plans!inner(name)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .eq('plans.name', 'Placement Vault')
      .limit(1)

    const { data: resourcePurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_id', resourceId)
      .eq('status', 'completed')
      .limit(1)

    if (!vaultPurchase?.length && !resourcePurchase?.length) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-2xl font-bold mb-2 text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to purchase this premium resource or the Placement Vault to access it.</p>
          <Link href="/library" className="text-primary hover:underline flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to Library
          </Link>
        </div>
      )
    }
  }

  // Get reading progress to set initial page
  const { data: progress } = await supabase
    .from('reading_progress')
    .select('current_page')
    .eq('user_id', user.id)
    .eq('resource_id', resourceId)
    .single()

  const initialPage = progress?.current_page || 1

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/library" className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-lg hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">{resource.title}</h1>
        </div>
      </div>

      <div className="flex-1 bg-black/5 rounded-xl overflow-hidden border border-border/50 shadow-inner relative">
        <DRMProtection studentName={profile?.name || 'Student'} studentEmail={profile?.email || 'email@example.com'}>
          <PDFViewer resourceId={resourceId} initialPage={initialPage} />
        </DRMProtection>
      </div>
    </div>
  )
}
