import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { BookOpen, Clock, Search, Play } from 'lucide-react'

export default async function LibraryPage(props: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ''
  const categoryFilter = searchParams?.category || ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch Categories
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  // Fetch Resources (Filtered)
  let query = supabase.from('resources').select('*, categories(name)').eq('is_active', true)
  
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }
  if (categoryFilter) {
    query = query.eq('category_id', categoryFilter)
  }
  const { data: resources } = await query.order('created_at', { ascending: false })

  // Fetch Continue Reading
  const { data: progress } = await supabase
    .from('reading_progress')
    .select('*, resources(*, categories(name))')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false })
    .limit(3)

  // Fetch Recently Viewed
  const { data: recentViews } = await supabase
    .from('resource_views')
    .select('*, resources(*, categories(name))')
    .eq('user_id', user?.id)
    .order('viewed_at', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Your Library</h1>
        <p className="text-muted-foreground text-lg">Access your premium placement resources.</p>
      </div>

      {/* Search and Categories */}
      <div className="flex flex-col md:flex-row gap-4">
        <form className="relative flex-1" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            name="q" 
            defaultValue={q} 
            placeholder="Search by title..." 
            className="pl-10 h-12 bg-card/50 backdrop-blur-md border-primary/20 text-lg rounded-xl"
          />
          {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
        </form>
        
        <div className="flex gap-2 overflow-x-auto pb-2 flex-nowrap scrollbar-hide">
          <Link href={`/library${q ? `?q=${q}` : ''}`} className={buttonVariants({ variant: !categoryFilter ? 'default' : 'outline', className: "rounded-full whitespace-nowrap" })}>
            All Categories
          </Link>
          {categories?.map(cat => (
            <Link key={cat.id} href={`/library?category=${cat.id}${q ? `&q=${q}` : ''}`} className={buttonVariants({ variant: categoryFilter === cat.id ? 'default' : 'outline', className: "rounded-full whitespace-nowrap" })}>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Continue Reading */}
      {!q && !categoryFilter && progress && progress.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Play className="h-6 w-6 text-primary" /> Continue Reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {progress.map((p: { id: string; resource_id: string; current_page: number; resources: { title: string; cover_image: string; categories: { name: string } } }) => (
              <Card key={p.id} className="glassmorphism hover:border-primary/50 transition-colors overflow-hidden group">
                <div className="h-32 bg-primary/10 relative overflow-hidden flex items-center justify-center">
                   {p.resources.cover_image ? (
                     <img src={p.resources.cover_image} alt={p.resources.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   ) : (
                     <BookOpen className="h-12 w-12 text-primary/30" />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <CardHeader className="pt-4 pb-2">
                  <CardTitle className="line-clamp-1">{p.resources.title}</CardTitle>
                  <CardDescription>Page {p.current_page}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/reader/${p.resource_id}`} className={buttonVariants({ className: "w-full font-semibold shadow-md" })}>
                    Resume
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {!q && !categoryFilter && recentViews && recentViews.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" /> Recently Viewed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {recentViews.map((v: { id: string; resource_id: string; resources: { title: string; categories: { name: string } } }) => (
              <Link key={v.id} href={`/reader/${v.resource_id}`} className="block group">
                <Card className="glassmorphism h-full hover:border-primary/50 transition-colors flex flex-col">
                  <CardHeader className="p-4 flex-1">
                    <CardDescription className="text-xs font-semibold text-primary mb-1">
                      {v.resources.categories?.name}
                    </CardDescription>
                    <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                      {v.resources.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Resources (Filtered) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{q || categoryFilter ? 'Search Results' : 'All Resources'}</h2>
        
        {resources?.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-2xl border border-border/50">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No resources found.</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources?.map((resource) => (
              <Card key={resource.id} className="glassmorphism hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden">
                <div className="aspect-[3/4] bg-muted/30 relative">
                  {resource.cover_image ? (
                    <img src={resource.cover_image} alt={resource.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/20" />
                    </div>
                  )}
                  {resource.is_premium && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                      PREMIUM
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 flex-1">
                  <CardDescription className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    {resource.categories?.name}
                  </CardDescription>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Link href={`/reader/${resource.id}`} className={buttonVariants({ className: "w-full font-semibold" })}>
                    Open Reader
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
