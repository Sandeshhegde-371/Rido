-- Create Mentorship Bookings Table
CREATE TABLE public.mentorship_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('Placement Roadmap', 'Resume Review', 'DSA Strategy', 'Interview Guidance')),
  booking_date DATE NOT NULL,
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meeting_link TEXT,
  payment_id TEXT,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mentorship_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.mentorship_bookings FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can insert own bookings" ON public.mentorship_bookings FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Admins can view and manage all bookings" ON public.mentorship_bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Set up storage bucket for Resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT (id) DO NOTHING;

-- RLS for resumes bucket
-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload resumes" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND auth.role() = 'authenticated'
);

-- Allow admins to view all resumes
CREATE POLICY "Admins can view all resumes" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Note: The old 'bookings' table was hypothetical. 
-- We will migrate any existing queries to use 'mentorship_bookings'.
