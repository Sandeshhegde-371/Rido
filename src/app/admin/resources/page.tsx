import { createClient } from '@/lib/supabase/server'
import { createResource, deleteResource } from '@/app/actions/cms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: resources } = await supabase.from('resources').select('*, categories(name)').order('created_at', { ascending: false })
  const { data: categories } = await supabase.from('categories').select('*').order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Management</h1>
          <p className="text-muted-foreground">Manage your vault&apos;s PDFs, handbooks, and prices.</p>
        </div>
        <Link href="/admin/resources/new" className={buttonVariants({ size: 'lg', className: 'shrink-0 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-[0_0_20px_rgba(139,92,246,0.3)]' })}>
          <Plus className="mr-2 h-5 w-5" /> New Resource Wizard
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="glassmorphism xl:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add New Resource</CardTitle>
            <CardDescription>Upload a new PDF or handbook.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createResource} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <select id="category_id" name="category_id" required className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select a category</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input id="cover_image" name="cover_image" type="url" placeholder="https://..." className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf_url">PDF URL (Secure/Hidden from Users)</Label>
                <Input id="pdf_url" name="pdf_url" type="url" required placeholder="s3://... or https://..." className="bg-background/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue="0" className="bg-background/50" />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <Label className="flex items-center space-x-2 h-10">
                    <input type="checkbox" name="is_premium" value="true" defaultChecked className="rounded border-primary/50 text-primary" />
                    <span>Is Premium?</span>
                  </Label>
                </div>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <Label className="flex items-center space-x-2">
                  <input type="checkbox" name="is_active" value="true" defaultChecked className="rounded border-primary/50 text-primary" />
                  <span>Is Active? (Visible)</span>
                </Label>
              </div>
              <Button type="submit" className="w-full">Create Resource</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glassmorphism xl:col-span-2">
          <CardHeader>
            <CardTitle>Resource Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resources?.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm">
                  <div className="flex gap-4 items-start">
                    {resource.cover_image && (
                      <img src={resource.cover_image} alt={resource.title} className="w-16 h-20 object-cover rounded-md" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {resource.title}
                        {!resource.is_active && <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">Hidden</span>}
                        {resource.is_premium && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Premium</span>}
                      </h3>
                      <p className="text-sm text-primary font-medium">{resource.categories?.name || 'Uncategorized'}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{resource.pdf_url}</p>
                      <p className="text-sm font-semibold mt-1">₹{resource.price}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <form action={async () => {
                      'use server'
                      await deleteResource(resource.id)
                    }}>
                      <Button variant="destructive" size="sm" className="w-full">Delete</Button>
                    </form>
                  </div>
                </div>
              ))}
              {resources?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No resources found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
