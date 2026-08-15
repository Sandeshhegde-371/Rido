# Rido - The Ultimate Placement & Mentorship SaaS

Rido is a fully-featured, production-ready SaaS platform built for creators, mentors, and placement agencies to sell digital resources, courses, and 1-on-1 mentorship sessions without writing a single line of code.

## 🚀 Key Features

### 1. Massive Admin Dashboard
- **Analytics:** View total revenue, monthly recurring revenue, and user growth with beautiful Recharts.
- **Resource Management:** Upload PDFs and Cover Images directly to secure Supabase storage using the 5-Step Resource Wizard.
- **User Management:** Manage users, grant/revoke access manually, and disable abusive users.
- **Mentorship Management:** View all booked sessions, attach Google Meet links securely, and track statuses.
- **Notifications Engine:** Broadcast announcements to all students or target specific users.
- **Dynamic Settings:** Change platform colors, name, and branding directly from the UI.

### 2. Student Experience
- **Secure Authentication:** Passwordless magic links or standard email/password via Supabase Auth.
- **Beautiful Dashboard:** Access purchased resources, view upcoming mentorship sessions, and read notifications.
- **Integrated PDF Reader:** Read handbooks securely directly inside the platform. (PDF URLs are hidden from the client).
- **Mentorship Booking:** Book 30-minute 1-on-1 sessions, upload resumes, and fill out dynamic pre-session forms.
- **Seamless Checkout:** Fully integrated Razorpay checkout for Indian payments.

### 3. Automated Emails
- Uses **Resend** to send beautiful HTML emails.
- Automatic booking confirmations and Google Meet link updates.

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router, Server Actions)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Storage Buckets)
- **Payments:** Razorpay
- **Emails:** Resend
- **Styling:** Tailwind CSS + Radix UI (shadcn/ui)
- **Icons:** Lucide React

## 📚 Getting Started

Follow the setup guides in this folder to deploy your own instance of Rido:

1. [Supabase Setup Guide](./SUPABASE_SETUP.md)
2. [Razorpay Setup Guide](./RAZORPAY_SETUP.md)
3. [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
