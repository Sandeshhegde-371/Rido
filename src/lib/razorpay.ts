import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
})

export async function createRazorpayOrder(amount: number, receipt: string) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt,
    })
    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret'
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(orderId + '|' + paymentId)
    .digest('hex')
    
  return generatedSignature === signature
}
