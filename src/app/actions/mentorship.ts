'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendMeetLinkAdded } from '@/lib/email'

// Helper to verify admin access
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Not authorized')
  
  return supabase
}

export async function addMeetLink(formData: FormData) {
  const supabase = await verifyAdmin()
  const bookingId = formData.get('booking_id') as string
  const meetingLink = formData.get('meeting_link') as string

  const { data: booking, error } = await supabase
    .from('mentorship_bookings')
    .update({ meeting_link: meetingLink })
    .eq('id', bookingId)
    .select('*, profiles(name, email)')
    .single()

  if (error) throw new Error(error.message)

  // Send Email
  if (booking.profiles?.email) {
    await sendMeetLinkAdded(
      booking.profiles.email,
      booking.profiles.name || 'Student',
      booking.session_type,
      booking.booking_date,
      booking.slot_start,
      meetingLink
    )
  }

  revalidatePath('/admin/mentorship')
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await verifyAdmin()
  
  const { error } = await supabase
    .from('mentorship_bookings')
    .update({ booking_status: status })
    .eq('id', bookingId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/mentorship')
}

export async function rescheduleBooking(formData: FormData) {
  const supabase = await verifyAdmin()
  const bookingId = formData.get('booking_id') as string
  const newDate = formData.get('new_date') as string
  const newSlotStart = formData.get('new_slot_start') as string
  const newSlotEnd = formData.get('new_slot_end') as string

  const { error } = await supabase
    .from('mentorship_bookings')
    .update({ 
      booking_date: newDate,
      slot_start: newSlotStart,
      slot_end: newSlotEnd
    })
    .eq('id', bookingId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/mentorship')
}
