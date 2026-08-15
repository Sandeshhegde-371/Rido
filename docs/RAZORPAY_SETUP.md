# Razorpay Setup Guide

Rido uses Razorpay to process payments for Resources, Plans, and Mentorship sessions.

## 1. Create a Razorpay Account
1. Sign up at [Razorpay](https://razorpay.com/).
2. Complete your KYC to activate Live Mode (or use Test Mode for local development).

## 2. Generate API Keys
1. In your Razorpay Dashboard, go to **Account & Settings -> API Keys**.
2. Click **Generate Test Key** (or Live Key).
3. Add these to your `.env.local` file:
   ```env
   RAZORPAY_KEY_ID="rzp_test_your_key_here"
   RAZORPAY_KEY_SECRET="your_secret_here"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_here"
   ```

*Note: The `NEXT_PUBLIC_` prefix is required so the frontend checkout script can access the Key ID. NEVER expose the secret.*

## 3. Webhooks (Required for Production)
Rido relies on Webhooks to verify payments securely without trusting the frontend.

1. In Razorpay, go to **Account & Settings -> Webhooks**.
2. Click **Add New Webhook**.
3. Set the Webhook URL to: `https://your-production-domain.com/api/razorpay/webhook`
4. Enter a strong random secret. Add it to `.env.local`:
   ```env
   RAZORPAY_WEBHOOK_SECRET="your_strong_random_secret"
   ```
5. Check the following events:
   - `order.paid`
6. Save the Webhook.

*Note: For local testing, you can use [Ngrok](https://ngrok.com/) to expose your `localhost:3000` to the internet and receive webhook events.*
