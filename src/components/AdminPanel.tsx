/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Search, Users, CheckCircle2, XCircle, Clock, TrendingUp, 
  LogOut, ArrowLeft, Mail, Phone, User, Calendar, CreditCard, Filter, 
  Check, X, Trash2, ArrowUpDown, Sparkles, RefreshCw, Send, ShieldAlert,
  ExternalLink, Tag, Edit, Percent, AlertCircle, Music, Layers, Download, Image, Copy, Instagram
} from "lucide-react";
import Logo from "./Logo";
import { getStoredOffers, saveStoredOffers, getPlanPriceDetails, BASE_PRICES } from "../lib/pricing";
import { supabase } from "../lib/supabase";

const SUPABASE_SQL_CODE = `-- 1. CREATE TABLES WITH STABLE RELATIONSHIPS AND COLUMNS
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    plan TEXT NOT NULL,
    is_annual BOOLEAN DEFAULT false,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    stage_name TEXT,
    contact_number TEXT,
    referral TEXT,
    receipt TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.free_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    instagram_handle TEXT NOT NULL,
    stage_name TEXT,
    primary_genre TEXT NOT NULL,
    spotify_profile TEXT,
    why_wavora TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.single_track_releases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    featured_artists TEXT,
    genre TEXT NOT NULL,
    sub_genre TEXT,
    license_type TEXT DEFAULT 'Original',
    release_date TEXT,
    label_name TEXT,
    is_dolby_atmos BOOLEAN DEFAULT false,
    has_content_id BOOLEAN DEFAULT false,
    is_explicit BOOLEAN DEFAULT false,
    spotify_profile TEXT,
    apple_music_profile TEXT,
    instagram_profile TEXT,
    lyrics TEXT,
    plan TEXT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending',
    audio_url TEXT,
    artwork_url TEXT,
    email TEXT,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure fields exist on existing table setups as well
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS artist TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS featured_artists TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS sub_genre TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'Original';
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS release_date TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS label_name TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS is_dolby_atmos BOOLEAN DEFAULT false;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS has_content_id BOOLEAN DEFAULT false;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS is_explicit BOOLEAN DEFAULT false;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS spotify_profile TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS apple_music_profile TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS instagram_profile TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS lyrics TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS artwork_url TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS contact_number TEXT;

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS is_annual BOOLEAN DEFAULT false;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS stage_name TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS referral TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS receipt TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS stage_name TEXT;
ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS primary_genre TEXT;
ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS spotify_profile TEXT;
ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS why_wavora TEXT;
ALTER TABLE public.free_applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. ENABLE ROW LEVEL SECURITY (RLS) FOR SECURITY AND SYNCING
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.single_track_releases ENABLE ROW LEVEL SECURITY;

-- 3. CREATE DYNAMIC POLICIES WITH FULL COOPERATIVE DEFIANT PERMISSIONS
DROP POLICY IF EXISTS "Allow public read access to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public insert to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public update to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public delete to applications" ON public.applications;
DROP POLICY IF EXISTS allow_select_applications ON public.applications;
DROP POLICY IF EXISTS allow_insert_applications ON public.applications;
DROP POLICY IF EXISTS allow_update_applications ON public.applications;
DROP POLICY IF EXISTS allow_delete_applications ON public.applications;
DROP POLICY IF EXISTS wavora_policy_select_applications ON public.applications;
DROP POLICY IF EXISTS wavora_policy_insert_applications ON public.applications;
DROP POLICY IF EXISTS wavora_policy_update_applications ON public.applications;
DROP POLICY IF EXISTS wavora_policy_delete_applications ON public.applications;

CREATE POLICY wavora_policy_select_applications ON public.applications FOR SELECT USING (true);
CREATE POLICY wavora_policy_insert_applications ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY wavora_policy_update_applications ON public.applications FOR UPDATE USING (true);
CREATE POLICY wavora_policy_delete_applications ON public.applications FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access to free_applications" ON public.free_applications;
DROP POLICY IF EXISTS "Allow public insert to free_applications" ON public.free_applications;
DROP POLICY IF EXISTS "Allow public update to free_applications" ON public.free_applications;
DROP POLICY IF EXISTS "Allow public delete to free_applications" ON public.free_applications;
DROP POLICY IF EXISTS allow_select_free_applications ON public.free_applications;
DROP POLICY IF EXISTS allow_insert_free_applications ON public.free_applications;
DROP POLICY IF EXISTS allow_update_free_applications ON public.free_applications;
DROP POLICY IF EXISTS allow_delete_free_applications ON public.free_applications;
DROP POLICY IF EXISTS wavora_policy_select_free_apps ON public.free_applications;
DROP POLICY IF EXISTS wavora_policy_insert_free_apps ON public.free_applications;
DROP POLICY IF EXISTS wavora_policy_update_free_apps ON public.free_applications;
DROP POLICY IF EXISTS wavora_policy_delete_free_apps ON public.free_applications;

CREATE POLICY wavora_policy_select_free_apps ON public.free_applications FOR SELECT USING (true);
CREATE POLICY wavora_policy_insert_free_apps ON public.free_applications FOR INSERT WITH CHECK (true);
CREATE POLICY wavora_policy_update_free_apps ON public.free_applications FOR UPDATE USING (true);
CREATE POLICY wavora_policy_delete_free_apps ON public.free_applications FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access to single_track_releases" ON public.single_track_releases;
DROP POLICY IF EXISTS "Allow public insert to single_track_releases" ON public.single_track_releases;
DROP POLICY IF EXISTS "Allow public update to single_track_releases" ON public.single_track_releases;
DROP POLICY IF EXISTS "Allow public delete to single_track_releases" ON public.single_track_releases;
DROP POLICY IF EXISTS allow_select_single_releases ON public.single_track_releases;
DROP POLICY IF EXISTS allow_insert_single_releases ON public.single_track_releases;
DROP POLICY IF EXISTS allow_update_single_releases ON public.single_track_releases;
DROP POLICY IF EXISTS allow_delete_single_releases ON public.single_track_releases;
DROP POLICY IF EXISTS wavora_policy_select_single_releases ON public.single_track_releases;
DROP POLICY IF EXISTS wavora_policy_insert_single_releases ON public.single_track_releases;
DROP POLICY IF EXISTS wavora_policy_update_single_releases ON public.single_track_releases;
DROP POLICY IF EXISTS wavora_policy_delete_single_releases ON public.single_track_releases;

CREATE POLICY wavora_policy_select_single_releases ON public.single_track_releases FOR SELECT USING (true);
CREATE POLICY wavora_policy_insert_single_releases ON public.single_track_releases FOR INSERT WITH CHECK (true);
CREATE POLICY wavora_policy_update_single_releases ON public.single_track_releases FOR UPDATE USING (true);
CREATE POLICY wavora_policy_delete_single_releases ON public.single_track_releases FOR DELETE USING (true);

-- 4. INSERT STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('single-releases', 'single-releases', true)
ON CONFLICT (id) DO NOTHING;

-- 5. STORAGE BUCKET POLICIES FOR 'single-releases'
DROP POLICY IF EXISTS "Public Select Objects" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Objects" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Objects" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Objects" ON storage.objects;
DROP POLICY IF EXISTS public_select_objects ON storage.objects;
DROP POLICY IF EXISTS public_upload_objects ON storage.objects;
DROP POLICY IF EXISTS public_update_objects ON storage.objects;
DROP POLICY IF EXISTS public_delete_objects ON storage.objects;
DROP POLICY IF EXISTS wavora_storage_select_single_releases ON storage.objects;
DROP POLICY IF EXISTS wavora_storage_insert_single_releases ON storage.objects;
DROP POLICY IF EXISTS wavora_storage_update_single_releases ON storage.objects;
DROP POLICY IF EXISTS wavora_storage_delete_single_releases ON storage.objects;

CREATE POLICY wavora_storage_select_single_releases ON storage.objects FOR SELECT USING (bucket_id = 'single-releases');
CREATE POLICY wavora_storage_insert_single_releases ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'single-releases');
CREATE POLICY wavora_storage_update_single_releases ON storage.objects FOR UPDATE USING (bucket_id = 'single-releases');
CREATE POLICY wavora_storage_delete_single_releases ON storage.objects FOR DELETE USING (bucket_id = 'single-releases');
`;

// Pre-seeded applications if none exist in localStorage
const MOCK_SEED_APPLICATIONS = [
  {
    id: "app-101",
    plan: "elite",
    isAnnual: true,
    email: "ritvik.sharma@wavestudio.in",
    fullName: "Ritvik Sharma",
    stageName: "RITVIK LIVE",
    contactNumber: "+91 94522 88102",
    referral: "Instagram",
    status: "pending",
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    receipt: "" // Will trigger generated mockup
  },
  {
    id: "app-102",
    plan: "pro",
    isAnnual: false,
    email: "ananya.pillai@vibebeats.com",
    fullName: "Ananya Pillai",
    stageName: "Ananya Cosmic",
    contactNumber: "+91 91223 44556",
    referral: "YouTube Showcase",
    status: "approved",
    date: new Date(Date.now() - 17 * 3600 * 1000).toISOString(), // 17 hours ago
    receipt: ""
  },
  {
    id: "app-103",
    plan: "basic",
    isAnnual: true,
    email: "kabir.verma@beats.in",
    fullName: "Kabir Verma",
    stageName: "DJ Hypebeast",
    contactNumber: "+91 98877 66554",
    referral: "Friend Recommendation",
    status: "approved",
    date: new Date(Date.now() - 40 * 3600 * 1000).toISOString(), // 1.5 days ago
    receipt: ""
  },
  {
    id: "app-104",
    plan: "pro",
    isAnnual: true,
    email: "samarth.jain@neonlabel.com",
    fullName: "Samarth Jain",
    stageName: "System Outage",
    contactNumber: "+91 95421 00223",
    referral: "Instagram",
    status: "rejected",
    date: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), // 3 days ago
    receipt: ""
  }
];

// Pre-seeded free applications if none exist in localStorage
const MOCK_SEED_FREE_APPLICATIONS = [
  {
    id: "free-101",
    artistName: "MC Spitfire",
    realName: "Rohan Deshmukh",
    email: "spitfirerap@gmail.com",
    contactNumber: "+91 98334 22109",
    youtubeChannel: "youtube.com/@mc_spitfire",
    instagramId: "@spitfire_rap",
    spotifyId: "https://open.spotify.com/artist/dummy1",
    whyFree: "I am an upcoming underground rapper from Mumbai. I want to release my first mixtape without upfront investment.",
    status: "pending",
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: "free-102",
    artistName: "Choreograph",
    realName: "Sarah Thomas",
    email: "sarahsongs@vibe.in",
    contactNumber: "+91 88772 11002",
    youtubeChannel: "youtube.com/@sarah_thomas",
    instagramId: "@sarah.thomas.music",
    spotifyId: "",
    whyFree: "Looking for premium release workflow but on a budget. Ready to partner with a selective distro platform.",
    status: "approved",
    created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString()
  }
];

const mapDbApplicationToClient = (row: any) => ({
  id: row.id,
  plan: row.plan,
  isAnnual: row.is_annual !== undefined ? row.is_annual : (row.isAnnual !== undefined ? row.isAnnual : true),
  email: row.email,
  fullName: row.full_name || row.fullName || "",
  stageName: row.stage_name || row.stageName || "",
  contactNumber: row.contact_number || row.contactNumber || "",
  referral: row.referral || "",
  receipt: row.receipt || "",
  status: row.status || "pending",
  userId: row.user_id || row.userId,
  date: row.created_at || row.date || new Date().toISOString()
});

interface AdminPanelProps {
  onBackToMain: () => void;
}

export default function AdminPanel({ onBackToMain }: AdminPanelProps) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("wavora_admin_auth") === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Core Data State
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"submissions" | "offers" | "free-submissions" | "single-releases">("submissions");
  const [offers, setOffers] = useState(() => getStoredOffers());

  // Free Selective Applications State
  const [freeApplications, setFreeApplications] = useState<any[]>([]);
  const [selectedFreeApp, setSelectedFreeApp] = useState<any | null>(null);
  const [searchFreeQuery, setSearchFreeQuery] = useState("");
  const [selectedFreeStatus, setSelectedFreeStatus] = useState("all");

  // Single Track Releases State
  const [singleReleases, setSingleReleases] = useState<any[]>([]);
  const [selectedSingleRelease, setSelectedSingleRelease] = useState<any | null>(null);
  const [searchSingleQuery, setSearchSingleQuery] = useState("");
  const [selectedSingleStatus, setSelectedSingleStatus] = useState("all");
  const [showSqlSetup, setShowSqlSetup] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedReleaseText, setCopiedReleaseText] = useState(false);

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CODE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyReleaseDetailsToClipboard = (single: any) => {
    if (!single) return;
    const genreParts = (single.genre || "").split(" - ");
    const primaryGenre = genreParts[0] || "Not specified";
    const subGenre = genreParts[1] || "None specified";
    
    const text = `
===== WAVORA MUSIC RELEASE METADATA =====
ID: ${single.id}
Title/Track: ${single.title}
Primary Artist(s): ${single.artist}
Featured Artist(s): ${single.featured_artists || 'None'}
Primary Genre: ${primaryGenre}
Sub Genre: ${subGenre}
License Type: ${single.license_type || 'Original'}
Target Release Date: ${single.release_date || 'Not specified'}
Publisher / Record Label: ${single.label_name || 'Independent (Wavora Records)'}
Dolby Atmos spatial format: ${single.is_dolby_atmos ? 'Yes' : 'No'}
YouTube Content ID Protection: ${single.has_content_id ? 'Yes' : 'No'}
Explicit Lyrics Flag: ${single.is_explicit ? 'Yes' : 'No'}

----- CONTACT INFORMATION -----
Artist Email: ${single.email || 'N/A'}
Artist WhatsApp / Contact: ${single.contact_number || 'N/A'}

----- STREAM MUSIC LINKS -----
Spotify Profiles mapping: ${single.spotify_profile || 'Not provided'}
Apple Music Profiles mapping: ${single.apple_music_profile || 'Not provided'}
Instagram Profiles mapping: ${single.instagram_profile || 'Not provided'}

----- DISTRIBUTION DIGITAL ASSETS -----
Artwork image JPG File: ${single.artwork_url || 'Missing Link'}
Master WAV sound File: ${single.audio_url || 'Missing Link'}

----- ASSOCIATED LYRICS -----
${single.lyrics || 'No associated lyrics provided.'}
==========================================
`;
    navigator.clipboard.writeText(text.trim());
    setCopiedReleaseText(true);
    setTimeout(() => setCopiedReleaseText(false), 2000);
  };

  const parseArtistProfiles = (release: any) => {
    if (!release) return [];
    
    const profilesMap: Record<string, { type: 'Primary' | 'Featured', name: string, instagram: string, spotify: string, apple: string }> = {};

    const parseNameAndHandle = (str: string) => {
      const match = str.match(/(.*?)\s*\((.*?)\)/);
      if (match) {
        return { name: match[1].trim(), handle: match[2].trim() };
      }
      return { name: str.trim(), handle: "" };
    };

    // 1. Process Primaries
    if (release.artist) {
      const parts = release.artist.split(",");
      parts.forEach((p: string) => {
        const { name, handle } = parseNameAndHandle(p);
        if (name) {
          profilesMap[name.toLowerCase()] = {
            type: 'Primary',
            name,
            instagram: handle,
            spotify: "",
            apple: ""
          };
        }
      });
    }

    // 2. Process Featureds
    if (release.featured_artists) {
      const parts = release.featured_artists.split(",");
      parts.forEach((p: string) => {
        const { name, handle } = parseNameAndHandle(p);
        if (name) {
          profilesMap[name.toLowerCase()] = {
            type: 'Featured',
            name,
            instagram: handle,
            spotify: "",
            apple: ""
          };
        }
      });
    }

    // Process profiles columns
    const parseProfilesColumn = (colVal: string, key: 'spotify' | 'apple') => {
      if (!colVal) return;
      const items = colVal.split("|");
      items.forEach((item: string) => {
        const trimItem = item.trim();
        if (!trimItem) return;

        let isFeatured = false;
        let workStr = trimItem;
        if (trimItem.startsWith("Featured:")) {
          isFeatured = true;
          workStr = trimItem.replace(/^Featured:\s*/, "");
        }

        const colonIndex = workStr.indexOf(":");
        if (colonIndex !== -1) {
          const artistName = workStr.substring(0, colonIndex).trim();
          const link = workStr.substring(colonIndex + 1).trim();
          const mapKey = artistName.toLowerCase();

          if (profilesMap[mapKey]) {
            profilesMap[mapKey][key] = link;
          } else {
            profilesMap[mapKey] = {
              type: isFeatured ? 'Featured' : 'Primary',
              name: artistName,
              instagram: "",
              spotify: key === 'spotify' ? link : "",
              apple: key === 'apple' ? link : ""
            };
          }
        }
      });
    };

    parseProfilesColumn(release.spotify_profile, 'spotify');
    parseProfilesColumn(release.apple_music_profile, 'apple');

    if (release.instagram_profile) {
      const items = release.instagram_profile.split("|");
      items.forEach((item: string) => {
        const trimItem = item.trim();
        if (!trimItem) return;

        let isFeatured = false;
        let workStr = trimItem;
        if (trimItem.startsWith("Featured:")) {
          isFeatured = true;
          workStr = trimItem.replace(/^Featured:\s*/, "");
        }

        const colonIndex = workStr.indexOf(":");
        if (colonIndex !== -1) {
          const artistName = workStr.substring(0, colonIndex).trim();
          const handle = workStr.substring(colonIndex + 1).trim();
          const mapKey = artistName.toLowerCase();

          if (profilesMap[mapKey]) {
            if (handle && handle !== "Not Available") {
              profilesMap[mapKey].instagram = handle;
            }
          } else {
            profilesMap[mapKey] = {
              type: isFeatured ? 'Featured' : 'Primary',
              name: artistName,
              instagram: handle === "Not Available" ? "" : handle,
              spotify: "",
              apple: ""
            };
          }
        }
      });
    }

    return Object.values(profilesMap);
  };

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // or "name"
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load and refresh entries from Supabase + fallback localStorage
  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const mapped = data.map(mapDbApplicationToClient);
        setApplications(mapped);
        localStorage.setItem("wavora_applications", JSON.stringify(mapped));
        return;
      }
    } catch (err) {
      console.warn("Could not load from Supabase applications, falling back to local storage:", err);
    }

    let stored = localStorage.getItem("wavora_applications");
    if (!stored) {
      // Seed initial mock data
      localStorage.setItem("wavora_applications", JSON.stringify(MOCK_SEED_APPLICATIONS));
      setApplications(MOCK_SEED_APPLICATIONS);
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setApplications(parsed.map(mapDbApplicationToClient));
        } else {
          setApplications([]);
        }
      } catch (err) {
        setApplications([]);
      }
    }
  };

  const loadFreeApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("free_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const mapped = data.map((row: any) => ({
          id: row.id,
          artistName: row.artist_name || row.artistName || "",
          realName: row.real_name || row.realName || "",
          email: row.email,
          contactNumber: row.contact_number || row.contactNumber || "",
          youtubeChannel: row.youtube_channel || row.youtubeChannel || "",
          instagramId: row.instagram_id || row.instagramId || "",
          spotifyId: row.spotify_id || row.spotifyId || "",
          whyFree: row.why_free || row.whyFree || "",
          status: row.status || "pending",
          date: row.created_at || row.date || new Date().toISOString()
        }));

        // Merge with local-only items that failed Supabase insertion (missing columns etc)
        let localOnlyApps: any[] = [];
        try {
          const stored = localStorage.getItem("wavora_free_applications");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              localOnlyApps = parsed.filter(item => typeof item.id === "string" && item.id.startsWith("free-"));
            }
          }
        } catch(e) {}
        
        // Ensure to remove duplicates if somehow local item got same ID
        const finalMerged = [...localOnlyApps, ...mapped];

        setFreeApplications(finalMerged);
        localStorage.setItem("wavora_free_applications", JSON.stringify(finalMerged));
        return;
      }
    } catch (err) {
      console.warn("Could not load from Supabase free_applications, falling back to local storage:", err);
    }

    let stored = localStorage.getItem("wavora_free_applications");
    if (!stored) {
      // Seed initial mock free data
      localStorage.setItem("wavora_free_applications", JSON.stringify(MOCK_SEED_FREE_APPLICATIONS));
      setFreeApplications(MOCK_SEED_FREE_APPLICATIONS);
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFreeApplications(parsed);
        } else {
          setFreeApplications([]);
        }
      } catch (err) {
        setFreeApplications([]);
      }
    }
  };

  const loadSingleReleases = async () => {
    try {
      const { data, error } = await supabase
        .from("single_track_releases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setSingleReleases(data);
        localStorage.setItem("wavora_single_track_releases", JSON.stringify(data));
        return;
      }
    } catch (err) {
      console.warn("Could not load from Supabase single_track_releases, falling back to local storage:", err);
    }

    let stored = localStorage.getItem("wavora_single_track_releases");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSingleReleases(parsed);
        } else {
          setSingleReleases([]);
        }
      } catch (err) {
        setSingleReleases([]);
      }
    } else {
      setSingleReleases([]);
    }
  };

  useEffect(() => {
    loadApplications();
    loadFreeApplications();
    loadSingleReleases();
    const handleStorageChange = () => {
      loadApplications();
      loadFreeApplications();
      loadSingleReleases();
    };
    const handleFreeChange = () => {
      loadFreeApplications();
    };
    const handleSingleChange = () => {
      loadSingleReleases();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("wavora_free_applications_updated", handleFreeChange);
    window.addEventListener("wavora_single_track_releases_updated", handleSingleChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wavora_free_applications_updated", handleFreeChange);
      window.removeEventListener("wavora_single_track_releases_updated", handleSingleChange);
    };
  }, []);

  // Set selected application to the first pending one if nothing is selected yet
  useEffect(() => {
    if (applications.length > 0 && !selectedApp) {
      const pending = applications.find(a => a.status === "pending");
      setSelectedApp(pending || applications[0]);
    } else if (selectedApp) {
      // Keep selected app in sync if the list updates
      const updated = applications.find(a => a.id === selectedApp.id);
      if (updated) setSelectedApp(updated);
    }
  }, [applications]);

  // Set selected free application to the first pending one if nothing is selected yet
  useEffect(() => {
    if (freeApplications.length > 0 && !selectedFreeApp) {
      const pending = freeApplications.find(f => f.status === "pending");
      setSelectedFreeApp(pending || freeApplications[0]);
    } else if (selectedFreeApp) {
      const updated = freeApplications.find(f => f.id === selectedFreeApp.id);
      if (updated) setSelectedFreeApp(updated);
    }
  }, [freeApplications]);

  // Set selected single release to the first one if nothing is selected yet
  useEffect(() => {
    if (singleReleases.length > 0 && !selectedSingleRelease) {
      setSelectedSingleRelease(singleReleases[0]);
    } else if (selectedSingleRelease) {
      const updated = singleReleases.find(r => r.id === selectedSingleRelease.id);
      if (updated) setSelectedSingleRelease(updated);
    }
  }, [singleReleases]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    if (email === "admin@g.g" && password === "232323") {
      setIsLoggingIn(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoggingIn(false);
        localStorage.setItem("wavora_admin_auth", "true");
      }, 1000);
    } else {
      setLoginError("Invalid email address or passcode.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("wavora_admin_auth");
  };

  // Change Application status
  const updateStatus = async (appId: string, status: "pending" | "approved" | "rejected") => {
    const updated = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status };
      }
      return app;
    });
    setApplications(updated);
    localStorage.setItem("wavora_applications", JSON.stringify(updated));

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appId);
    if (!isUUID) return;

    try {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", appId);
      if (error) {
        console.warn("Could not sync updated status with Supabase:", error);
      }
    } catch (err) {
      console.warn("Exception during remote status update:", err);
    }
  };

  // Delete Application
  const deleteApp = async (appId: string) => {
    const updated = applications.filter(app => app.id !== appId);
    setApplications(updated);
    localStorage.setItem("wavora_applications", JSON.stringify(updated));
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(updated[0] || null);
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appId);
    if (!isUUID) return;

    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", appId);
      if (error) {
        console.warn("Could not remove record from Supabase:", error);
      }
    } catch (err) {
      console.warn("Exception during remote deletion:", err);
    }
  };

  // Change Free Application status
  const updateFreeStatus = async (appId: string, status: "pending" | "approved" | "rejected") => {
    const updated = freeApplications.map(app => {
      if (app.id === appId) {
        return { ...app, status };
      }
      return app;
    });
    setFreeApplications(updated);
    localStorage.setItem("wavora_free_applications", JSON.stringify(updated));

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appId);
    if (!isUUID) return;

    try {
      const { error } = await supabase
        .from("free_applications")
        .update({ status })
        .eq("id", appId);
      if (error) {
        console.warn("Could not sync updated status with Supabase:", error);
      }
    } catch (err) {
      console.warn("Exception during remote status update:", err);
    }
  };

  // Delete Free Application
  const deleteFreeApp = async (appId: string) => {
    const updated = freeApplications.filter(app => app.id !== appId);
    setFreeApplications(updated);
    localStorage.setItem("wavora_free_applications", JSON.stringify(updated));
    if (selectedFreeApp && selectedFreeApp.id === appId) {
      setSelectedFreeApp(updated[0] || null);
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appId);
    if (!isUUID) return;

    try {
      const { error } = await supabase
        .from("free_applications")
        .delete()
        .eq("id", appId);
      if (error) {
        console.warn("Could not remove record from Supabase:", error);
      }
    } catch (err) {
      console.warn("Exception during remote deletion:", err);
    }
  };

  // Change Single Track release status
  const updateSingleStatus = async (releaseId: string | number, status: string) => {
    const updated = singleReleases.map(rel => {
      if (rel.id === releaseId) {
        return { ...rel, status };
      }
      return rel;
    });
    setSingleReleases(updated);
    localStorage.setItem("wavora_single_track_releases", JSON.stringify(updated));

    const isStringId = typeof releaseId === "string";
    const isUUID = isStringId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(releaseId);
    if (!isUUID) return;

    try {
      const { error } = await supabase
        .from("single_track_releases")
        .update({ status })
        .eq("id", releaseId);
      if (error) {
        console.warn("Could not sync updated single release status with Supabase:", error);
      }
    } catch (err) {
      console.warn("Exception during remote single release status update:", err);
    }
  };

  // Delete Single Release
  const deleteSingleRelease = async (releaseId: string | number) => {
    const updated = singleReleases.filter(rel => rel.id !== releaseId);
    setSingleReleases(updated);
    localStorage.setItem("wavora_single_track_releases", JSON.stringify(updated));
    if (selectedSingleRelease && selectedSingleRelease.id === releaseId) {
      setSelectedSingleRelease(updated[0] || null);
    }

    const isStringId = typeof releaseId === "string";
    const isUUID = isStringId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(releaseId);
    if (!isUUID) return;

    try {
      const { error } = await supabase
        .from("single_track_releases")
        .delete()
        .eq("id", releaseId);
      if (error) {
        console.warn("Could not remove single release from Supabase:", error);
      }
    } catch (err) {
      console.warn("Exception during remote single release deletion:", err);
    }
  };

  // Reset to default seed data of 4 mock items + clear localStorage overrides
  const handleResetData = () => {
    if (confirm("This will reset all application data back to the demo mock profiles. Proceed?")) {
      localStorage.setItem("wavora_applications", JSON.stringify(MOCK_SEED_APPLICATIONS));
      setApplications(MOCK_SEED_APPLICATIONS);
      setSelectedApp(MOCK_SEED_APPLICATIONS[0]);
    }
  };

  const handleSaveOffers = (updatedOffers: typeof offers) => {
    saveStoredOffers(updatedOffers);
    setOffers(updatedOffers);
  };

  const handleClearOffers = () => {
    if (confirm("Reset promotional offers back to normal? This will clear all active discount prices.")) {
      const resetOffers = {
        basic: { planId: "basic", annualOfferPrice: null, monthlyOfferPrice: null, offerLabel: "" },
        pro: { planId: "pro", annualOfferPrice: null, monthlyOfferPrice: null, offerLabel: "" },
        elite: { planId: "elite", annualOfferPrice: null, monthlyOfferPrice: null, offerLabel: "" }
      };
      saveStoredOffers(resetOffers);
      setOffers(resetOffers);
    }
  };

  // Add a quick random synthetic application to test inflow
  const handleAddDemoSubmission = async () => {
    const demoNames = [
      { full: "Rishabh Malhotra", stage: "RISH MIX", email: "rish@studio.in" },
      { full: "Kavya Iyer", stage: "Iyer Beats", email: "kavya.music@yahoo.com" },
      { full: "Devansh Mehta", stage: "Acoustic Dev", email: "devansh.mehta@gmail.com" },
      { full: "Siddharth Sen", stage: "Cosmo Synth", email: "sid.sen@outlook.com" }
    ];
    const item = demoNames[Math.floor(Math.random() * demoNames.length)];
    const plans = ["basic", "pro", "elite"];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const isAnnual = Math.random() > 0.4;
    const referrals = ["Instagram", "Google Search", "YouTube Showcase", "Word of Mouth"];
    const referral = referrals[Math.floor(Math.random() * referrals.length)];

    // Generate a valid UUID if possible, or fallback
    const newAppId = crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`;

    const newApp = {
      id: newAppId,
      plan,
      isAnnual,
      email: item.email,
      fullName: item.full,
      stageName: item.stage,
      contactNumber: `+91 900${Math.floor(1000000 + Math.random() * 9000000)}`,
      referral,
      status: "pending",
      date: new Date().toISOString(),
      receipt: ""
    };

    const updated = [newApp, ...applications];
    setApplications(updated);
    localStorage.setItem("wavora_applications", JSON.stringify(updated));
    setSelectedApp(newApp);

    try {
      const { error } = await supabase.from("applications").insert([{
        id: newAppId,
        plan: newApp.plan,
        is_annual: newApp.isAnnual,
        email: newApp.email,
        full_name: newApp.fullName,
        stage_name: newApp.stageName,
        contact_number: newApp.contactNumber,
        referral: newApp.referral,
        receipt: newApp.receipt,
        status: newApp.status,
        user_id: null
      }]);
      if (error) {
        console.warn("Could not insert demo submission into Supabase:", error);
      }
    } catch (err) {
      console.warn("Exception seeding demo application into Supabase:", err);
    }
  };

  // Calculate pricing values
  const getAppPrice = (app: any) => {
    if (!app) return 0;
    const planStr = app.plan || "";
    if (planStr.endsWith("_single") || planStr.includes("single")) {
      const cleanPlan = planStr.replace("_single", "");
      const prices: Record<string, number> = { basic: 19, pro: 39, elite: 79 };
      return prices[cleanPlan] || 39;
    }
    return getPlanPriceDetails(app.plan, app.isAnnual).finalPrice;
  };

  // Calculations for dashboard counters
  const totalCount = applications.length;
  const pendingCount = applications.filter(a => a.status === "pending").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;
  const rejectedCount = applications.filter(a => a.status === "rejected").length;

  const totalProjectedVolume = applications
    .filter(a => a.status === "approved")
    .reduce((sum, app) => sum + getAppPrice(app), 0);

  const conversionPercentage = totalCount > 0 
    ? Math.round((approvedCount / totalCount) * 100) 
    : 0;

  // Filter and Search Free Applications
  const filteredFreeApps = freeApplications.filter(f => {
    const query = searchFreeQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (f.artistName || "").toLowerCase().includes(query) ||
      (f.realName || "").toLowerCase().includes(query) ||
      (f.email || "").toLowerCase().includes(query) ||
      (f.instagramId || "").toLowerCase().includes(query);

    const matchesStatus = selectedFreeStatus === "all" || f.status === selectedFreeStatus;

    return matchesSearch && matchesStatus;
  });

  // Filter and Search Single Track Releases
  const filteredSingleReleases = singleReleases.filter(r => {
    const query = searchSingleQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (r.title || "").toLowerCase().includes(query) ||
      (r.artist || "").toLowerCase().includes(query) ||
      (r.featured_artists || "").toLowerCase().includes(query) ||
      (r.genre || "").toLowerCase().includes(query) ||
      (r.license_type || "").toLowerCase().includes(query);

    const matchesStatus = selectedSingleStatus === "all" || r.status === selectedSingleStatus;

    return matchesSearch && matchesStatus;
  });

  // Sorting and Filtering logik
  const filteredApps = applications.filter(app => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      app.fullName?.toLowerCase().includes(searchLower) ||
      app.stageName?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower) ||
      app.contactNumber?.includes(searchQuery);

    // Tier filter
    const matchesTier = selectedTier === "all" || app.plan === selectedTier;

    // Status filter
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;

    // Period filter
    const matchesPeriod = 
      selectedPeriod === "all" || 
      (selectedPeriod === "annual" && app.isAnnual) || 
      (selectedPeriod === "monthly" && !app.isAnnual);

    return matchesSearch && matchesTier && matchesStatus && matchesPeriod;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "name") {
      comparison = (a.stageName || "").localeCompare(b.stageName || "");
    } else if (sortBy === "plan") {
      comparison = (a.plan || "").localeCompare(b.plan || "");
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Helper date formatter
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return isoStr;
    }
  };

  // CSS Class getters
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "elite":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25";
      case "pro":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/25";
      default:
        return "bg-gray-400/10 text-gray-300 border border-white/5";
    }
  };

  // Render Authentication Wall
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col justify-between font-sans relative" id="admin-login-screen">
        {/* Ambient grids/gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        
        {/* Top Header Row of login */}
        <header className="p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-sm z-15">
          <div className="flex items-center gap-1">
            <Logo hideTagline={true} width={130} height={38} className="h-9 w-auto" />
            <div className="h-5 w-[1.5px] bg-white/10 mx-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">
              Admin Portal
            </span>
          </div>
          <button 
            type="button"
            onClick={onBackToMain}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Wavora Live
          </button>
        </header>

        {/* Auth Body Centered */}
        <div className="flex-grow flex items-center justify-center p-4 z-10">
          <div className="w-full max-w-md bg-[#0B0B0F]/65 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] rounded-full" />
            
            <div className="text-center space-y-2 mb-8">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/25 rounded-xl flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase mt-4">
                Access Gateway
              </h2>
              <p className="text-xs text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                Provide authorized administrator credentials to review pending UPI payments and onboard artist plans.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2 font-medium">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@g.g"
                    className="w-full pl-10 pr-4 py-3 bg-[#050507] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-600 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  Security Passcode
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-[#050507] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-600 transition-all font-mono tracking-widest"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 mt-2 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
              >
                {isLoggingIn ? "Authenticating Session..." : "Verify Identity"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <span className="text-[9px] text-gray-500 block">
                Session security complies with WAVORA distribution guidelines.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-white/5 text-center text-xs text-gray-500 backdrop-blur-sm z-10">
          <p>© {new Date().getFullYear()} Wavora Live. Private Security Gatehouse.</p>
        </footer>
      </div>
    );
  }

  // Render Full Admin Panel
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans" id="admin-dashboard-app">
      {/* Top Navbar */}
      <header className="px-6 py-4 bg-[#0B0B0F] border-b border-white/10 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-2">
          <button onClick={onBackToMain} className="cursor-pointer focus:outline-none" aria-label="Back to home">
            <Logo hideTagline={true} width={120} height={34} className="h-8 w-auto" />
          </button>
          <div className="h-5 w-[1px] bg-white/15 mx-2" />
          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/25">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick utility buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => loadApplications()}
              title="Pull latest applications from remote database"
              className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Sync DB
            </button>
            <button
              onClick={handleAddDemoSubmission}
              title="Spawn a realistic demo application submission"
              className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-purple-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3" />
              Demo Inflow
            </button>
            <button
              onClick={handleResetData}
              title="Reset records to seeds"
              className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Seeds
            </button>
          </div>

          <div className="h-5 w-[1px] bg-white/15 hidden sm:block" />

          {/* User Signout info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <span className="text-xs font-bold block text-white">Wavora Curator</span>
              <span className="text-[9px] text-gray-500 font-mono block">admin@g.g</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Screen Content */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stats Strip at top of main container - Span 12 */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-container">
          <div className="bg-[#0B0B0F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="p-3 rounded-xl bg-white/5 text-white border border-white/10">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Inbox</span>
              <span className="text-2xl font-mono font-bold text-white">{totalCount}</span>
            </div>
          </div>

          <div className="bg-[#0B0B0F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Pending review</span>
              <span className="text-2xl font-mono font-bold text-amber-400">{pendingCount}</span>
            </div>
          </div>

          <div className="bg-[#0B0B0F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Approved slots (Rate)</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {approvedCount} <span className="text-xs text-gray-500 font-sans font-medium">({conversionPercentage}%)</span>
              </span>
            </div>
          </div>

          <div className="bg-[#0B0B0F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Projected Revenue Pool</span>
              <span className="text-2xl font-mono font-bold text-purple-400">₹{totalProjectedVolume}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1 bg-[#050507] border border-white/5 rounded-xl self-start max-w-4xl shadow-inner mb-2 z-10 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`flex-1 min-w-[120px] py-2 px-4 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "submissions"
                ? "bg-white text-black font-black shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Applications Inbox
            {pendingCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("free-submissions")}
            className={`flex-1 min-w-[120px] py-2 px-3.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "free-submissions"
                ? "bg-white text-black font-black shadow-lg"
                : "text-[#81818c] hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Free distribution ({freeApplications.length})
            {freeApplications.filter(f => f.status === "pending").length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("single-releases")}
            className={`flex-1 min-w-[120px] py-2 px-3.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "single-releases"
                ? "bg-white text-black font-black shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Music className="h-3.5 w-3.5 text-purple-400" />
            Single Releases ({singleReleases.length})
            {singleReleases.filter(r => r.status === "pending" || r.status === "Live & Transmitting").length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 block animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`flex-1 min-w-[120px] py-2 px-4 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "offers"
                ? "bg-white text-black font-black shadow-lg text-opacity-90"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Tag className="h-3.5 w-3.5 text-purple-400" />
            Manage Plan Offers
          </button>
        </div>

        {activeTab === "submissions" ? (
          <>
            {/* Column 1: Filter bar + Table List - Span 7 */}
            <div className="lg:col-span-7 flex flex-col gap-4 bg-[#0B0B0F] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] overflow-hidden" id="workspace-table-column">
          
          {/* Filters controls panel */}
          <div className="space-y-3 pb-3 border-b border-white/5">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search artist name, email, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#050507] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium placeholder-gray-500"
                />
              </div>

              {/* Status filtering button group */}
              <div className="flex bg-[#050507] p-0.5 rounded-xl border border-white/5 self-start sm:self-auto shrink-0">
                {["all", "pending", "approved", "rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedStatus === st 
                        ? "bg-white text-black font-extrabold shadow-sm" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Supplementary dropdown tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 pt-1">
              <div className="flex items-center gap-1 bg-[#050507] border border-white/5 rounded-lg px-2 py-1">
                <Filter className="h-3 w-3 text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-gray-500 mr-1">Tier:</span>
                <select 
                  value={selectedTier} 
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-transparent text-[10px] outline-none font-bold text-white border-none p-0 pr-4 cursor-pointer uppercase"
                >
                  <option value="all" className="bg-[#070709] text-white">All Plans</option>
                  <option value="basic" className="bg-[#070709] text-white">Basic</option>
                  <option value="pro" className="bg-[#070709] text-white">Pro Artist</option>
                  <option value="elite" className="bg-[#070709] text-white">Elite Label</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-[#050507] border border-white/5 rounded-lg px-2 py-1">
                <CreditCard className="h-3 w-3 text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-gray-500 mr-1">Term:</span>
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-transparent text-[10px] outline-none font-bold text-white border-none p-0 pr-4 cursor-pointer uppercase"
                >
                  <option value="all" className="bg-[#070709] text-white">All billings</option>
                  <option value="annual" className="bg-[#070709] text-white">Annual</option>
                  <option value="monthly" className="bg-[#070709] text-white">Monthly</option>
                </select>
              </div>

              {/* Reset filter button */}
              {(searchQuery !== "" || selectedTier !== "all" || selectedStatus !== "all" || selectedPeriod !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTier("all");
                    setSelectedStatus("all");
                    setSelectedPeriod("all");
                  }}
                  className="text-[10px] text-purple-400 font-bold uppercase hover:underline cursor-pointer py-1 block"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-grow overflow-x-auto min-h-[350px]">
            <table className="w-full text-left border-collapse" id="admin-applicants-table">
              <thead>
                <tr className="border-b border-white/5 text-[9px] text-gray-400 uppercase tracking-wider font-mono">
                  <th 
                    className="py-3 px-2 cursor-pointer font-bold hover:text-white transition-colors"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Artist / Project {sortBy === "name" && <ArrowUpDown className="h-2.5 w-2.5 text-purple-400" />}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-2 cursor-pointer font-bold hover:text-white transition-colors"
                    onClick={() => toggleSort("plan")}
                  >
                    <div className="flex items-center gap-1">
                      Tier {sortBy === "plan" && <ArrowUpDown className="h-2.5 w-2.5 text-purple-400" />}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-2 cursor-pointer font-bold hover:text-white transition-colors"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Submitted {sortBy === "date" && <ArrowUpDown className="h-2.5 w-2.5 text-purple-400" />}
                    </div>
                  </th>
                  <th className="py-3 px-2 font-bold text-center">Status</th>
                  <th className="py-3 px-2 text-right font-bold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                      <div className="space-y-2 max-w-xs mx-auto">
                        <p className="text-sm font-bold text-white text-opacity-80">No results found</p>
                        <p className="text-xs">Adjust your search parameters or query keywords to locate records.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const isSelected = selectedApp && selectedApp.id === app.id;
                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`group cursor-pointer transition-colors text-xs hover:bg-white/[0.02] ${
                          isSelected ? "bg-white/[0.04]" : ""
                        }`}
                      >
                        {/* Name column */}
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-white group-hover:text-purple-400 transition-colors">
                            {app.stageName || "Unnamed Artist"}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 font-medium flex items-center gap-1">
                            <span>{app.fullName}</span>
                          </div>
                        </td>

                        {/* Plan column */}
                        <td className="py-3.5 px-2">
                          <div className="flex flex-col gap-1 items-start">
                            {(() => {
                              const planStr = app.plan || "";
                              const isSingle = planStr.endsWith("_single") || planStr.includes("single");
                              const cleanPlan = planStr.replace("_single", "");
                              return (
                                <>
                                  <span className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded ${getPlanBadge(cleanPlan)}`}>
                                    {cleanPlan}
                                  </span>
                                  <span className="text-[9px] text-gray-500 font-mono">
                                    {isSingle ? "Single" : (app.isAnnual ? "Annual" : "Monthly")}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </td>

                        {/* Submitted column */}
                        <td className="py-3.5 px-2 text-gray-400 font-mono text-[10px]">
                          {formatDate(app.date)}
                        </td>

                        {/* Status badge column */}
                        <td className="py-3.5 px-2 text-center">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </td>

                        {/* Price amount column */}
                        <td className="py-3.5 px-2 text-right font-mono font-semibold text-white">
                          ₹{getAppPrice(app)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick list action footer count */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
            <span>Showing {filteredApps.length} of {totalCount} total applications</span>
          </div>
        </div>

        {/* Column 2: Selected Application Details Panel - Span 5 */}
        <div className="lg:col-span-5 bg-[#0B0B0F] border border-white/10 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between" id="selected-application-detail-card">
          {selectedApp ? (
            <div className="flex flex-col h-full justify-between gap-6">
              
              {/* Card top branding/header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-white/5">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-widest text-gray-500 uppercase block">Application File</span>
                    <h3 className="text-base font-extrabold text-white tracking-tight uppercase">
                      {selectedApp.stageName}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteApp(selectedApp.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-colors cursor-pointer"
                      title="Permanently remove application"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid details block */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-[#050507]/40 p-4 border border-white/5 rounded-xl">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Real Name</span>
                    <div className="flex items-center gap-1.5 text-white font-medium">
                      <User className="h-3 w-3 text-purple-400" />
                      {selectedApp.fullName}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Selected Plan</span>
                    <div>
                      {(() => {
                        const planStr = selectedApp.plan || "";
                        const isSingle = planStr.endsWith("_single") || planStr.includes("single");
                        const cleanPlan = planStr.replace("_single", "");
                        let cycleText = selectedApp.isAnnual ? "Year" : "Month";
                        if (isSingle) cycleText = "One-time Release";
                        return (
                          <>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${getPlanBadge(cleanPlan)}`}>
                              {cleanPlan}
                            </span>
                            <span className="text-gray-400 text-[10px] block mt-0.5 font-mono">
                              ₹{getAppPrice(selectedApp)} / {cycleText}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Email ID</span>
                    <a 
                      href={`mailto:${selectedApp.email}`} 
                      className="flex items-center gap-1.5 text-purple-400 hover:underline font-mono truncate font-medium"
                    >
                      <Mail className="h-3 w-3 text-purple-400 flex-shrink-0" />
                      {selectedApp.email}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Contact Phone</span>
                    <a 
                      href={`tel:${selectedApp.contactNumber}`} 
                      className="flex items-center gap-1.5 text-cyan-400 hover:underline font-mono font-medium"
                    >
                      <Phone className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                      {selectedApp.contactNumber}
                    </a>
                  </div>

                  <div className="space-y-1 col-span-2 pt-2 border-t border-white/[0.03] grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Acquisition Referral</span>
                      <span className="text-gray-300 font-medium font-mono text-[10px]">{selectedApp.referral || "Direct Traffic"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Submission Date</span>
                      <span className="text-gray-300 font-medium font-mono text-[10px]">{formatDate(selectedApp.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot zone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <span>UPI Verification Proof</span>
                    </label>
                    <span className="text-[9px] text-gray-500 font-mono font-medium">To: damnsingh@fam</span>
                  </div>

                  {selectedApp.receipt && selectedApp.receipt !== "pdf" && selectedApp.receipt.startsWith("data:") ? (
                    // Real dynamic uploaded payment receipt screenshot zoom
                    <div className="relative border border-white/10 rounded-xl overflow-hidden bg-[#050507] hover:border-purple-500/20 transition-all group/screenshot shadow-lg max-h-[220px] flex items-center justify-center">
                      <img 
                        src={selectedApp.receipt} 
                        alt="Payment Receipt Screenshot uploaded by artist" 
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-contain max-h-[220px]"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/screenshot:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a 
                          href={selectedApp.receipt} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-3 py-1.5 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Full Size
                        </a>
                      </div>
                    </div>
                  ) : (
                    // Generate a high fidelity beautiful legal invoice screenshot fallback because of demo seeds / mock files
                    <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-950 to-[#0c0c11] border border-white/5 relative overflow-hidden font-mono text-[10px] text-gray-400 space-y-2 max-h-[225px] select-all shadow-inner">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none" />
                      
                      {/* Header block of virtual voucher */}
                      <div className="flex justify-between items-start border-b border-white/5 pb-2 text-[9px] text-gray-500 font-bold">
                        <span>BHIM UPI TRANSACTION VOUCHER</span>
                        <span className="text-emerald-400">SUCCESSFUL</span>
                      </div>

                      {/* Content block */}
                      <div className="space-y-1 py-1 text-[9px] leading-tight">
                        <div className="flex justify-between">
                          <span>Merchant UPI ID:</span>
                          <span className="text-white">damnsingh@fam</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remitter Name:</span>
                          <span className="text-white">{selectedApp.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remitter Email:</span>
                          <span className="text-white">{selectedApp.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="text-white text-opacity-80">WVR-{selectedApp.id?.toUpperCase() || "948A71F"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reference Bank No:</span>
                          <span className="text-white">612948520{selectedApp.id?.slice(-3) || "811"}</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-white/10 my-2 pt-2 flex justify-between items-baseline">
                        <span className="text-[9px] text-gray-500 font-extrabold uppercase">Paid Amount</span>
                        <div className="flex items-baseline gap-0.5 text-emerald-400 font-extrabold text-xs">
                          <span>₹{getAppPrice(selectedApp)}</span>
                          <span className="text-[8px] text-gray-400 uppercase">INR</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Action Workflow controls */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Onboarding Workflow Actions</span>
                
                {selectedApp.status === "pending" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateStatus(selectedApp.id, "approved")}
                      className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-xl text-black font-extrabold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.15)]"
                    >
                      <Check className="h-4 w-4" />
                      Approve & Slot
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.id, "rejected")}
                      className="py-3 px-4 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      Decline Application
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedApp.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {selectedApp.status === "approved" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white capitalize">Onboarding status: {selectedApp.status}</h4>
                        <p className="text-[9px] text-gray-500 mt-0.5">Updated in local curation database.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateStatus(selectedApp.id, "pending")}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all rounded-lg text-[9px] font-extrabold uppercase tracking-widest cursor-pointer border border-white/5"
                    >
                      Re-review
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <div className="w-12 h-12 bg-white/5 border border-white/5 text-gray-600 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-sm font-bold text-white text-opacity-80">Select an application</p>
              <p className="text-xs max-w-[220px] mx-auto mt-1 leading-relaxed">
                Choose an application file from the left ledger list to investigate details, UPI receipt vouchers, and verify the tier.
              </p>
            </div>
          )}
        </div>
        </>
        ) : activeTab === "free-submissions" ? (
          <>
            {/* Free Applications Inbox columns layout */}
            <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-4 bg-[#0B0B0F] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] overflow-hidden" id="free-workspace-table-column">
              <div className="space-y-3 pb-3 border-b border-white/5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search artist name, real name, email, socials..."
                      value={searchFreeQuery}
                      onChange={(e) => setSearchFreeQuery(e.target.value)}
                      className="w-full bg-[#050507] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium placeholder-gray-500"
                    />
                  </div>
                  <div className="flex bg-[#050507] p-0.5 rounded-xl border border-white/5 self-start sm:self-auto shrink-0 font-sans">
                    {["all", "pending", "approved", "rejected"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedFreeStatus(st)}
                        className={`py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedFreeStatus === st 
                            ? "bg-white text-black font-extrabold shadow-sm" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Free Submissions List Container */}
              <div className="overflow-y-auto max-h-[600px] flex-1 space-y-2 pr-1 custom-scrollbar">
                {filteredFreeApps.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 font-sans">
                    <AlertCircle className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                    <p className="text-xs font-bold text-white/50">No free applications match search criteria.</p>
                  </div>
                ) : (
                  filteredFreeApps.map((item) => {
                    const isSelected = selectedFreeApp?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFreeApp(item)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? "bg-emerald-500/5 border-emerald-500/30 shadow-lg"
                            : "bg-[#070709]/45 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-white truncate max-w-[150px]">
                              {item.artistName}
                            </span>
                            <span className="text-[9px] text-gray-505 font-medium truncate max-w-[120px]">
                              ({item.realName})
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 ${
                              item.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : item.status === "rejected"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 min-w-0">
                            <span className="truncate max-w-[160px] font-mono">{item.email}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10 shrink-0" />
                            <span className="text-gray-500 text-[9px]">{item.instagramId}</span>
                          </div>
                        </div>

                        {/* Date badge */}
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-gray-500 font-mono block">
                            {new Date(item.date || item.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="text-[8px] text-emerald-400/80 font-bold block mt-0.5 uppercase tracking-wider">
                            70% Tier
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Free Application details panel - Span 5 */}
            <div className="lg:col-span-12 xl:col-span-5 bg-[#0B0B0F] border border-white/10 rounded-2xl p-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex flex-col h-full min-h-[500px]" id="free-workspace-detail-column">
              {selectedFreeApp ? (
                <div className="flex-1 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-5">
                    {/* Header profile title block */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">{selectedFreeApp.artistName}</h3>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/25">Free Plan</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium tracking-normal mt-0.5">Real Identity: {selectedFreeApp.realName}</p>
                      </div>

                      <button
                        onClick={() => deleteFreeApp(selectedFreeApp.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors rounded-xl cursor-pointer"
                        title="Discard record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Meta info checklist grids */}
                    <div className="bg-[#050507] rounded-2xl border border-white/5 p-4 space-y-3 font-sans">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Email Contact</span>
                          <span className="text-xs font-semibold text-white select-all block break-words">{selectedFreeApp.email}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Mobile (WhatsApp)</span>
                          <span className="text-xs font-semibold text-white block">{selectedFreeApp.contactNumber}</span>
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-white/5" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Instagram ID</span>
                          <a
                            href={`https://instagram.com/${selectedFreeApp.instagramId.replace("@", "")}`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noreferrer"
                            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 group"
                          >
                            <span>{selectedFreeApp.instagramId}</span>
                            <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">YouTube Channel</span>
                          {selectedFreeApp.youtubeChannel ? (
                            <a
                              href={selectedFreeApp.youtubeChannel.startsWith("http") ? selectedFreeApp.youtubeChannel : `https://${selectedFreeApp.youtubeChannel}`}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              rel="noreferrer"
                              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 group"
                            >
                              <span className="truncate max-w-[120px]">Visit Channel</span>
                              <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-500 block">Not Provided</span>
                          )}
                        </div>
                      </div>

                      {selectedFreeApp.spotifyId && (
                        <>
                          <div className="h-[1px] w-full bg-white/5" />
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Spotify Artist Catalog</span>
                            <a
                              href={selectedFreeApp.spotifyId.startsWith("http") ? selectedFreeApp.spotifyId : `https://open.spotify.com/artist/${selectedFreeApp.spotifyId}`}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              rel="noreferrer"
                              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
                            >
                              <span className="truncate max-w-[260px]">{selectedFreeApp.spotifyId}</span>
                              <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                            </a>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Why free question essay */}
                    <div className="space-y-1 bg-[#050507] p-3.5 rounded-xl border border-white/5 min-h-[105px]">
                      <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-wider block font-mono">Why do they want selective free tier?</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-normal whitespace-pre-wrap italic">
                        "{selectedFreeApp.whyFree || "No special explanation was provided by the applicant."}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Workflows */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Onboarding Workflow Actions</span>

                    {selectedFreeApp.status === "pending" ? (
                      <div className="grid grid-cols-2 gap-3 font-sans">
                        <button
                          onClick={() => updateFreeStatus(selectedFreeApp.id, "approved")}
                          className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-xl text-black font-extrabold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.15)]"
                        >
                          <Check className="h-4 w-4" />
                          Approve Onboarding
                        </button>
                        <button
                          onClick={() => updateFreeStatus(selectedFreeApp.id, "rejected")}
                          className="py-3 px-4 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                          Reject / Decline
                        </button>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedFreeApp.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {selectedFreeApp.status === "approved" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white capitalize">Onboarding status: {selectedFreeApp.status}</h4>
                            <p className="text-[9px] text-gray-505 mt-0.5">Updated in free curation ledger.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateFreeStatus(selectedFreeApp.id, "pending")}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all rounded-lg text-[9px] font-extrabold uppercase tracking-widest cursor-pointer border border-white/5"
                        >
                          Re-review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                  <div className="w-12 h-12 bg-white/5 border border-white/5 text-gray-600 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="h-6 w-6 text-gray-600 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-white text-opacity-80">Select a free application</p>
                  <p className="text-xs max-w-[220px] mx-auto mt-1 leading-relaxed">
                    Identify candidates from the list to view social reach, YouTube portfolio, Spotify identifiers, and verify why they want to distribute with Wavora.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : activeTab === "single-releases" ? (
          <>
            {/* Column 1: Releases List - Span 7 */}
            <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-4 bg-[#0B0B0F] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] overflow-hidden" id="single-releases-table-column">
              <div className="space-y-3 pb-3 border-b border-white/5">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between animate-fadeIn">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search title, artist, featured, genre, license type..."
                      value={searchSingleQuery}
                      onChange={(e) => setSearchSingleQuery(e.target.value)}
                      className="w-full bg-[#050507] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium placeholder-gray-500"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <div className="flex bg-[#050507] p-0.5 rounded-xl border border-white/5 font-sans">
                      {["all", "pending", "Live & Transmitting", "rejected"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setSelectedSingleStatus(st)}
                          className={`py-1.5 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            selectedSingleStatus === st 
                              ? "bg-white text-black font-extrabold shadow-sm" 
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setShowSqlSetup(!showSqlSetup)}
                      className={`py-2 px-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1 ${
                        showSqlSetup 
                          ? "bg-purple-500 text-black border-purple-500 font-extrabold shadow-[0_4px_12px_rgba(168,85,247,0.3)]"
                          : "bg-purple-500/5 hover:bg-purple-500/15 border-purple-500/15 text-purple-400"
                      }`}
                      title="Get complete SQL schema for Supabase integration"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      SQL Setup
                    </button>
                  </div>
                </div>

                {/* Copiable setup instructions and code block */}
                {showSqlSetup && (
                  <div className="p-4 bg-purple-950/15 border border-purple-500/25 rounded-2xl space-y-3 animate-slideDown">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 block animate-pulse" />
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-purple-300 font-mono">
                          Supabase Schema Script Config
                        </h4>
                      </div>
                      <button
                        onClick={copySqlToClipboard}
                        className="py-1 px-2.5 bg-purple-500 hover:bg-purple-600 text-black font-extrabold text-[9px] uppercase tracking-widest rounded-md cursor-pointer transition-colors flex items-center gap-1 shadow"
                      >
                        {copiedSql ? (
                          <>
                            <Check className="h-3 w-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3" /> Copy SQL Code
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-300 leading-normal font-sans">
                      Copy this verified PG-compatible SQL into your **Supabase Dashboard SQL Editor** to create correct structured database tables, asset distribution buckets, and RLS policies. It resolves the `price DEFAULT 0` column data-type syntax error and allows WAV/JPG downloads.
                    </p>

                    <div className="relative">
                      <pre className="p-3 bg-black/60 border border-white/5 rounded-xl font-mono text-[9px] text-purple-300 overflow-x-auto max-h-[160px] leading-normal whitespace-pre scrollbar-thin select-all">
                        {SUPABASE_SQL_CODE}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* List items */}
              <div className="flex-1 overflow-y-auto max-h-[580px] pr-1.5 space-y-2.5" id="single-releases-layout-list">
                {filteredSingleReleases.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-500 font-mono">
                    No single releases found matching constraints.
                  </div>
                ) : (
                  filteredSingleReleases.map((release) => {
                    const isSelected = selectedSingleRelease && selectedSingleRelease.id === release.id;
                    return (
                      <div
                        key={release.id}
                        onClick={() => setSelectedSingleRelease(release)}
                        className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? "bg-purple-500/10 border-purple-500/45 shadow-[0_4px_12px_rgba(168,85,247,0.15)]"
                            : "bg-[#050507]/40 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-gray-400"
                          }`}>
                            <Music className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{release.title}</h4>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                              by <span className="font-semibold text-gray-300">{release.artist}</span>
                              {release.featured_artists && (
                                <span className="text-gray-500 font-normal"> (feat. {release.featured_artists})</span>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className="text-[8px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                                {release.genre}
                              </span>
                              {release.license_type && (
                                <span className="text-[8px] bg-purple-500/5 text-purple-400 border border-purple-500/10 px-1.5 py-0.5 rounded font-mono uppercase">
                                  {release.license_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="text-right shrink-0">
                          <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full font-mono ${
                            release.status === "approved" || release.status === "Live & Transmitting"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : release.status === "rejected"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {release.status}
                          </span>
                          <span className="text-[8px] text-gray-500 block font-mono mt-1">
                            {release.release_date || "No release date"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Details Display - Span 5 */}
            <div className="lg:col-span-12 xl:col-span-5 bg-[#0B0B0F] border border-white/10 rounded-2xl p-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex flex-col h-full min-h-[500px]" id="single-release-detail-column">
              {selectedSingleRelease ? (
                <div className="flex-1 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-5">
                    {/* Header title */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-white uppercase tracking-wider truncate max-w-[200px]">{selectedSingleRelease.title}</h3>
                          <span className="text-[9px] bg-purple-500/10 text-purple-400 font-bold px-1.5 py-0.5 rounded border border-purple-500/25 shrink-0">Single release</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium tracking-normal mt-0.5 truncate">
                          Primary Artist ID/Role: {selectedSingleRelease.artist}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => copyReleaseDetailsToClipboard(selectedSingleRelease)}
                          className={`px-2.5 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 border ${
                            copiedReleaseText
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-extrabold"
                              : "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400"
                          }`}
                          title="Copy everything to clipboard"
                        >
                          <Copy className="h-3 w-3" />
                          {copiedReleaseText ? "Copied All!" : "Copy"}
                        </button>

                        <button
                          onClick={() => {
                            if (confirm("Delete this single release distribution file permanently?")) {
                              deleteSingleRelease(selectedSingleRelease.id);
                            }
                          }}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors rounded-xl cursor-pointer"
                          title="Delete Release permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata checklist */}
                    <div className="bg-[#050507] rounded-2xl border border-white/5 p-4 space-y-3 font-sans">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Primary Genre</span>
                          <span className="text-xs font-semibold text-white block truncate">{selectedSingleRelease.genre?.split(" - ")[0] || selectedSingleRelease.genre || "not specified"}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-purple-400 uppercase tracking-widest block font-mono font-bold">Sub-Genre</span>
                          <span className="text-xs font-semibold text-purple-300 block truncate">{selectedSingleRelease.sub_genre || selectedSingleRelease.genre?.split(" - ")[1] || "None specified"}</span>
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-white/5" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Licensing Type</span>
                          <span className="text-xs font-semibold text-purple-200 block uppercase font-mono">{selectedSingleRelease.license_type || "not specified"}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Record Label</span>
                          <span className="text-xs font-semibold text-white block truncate">{selectedSingleRelease.label_name || "Independent"}</span>
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-white/5" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Target Date</span>
                          <span className="text-xs font-semibold text-white block font-mono text-[11px]">{selectedSingleRelease.release_date || "Not Provided"}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Explicit Lyrics</span>
                          <span className={`text-xs font-semibold block ${selectedSingleRelease.is_explicit ? "text-red-400 font-bold" : "text-gray-500"}`}>
                            {selectedSingleRelease.is_explicit ? "✓ Yes (Explicit)" : "✗ No (Clean)"}
                          </span>
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-white/5" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Dolby Atmos Spatial Audio</span>
                          <span className={`text-xs font-semibold block ${selectedSingleRelease.is_dolby_atmos ? "text-cyan-400" : "text-gray-500"}`}>
                            {selectedSingleRelease.is_dolby_atmos ? "✓ True - Immersive Master" : "✗ False"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Social Content ID (YouTube)</span>
                          <span className={`text-xs font-semibold block ${selectedSingleRelease.has_content_id ? "text-emerald-400 font-bold" : "text-gray-500"}`}>
                            {selectedSingleRelease.has_content_id ? "✓ True - Active Claims Enabled" : "✗ False"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Artist & Profile Link Directories */}
                    <div className="bg-[#050507] rounded-2xl border border-white/5 p-4 space-y-3 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest block font-mono">
                          Artist & Streaming Profiles ({parseArtistProfiles(selectedSingleRelease).length})
                        </span>
                        <User className="h-3 w-3 text-purple-400" />
                      </div>

                      <div className="space-y-3">
                        {parseArtistProfiles(selectedSingleRelease).map((profile, index) => (
                          <div 
                            key={index}
                            className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white tracking-wide">{profile.name}</span>
                              <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                profile.type === 'Primary' 
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {profile.type}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 pt-1.5 border-t border-white/5">
                              {/* Instagram */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] text-gray-500 uppercase font-mono">Instagram</span>
                                {profile.instagram ? (
                                  <a 
                                    href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-purple-400 hover:underline flex items-center gap-1 font-mono"
                                  >
                                    <Instagram className="h-2.5 w-2.5" />
                                    {profile.instagram}
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-gray-600 font-mono italic">Not provided</span>
                                )}
                              </div>

                              {/* Spotify */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] text-gray-500 uppercase font-mono font-bold">Spotify</span>
                                {profile.spotify && profile.spotify !== "No (Create New)" ? (
                                  <a 
                                    href={profile.spotify.startsWith("http") ? profile.spotify : `https://open.spotify.com/artist/${profile.spotify}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-mono hover:text-emerald-300 font-semibold truncate max-w-[200px]"
                                    title={profile.spotify}
                                  >
                                    <ExternalLink className="h-2.5 w-2.5" />
                                    {profile.spotify.substring(0, 24)}...
                                  </a>
                                ) : profile.spotify === "No (Create New)" ? (
                                  <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                    Create New Spotify Profile
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-650 font-mono italic">No Page (Create New)</span>
                                )}
                              </div>

                              {/* Apple Music */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] text-gray-500 uppercase font-mono font-bold">Apple Music</span>
                                {profile.apple && profile.apple !== "No (Create New)" ? (
                                  <a 
                                    href={profile.apple.startsWith("http") ? profile.apple : `https://music.apple.com/artist/${profile.apple}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-pink-400 hover:underline flex items-center gap-1 font-mono hover:text-pink-300 font-semibold truncate max-w-[200px]"
                                    title={profile.apple}
                                  >
                                    <ExternalLink className="h-2.5 w-2.5" />
                                    {profile.apple.substring(0, 24)}...
                                  </a>
                                ) : profile.apple === "No (Create New)" ? (
                                  <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                    Create New Apple Profile
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-650 font-mono italic">No Page (Create New)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Artist Direct Contact Details */}
                    {(selectedSingleRelease.email || selectedSingleRelease.contact_number) && (
                      <div className="bg-purple-950/10 rounded-2xl border border-purple-500/10 p-4 space-y-3 font-sans">
                        <span className="text-[8px] text-purple-400 font-bold uppercase tracking-widest block font-mono">
                          Live Contact coordinates
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {selectedSingleRelease.email && (
                            <div className="space-y-1">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">Primary Email</span>
                              <a 
                                href={`mailto:${selectedSingleRelease.email}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-purple-300 transition-colors bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 w-full justify-between"
                              >
                                <span className="truncate text-[11px] font-medium">{selectedSingleRelease.email}</span>
                                <Mail className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                              </a>
                            </div>
                          )}

                          {selectedSingleRelease.contact_number && (
                            <div className="space-y-1">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-mono">WhatsApp Call/Text</span>
                              <a 
                                href={`https://wa.me/${selectedSingleRelease.contact_number.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-purple-300 transition-colors bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 w-full justify-between"
                              >
                                <span className="truncate text-[11px] font-medium">{selectedSingleRelease.contact_number}</span>
                                <Phone className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lyrics block */}
                    {selectedSingleRelease.lyrics && (
                      <div className="space-y-1 bg-[#050507] p-3.5 rounded-xl border border-white/5">
                        <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-wider block font-mono">Associated Lyrics</span>
                        <div className="text-xs text-gray-300 leading-relaxed font-normal whitespace-pre-wrap max-h-[140px] overflow-y-auto pr-1 select-text scrollbar-thin">
                          {selectedSingleRelease.lyrics}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Distribution Assets (WAV and JPG) */}
                    <div className="space-y-3 bg-[#050507] p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-mono">
                        Distribution Master Assets (WAV & JPG)
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Artwork jpg asset */}
                        <div className="bg-white/2 p-3 rounded-lg border border-white/5 flex flex-col justify-between space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                              <Image className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-mono">Cover Artwork</span>
                              <span className="text-[11px] font-bold text-white block truncate">
                                {selectedSingleRelease.artwork_url ? "artwork.jpg" : "Missing Artwork"}
                              </span>
                            </div>
                          </div>
                          
                          {selectedSingleRelease.artwork_url && (
                            <div className="relative group cursor-pointer aspect-square rounded-md overflow-hidden border border-white/10">
                              <img 
                                src={selectedSingleRelease.artwork_url} 
                                alt="Distribution Cover Artwork"
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                              />
                            </div>
                          )}

                          {selectedSingleRelease.artwork_url ? (
                            <a
                              href={selectedSingleRelease.artwork_url}
                              download={`${selectedSingleRelease.title.replace(/\s+/g, "_")}_Artwork.jpg`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-1.5 px-3 bg-purple-500 hover:bg-purple-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-md text-center flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors"
                            >
                              <Download className="h-3 w-3" />
                              Download JPG
                            </a>
                          ) : (
                            <div className="text-[10px] text-gray-500 font-medium italic text-center py-1 bg-white/5 rounded">No asset file uploaded</div>
                          )}
                        </div>

                        {/* Audio wav asset */}
                        <div className="bg-white/2 p-3 rounded-lg border border-white/5 flex flex-col justify-between space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                              <Music className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-mono">Audio Master</span>
                              <span className="text-[11px] font-bold text-white block truncate">
                                {selectedSingleRelease.audio_url ? "master_track.wav" : "Missing audio.wav"}
                              </span>
                            </div>
                          </div>

                          {selectedSingleRelease.audio_url && (
                            <div className="py-2">
                              <audio 
                                src={selectedSingleRelease.audio_url} 
                                controls 
                                className="w-full h-8 rounded bg-slate-900 border border-white/10"
                                style={{ colorScheme: "dark" }}
                              />
                            </div>
                          )}

                          {selectedSingleRelease.audio_url ? (
                            <a
                              href={selectedSingleRelease.audio_url}
                              download={`${selectedSingleRelease.title.replace(/\s+/g, "_")}_Master.wav`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-1.5 px-3 bg-cyan-500 hover:bg-cyan-650 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-md text-center flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors"
                            >
                              <Download className="h-3 w-3" />
                              Download WAV
                            </a>
                          ) : (
                            <div className="text-[10px] text-gray-500 font-medium italic text-center py-1 bg-white/5 rounded">No audio files uploaded</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Workflows */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Onboarding Workflow Actions</span>

                    <div className="grid grid-cols-2 gap-2 font-sans">
                      <button
                        onClick={() => updateSingleStatus(selectedSingleRelease.id, "Live & Transmitting")}
                        className={`py-2.5 px-3 rounded-xl font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                          selectedSingleRelease.status === "Live & Transmitting"
                            ? "bg-emerald-500 text-black shadow-[0_4px_15px_rgba(16,185,129,0.15)]"
                            : "bg-[#050507] hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Transmit Live
                      </button>
                      
                      <button
                        onClick={() => updateSingleStatus(selectedSingleRelease.id, "rejected")}
                        className={`py-2.5 px-3 rounded-xl font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                          selectedSingleRelease.status === "rejected"
                            ? "bg-red-500 text-white"
                            : "bg-[#050507] hover:bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <X className="h-3.5 w-3.5" />
                        Flag / Decline
                      </button>
                    </div>

                    {selectedSingleRelease.status !== "pending" && (
                      <div className="pt-2 text-center">
                        <button
                          onClick={() => updateSingleStatus(selectedSingleRelease.id, "pending")}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all rounded-lg text-[9px] font-extrabold uppercase tracking-widest cursor-pointer border border-white/5"
                        >
                          Reset to Pending Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                  <div className="w-12 h-12 bg-white/5 border border-white/5 text-gray-600 rounded-full flex items-center justify-center mb-3">
                    <Music className="h-6 w-6 text-gray-600 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-white text-opacity-80">Select a Single Release</p>
                  <p className="text-xs max-w-[220px] mx-auto mt-1 leading-relaxed">
                    Identify release cards from the left catalog index to control status, audit license types, track Dolby Atmos encoding requests, and review lyric transcription registries.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 bg-[#0B0B0F]/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.4)] space-y-8" id="admin-offers-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wider uppercase flex items-center gap-2 font-mono">
                  <Tag className="h-4 w-4 text-purple-400" />
                  DYNAMIC PROMOTIONAL OFFERS MANAGER
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">
                  Offer custom promotional prices on plans. Base prices remain unchanged, but if configured, the main price gets crossed-out (line-through), and the promotional offer is displayed with a dynamic percentage cut calculation across Wavora Live.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearOffers}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset Normal Prices
                </button>
              </div>
            </div>

            {/* 3-Plan Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(["basic", "pro", "elite"] as const).map((planId) => {
                const baseInfo = BASE_PRICES[planId];
                const activeOffer = offers[planId] || { planId, annualOfferPrice: null, monthlyOfferPrice: null, offerLabel: "" };

                // Local dynamic calculation variables
                const annualBase = baseInfo.annual;
                const monthlyBase = baseInfo.monthly;
                const annualNew = activeOffer.annualOfferPrice;
                const monthlyNew = activeOffer.monthlyOfferPrice;

                const annualCutPercent = annualNew && annualNew < annualBase ? Math.round(((annualBase - annualNew) / annualBase) * 100) : 0;
                const monthlyCutPercent = monthlyNew && monthlyNew < monthlyBase ? Math.round(((monthlyBase - monthlyNew) / monthlyBase) * 100) : 0;

                let displayName = "Pro Artist Plan";
                let planColor = "border-purple-500/25 bg-purple-950/10 text-purple-300";
                if (planId === "basic") {
                  displayName = "Basic Plan";
                  planColor = "border-white/10 bg-neutral-900/30 text-gray-300";
                } else if (planId === "elite") {
                  displayName = "Elite Label Plan";
                  planColor = "border-cyan-500/20 bg-cyan-950/10 text-cyan-300";
                }

                return (
                  <div key={planId} className={`rounded-xl border p-5 flex flex-col justify-between space-y-6 ${planColor}`} id={`config-card-${planId}`}>
                    {/* Header */}
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-gray-500 uppercase font-black block">PLAN TARGET</span>
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-tight mt-1">{displayName}</h4>
                    </div>

                    <div className="space-y-4">
                      {/* 1. Annual Custom Pricing */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Annual Billing Offer</span>
                          <span className="text-[10px] text-gray-500 font-mono">Base: ₹{annualBase}/yr</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-white text-xs font-mono font-bold bg-[#0B0B0F] border border-white/10 px-2 py-1.5 rounded-lg select-none">₹</div>
                          <input
                            type="number"
                            min="1"
                            max={annualBase - 1}
                            placeholder="Promo price (e.g. 299)"
                            value={annualNew !== null && annualNew !== undefined ? annualNew : ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? null : Number(e.target.value);
                              const updated = {
                                ...offers,
                                [planId]: { ...activeOffer, annualOfferPrice: val }
                              };
                              handleSaveOffers(updated);
                            }}
                            className="flex-grow bg-[#050507] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        {annualCutPercent > 0 ? (
                          <p className="text-[9px] text-emerald-400 font-bold tracking-wider mt-1 uppercase flex items-center gap-1">
                            <Percent className="h-3 w-3" /> Resulting Discount: {annualCutPercent}% OFF
                          </p>
                        ) : (
                          <p className="text-[8px] text-gray-500 mt-1">Normal pricing applies. Enter value less than ₹{annualBase} to apply offer cut.</p>
                        )}
                      </div>

                      {/* 2. Monthly Custom Pricing */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Monthly Billing Offer</span>
                          <span className="text-[10px] text-gray-500 font-mono">Base: ₹{monthlyBase}/mo</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-white text-xs font-mono font-bold bg-[#0B0B0F] border border-white/10 px-2 py-1.5 rounded-lg select-none">₹</div>
                          <input
                            type="number"
                            min="1"
                            max={monthlyBase - 1}
                            placeholder="Promo price (e.g. 39)"
                            value={monthlyNew !== null && monthlyNew !== undefined ? monthlyNew : ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? null : Number(e.target.value);
                              const updated = {
                                ...offers,
                                [planId]: { ...activeOffer, monthlyOfferPrice: val }
                              };
                              handleSaveOffers(updated);
                            }}
                            className="flex-grow bg-[#050507] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        {monthlyCutPercent > 0 ? (
                          <p className="text-[9px] text-emerald-400 font-bold tracking-wider mt-1 uppercase flex items-center gap-1">
                            <Percent className="h-3 w-3" /> Resulting Discount: {monthlyCutPercent}% OFF
                          </p>
                        ) : (
                          <p className="text-[8px] text-gray-500 mt-1">Normal pricing applies. Enter value less than ₹{monthlyBase} to apply offer cut.</p>
                        )}
                      </div>

                      {/* 3. Offer label Tagline */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Promotional Tag Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Golden Festival Deal!"
                          value={activeOffer.offerLabel || ""}
                          onChange={(e) => {
                            const updated = {
                              ...offers,
                              [planId]: { ...activeOffer, offerLabel: e.target.value }
                            };
                            handleSaveOffers(updated);
                          }}
                          className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span>Instant sync active</span>
                      <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="Configured & active in dashboard" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Note guide block */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-300 leading-relaxed flex items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-purple-400" />
              <span>
                <strong>System Information:</strong> Changes are published instantly in real-time. Landing plan tables, applicant submission forms, and cash register logs will immediately process users with these discounted pricing structures. Users will see the permanent pricing struck out with the new rate displayed in active glowing white tags with percent cut calculations.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-5 px-6 border-t border-white/5 text-center text-[10px] text-gray-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4 z-10 bg-[#070709]">
        <span>© {new Date().getFullYear()} Wavora Live. Distribution Registry. Internal authorized use solely.</span>
        <div className="flex gap-4">
          <button onClick={onBackToMain} className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[9px] font-bold">
            Back to Public Homepage
          </button>
        </div>
      </footer>
    </div>
  );
}
