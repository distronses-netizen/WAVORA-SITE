-- Supabase Schema for Free Distribution Applications

-- Create the table
CREATE TABLE IF NOT EXISTS free_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_name TEXT NOT NULL,
    real_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    youtube_channel TEXT,
    instagram_id TEXT NOT NULL,
    spotify_id TEXT,
    why_free TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- Expected values: 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE free_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Allow public inserts" ON free_applications;
DROP POLICY IF EXISTS "Allow public read" ON free_applications;
DROP POLICY IF EXISTS "Allow public update" ON free_applications;
DROP POLICY IF EXISTS "Allow public delete" ON free_applications;
DROP POLICY IF EXISTS "Allow authenticated read" ON free_applications;
DROP POLICY IF EXISTS "Allow authenticated update" ON free_applications;
DROP POLICY IF EXISTS "Allow authenticated delete" ON free_applications;

-- Allow unauthenticated (public) inserts so that users can submit the form
CREATE POLICY "Allow public inserts" ON free_applications
    FOR INSERT
    WITH CHECK (true);

-- Allow public read, update, and delete for the unauthenticated admin portal
CREATE POLICY "Allow public read" ON free_applications
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public update" ON free_applications
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete" ON free_applications
    FOR DELETE
    USING (true);

