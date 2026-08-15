import { createClient } from '@/lib/supabase/server'
import { deleteBundle } from '@/app/actions/bundles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Package, Plus, Trash2, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminBundlesPage() {
  const supabase = await createClient()
  
  const { data: bundles } = await supabase
    .from('bundles')
    .select('*, bundle_resources(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bundles</h1>
          <p className="text-muted-foreground">Stitch resources together and sell them at a premium.</p>
        </div>
        <Link href="/admin/bundles/new" className={buttonVariants({ size: 'lg', className: 'shrink-0 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-[0_0_20px_rgba(139,92,246,0.3)]' })}>
          <Plus className="mr-2 h-5 w-5" /> Create Bundle
        </Link>
      </div>

      {bundles?.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-xl bg-card/30">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Bundles Found</h3>
          <p className="text-muted-foreground mb-6">You haven&apos;t created any resource bundles yet.</p>
          <Link href="/admin/bundles/new" className={buttonVariants({ variant: 'outline' })}>
            Create your first bundle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bundles?.map((bundle) => (
            <Card key={bundle.id} className="glassmorphism overflow-hidden group">
              <div className="aspect-[21/9] relative bg-muted">
                {bundle.cover_image ? (
                  <Image src={bundle.cover_image} alt={bundle.name} fill className="object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><Package className="h-12 w-12 text-muted-foreground/50" /></div>
                )}
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-border">
                  <IndianRupee className="h-3 w-3" /> {bundle.price}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{bundle.name}</CardTitle>
                <CardDescription className="line-clamp-2">{bundle.description || 'No description provided.'}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full font-medium">
                  {bundle.bundle_resources[0]?.count || 0} Resources
                </div>
                <div className="flex gap-2">
                  <form action={async () => {
                    'use server'
                    await deleteBundle(bundle.id)
                  }}>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
