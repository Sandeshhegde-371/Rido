import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId, type } = await request.json()

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!isValid) {
      if (type === 'mentorship') {
        await supabase.from('mentorship_bookings').update({ booking_status: 'failed' }).eq('id', purchaseId)
      } else {
        await supabase.from('purchases').update({ status: 'failed' }).eq('id', purchaseId)
      }
      return new NextResponse('Invalid signature', { status: 400 })
    }

    if (type === 'mentorship') {
      const { data: booking, error } = await supabase.from('mentorship_bookings').update({ 
        booking_status: 'confirmed',
        payment_id: razorpay_payment_id 
      }).eq('id', purchaseId).select('*, profiles(name, email)').single()
      
      if (error) throw new Error(error.message)

      // Send email
      if (booking.profiles?.email) {
        await sendBookingConfirmation(
          booking.profiles.email, 
          booking.profiles.name || 'Student', 
          booking.session_type, 
          booking.booking_date, 
          booking.slot_start
        )
      }
    } else {
      const { error } = await supabase.from('purchases').update({ 
        status: 'completed',
        payment_id: razorpay_payment_id 
      }).eq('id', purchaseId)

      if (error) throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
