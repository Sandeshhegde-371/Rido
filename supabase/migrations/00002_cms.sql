-- Create Categories Table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Alter Resources Table
ALTER TABLE public.resources ADD COLUMN category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.resources RENAME COLUMN url TO pdf_url;
ALTER TABLE public.resources ADD COLUMN cover_image TEXT;
ALTER TABLE public.resources ADD COLUMN is_premium BOOLEAN DEFAULT true;
ALTER TABLE public.resources ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE public.resources DROP COLUMN type;

-- Create Reading Progress Table
CREATE TABLE public.reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  current_page INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, resource_id)
);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reading progress" ON public.reading_progress FOR ALL USING (auth.uid() = user_id);

-- Create Resource Views Table
CREATE TABLE public.resource_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.resource_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own resource views" ON public.resource_views FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all resource views" ON public.resource_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert Default Categories
INSERT INTO public.categories (name, slug) VALUES 
('DSA', 'dsa'),
('System Design', 'system-design'),
('DBMS', 'dbms'),
('OS', 'os'),
('Computer Networks', 'computer-networks'),
('OOPs', 'oops'),
('SQL', 'sql'),
('Git & GitHub', 'git-github'),
('REST APIs', 'rest-apis'),
('Aptitude', 'aptitude'),
('Resume', 'resume'),
('HR Interview', 'hr-interview'),
('AI/ML', 'ai-ml')
ON CONFLICT (slug) DO NOTHING;
