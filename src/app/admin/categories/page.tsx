import { createClient } from '@/lib/supabase/server'
import { createCategory, deleteCategory } from '@/app/actions/cms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">Add, edit, and reorder resource categories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphism md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Create a new category for resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="e.g. System Design" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Optional description" className="bg-background/50" />
              </div>
              <Button type="submit" className="w-full">Create Category</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glassmorphism md:col-span-2">
          <CardHeader>
            <CardTitle>Existing Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm">
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    {category.description && <p className="text-sm mt-1">{category.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={async () => {
                      'use server'
                      await deleteCategory(category.id)
                    }}>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </form>
                  </div>
                </div>
              ))}
              {categories?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No categories found. Create one to get started.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
