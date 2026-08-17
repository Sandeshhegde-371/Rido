import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Calendar, Clock, Video, Plus, CheckCircle2, Clock3 } from 'lucide-react'
import Link from 'next/link'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bookings } = await supabase
    .from('mentorship_bookings')
    .select('*')
    .eq('user_id', user?.id)
    .order('booking_date', { ascending: false })

  const upcomingBookings = bookings?.filter(b => b.booking_status === 'scheduled') || []
  const pastBookings = bookings?.filter(b => b.booking_status === 'completed' || b.booking_status === 'cancelled') || []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentorship Bookings</h1>
          <p className="text-muted-foreground">Manage your 1-on-1 sessions.</p>
        </div>
        <Link 
          href="/mentorship" 
          className={buttonVariants({ className: 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all' })}
        >
          <Plus className="w-4 h-4 mr-2" /> Book a Session
        </Link>
      </div>
      
      <Card className="glassmorphism border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock3 className="w-5 h-5 text-primary" /> Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled Google Meet sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card/30">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No Upcoming Sessions</h3>
              <p className="text-muted-foreground mb-6">You haven&apos;t scheduled any upcoming mentorship sessions yet.</p>
              <Link href="/mentorship" className={buttonVariants({ variant: 'outline' })}>
                Find a slot
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-primary/5 transition-colors gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg text-primary">{booking.session_type}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {booking.booking_date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {booking.slot_start} - {booking.slot_end}</span>
                    </div>
                  </div>
                  {booking.meeting_link ? (
                    <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer" className={buttonVariants({ className: 'w-full md:w-auto bg-green-600 hover:bg-green-700 text-white' })}>
                      <Video className="w-4 h-4 mr-2" /> Join Google Meet
                    </a>
                  ) : (
                    <Button variant="secondary" className="w-full md:w-auto" disabled>
                      Link Pending
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pastBookings.length > 0 && (
        <Card className="glassmorphism mt-8 opacity-80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Past Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30 gap-4">
                  <div>
                    <p className="font-medium">{booking.session_type}</p>
                    <p className="text-sm text-muted-foreground">{booking.booking_date} • {booking.slot_start}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${booking.booking_status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                    {booking.booking_status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
