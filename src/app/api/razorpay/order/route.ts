import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrder } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const { type, id, mentorshipData } = await request.json()
    // type can be 'plan', 'resource', or 'mentorship'
    
    let amount = 0
    let planId = null
    let resourceId = null

    if (type === 'plan') {
      const { data: plan } = await supabase.from('plans').select('*').eq('id', id).single()
      if (!plan) return new NextResponse('Plan not found', { status: 404 })
      amount = plan.price
      planId = plan.id
    } else if (type === 'resource') {
      const { data: resource } = await supabase.from('resources').select('*').eq('id', id).single()
      if (!resource) return new NextResponse('Resource not found', { status: 404 })
      amount = resource.price
      resourceId = resource.id
    } else if (type === 'mentorship') {
      amount = 99
    } else {
      return new NextResponse('Invalid type', { status: 400 })
    }

    // Create Razorpay Order
    const order = await createRazorpayOrder(amount, `receipt_${user.id}_${Date.now()}`)

    let recordId = null

    if (type === 'mentorship') {
      const { data: booking, error } = await supabase.from('mentorship_bookings').insert({
        user_id: user.id,
        session_type: mentorshipData.session_type,
        booking_date: mentorshipData.booking_date,
        slot_start: mentorshipData.slot_start,
        slot_end: mentorshipData.slot_end,
        form_data: mentorshipData.form_data,
        booking_status: 'pending'
      }).select().single()
      if (error) throw new Error(error.message)
      recordId = booking.id
    } else {
      // Create pending purchase record
      const { data: purchase, error } = await supabase.from('purchases').insert({
        user_id: user.id,
        plan_id: planId,
        resource_id: resourceId,
        amount,
        status: 'pending'
      }).select().single()
      if (error) throw new Error(error.message)
      recordId = purchase.id
    }

    return NextResponse.json({ order, purchaseId: recordId, type })
  } catch (error) {
    console.error('Order generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
