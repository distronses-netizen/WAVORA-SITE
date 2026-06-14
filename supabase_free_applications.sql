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

-- Allow unauthenticated (public) inserts so that users can submit the form
CREATE POLICY "Allow public inserts" ON free_applications
    FOR INSERT
    WITH CHECK (true);

-- Allow admins to read, update, and delete (assuming you handle admin auth, if you use a service_role key from your admin panel, the service role bypasses RLS anyway).
-- This sets up basic policy for authenticated users:
CREATE POLICY "Allow authenticated read" ON free_applications
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON free_applications
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON free_applications
    FOR DELETE
    USING (auth.role() = 'authenticated');
