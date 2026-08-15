import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'mock_key')

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Mock Email] To: ${to} | Subject: ${subject}`)
    console.log(`[Mock Email Body]:\n${html}`)
    return { success: true }
  }

  try {
    const data = await resend.emails.send({
      from: 'Rido Mentorship <no-reply@rido.com>', // Replace with verified domain in production
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Pre-defined templates

export async function sendBookingConfirmation(to: string, name: string, sessionType: string, date: string, time: string) {
  const html = `
    <h1>Booking Confirmed!</h1>
    <p>Hi ${name},</p>
    <p>Your <strong>${sessionType}</strong> session has been successfully booked for <strong>${date}</strong> at <strong>${time}</strong>.</p>
    <p>Your mentor will review your details and a Google Meet link will be updated in your dashboard shortly.</p>
    <p>Thanks,<br>The Rido Team</p>
  `
  return sendEmail(to, `Booking Confirmed: ${sessionType}`, html)
}

export async function sendMeetLinkAdded(to: string, name: string, sessionType: string, date: string, time: string, link: string) {
  const html = `
    <h1>Your Meeting Link is Ready</h1>
    <p>Hi ${name},</p>
    <p>The Google Meet link for your <strong>${sessionType}</strong> session on <strong>${date}</strong> at <strong>${time}</strong> has been added.</p>
    <p><strong>Join Link:</strong> <a href="${link}">${link}</a></p>
    <p>Please join 5 minutes early.</p>
    <p>Thanks,<br>The Rido Team</p>
  `
  return sendEmail(to, `Meeting Link Added: ${sessionType}`, html)
}
