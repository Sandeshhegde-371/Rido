/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, ChevronRight, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

const SESSION_TYPES = [
  { id: 'Placement Roadmap', desc: 'Get a personalized roadmap for your dream role.' },
  { id: 'Resume Review', desc: '1-on-1 feedback on your resume to bypass ATS.' },
  { id: 'DSA Strategy', desc: 'Optimize your Leetcode journey and problem-solving.' },
  { id: 'Interview Guidance', desc: 'Mock tips and targeted prep for your target companies.' },
]

const SLOTS = ['20:00', '20:30', '21:00', '21:30']

export default function MentorshipBookingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  
  // Form State
  const [sessionType, setSessionType] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('resumes').upload(fileName, file)
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(data.path)
      setFormData({ ...formData, resume_url: publicUrl })
    }
    setIsUploading(false)
  }

  const handleCheckout = async () => {
    setIsProcessing(true)
    try {
      // 1. Create Order
      const slotEndMap: Record<string, string> = { '20:00': '20:30', '20:30': '21:00', '21:00': '21:30', '21:30': '22:00' }
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mentorship',
          mentorshipData: {
            session_type: sessionType,
            booking_date: date,
            slot_start: slot + ':00',
            slot_end: slotEndMap[slot] + ':00',
            form_data: formData
          }
        })
      })
      const { order, purchaseId } = await res.json()

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock',
        amount: order.amount,
        currency: order.currency,
        name: 'Rido Mentorship',
        description: sessionType,
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              purchaseId,
              type: 'mentorship'
            })
          })
          if (verifyRes.ok) {
            setStep(4)
          } else {
            alert('Payment verification failed.')
          }
        },
        theme: { color: '#8b5cf6' }
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error(error)
      alert('Checkout failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Book 1-on-1 Mentorship</h1>
        <p className="text-muted-foreground text-lg">Accelerate your career with expert guidance for just ₹99.</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${step >= num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {num}
            </div>
            {num < 3 && <div className={`h-1 w-16 ${step > num ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SESSION_TYPES.map(type => (
            <Card 
              key={type.id} 
              className={`cursor-pointer transition-all hover:border-primary/50 ${sessionType === type.id ? 'border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-primary/5' : 'glassmorphism'}`}
              onClick={() => setSessionType(type.id)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{type.id}</CardTitle>
                <CardDescription>{type.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
          <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
            <Button disabled={!sessionType} onClick={() => setStep(2)}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="glassmorphism max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Details for {sessionType}</CardTitle>
            <CardDescription>Help your mentor prepare for the session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionType === 'Placement Roadmap' && (
              <>
                <div className="space-y-2"><Label>College</Label><Input onChange={e => setFormData({...formData, college: e.target.value})} /></div>
                <div className="space-y-2"><Label>Branch & Year</Label><Input onChange={e => setFormData({...formData, branch: e.target.value})} /></div>
                <div className="space-y-2"><Label>Dream Role</Label><Input onChange={e => setFormData({...formData, dream_role: e.target.value})} /></div>
              </>
            )}
            {sessionType === 'Resume Review' && (
              <>
                <div className="space-y-2"><Label>Target Role</Label><Input onChange={e => setFormData({...formData, target_role: e.target.value})} /></div>
                <div className="space-y-2"><Label>Specific Concerns</Label><Input onChange={e => setFormData({...formData, concerns: e.target.value})} /></div>
                <div className="space-y-2">
                  <Label>Upload Resume (PDF)</Label>
                  <div className="flex items-center gap-4">
                    <Input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} className="flex-1" />
                    {isUploading && <span className="text-sm text-muted-foreground animate-pulse">Uploading...</span>}
                    {formData.resume_url && <CheckCircle className="h-6 w-6 text-green-500" />}
                  </div>
                </div>
              </>
            )}
            {sessionType === 'DSA Strategy' && (
              <>
                <div className="space-y-2"><Label>Preferred Language</Label><Input onChange={e => setFormData({...formData, language: e.target.value})} /></div>
                <div className="space-y-2"><Label>Approximate Leetcode Count</Label><Input type="number" onChange={e => setFormData({...formData, leetcode_count: e.target.value})} /></div>
                <div className="space-y-2"><Label>Weak Areas</Label><Input onChange={e => setFormData({...formData, weak_areas: e.target.value})} /></div>
              </>
            )}
            {sessionType === 'Interview Guidance' && (
              <>
                <div className="space-y-2"><Label>Target Companies</Label><Input onChange={e => setFormData({...formData, companies: e.target.value})} /></div>
                <div className="space-y-2"><Label>Preparation Status</Label><Input onChange={e => setFormData({...formData, status: e.target.value})} /></div>
              </>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="glassmorphism max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Select Slot & Checkout</CardTitle>
            <CardDescription>Choose an available time slot for your session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={e => setDate(e.target.value)} className="bg-background/50" />
            </div>
            
            <div className="space-y-2">
              <Label>Available Slots</Label>
              <div className="flex flex-wrap gap-3">
                {SLOTS.map(s => (
                  <Button 
                    key={s} 
                    variant={slot === s ? 'default' : 'outline'} 
                    onClick={() => setSlot(s)}
                    className="w-24"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-xl flex justify-between items-center mt-6">
              <div>
                <p className="font-semibold text-lg">{sessionType}</p>
                <p className="text-muted-foreground text-sm flex items-center gap-2"><Calendar className="h-4 w-4"/> {date || 'Select Date'} <Clock className="h-4 w-4 ml-2"/> {slot ? `${slot} IST` : 'Select Slot'}</p>
              </div>
              <p className="text-3xl font-bold">₹99</p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button disabled={!date || !slot || isProcessing} onClick={handleCheckout}>
                {isProcessing ? 'Processing...' : 'Pay ₹99 & Book'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <div className="text-center space-y-4 py-16 bg-card/30 rounded-2xl border border-border/50 max-w-md mx-auto">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          <h2 className="text-3xl font-bold">Booking Confirmed!</h2>
          <p className="text-muted-foreground">Your mentor will be notified. Check your email and dashboard for the Google Meet link.</p>
          <div className="pt-6">
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      )}
    </div>
  )
}
