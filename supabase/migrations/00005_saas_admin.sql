-- 1. Profiles Additions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

-- 2. Settings Table
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initial settings
INSERT INTO public.settings (key, value) VALUES 
('platform_name', 'Rido'),
('primary_color', '#8b5cf6'),
('logo_url', '')
ON CONFLICT DO NOTHING;

-- 3. Notifications Table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- null means broadcast to all
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Bundles
CREATE TABLE public.bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.bundle_resources (
  bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, resource_id)
);

-- Update purchases to support bundles
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE;

-- RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own or broadcast notifications" ON public.notifications FOR SELECT USING (
  user_id = auth.uid() OR user_id IS NULL
);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view bundles" ON public.bundles FOR SELECT USING (true);
CREATE POLICY "Admins can manage bundles" ON public.bundles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view bundle resources" ON public.bundle_resources FOR SELECT USING (true);
CREATE POLICY "Admins can manage bundle resources" ON public.bundle_resources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Storage Buckets for Resources
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false) ON CONFLICT (id) DO NOTHING;

-- RLS Covers (Publicly viewable)
CREATE POLICY "Covers are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Admins can upload covers" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'covers' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS PDFs (Only Admins and Purchasers can view)
-- Note: A secure API endpoint `/api/pdf/[id]` handles the read logic for students securely.
-- For storage objects directly, only admins can read/write them here to prevent raw URL access.
CREATE POLICY "Admins can manage pdfs" ON storage.objects FOR ALL USING (
  bucket_id = 'pdfs' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
