-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR FRIENDSHIP CALCULATOR
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Table to track friendship calculations (names entered, vibe, score)
CREATE TABLE IF NOT EXISTS public.friendship_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_name TEXT NOT NULL,
    friend_name TEXT NOT NULL,
    vibe TEXT,
    score INTEGER,
    archetype TEXT,
    user_agent TEXT,
    referrer TEXT
);

-- 2. Table to track unique visits & pageviews
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    path TEXT DEFAULT '/',
    referrer TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    language TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.friendship_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Allow public anonymous insertion from the website frontend
CREATE POLICY "Allow anonymous inserts to friendship_calculations"
ON public.friendship_calculations
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts to site_visits"
ON public.site_visits
FOR INSERT
TO anon
WITH CHECK (true);

-- 4. Optional: Allow authenticated users / dashboard to view all records
CREATE POLICY "Allow read access for authenticated users to friendship_calculations"
ON public.friendship_calculations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read access for authenticated users to site_visits"
ON public.site_visits
FOR SELECT
TO authenticated
USING (true);

-- 5. Helpful indexes for fast querying in Supabase Table Editor
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON public.friendship_calculations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.site_visits (created_at DESC);
