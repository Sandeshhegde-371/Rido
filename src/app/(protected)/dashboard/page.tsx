/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { BookOpen, Clock, Play, ShoppingBag, Video } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all purchases to determine access
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, plans(name), resources(*, categories(name))')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  const hasVaultAccess = purchases?.some(p => p.plans?.name === 'Placement Vault')
  
  // If vault access, get all premium resources. Else just purchased ones.
  let purchasedResources: Record<string, any>[] = []
  if (hasVaultAccess) {
    const { data: allResources } = await supabase.from('resources').select('*, categories(name)').eq('is_active', true).eq('is_premium', true)
    purchasedResources = allResources || []
  } else {
    purchasedResources = purchases?.filter(p => p.resources).map(p => p.resources) || []
  }

  // Fetch Reading Progress
  const { data: progress } = await supabase
    .from('reading_progress')
    .select('*, resources(*, categories(name))')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(3)

  // Fetch Recently Viewed
  const { data: recentViews } = await supabase
    .from('resource_views')
    .select('*, resources(*, categories(name))')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(4)

  // Fetch Upcoming Sessions
  const { data: bookings } = await supabase
    .from('mentorship_bookings')
    .select('*, profiles(name)')
    .eq('user_id', user.id)
    .in('booking_status', ['pending', 'confirmed'])
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })
    .order('slot_start', { ascending: true })
    .limit(3)

  const recentPurchases = purchases?.slice(0, 3) || []

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Student Dashboard</h1>
        <p className="text-muted-foreground text-lg">Welcome back! Here is your learning overview.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Learning Activity */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Continue Reading */}
          {progress && progress.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Play className="h-6 w-6 text-primary" /> Continue Reading
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progress.map((p: Record<string, any>) => (
                  <Card key={p.id} className="glassmorphism hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">{p.resources.categories?.name}</CardDescription>
                      <CardTitle className="text-lg line-clamp-1">{p.resources.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Page {p.current_page}</span>
                      <Link href={`/reader/${p.resource_id}`} className={buttonVariants({ size: "sm" })}>Resume</Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Recently Viewed */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" /> Recently Opened
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentViews?.map((v: Record<string, any>) => (
                <Link key={v.id} href={`/reader/${v.resource_id}`} className="block group">
                  <Card className="glassmorphism h-full hover:border-primary/50 transition-colors">
                    <CardHeader className="p-4">
                      <CardDescription className="text-xs font-semibold text-primary mb-1">
                        {v.resources.categories?.name}
                      </CardDescription>
                      <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {v.resources.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
              {recentViews?.length === 0 && <p className="text-muted-foreground col-span-2">No recent views.</p>}
            </div>
          </section>

          {/* Purchased Resources */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> Unlocked Resources
              {hasVaultAccess && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full align-middle">VAULT ACCESS</span>}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {purchasedResources?.slice(0, 6).map((resource: Record<string, any>) => (
                <Card key={resource.id} className="glassmorphism flex flex-col hover:-translate-y-1 transition-transform">
                  <div className="aspect-video bg-muted/30 relative overflow-hidden rounded-t-xl">
                    {resource.cover_image ? (
                      <img src={resource.cover_image} alt={resource.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-primary/20" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 flex-1">
                    <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Link href={`/reader/${resource.id}`} className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}>Open</Link>
                  </CardContent>
                </Card>
              ))}
              {purchasedResources?.length === 0 && <p className="text-muted-foreground col-span-3">No unlocked resources yet. Visit the Library!</p>}
            </div>
            {purchasedResources.length > 6 && (
              <Link href="/library" className={buttonVariants({ variant: "outline", className: "w-full" })}>View all unlocked resources in Library</Link>
            )}
          </section>

        </div>

        {/* Right Column: Account & Sessions */}
        <div className="space-y-8">
          
          {/* Upcoming Sessions */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" /> Upcoming Sessions
            </h2>
            <div className="space-y-4">
              {bookings?.map((booking: any) => (
                <Card key={booking.id} className="glassmorphism">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <p className="font-semibold text-primary">{booking.session_type}</p>
                    <p className="text-sm text-muted-foreground">{booking.booking_date} at {booking.slot_start}</p>
                    {booking.meeting_link ? (
                      <a href={booking.meeting_link} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm", className: "w-full mt-2" })}>Join Meet</a>
                    ) : (
                      <Button size="sm" disabled variant="outline" className="w-full mt-2">Link Pending</Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              {bookings?.length === 0 && (
                <Card className="glassmorphism border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No upcoming sessions scheduled.
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Recent Purchases */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" /> Recent Purchases
              </h2>
              <Link href="/purchases" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentPurchases?.map((purchase: Record<string, any>) => (
                <div key={purchase.id} className="flex justify-between items-center p-3 rounded-lg bg-card/50 border border-border/50">
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate">{purchase.plans?.name || purchase.resources?.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(purchase.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-sm ml-2 shrink-0">₹{purchase.amount}</p>
                </div>
              ))}
              {recentPurchases?.length === 0 && <p className="text-muted-foreground text-sm">No purchases found.</p>}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
