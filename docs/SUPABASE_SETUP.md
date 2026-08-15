# Supabase Setup Guide

Rido relies heavily on Supabase for Authentication, Database, and secure File Storage. Follow these exact steps to set up your project.

## 1. Create a Project
1. Go to [Supabase](https://supabase.com/).
2. Create a new project and select an AWS region closest to your users (e.g., `ap-south-1` for India).
3. Save your Database Password securely.

## 2. Get API Keys
1. Go to **Project Settings -> API**.
2. Copy the `Project URL` and `anon public` key.
3. Add these to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

## 3. Run Migrations
Rido comes with 5 sequential SQL migrations. You MUST run them in order.
1. Open the **SQL Editor** in the Supabase Dashboard.
2. Copy and paste the contents of each file from `supabase/migrations/` in this exact order and click **RUN**:
   - `00001_init.sql` (Creates profiles, resources, plans, purchases, categories)
   - `00002_rls.sql` (Sets up Row Level Security)
   - `00003_storage.sql` (Creates buckets)
   - `00004_mentorship.sql` (Creates mentorship_bookings table and resumes bucket)
   - `00005_saas_admin.sql` (Creates settings, notifications, bundles, and disables profiles)

*Alternatively, if you have the Supabase CLI installed, just run `supabase db push`.*

## 4. Storage Buckets Verification
Ensure the following buckets exist in **Storage**:
1. `covers` (Public) - For resource cover images.
2. `pdfs` (Private) - For the actual premium handbooks.
3. `resumes` (Private) - For student resumes during mentorship booking.

The migration scripts (`00003`, `00004`, `00005`) should have created these automatically with the correct RLS policies.

## 5. Create the First Admin
To access the Admin Dashboard, your user account must have the `role` of `admin`.
1. Sign up on your local Rido app (`http://localhost:3000/signup`).
2. Go to the Supabase Dashboard -> **Table Editor** -> `profiles`.
3. Find your row, double-click the `role` cell, change it from `student` to `admin`, and save.
4. Refresh your local app. You now have full access to `/admin`.
