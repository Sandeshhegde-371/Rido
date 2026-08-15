import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addMeetLink, updateBookingStatus, rescheduleBooking } from '@/app/actions/mentorship'
import { Video, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function AdminMentorshipPage() {
  const supabase = await createClient()
  
  const { data: bookings } = await supabase
    .from('mentorship_bookings')
    .select('*, profiles(name, email)')
    .order('booking_date', { ascending: false })
    .order('slot_start', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mentorship Sessions</h1>
        <p className="text-muted-foreground">Manage upcoming sessions, meet links, and view student forms.</p>
      </div>

      <div className="space-y-4">
        {bookings?.map((booking) => (
          <Card key={booking.id} className="glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" /> {booking.session_type}
                </CardTitle>
                <CardDescription className="mt-1 font-medium text-primary">
                  {booking.profiles?.name} ({booking.profiles?.email})
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${booking.booking_status === 'confirmed' ? 'bg-green-500/20 text-green-500' : booking.booking_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'}`}>
                  {booking.booking_status}
                </span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {booking.booking_date} <Clock className="h-4 w-4 ml-2" /> {booking.slot_start}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                
                {/* Form Data Viewer */}
                <div className="bg-card/50 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Pre-Session Form</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(booking.form_data || {}).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium text-primary capitalize">{key.replace(/_/g, ' ')}:</span> 
                        {key === 'resume_url' && typeof value === 'string' ? (
                          <a href={value} target="_blank" rel="noreferrer" className="ml-2 text-blue-500 hover:underline">View Resume</a>
                        ) : (
                          <span className="ml-2 text-muted-foreground">{String(value)}</span>
                        )}
                      </div>
                    ))}
                    {Object.keys(booking.form_data || {}).length === 0 && <p className="text-muted-foreground">No form data provided.</p>}
                  </div>
                </div>

                {/* Management Actions */}
                <div className="space-y-4">
                  {/* Meet Link Form */}
                  <form action={addMeetLink} className="space-y-2 bg-card/50 p-4 rounded-xl border border-border/50">
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <Label htmlFor="meeting_link">Google Meet Link</Label>
                    <div className="flex gap-2">
                      <Input name="meeting_link" id="meeting_link" defaultValue={booking.meeting_link || ''} placeholder="https://meet.google.com/..." className="bg-background/50" required />
                      <Button type="submit" size="sm">Save & Email</Button>
                    </div>
                  </form>

                  {/* Reschedule & Status */}
                  <div className="flex flex-wrap gap-2">
                    {booking.booking_status === 'confirmed' && (
                      <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'completed') }}>
                        <Button variant="outline" size="sm" className="text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/50"><CheckCircle className="h-4 w-4 mr-2" /> Mark Completed</Button>
                      </form>
                    )}
                    {booking.booking_status !== 'cancelled' && (
                      <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'cancelled') }}>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"><XCircle className="h-4 w-4 mr-2" /> Cancel Session</Button>
                      </form>
                    )}
                  </div>
                  
                  {/* Note: Reschedule form hidden for brevity, can be expanded if needed */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {bookings?.length === 0 && <p className="text-muted-foreground text-center py-8">No mentorship bookings found.</p>}
      </div>
    </div>
  )
}
