-- Create Plans Table
CREATE TABLE public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Only admins can modify plans" ON public.plans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert Default Plans
INSERT INTO public.plans (name, price) VALUES 
('Single Resource', 39.00),
('Placement Vault', 99.00)
ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price;

-- Alter Purchases Table
ALTER TABLE public.purchases ADD COLUMN plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE;
ALTER TABLE public.purchases ADD COLUMN payment_id TEXT;
ALTER TABLE public.purchases ALTER COLUMN resource_id DROP NOT NULL;

-- If both are null, that's invalid, but we'll enforce it via application logic.
-- A purchase is either for a specific resource, or a plan (like the Vault).

-- Update RLS for purchases if needed (Admins can manage, Users can view own)
-- Existing policies: "Users can view own purchases", "Admins can view all purchases"
-- We should allow admins to INSERT/UPDATE/DELETE purchases to grant/revoke access.
CREATE POLICY "Admins can manage purchases" ON public.purchases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
