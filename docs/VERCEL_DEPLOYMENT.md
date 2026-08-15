# Vercel Deployment Guide

Deploying Rido to production is incredibly simple using Vercel.

## 1. Push to GitHub
Ensure your entire project is pushed to a private GitHub repository.

## 2. Deploy on Vercel
1. Go to [Vercel](https://vercel.com/) and create a new project.
2. Import your Rido GitHub repository.
3. Vercel will automatically detect that it's a Next.js application.

## 3. Environment Variables
Before clicking Deploy, you must add all your environment variables. 
Copy these from your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Razorpay
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
RAZORPAY_WEBHOOK_SECRET=""

# Resend (Emails)
RESEND_API_KEY=""
```

## 4. Build & Deploy
1. Click **Deploy**.
2. Vercel will run `npm run build`. This will type-check and lint your application.
3. Once finished, Vercel will give you a live `.vercel.app` URL.

## 5. Post-Deployment
1. Go to your Supabase Dashboard. Add your new Vercel URL to **Authentication -> URL Configuration** as the Site URL and add wildcard redirect URLs.
2. Update your Razorpay Webhook URL to point to your new production domain.
3. Test a live payment!
