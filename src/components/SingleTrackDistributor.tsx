/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  X, Check, Upload, ArrowRight, Sparkles, AlertCircle, Clock, 
  CheckCircle2, ShieldCheck, Mail, User, Radio, Phone, HelpCircle,
  Copy, Music, Globe, Server, Star, Lock, CreditCard, ChevronRight,
  Database, Info, RefreshCw, Layers, Sliders, Play, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";

interface SingleTrackDistributorProps {
  selectedPlanId: "basic" | "pro" | "elite";
  onBackToMain: () => void;
}

const genreMap: Record<string, string[]> = {
  "Alternative": ["College Rock", "Goth Rock", "Grunge", "Indie Rock", "New Wave", "Punk"],
  "Anime": ["Action", "Mecha", "Vocaloid", "J-Pop", "J-Rock"],
  "Blues": ["Acoustic Blues", "Chicago Blues", "Classic Blues", "Contemporary Blues", "Country Blues", "Delta Blues", "Electric Blues"],
  "Brazilian": ["Axé", "Bossa Nova", "Choro", "Forró", "Frevo", "MPB", "Pagode", "Samba", "Sertanejo"],
  "Children's Music": ["Lullabies", "Sing-Along", "Stories"],
  "Christian & Gospel": ["CCM", "Christian Metal", "Christian Pop", "Christian Rap", "Christian Rock", "Classic Christian", "Contemporary Gospel", "Gospel", "Southern Gospel", "Traditional Gospel"],
  "Classical": ["Avant-Garde", "Baroque", "Chamber Music", "Chant", "Choral", "Classical Crossover", "Early Music", "High Classical", "Impressionist", "Medieval", "Minimalism", "Modern Composition", "Opera", "Orchestral", "Renaissance", "Romantic"],
  "Comedy": ["Novelty", "Standup Comedy"],
  "Country": ["Alternative Country", "Americana", "Bluegrass", "Contemporary Bluegrass", "Contemporary Country", "Country Gospel", "Honky Tonk", "Outlaw Country", "Traditional Bluegrass", "Traditional Country", "Urban Cowboy"],
  "Dance": ["Breakbeat", "Exercise", "Garage", "Hardcore", "House", "Jungle/Drum'n'bass", "Techno", "Trance"],
  "Electronic": ["Ambient", "Crossover", "Downtempo", "Electronic Art Music", "IDM/Experimental", "Industrial", "Pop/Dance", "Synthwave", "Dubstep"],
  "Folk": ["Contemporary Folk", "Traditional Folk"],
  "Hip-Hop / Rap": ["Alternative Rap", "Bounce", "Dirty South", "East Coast Rap", "Gangsta Rap", "Hardcore Rap", "Hip-Hop", "Latin Rap", "Old School Rap", "Rap", "Underground Rap", "West Coast Rap"],
  "Holiday": ["Chanukah", "Christmas", "Easter", "Halloween", "Holiday: Other", "Thanksgiving"],
  "Indian": ["Indian Classical", "Indian Pop", "Ghazal", "Bollywood", "Tamil", "Telugu", "Regional Indian"],
  "Instrumental": ["March (Instrumental)"],
  "Jazz": ["Avant-Garde Jazz", "Big Band", "Bop", "Contemporary Jazz", "Cool", "Crossover Jazz", "Dixieland", "Fusion", "Hard Bop", "Latin Jazz", "Mainstream Jazz", "Ragtime", "Smooth Jazz", "Trad Jazz"],
  "Latin": ["Alternative & Rock Latino", "Baladas y Boleros", "Brazilian", "Contemporary Latin", "Latin Jazz", "Pop Latino", "Raíces", "Reggaeton y Hip-Hop", "Regional Mexicano", "Salsa y Tropical"],
  "Metal": ["Alternative Metal", "Black Metal", "Death Metal", "Doom Metal", "Goth Metal", "Hair Metal", "Heavy Metal", "Industrial Metal", "Metalcore", "Nu-Metal", "Power Metal", "Prog-Metal", "Sludge", "Speed Metal", "Thrash Metal"],
  "New Age": ["Environmental", "Healing", "Meditation", "Nature", "Relaxation", "Travel"],
  "Pop": ["Adult Contemporary", "Britpop", "C-Pop", "Cantopop", "Chamber Pop", "Dance Pop", "Idol", "J-Pop", "K-Pop", "Pop/Rock", "Singer/Songwriter", "Soft Rock", "Teen Pop"],
  "Punk": ["Hardcore Punk", "Pop Punk", "Skate Punk"],
  "R&B / Soul": ["Contemporary R&B", "Disco", "Doo Wop", "Funk", "Motown", "Neo-Soul", "Quiet Storm", "Soul"],
  "Reggae": ["Dancehall", "Dub", "Lovers Rock", "Modern Dancehall", "Ragga", "Reggae En Español", "Reggae Roots", "Rocksteady", "Ska"],
  "Rock": ["Adult Alternative", "American Trad Rock", "Arena Rock", "Blues-Rock", "British Invasion", "Death Metal/Black Metal", "Glam Rock", "Hair Metal", "Hard Rock", "Metal", "Jam Bands", "Prog-Rock/Art Rock", "Psychedelic", "Roots Rock", "Singer/Songwriter", "Southern Rock", "Surf", "Tex-Mex"],
  "Singer/Songwriter": ["Alternative Folk", "Contemporary Folk", "Contemporary Singer/Songwriter", "Indie Folk"],
  "Soundtrack": ["Foreign Cinema", "Musicals", "Original Score", "Soundtrack", "TV Soundtrack"],
  "Spoken Word": ["Audiobooks", "Poetry", "Storytelling"],
  "World": ["Africa", "Afro-Beat", "Afro-Pop", "Asia", "Australia", "Bossa Nova", "Cajun", "Caribbean", "Celtic", "Celtic Folk", "Contemporary Celtic", "Coupé-Décalé", "Dangdut", "Drinking Songs", "Drone", "Europe", "France", "Hawaii", "Indian Classical", "Indian Pop", "Iberia", "Japanese Pop", "Klezmer", "Middle East", "North America", "Ode", "Piphat", "Polka", "Soca", "South America", "South Africa", "Traditional Celtic", "Worldbeat", "Zydeco"]
};

export default function SingleTrackDistributor({ selectedPlanId, onBackToMain }: SingleTrackDistributorProps) {
  const [currentStep, setCurrentStep] = useState<"contact" | "dashboard" | "payment" | "success">("contact");
  const [planId, setPlanId] = useState<"basic" | "pro" | "elite">(selectedPlanId);

  // Form input states
  const [formData, setFormData] = useState({
    title: "",
    genre: "Pop",
    subGenre: "",
    composer: "",
    lyricist: "",
    producer: "",
    licenseType: "Original",
    releaseDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
    labelName: "",
    publisher: "Wavora Records",
    isDolbyAtmos: false,
    hasContentId: false,
    lyrics: "",
    spotifyProfile: "",
    appleMusicProfile: "",
    instagramId: "",
    email: "",
    contactNumber: "",
    isExplicit: "no"
  });

  const [primaryArtists, setPrimaryArtists] = useState([{ id: Date.now(), name: "", instagramId: "", hasSpotify: "no", hasApple: "no", spotifyProfile: "", appleMusicProfile: "" }]);
  const [featuredArtists, setFeaturedArtists] = useState([{ id: Date.now() + 1, name: "", instagramId: "", hasSpotify: "no", hasApple: "no", spotifyProfile: "", appleMusicProfile: "" }]);

  // Artwork drag/drop upload state
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkError, setArtworkError] = useState("");
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const [artworkDragActive, setArtworkDragActive] = useState(false);

  // Audio drag/drop upload state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioError, setAudioError] = useState("");
  const [audioProgress, setAudioProgress] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment receipts states
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptDragActive, setReceiptDragActive] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [copiedMigrationSql, setCopiedMigrationSql] = useState(false);
  const paymentFileInputRef = useRef<HTMLInputElement>(null);

  // Plan Details Map
  const plansCatalog = {
    basic: {
      name: "Basic Single",
      price: 19,
      royalty: "80%",
      turnaround: "7 days",
      platformsCount: "150+",
      platformsList: ["Spotify", "YouTube Music", "Amazon Music", "Pandora", "Deezer", "And 140+ more..."],
      features: [
        "Core distribution to 150+ streaming stores",
        "80% absolute artist royalties",
        "Wavora general label placeholder",
        "WAV audio master checks",
        "Email support turnaround in 48 hours"
      ],
      color: "border-gray-500/20 bg-gray-950/40 text-gray-400"
    },
    pro: {
      name: "Pro Single",
      price: 39,
      royalty: "90%",
      turnaround: "3-5 days",
      platformsCount: 50,
      platformsList: ["Spotify", "YouTube Music", "Amazon Music", "Apple Music", "JioSaavn", "Deezer", "Tidal", "Wynk", "Instagram & TikTok Support"],
      features: [
        "Expedited distribution (3-5 days launch)",
        "90% absolute artist royalties",
        "Enhanced audio normalization & metadata syncing",
        "Social media audio monetization (Tik Tok / IG)",
        "Priority WhatsApp & Call support"
      ],
      color: "border-purple-500/30 bg-purple-950/15 text-purple-400"
    },
    elite: {
      name: "Elite Single",
      price: 79,
      royalty: "100%",
      turnaround: "2-3 days",
      platformsCount: 150,
      platformsList: ["All 150+ international stores", "Instant Content ID protection", "Official Artist Channel (OAC) setup", "Airplay playlist placements", "Sina Weibo & Chinese mainland channels boost"],
      features: [
        "Express 24-48 hour publishing",
        "100% absolute royalties to you",
        "Custom Record Label & Copyright fields",
        "Professional Dolby Atmos spatial audio mastering",
        "Full YouTube Content ID protection coverage"
      ],
      color: "border-cyan-500/30 bg-cyan-950/15 text-cyan-400"
    }
  };

  const currentPlan = plansCatalog[planId];

  // Prefill email from authenticated user on mount
  useEffect(() => {
    async function prefillEmail() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          setFormData(prev => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        console.warn("Could not prefill email from auth:", err);
      }
    }
    prefillEmail();
  }, []);

  const validateContact = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) {
      errors.email = "Primary contact email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "WhatsApp / Contact number is required for coordinate synchronization.";
    } else if (formData.contactNumber.trim().length < 8) {
      errors.contactNumber = "Please specify a valid mobile/WhatsApp number (at least 8 digits).";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Sync initial inputs and update minimum release date based on selected plan
  useEffect(() => {
    setPlanId(selectedPlanId);
  }, [selectedPlanId]);

  useEffect(() => {
    let days = 7;
    if (planId === "pro") days = 3;
    if (planId === "elite") days = 2;
    
    const minDate = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString().split("T")[0];
    if (new Date(formData.releaseDate) < new Date(minDate)) {
       setFormData(prev => ({...prev, releaseDate: minDate}));
    }
  }, [planId, formData.releaseDate]);

  const getMinReleaseDate = () => {
    let days = 7;
    if (planId === "pro") days = 3;
    if (planId === "elite") days = 2;
    return new Date(Date.now() + days * 24 * 3600 * 1000).toISOString().split("T")[0];
  };

  // Artwork drag handlers
  const handleArtworkDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setArtworkDragActive(true);
    } else if (e.type === "dragleave") {
      setArtworkDragActive(false);
    }
  };

  const handleArtworkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArtworkDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleArtworkFile(e.dataTransfer.files[0]);
    }
  };

  const handleArtworkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleArtworkFile(e.target.files[0]);
    }
  };

  const handleArtworkFile = (file: File) => {
    const isJpg = file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg");
    if (!isJpg) {
      setArtworkError("Artwork must be a JPG file.");
      return;
    }
    
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== 3000 || img.height !== 3000) {
        setArtworkError("Artwork must be exactly 3000x3000px resolution.");
        setArtworkFile(null);
      } else {
        setArtworkError("");
        setArtworkFile(file);
      }
    };
  };

  // Audio drag handlers
  const handleAudioDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAudioFile(e.target.files[0]);
    }
  };

  // Validate Audio and simulate high-speed server parsing
  const handleAudioFile = (file: File) => {
    const isAudio = file.type === "audio/wav" || file.name.toLowerCase().endsWith(".wav");
    if (!isAudio) {
      setAudioError("Invalid file type. Only WAV format is allowed.");
      return;
    }
    setAudioError("");
    setAudioFile(file);
    setIsUploadingAudio(true);
    setAudioProgress(0);

    // Dynamic wave progression bar
    const interval = setInterval(() => {
      setAudioProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingAudio(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Payment receipts drag handlers
  const handleReceiptDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setReceiptDragActive(true);
    } else if (e.type === "dragleave") {
      setReceiptDragActive(false);
    }
  };

  const handleReceiptDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReceiptDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleReceiptFile(e.dataTransfer.files[0]);
    }
  };

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleReceiptFile(e.target.files[0]);
    }
  };

  const handleReceiptFile = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setFormErrors(prev => ({ ...prev, receipt: "Invalid format. Upload screen image or PDF transaction certificate." }));
      return;
    }
    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy.receipt;
      return copy;
    });
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const copyUpiToClipboard = () => {
    navigator.clipboard.writeText("damnsingh@fam");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Validate Dashboard inputs
  const validateDashboard = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Release Track or Single Title is required.";
    const hasPrimaryArtist = primaryArtists.some(a => a.name.trim() !== "");
    if (!hasPrimaryArtist) errors.artist = "At least one Primary Artist name is required.";
    
    // Sub-genre validation: compulsory
    if (!formData.subGenre) {
      errors.subGenre = "Sub-genre selection is compulsory.";
    }

    if (!formData.composer.trim()) {
      errors.composer = "Composer name is compulsory.";
    }

    if (!formData.lyricist.trim()) {
      errors.lyricist = "Lyricist name is compulsory.";
    }

    if (!formData.producer.trim()) {
      errors.producer = "Producer name is compulsory.";
    }

    primaryArtists.forEach((a, idx) => {
      if (a.name.trim() !== "") {
        if (!a.instagramId.trim()) {
          errors[`primaryInsta_${idx}`] = `Instagram is mandatory for ${a.name || "this artist"}.`;
        }
        if (a.hasSpotify === "yes") {
          if (!a.spotifyProfile || !a.spotifyProfile.trim()) {
            errors[`primarySpotify_${idx}`] = `Spotify link/ID is compulsory when mapping profile.`;
          }
        }
        if (a.hasApple === "yes") {
          if (!a.appleMusicProfile || !a.appleMusicProfile.trim()) {
            errors[`primaryApple_${idx}`] = `Apple Music link/ID is compulsory when mapping profile.`;
          }
        }
      }
    });

    featuredArtists.forEach((a, idx) => {
      if (a.name.trim() !== "") {
        if (!a.instagramId.trim()) {
          errors[`featuredInsta_${idx}`] = `Instagram is mandatory for ${a.name || "this artist"}.`;
        }
        if (a.hasSpotify === "yes") {
          if (!a.spotifyProfile || !a.spotifyProfile.trim()) {
            errors[`featuredSpotify_${idx}`] = `Spotify link/ID is compulsory when mapping profile.`;
          }
        }
        if (a.hasApple === "yes") {
          if (!a.appleMusicProfile || !a.appleMusicProfile.trim()) {
            errors[`featuredApple_${idx}`] = `Apple Music link/ID is compulsory when mapping profile.`;
          }
        }
      }
    });

    if (!audioFile || isUploadingAudio) errors.audio = "A valid master audio (.wav) upload is required.";
    if (!artworkFile) errors.artwork = "A valid artwork (3000x3000px JPG) is required.";
    if (planId === "elite" && !formData.labelName.trim()) {
      errors.labelName = "Custom publisher label name is required on the Elite single plan.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateDashboard()) {
      setCurrentStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const executeSandboxBypass = async () => {
    setIsSubmittingPayment(true);
    setSupabaseError(null);
    
    let userIdValue = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userIdValue = user.id;
      }
    } catch (e) {
      console.warn("Failed to retrieve user context for track logging:", e);
    }

    const artistStr = primaryArtists.map(a => a.name.trim()).filter(Boolean).join(", ");
    const featuredStr = featuredArtists.map(a => a.name.trim()).filter(Boolean).join(", ");

    let audioUrlValue = null;
    let artworkUrlValue = null;

    try {
      // 1. Upload Artwork to Supabase Storage
      if (artworkFile) {
        try {
          const fileExt = artworkFile.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
          const filePath = `artwork/${fileName}`;
          const { data, error } = await supabase.storage
            .from("single-releases")
            .upload(filePath, artworkFile, { cacheControl: '3600', upsert: true });

          if (error) {
            console.warn("Artwork upload error:", error);
            setSupabaseError(`Artwork upload failed: ${error.message}. Please check if is-releases storage bucket policies are set up correctly.`);
            setIsSubmittingPayment(false);
            return;
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from("single-releases")
              .getPublicUrl(filePath);
            artworkUrlValue = publicUrl;
          }
        } catch (err: any) {
          console.warn("Artwork upload catch error:", err);
          setSupabaseError(`Artwork upload failure: ${err?.message || err}`);
          setIsSubmittingPayment(false);
          return;
        }

        // Local fallback artwork preview (Base64)
        if (!artworkUrlValue) {
          try {
            artworkUrlValue = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(artworkFile);
            });
          } catch (err) {
            console.warn("Convert artwork to base64 failed:", err);
          }
        }
      }

      // 2. Upload Master Audio WAV to Supabase Storage
      if (audioFile) {
        try {
          const fileExt = audioFile.name.split('.').pop() || 'wav';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
          const filePath = `audio/${fileName}`;
          const { data, error } = await supabase.storage
            .from("single-releases")
            .upload(filePath, audioFile, { cacheControl: '3600', upsert: true });

          if (error) {
            console.warn("Audio upload error:", error);
            setSupabaseError(`Audio file upload failed: ${error.message}. Please check your single-releases storage bucket configuration.`);
            setIsSubmittingPayment(false);
            return;
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from("single-releases")
              .getPublicUrl(filePath);
            audioUrlValue = publicUrl;
          }
        } catch (err: any) {
          console.warn("Audio upload catch error:", err);
          setSupabaseError(`Audio upload failure: ${err?.message || err}`);
          setIsSubmittingPayment(false);
          return;
        }

        // Local level placeholder sound
        if (!audioUrlValue) {
          audioUrlValue = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        }
      }

      const spotifyProfileVal = primaryArtists
        .filter(a => a.name.trim() !== "")
        .map(a => `${a.name}: ${a.spotifyProfile || 'Not Available'}`)
        .concat(
          featuredArtists
            .filter(a => a.name.trim() !== "")
            .map(a => `Featured: ${a.name}: ${a.spotifyProfile || 'Not Available'}`)
        )
        .join(" | ");

      const appleProfileVal = primaryArtists
        .filter(a => a.name.trim() !== "")
        .map(a => `${a.name}: ${a.appleMusicProfile || 'Not Available'}`)
        .concat(
          featuredArtists
            .filter(a => a.name.trim() !== "")
            .map(a => `Featured: ${a.name}: ${a.appleMusicProfile || 'Not Available'}`)
        )
        .join(" | ");

      const instagramProfileVal = primaryArtists
        .filter(a => a.name.trim() !== "")
        .map(a => `${a.name}: ${a.instagramId || 'Not Available'}`)
        .concat(
          featuredArtists
            .filter(a => a.name.trim() !== "")
            .map(a => `Featured: ${a.name}: ${a.instagramId || 'Not Available'}`)
        )
        .join(" | ");

      const dbPayload = {
        user_id: userIdValue,
        title: formData.title,
        artist: artistStr,
        featured_artists: featuredStr || null,
        genre: formData.subGenre ? `${formData.genre} - ${formData.subGenre}` : formData.genre,
        license_type: formData.licenseType,
        release_date: formData.releaseDate,
        label_name: formData.labelName || null,
        is_dolby_atmos: formData.isDolbyAtmos,
        has_content_id: formData.hasContentId,
        lyrics: formData.lyrics || null,
        plan: planId,
        price: currentPlan.price,
        status: "Live & Transmitting",
        audio_url: audioUrlValue,
        artwork_url: artworkUrlValue,
        email: formData.email,
        contact_number: formData.contactNumber,
        is_explicit: formData.isExplicit === "yes",
        spotify_profile: spotifyProfileVal,
        apple_music_profile: appleProfileVal,
        instagram_profile: instagramProfileVal,
        sub_genre: formData.subGenre,
        composer: formData.composer,
        lyricist: formData.lyricist,
        producer: formData.producer
      };

      let insertedRow: any = null;

      // Attempt direct save to Supabase
      const { data, error: dbErr } = await supabase
        .from("single_track_releases")
        .insert([dbPayload])
        .select();

      if (dbErr) {
        console.error("⛔ Supabase Single Insert Error details:", {
          message: dbErr.message,
          details: dbErr.details,
          hint: dbErr.hint,
          code: dbErr.code,
        });
        setSupabaseError(`Supabase DB Error: ${dbErr.message} (Code: ${dbErr.code}). ${dbErr.hint || "Please make sure your database single_track_releases table is created using our setup script and contains columns 'email' and 'contact_number'."}`);
        setIsSubmittingPayment(false);
        return;
      } else if (data && data[0]) {
        insertedRow = data[0];
      }

      setTimeout(() => {
        setIsSubmittingPayment(false);
        setCurrentStep("success");
        
        // Save campaign locally
        try {
          const key = "wavora_single_track_releases";
          const saved = localStorage.getItem(key);
          const list = saved ? JSON.parse(saved) : [];
          list.unshift(insertedRow || {
            id: `single-${Date.now()}`,
            title: formData.title,
            artist: artistStr,
            featured_artists: featuredStr || null,
            plan: planId,
            price: currentPlan.price,
            status: "Live & Transmitting",
            genre: formData.subGenre ? `${formData.genre} - ${formData.subGenre}` : formData.genre,
            license_type: formData.licenseType,
            audio_url: audioUrlValue,
            artwork_url: artworkUrlValue,
            email: formData.email,
            contact_number: formData.contactNumber,
            is_explicit: formData.isExplicit === "yes",
            spotify_profile: spotifyProfileVal,
            apple_music_profile: appleProfileVal,
            instagram_profile: instagramProfileVal,
            sub_genre: formData.subGenre,
            composer: formData.composer,
            lyricist: formData.lyricist,
            producer: formData.producer,
            date: new Date().toISOString()
          });
          localStorage.setItem(key, JSON.stringify(list));
          window.dispatchEvent(new Event("storage"));
          // Dispatch custom sync event for instant Admin dashboard updates
          window.dispatchEvent(new CustomEvent("wavora_single_track_releases_updated", { detail: list }));
        } catch (err) {
          console.warn(err);
        }
        
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1800);

    } catch (generalErr: any) {
      console.error("General submission exception occurred:", generalErr);
      setSupabaseError(`System Submission Error: ${generalErr?.message || "Unknown error."}`);
      setIsSubmittingPayment(false);
    }
  };

  const handleConfirmPaymentReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      setFormErrors(prev => ({ ...prev, receipt: "Please upload your UPI transaction receipt screenshot to secure the license." }));
      return;
    }
    executeSandboxBypass();
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Dynamic header stage */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <CompassIcon planId={planId} />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase font-mono block">Wavora Direct Engine</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase font-mono tracking-tight text-white mt-0.5">
                {currentStep === "contact" ? "Artist Contact Hub" : currentStep === "dashboard" ? `Single-Track Distributor` : currentStep === "payment" ? `Secure Gateway Checkout` : `Release Scheduled`}
              </h1>
            </div>
          </div>

          <button
            onClick={onBackToMain}
            className="text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            ← Back Home
          </button>
        </div>

        {/* Plan Swapping mini pill-matrix */}
        {currentStep === "dashboard" && (
          <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Selected Gateway:</span>
              <span className="text-xs font-black text-white px-2.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/20 uppercase font-mono tracking-wider">{currentPlan.name} (₹{currentPlan.price})</span>
            </div>

            <div className="flex p-0.5 bg-black/40 border border-white/10 rounded-lg">
              <button
                type="button"
                onClick={() => setPlanId("basic")}
                className={`py-1.5 px-3 rounded text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer font-mono ${
                  planId === "basic" ? "bg-white text-black shadow" : "text-gray-450 hover:text-white"
                }`}
              >
                ₹19 Basic
              </button>
              <button
                type="button"
                onClick={() => setPlanId("pro")}
                className={`py-1.5 px-3 rounded text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer font-mono ${
                  planId === "pro" ? "bg-white text-black shadow" : "text-gray-450 hover:text-white"
                }`}
              >
                ₹39 Pro
              </button>
              <button
                type="button"
                onClick={() => setPlanId("elite")}
                className={`py-1.5 px-3 rounded text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer font-mono ${
                  planId === "elite" ? "bg-white text-black shadow" : "text-gray-450 hover:text-white"
                }`}
              >
                ₹79 Elite
              </button>
            </div>
          </div>
        )}

        {/* STEP PANELS CONTAINER */}
        <AnimatePresence mode="wait">
          
          {/* STEP 0: ARTIST CONTACT HUB FOR LIVE HUMAN VERIFICATION */}
          {currentStep === "contact" && (
            <motion.div
              key="dist-contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 max-w-xl mx-auto"
            >
              <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
                
                <div className="text-center space-y-2 border-b border-white/5 pb-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider font-mono">
                    <Sparkles className="h-3 w-3 animate-spin" /> Live Sync Coordinator Assigned
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-mono uppercase tracking-tight text-white mt-1">
                    Release Verification setup
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                    Before uploading tracks, link your high-priority coordinate channels. Wavora is an expert human-reviewed network — never a silent automated database.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* High priority contact reassurance */}
                  <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
                        Our Handshake Promise
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      <strong>We ensure to talk to you directly:</strong> Every master application triggers a personal review by a Wavora sync manager. We will contact you directly via <strong>WhatsApp</strong> and <strong>Email</strong> to verify your layout, confirm copyright identifiers, coordinate Spotify/Apple profiles, and hand-guide your release live to the stores.
                    </p>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                      Coordinate Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-550" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="artist@recordlabel.com"
                        className="w-full bg-[#050507] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium placeholder-gray-600"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-[9px] text-red-400 font-mono font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone / WhatsApp Field */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                      WhatsApp / Contact Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-550" />
                      <input
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                        placeholder="+91 XXXXX XXXXX (or complete international representation)"
                        className="w-full bg-[#050507] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium placeholder-gray-600"
                      />
                    </div>
                    {formErrors.contactNumber && (
                      <p className="text-[9px] text-red-400 font-mono font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {formErrors.contactNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex gap-3">
                  <button
                    type="button"
                    onClick={onBackToMain}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateContact()) {
                        setFormErrors({});
                        setCurrentStep("dashboard");
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(147,51,234,0.3)]"
                  >
                    Set Track Info <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: TAILORED DISTRIBUTION PROFILE DASHBOARD */}
          {currentStep === "dashboard" && (
            <motion.div
              key="dist-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Elements columns (7 spans) */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h2 className="text-xs font-black uppercase text-white tracking-widest font-mono flex items-center gap-2">
                        <Sliders className="h-4.5 w-4.5 text-purple-400" />
                        Release Blueprint Details
                      </h2>
                      <span className="text-[10px] font-mono text-purple-400 font-extrabold uppercase animate-pulse">Draft Live Synced</span>
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">
                            Track Release Title <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Midnight Horizon"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-[#050508] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                          />
                          {formErrors.title && <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono"><AlertCircle className="h-3 w-3" /> {formErrors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono flex items-center justify-between">
                            <span>Primary Artist name <span className="text-red-400">*</span></span>
                            <button 
                              type="button" 
                              onClick={() => setPrimaryArtists(p => [...p, { id: Date.now(), name: "", instagramId: "", hasSpotify: "no", hasApple: "no", spotifyProfile: "", appleMusicProfile: "" }])}
                              className="text-purple-400 hover:text-purple-300 font-bold text-xs flex items-center"
                            >
                              + Add
                            </button>
                          </label>
                          <div className="space-y-3">
                            {primaryArtists.map((artist, idx) => (
                              <div key={artist.id} className="space-y-3.5 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl relative">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Band or Artist Handle"
                                    value={artist.name}
                                    onChange={(e) => setPrimaryArtists(p => p.map(a => a.id === artist.id ? { ...a, name: e.target.value } : a))}
                                    className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                                  />
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryArtists(p => p.filter(a => a.id !== artist.id))}
                                      className="p-2.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-450 uppercase tracking-wider block font-mono">Instagram ID</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. @artist_handle *"
                                      value={artist.instagramId}
                                      onChange={(e) => setPrimaryArtists(p => p.map(a => a.id === artist.id ? { ...a, instagramId: e.target.value } : a))}
                                      className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                                    />
                                    {formErrors[`primaryInsta_${idx}`] && <p className="text-[9px] text-red-400 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors[`primaryInsta_${idx}`]}</p>}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {/* Spotify Box */}
                                    <div className="bg-[#050509]/60 border border-white/5 p-3.5 rounded-xl space-y-2 flex flex-col justify-between">
                                      <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide font-mono block">
                                          Spotify Profile?
                                        </span>
                                        <span className="text-[9px] text-gray-500 block leading-tight">
                                          Does {artist.name || "this artist"} have a Spotify Artist page?
                                        </span>
                                      </div>
                                      
                                      <div className="flex gap-1.5 pt-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPrimaryArtists(p => p.map(a => a.id === artist.id ? { ...a, hasSpotify: "no", spotifyProfile: "" } : a));
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all border ${
                                            artist.hasSpotify !== "yes"
                                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-lg shadow-purple-500/5"
                                              : "bg-[#050508] text-gray-450 border-white/5 hover:border-white/10"
                                          }`}
                                        >
                                          No
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPrimaryArtists(p => p.map(a => a.id === artist.id ? { ...a, hasSpotify: "yes" } : a));
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all border ${
                                            artist.hasSpotify === "yes"
                                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-lg shadow-purple-500/5"
                                              : "bg-[#050508] text-gray-450 border-white/5 hover:border-white/10"
                                          }`}
                                        >
                                          Yes
                                        </button>
                                      </div>

                                      {artist.hasSpotify === "yes" && (
                                        <div className="space-y-1 pt-2 border-t border-white/5 animate-fadeIn">
                                          <label className="text-[9px] font-bold text-green-400 block font-mono uppercase tracking-wider">
                                            Spotify URL/ID <span className="text-red-400 font-bold">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Pasting is compulsory"
                                            value={artist.spotifyProfile}
                                            onChange={(e) => setPrimaryArtists(p => p.map(a => a.id === artist.id ? { ...a, spotifyProfile: e.target.value } : a))}
                                            className="w-full bg-[#050508] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                                          />
                                          {formErrors[`primarySpotify_${idx}`] && (
                                            <p className="text-[9px] text-red-400 font-mono flex items-center gap-1">
                                              <AlertCircle className="h-3 w-3" /> {formErrors[`primarySpotify_${idx}`]}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Apple Music Box */}
                                    <div className="bg-[#050509]/60 border border-white/5 p-3.5 rounded-xl space-y-2 flex flex-col justify-between">
                                      <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide font-mono block">
                                          Apple Music?
                                        </span>
                                        <span className="text-[9px] text-gray-500 block leading-tight">
                                          Does {artist.name || "this artist"} have an Apple Music page?
                                        </span>
                                      </div>
                                      
                                      <div className="flex gap-1.5 pt-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPrimaryArtists(p => p.map(a => a.id === artist.id ? { ...a, hasApple: "no", appleMusicProfile: "" } : a));
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all border ${
                                            artist.hasApple !== "yes"
                                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-lg shadow-purple-500/5"
                                              : "bg-[#050508] text-gray-450 border-white/5 hover:border-white/10"
                                          }`}
                                        >
                                          No
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPrimaryArtists(p => p.map(a => a.id === artist.id ? { ...a, hasApple: "yes" } : a));
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all border ${
                                            artist.hasApple === "yes"
                                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-lg shadow-purple-500/5"
                                              : "bg-[#050508] text-gray-450 border-white/5 hover:border-white/10"
                                          }`}
                                        >
                                          Yes
                                        </button>
                                      </div>

                                      {artist.hasApple === "yes" && (
                                        <div className="space-y-1 pt-2 border-t border-white/5 animate-fadeIn">
                                          <label className="text-[9px] font-bold text-pink-400 block font-mono uppercase tracking-wider">
                                            Apple Music URL/ID <span className="text-red-400 font-bold">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Pasting is compulsory"
                                            value={artist.appleMusicProfile}
                                            onChange={(e) => setPrimaryArtists(p => p.map(a => a.id === artist.id ? { ...a, appleMusicProfile: e.target.value } : a))}
                                            className="w-full bg-[#050508] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                                          />
                                          {formErrors[`primaryApple_${idx}`] && (
                                            <p className="text-[9px] text-red-400 font-mono flex items-center gap-1">
                                              <AlertCircle className="h-3 w-3" /> {formErrors[`primaryApple_${idx}`]}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {formErrors.artist && <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono"><AlertCircle className="h-3 w-3" /> {formErrors.artist}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono flex items-center justify-between">
                            <span>Featured Artists / Band (Optional)</span>
                            <button 
                              type="button" 
                              onClick={() => setFeaturedArtists(p => [...p, { id: Date.now(), name: "", instagramId: "", hasSpotify: "no", hasApple: "no", spotifyProfile: "", appleMusicProfile: "" }])}
                              className="text-purple-400 hover:text-purple-300 font-bold text-xs flex items-center"
                            >
                              + Add
                            </button>
                          </label>
                          <div className="space-y-3">
                            {featuredArtists.map((artist, idx) => (
                              <div key={artist.id} className="space-y-3.5 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl relative">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. Sitar Odyssey"
                                    value={artist.name}
                                    onChange={(e) => setFeaturedArtists(p => p.map(a => a.id === artist.id ? { ...a, name: e.target.value } : a))}
                                    className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-650 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                                  />
                                  {featuredArtists.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setFeaturedArtists(p => p.filter(a => a.id !== artist.id))}
                                      className="p-2.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-450 uppercase tracking-wider block font-mono">Instagram ID</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. @artist_handle *"
                                      value={artist.instagramId}
                                      onChange={(e) => setFeaturedArtists(p => p.map(a => a.id === artist.id ? { ...a, instagramId: e.target.value } : a))}
                                      className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-650 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                                    />
                                    {formErrors[`featuredInsta_${idx}`] && <p className="text-[9px] text-red-400 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors[`featuredInsta_${idx}`]}</p>}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {/* Spotify Box */}
                                    <div className="bg-[#050509]/60 border border-white/5 p-3.5 rounded-xl space-y-2 flex flex-col justify-between">
                                      <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide font-mono block">
                                          Spotify Profile?
                                        </span>
                                        <span className="text-[9px] text-gray-500 block leading-tight">
                                          Does {artist.name || "this artist"} have a Spotify Artist page?
                                        </span>
                                      </div>
                                      
                                      <div className="flex gap-1.5 pt-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setFeaturedArtists(p => p.map(a => a.id === artist.id ? { ...a, hasSpotify: "no", spotifyProfile: "" } : a));
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all border ${
                                            artist.hasSpotify !== "yes"
                                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-lg shadow-purple-500/5"
                                              : "bg-[#050508] text-gray-455 border-white/5 hover:border-white/10"
                                          }`}
                                        >
                                          No
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setFeaturedArtists(p => p.map(a => a.id === artist.id ? { ...a, hasSpotify: "yes" } : a));
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all border ${
                                            artist.hasSpotify === "yes"
                                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-lg shadow-purple-500/5"
                                              : "bg-[#050508] text-gray-455 border-white/5 hover:border-white/10"
                                          }`}
                                        >
                                          Yes
                                        </button>
                                      </div>

                                      {artist.hasSpotify === "yes" && (
                                        <div className="space-y-1 pt-2 border-t border-white/5 animate-fadeIn">
                                          <label className="text-[9px] font-bold text-green-400 block font-mono uppercase tracking-wider">
                                            Spotify URL/ID <span className="text-red-400 font-bold">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Pasting is compulsory"
                                            value={artist.spotifyProfile}
                                            onChange={(e) => setFeaturedArtists(p => p.map(a => a.id === artist.id ? { ...a, spotifyProfile: e.target.value } : a))}
                                            className="w-full bg-[#050508] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                                          />
                                          {formErrors[`featuredSpotify_${idx}`] && (
                                            <p className="text-[9px] text-red-400 font-mono flex items-center gap-1">
                                              <AlertCircle className="h-3 w-3" /> {formErrors[`featuredSpotify_${idx}`]}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Apple Music Box */}
                                    <div className="bg-[#050509]/60 border border-white/5 p-3.5 rounded-xl space-y-2 flex flex-col justify-between">
                                      <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide font-mono block">
                                          Apple Music?
                                        </span>
                                        <span className="text-[9px] text-gray-500 block leading-tight">
                                          Does {artist.name || "this artist"} have an Apple Music page?
                                        </span>
                                      </div>
                                      
                                      <div className="flex gap-1.5 pt-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setFeaturedArtists(p => p.map(a => a.id === artist.id ? { ...a, hasApple: "no", appleMusicProfile: "" } : a));
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all border ${
                                            artist.hasApple !== "yes"
                                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-lg shadow-purple-500/5"
                                              : "bg-[#050508] text-gray-455 border-white/5 hover:border-white/10"
                                          }`}
                                        >
                                          No
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setFeaturedArtists(p => p.map(a => a.id === artist.id ? { ...a, hasApple: "yes" } : a));
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all border ${
                                            artist.hasApple === "yes"
                                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-lg shadow-purple-500/5"
                                              : "bg-[#050508] text-gray-455 border-white/5 hover:border-white/10"
                                          }`}
                                        >
                                          Yes
                                        </button>
                                      </div>

                                      {artist.hasApple === "yes" && (
                                        <div className="space-y-1 pt-2 border-t border-white/5 animate-fadeIn">
                                          <label className="text-[9px] font-bold text-pink-400 block font-mono uppercase tracking-wider">
                                            Apple Music URL/ID <span className="text-red-400 font-bold">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Pasting is compulsory"
                                            value={artist.appleMusicProfile}
                                            onChange={(e) => setFeaturedArtists(p => p.map(a => a.id === artist.id ? { ...a, appleMusicProfile: e.target.value } : a))}
                                            className="w-full bg-[#050508] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                                          />
                                          {formErrors[`featuredApple_${idx}`] && (
                                            <p className="text-[9px] text-red-400 font-mono flex items-center gap-1">
                                              <AlertCircle className="h-3 w-3" /> {formErrors[`featuredApple_${idx}`]}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">Primary Musical Genre</label>
                            <select
                              value={formData.genre}
                              onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value, subGenre: "" }))}
                              className="w-full bg-[#050508] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                            >
                              <option value="Alternative">Alternative</option>
                              <option value="Anime">Anime</option>
                              <option value="Blues">Blues</option>
                              <option value="Brazilian">Brazilian</option>
                              <option value="Children's Music">Children's Music</option>
                              <option value="Christian & Gospel">Christian & Gospel</option>
                              <option value="Classical">Classical</option>
                              <option value="Comedy">Comedy</option>
                              <option value="Country">Country</option>
                              <option value="Dance">Dance</option>
                              <option value="Electronic">Electronic</option>
                              <option value="Folk">Folk</option>
                              <option value="Hip-Hop / Rap">Hip-Hop / Rap</option>
                              <option value="Holiday">Holiday</option>
                              <option value="Indian">Indian</option>
                              <option value="Instrumental">Instrumental</option>
                              <option value="Jazz">Jazz</option>
                              <option value="Latin">Latin</option>
                              <option value="Metal">Metal</option>
                              <option value="New Age">New Age</option>
                              <option value="Pop">Pop</option>
                              <option value="Punk">Punk</option>
                              <option value="R&B / Soul">R&B / Soul</option>
                              <option value="Reggae">Reggae</option>
                              <option value="Rock">Rock</option>
                              <option value="Singer/Songwriter">Singer/Songwriter</option>
                              <option value="Soundtrack">Soundtrack</option>
                              <option value="Spoken Word">Spoken Word</option>
                              <option value="World">World</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">
                              Sub Genre <span className="text-red-400 font-bold">* Compulsory</span>
                            </label>
                            <select
                              value={formData.subGenre}
                              onChange={(e) => setFormData(prev => ({ ...prev, subGenre: e.target.value }))}
                              className={`w-full bg-[#050508] border rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans disabled:opacity-50 ${
                                formErrors.subGenre ? "border-red-500/50 focus:ring-red-500" : "border-white/10"
                              }`}
                              disabled={!genreMap[formData.genre]?.length}
                            >
                              <option value="">Select a sub-genre...</option>
                              {genreMap[formData.genre]?.map(sg => (
                                <option key={sg} value={sg}>{sg}</option>
                              ))}
                            </select>
                            {formErrors.subGenre && (
                              <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono">
                                <AlertCircle className="h-3 w-3" /> {formErrors.subGenre}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">
                              Composer Name <span className="text-red-400 font-bold">* Compulsory</span>
                            </label>
                            <input
                              type="text"
                              value={formData.composer}
                              onChange={(e) => setFormData(prev => ({ ...prev, composer: e.target.value }))}
                              placeholder="Who composed the music?"
                              className={`w-full bg-[#050508] border rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans ${
                                formErrors.composer ? "border-red-500/50 focus:ring-red-500" : "border-white/10"
                              }`}
                            />
                            {formErrors.composer && (
                              <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono">
                                <AlertCircle className="h-3 w-3" /> {formErrors.composer}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">
                              Lyricist Name <span className="text-red-400 font-bold">* Compulsory</span>
                            </label>
                            <input
                              type="text"
                              value={formData.lyricist}
                              onChange={(e) => setFormData(prev => ({ ...prev, lyricist: e.target.value }))}
                              placeholder="Who wrote the lyrics?"
                              className={`w-full bg-[#050508] border rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans ${
                                formErrors.lyricist ? "border-red-500/50 focus:ring-red-500" : "border-white/10"
                              }`}
                            />
                            {formErrors.lyricist && (
                              <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono">
                                <AlertCircle className="h-3 w-3" /> {formErrors.lyricist}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">
                              Producer Name <span className="text-red-400 font-bold">* Compulsory</span>
                            </label>
                            <input
                              type="text"
                              value={formData.producer}
                              onChange={(e) => setFormData(prev => ({ ...prev, producer: e.target.value }))}
                              placeholder="Who produced the track?"
                              className={`w-full bg-[#050508] border rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans ${
                                formErrors.producer ? "border-red-500/50 focus:ring-red-500" : "border-white/10"
                              }`}
                            />
                            {formErrors.producer && (
                              <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono">
                                <AlertCircle className="h-3 w-3" /> {formErrors.producer}
                              </p>
                            )}
                          </div>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">License Type</label>
                          <select
                            value={formData.licenseType}
                            onChange={(e) => setFormData(prev => ({ ...prev, licenseType: e.target.value }))}
                            className="w-full bg-[#050508] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                          >
                            <option value="Original">Original</option>
                            <option value="Non Exclusive">Non Exclusive</option>
                            <option value="Cover">Cover</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">Target stream release date</label>
                          <input
                            type="date"
                            min={getMinReleaseDate()}
                            value={formData.releaseDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                            className="w-full bg-[#050508] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                          />
                          <p className="text-[9px] text-gray-550">Recommended buffer period: {planId === 'elite' ? '2-3' : planId === 'pro' ? '3-5' : '7'} days minimum.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block font-mono">Standard Publisher Credit line</label>
                          <input
                            type="text"
                            disabled
                            value={formData.publisher}
                            className="w-full bg-white/[0.02] border border-white/5 opacity-55 cursor-not-allowed rounded-xl px-3.5 py-3 text-xs text-gray-400 font-mono"
                          />
                        </div>
                      </div>

                      {/* Explicit Content & Content ID Classification */}
                      <div className="bg-[#0e0e16]/60 border border-white/5 rounded-2xl p-5 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono flex items-center gap-1.5 border-b border-white/5 pb-2">
                          <AlertTriangle className="h-4 w-4" /> Content Classification &amp; Security Rights
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                            <div>
                              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider font-mono block">Explicit Content Warning</span>
                              <span className="text-[9px] text-gray-500 block leading-tight pt-0.5">Does this track contain explicit lyrics, language, or themes?</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isExplicit: "no" }))}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
                                  formData.isExplicit === "no"
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-lg shadow-purple-500/5"
                                    : "bg-[#050508] text-gray-450 border-white/5 hover:border-white/10"
                                }`}
                              >
                                No
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isExplicit: "yes" }))}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
                                  formData.isExplicit === "yes"
                                    ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-lg shadow-red-500/5"
                                    : "bg-[#050508] text-gray-450 border-white/5 hover:border-white/10"
                                }`}
                              >
                                Yes
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                            <div>
                              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider font-mono block">YouTube Content ID Protection</span>
                              <span className="text-[9px] text-gray-500 block leading-tight pt-0.5">Secure automated revenue of copyright matching on YouTube.</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, hasContentId: false }))}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
                                  !formData.hasContentId
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-lg shadow-purple-500/5"
                                    : "bg-[#050508] text-gray-450 border-white/5 hover:border-white/10"
                                }`}
                              >
                                No
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, hasContentId: true }))}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
                                  formData.hasContentId
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-lg shadow-purple-500/5"
                                    : "bg-[#050509] text-gray-450 border-white/5 hover:border-white/10"
                                }`}
                              >
                                Yes
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* TAILORED FIELDS FOR SPECIFIC PLANS: DIFFERENT FOR EVERY PLAN */}
                      {planId === "elite" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-4 border-t border-purple-500/10 space-y-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block font-mono">
                                Custom Record Label Publisher Name <span className="text-red-400">*</span>
                              </label>
                              <span className="text-[8px] font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-cyan-400 font-mono uppercase">Elite Feature Exclusive</span>
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. Astral Music Group"
                              required
                              value={formData.labelName}
                              onChange={(e) => setFormData(prev => ({ ...prev, labelName: e.target.value }))}
                              className="w-full bg-[#050508] border border-cyan-500/20 focus:border-cyan-400 rounded-xl px-3.5 py-3 text-xs text-white placeholder-cyan-900/60 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                            />
                            {formErrors.labelName && <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono"><AlertCircle className="h-3 w-3" /> {formErrors.labelName}</p>}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cyan-950/5 border border-cyan-500/10 p-3.5 rounded-xl">
                            <div className="flex items-center justify-between p-1">
                              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider font-mono">Activate Dolby Spatial Audio</span>
                              <input
                                type="checkbox"
                                checked={formData.isDolbyAtmos}
                                onChange={(e) => setFormData(prev => ({ ...prev, isDolbyAtmos: e.target.checked }))}
                                className="w-4 h-4 cursor-pointer accent-cyan-500"
                              />
                            </div>
                            <div className="flex items-center justify-between p-1">
                              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider font-mono">YouTube Content ID Protection</span>
                              <input
                                type="checkbox"
                                checked={formData.hasContentId}
                                onChange={(e) => setFormData(prev => ({ ...prev, hasContentId: e.target.checked }))}
                                className="w-4 h-4 cursor-pointer accent-cyan-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {planId === "pro" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-4 border-t border-purple-500/10 space-y-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest block font-mono">
                                Synchronized Lyrics Text (Pro Placements)
                              </label>
                              <span className="text-[8px] font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-purple-400 font-mono uppercase">Pro Feature Exclusive</span>
                            </div>
                            <textarea
                              rows={2.5}
                              placeholder="Pills/lyrics to pair with synchronized digital streams..."
                              value={formData.lyrics}
                              onChange={(e) => setFormData(prev => ({ ...prev, lyrics: e.target.value }))}
                              className="w-full bg-[#050508] border border-purple-500/20 focus:border-purple-400 rounded-xl p-3 text-xs text-white placeholder-purple-900/45 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-mono resize-none"
                            />
                          </div>
                        </motion.div>
                      )}

                      {planId === "basic" && (
                        <div className="pt-2 bg-white/[0.01] p-3 border border-white/5 rounded-xl">
                          <span className="text-[9px] font-black text-gray-550 uppercase tracking-widest font-mono block mb-1">Standard Basic Release Guidelines</span>
                          <p className="text-[10px] text-gray-450 leading-relaxed">
                            Basic campaigns require standard 7-day turnaround. To upload custom publisher names or unlock synchronized lyrics for Spotify/Apple music, please upgrade to the Pro or Elite tiers.
                          </p>
                        </div>
                      )}

                    </div>

                    {/* DRAG AND DROP ARTWORK ATTACHMENT */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                        Release Artwork Cover <span className="text-red-400">*</span>
                      </label>

                      <div
                        onDragEnter={handleArtworkDrag}
                        onDragOver={handleArtworkDrag}
                        onDragLeave={handleArtworkDrag}
                        onDrop={handleArtworkDrop}
                        onClick={() => artworkInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-300 relative overflow-hidden ${
                          artworkDragActive
                            ? "border-purple-500 bg-purple-500/10 scale-[0.99]"
                            : "border-white/10 bg-[#050508] hover:border-white/20 hover:bg-black/35"
                        }`}
                      >
                        <input
                          ref={artworkInputRef}
                          type="file"
                          accept="image/jpeg"
                          onChange={handleArtworkSelect}
                          className="hidden"
                        />

                        {!artworkFile ? (
                          <div className="space-y-3 pointer-events-none">
                            <div className="mx-auto w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                              <Upload className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">Click or drag artwork here</p>
                              <p className="text-[10px] text-gray-500 font-mono mt-1">ONLY 3000x3000px JPG accepted</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 z-10 w-full text-left">
                            <div className="h-10 w-10 bg-purple-500/10 rounded border border-purple-500/20 flex items-center justify-center shrink-0">
                              <Globe className="h-4 w-4 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate flex items-center gap-2">
                                {artworkFile.name}
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono">{(artworkFile.size / 1024 / 1024).toFixed(2)} MB • 3000x3000px</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setArtworkFile(null); }}
                              className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <AnimatePresence>
                        {artworkError && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] text-red-400 flex items-center gap-1 font-mono pl-1 pt-1"
                          >
                            <AlertCircle className="h-3 w-3" /> {artworkError}
                          </motion.p>
                        )}
                        {formErrors.artwork && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] text-red-400 flex items-center gap-1 font-mono pl-1 pt-1"
                          >
                            <AlertCircle className="h-3 w-3" /> {formErrors.artwork}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* DRAG AND DROP HIGH-FIDELITY AUDIO ATTACHMENT */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                        Primary Audio Master WAV <span className="text-red-400">*</span>
                      </label>

                      <div
                        onDragEnter={handleAudioDrag}
                        onDragOver={handleAudioDrag}
                        onDragLeave={handleAudioDrag}
                        onDrop={handleAudioDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-300 relative overflow-hidden ${
                          dragActive
                            ? "border-purple-500 bg-purple-500/10 scale-[0.99]"
                            : "border-white/10 bg-[#050508] hover:border-white/20 hover:bg-black/35"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioSelect}
                          className="hidden"
                        />

                        {audioFile ? (
                          <div className="space-y-3.5 z-10 w-full">
                            <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto">
                              <Play className="h-5 w-5 fill-current text-purple-450" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-white truncate max-w-xs mx-auto font-mono">{audioFile.name}</p>
                              <p className="text-[10px] text-gray-500">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Audio Format</p>
                            </div>

                            {/* Progress bar wave simulation */}
                            {isUploadingAudio ? (
                              <div className="max-w-xs mx-auto">
                                <div className="flex justify-between text-[9px] text-purple-400 font-mono uppercase mb-1">
                                  <span>Server Verification Checks</span>
                                  <span>{audioProgress}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-150" style={{ width: `${audioProgress}%` }} />
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider font-mono">
                                <ShieldCheck className="h-4 w-4" /> 100% Stream Verification Match
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-purple-400 mb-2 animate-bounce" />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">Drag & Drop Master Audio track</span>
                            <span className="text-[9px] text-gray-500 mt-1">High resolution WAV (44.1 kHz, 16-bit) or MP3 files only</span>
                          </>
                        )}
                      </div>
                      {audioError && <p className="text-[10px] text-red-400 font-mono block font-semibold"><AlertCircle className="h-3.5 w-3.5 inline mr-1" />{audioError}</p>}
                      {formErrors.audio && <p className="text-[10px] text-red-400 font-mono block font-semibold"><AlertCircle className="h-3.5 w-3.5 inline mr-1" />{formErrors.audio}</p>}
                    </div>

                  </div>
                </div>

                {/* TAILORED WORKFLOW DIRECTORY (5 spans) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Platforms checklist, customized dynamically by plan */}
                  <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl space-y-5 relative">
                    <h3 className="text-[11px] font-black uppercase text-white tracking-widest font-mono border-b border-white/5 pb-3 block">
                      Platform Reach Checklist
                    </h3>

                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 flex items-center gap-1.5 font-mono mb-2">
                      <Globe className="h-3.5 w-3.5 text-purple-400" />
                      Authorized Distribution Streams: <strong className="text-white font-mono">{currentPlan.platformsCount} STORES</strong>
                    </div>

                    <div className="space-y-2.5">
                      {["Spotify", "Apple Music", "JioSaavn", "Instagram / Facebook", "YouTube Music / Shorts", "TikTok / ByteDance", "Amazon Music", "Wynk Music", "Tidal HD", "Deezer Global"].map((store) => {
                        // Dynamically assess toggle permissions depending on current single plan
                        let hasPrem = true;
                        if (planId === "basic") {
                          // Basic supports 150+ stores
                          hasPrem = !["Wynk Music"].includes(store);
                        } else if (planId === "pro") {
                          // Pro gets everything except Wynk
                          hasPrem = !["Wynk Music"].includes(store);
                        }
                        
                        return (
                          <div 
                            key={store} 
                            className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                              hasPrem 
                                ? "bg-emerald-500/[0.01] border-emerald-500/10 text-gray-300" 
                                : "bg-white/[0.01] border-white/5 text-gray-650 opacity-45 strike-through cursor-default"
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase font-sans tracking-wide">
                              {store}
                            </span>
                            {hasPrem ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            ) : (
                              <span className="text-[8px] font-mono uppercase bg-red-400/5 border border-red-400/10 px-1 rounded-sm text-red-500/80 font-bold shrink-0">Locked</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {planId !== "elite" && (
                      <div className="p-3.5 bg-purple-500/5 rounded-xl border border-purple-500/10 text-center">
                        <p className="text-[10px] text-purple-300 leading-relaxed font-sans font-medium mb-2.5">
                          Launch on Wynk Music, TikTok, Airplay radio slots, and lock in 100% royalties with Elite.
                        </p>
                        <button
                          type="button"
                          onClick={() => setPlanId("elite")}
                          className="py-1 px-3.5 bg-gradient-purple-cyan text-black text-[9px] uppercase tracking-wider font-extrabold rounded cursor-pointer"
                        >
                          Upgrade to Elite
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pricing transparency card */}
                  <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block">Order Summary</span>
                    <div className="space-y-2 font-mono">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{currentPlan.name} License</span>
                        <span>₹{currentPlan.price}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Store Delivery Checks</span>
                        <span className="text-emerald-400">FREE</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Royalty Contract</span>
                        <span className="text-purple-400">{currentPlan.royalty} split</span>
                      </div>
                      <div className="h-[1px] bg-white/10 my-2" />
                      <div className="flex justify-between text-sm text-white font-extrabold uppercase">
                        <span>Amount Payable</span>
                        <span className="text-cyan-400">₹{currentPlan.price}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Launcher Proceed row */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white/[0.02] border border-white/10 rounded-2xl p-6 gap-4">
                <div className="text-left">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block">Current Selection</span>
                  <p className="text-xs text-gray-300 font-semibold">{currentPlan.name} • Setup fee ₹{currentPlan.price} • Stream deployment scheduled</p>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full sm:w-auto px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-[#07070A] bg-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(139,92,200,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Proceed to Payment Selection
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PAYMENT SCREEN SCREEN */}
          {currentStep === "payment" && (
            <motion.div
              key="payment-gateway"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
                
                <h2 className="text-sm font-black uppercase text-white tracking-widest font-mono border-b border-white/5 pb-4">
                  License Payment Secure Transfer
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* QR Core Code Box (5 spans) */}
                  <div className="md:col-span-5 flex flex-col items-center text-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                    <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono">Scan & Pay via any UPI App</span>
                    
                    {/* Simulated High Definition QR Scanner */}
                    <div className="bg-white p-3 rounded-xl border-4 border-purple-500/30 w-[170px] aspect-square relative flex items-center justify-center shadow-xl select-none">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=damnsingh@fam%26pn=Wavora%2520Live%26am=${currentPlan.price}%26tn=Single%2520Track%2520Release%2520-${encodeURIComponent(formData.title)}`}
                        alt="UPI Payment QR Code"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-1 w-full">
                      <span className="text-[9px] text-gray-500 font-mono block">Direct Transfer Amount:</span>
                      <strong className="text-xl font-mono text-cyan-400 font-black block">₹{currentPlan.price}</strong>
                    </div>
                  </div>

                  {/* Bank/UPI copy fields (7 spans) */}
                  <div className="md:col-span-7 space-y-5">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase font-mono block">Payment Instructions</span>
                      <p className="text-xs text-gray-405 leading-relaxed">
                        1. Open your camera or favorite financial app (Airtel, PhonePe, Paytm, Google Pay, BHIM). <br />
                        2. Scan the secure barcode on the left, or copy our official registered Merchant VPA ID address manually. <br />
                        3. Complete the transfer of <strong className="text-white">₹{currentPlan.price}</strong> and take a screenshot of the confirmation page or note the transaction ID.
                      </p>
                    </div>

                    {/* VPA Copy Address block */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Registered Merchant VPA</label>
                      <div className="flex items-center">
                        <div className="bg-black border border-white/10 rounded-l-xl px-3.5 py-3 text-xs font-mono text-gray-300 flex-grow select-all">
                          damnsingh@fam
                        </div>
                        <button
                          type="button"
                          onClick={copyUpiToClipboard}
                          className="bg-white/10 hover:bg-white/15 border border-white/10 border-l-0 rounded-r-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all text-white cursor-pointer select-none shrink-0"
                        >
                          {copiedUpi ? "Copied" : "Copy VPA"}
                        </button>
                      </div>
                    </div>

                    {/* Fast Sandbox Simulator bypass link */}
                    <div className="bg-purple-500/5 p-3.5 border border-purple-500/10 rounded-xl text-center">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">Developer Testing Environment Bypassing</span>
                      <button
                        type="button"
                        onClick={executeSandboxBypass}
                        className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-purple-cyan hover:opacity-80 transition-all uppercase tracking-wider cursor-pointer"
                      >
                        ⚡ Sandbox Bypass: Simulate Paid Verification instantly
                      </button>
                    </div>
                  </div>

                </div>

                {/* Confirm Attachment Block Form */}
                <form onSubmit={handleConfirmPaymentReceipt} className="border-t border-white/10 pt-6 space-y-6">
                  
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                      Upload Confirmation Screenshot Certificate <span className="text-red-400">*</span>
                    </label>

                    <div
                      onDragEnter={handleReceiptDrag}
                      onDragOver={handleReceiptDrag}
                      onDragLeave={handleReceiptDrag}
                      onDrop={handleReceiptDrop}
                      onClick={() => paymentFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-300 relative ${
                        receiptDragActive
                          ? "border-cyan-500 bg-cyan-500/10 scale-[0.99]"
                          : "border-white/10 bg-[#050508] hover:border-white/20 hover:bg-black/35"
                      }`}
                    >
                      <input
                        ref={paymentFileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptSelect}
                        className="hidden"
                      />

                      {receiptPreview ? (
                        <div className="space-y-3">
                          <div className="w-16 h-16 rounded overflow-hidden border border-white/10 bg-neutral-950 mx-auto">
                            <img src={receiptPreview} alt="Payment receipt review" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white uppercase font-mono">Confirmation Match Verified</p>
                            <span className="text-[9px] text-gray-500 mt-1">{receiptFile?.name}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <CreditCard className="h-8 w-8 text-cyan-400 mb-2 animate-pulse" />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">Drag or Choose Receipt Screen file</span>
                          <span className="text-[9px] text-gray-500 mt-1">Accepts PNG, JPG or PDF formats under 8MB</span>
                        </>
                      )}
                    </div>
                    {formErrors.receipt && <p className="text-[10px] text-red-400 font-mono block"><AlertCircle className="h-3.5 w-3.5 inline mr-1" />{formErrors.receipt}</p>}
                    
                    {supabaseError && (
                      <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl space-y-3 text-left">
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
                            Database Schema Out of Sync
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-200 leading-relaxed font-mono bg-black/40 p-2.5 rounded border border-white/5">
                          {supabaseError}
                        </p>
                        
                        <div className="pt-2 border-t border-red-500/10 space-y-2.5">
                          <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider font-mono">
                            ⚡ Fast Fix: Add Missing Columns & Refresh Cache
                          </p>
                          <p className="text-[10px] text-gray-400 leading-normal">
                            Supabase caches database headers. If you previously created your table, you need to add the new columns and reload the schema. Paste this exact snippet in your <strong>Supabase SQL Editor</strong> and run it:
                          </p>

                          <div className="relative bg-black/80 rounded-lg p-3 border border-purple-500/20">
                            <pre className="text-[9px] text-purple-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed select-all pr-16">
{`ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS is_explicit BOOLEAN DEFAULT false;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS spotify_profile TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS apple_music_profile TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS instagram_profile TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS sub_genre TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS composer TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS lyricist TEXT;
ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS producer TEXT;

-- Command below clears the Supabase PostgREST PGRST204 schema cache instantly:
NOTIFY pgrst, 'reload schema';`}
                            </pre>
                            <button
                              type="button"
                              onClick={() => {
                                const sql = `ALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS is_explicit BOOLEAN DEFAULT false;\nALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS spotify_profile TEXT;\nALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS apple_music_profile TEXT;\nALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS instagram_profile TEXT;\nALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS sub_genre TEXT;\nALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS composer TEXT;\nALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS lyricist TEXT;\nALTER TABLE public.single_track_releases ADD COLUMN IF NOT EXISTS producer TEXT;\nNOTIFY pgrst, 'reload schema';`;
                                navigator.clipboard.writeText(sql);
                                setCopiedMigrationSql(true);
                                setTimeout(() => setCopiedMigrationSql(false), 2000);
                              }}
                              className={`absolute top-2 right-2 px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                                copiedMigrationSql
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                  : "bg-purple-500/10 hover:bg-purple-500/25 border-purple-500/20 text-purple-400"
                              }`}
                            >
                              {copiedMigrationSql ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                              {copiedMigrationSql ? "Copied!" : "Copy SQL"}
                            </button>
                          </div>

                          <span className="text-[9px] text-gray-500 block">
                            💡 After running the query, your release submit will pass perfectly!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission and return control buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep("dashboard")}
                      className="w-full sm:w-auto py-3 px-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      ← Review Draft
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingPayment}
                      className="w-full flex-grow py-4 bg-gradient-purple-cyan text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(139,92,200,0.35)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {isSubmittingPayment ? (
                        <>
                          <RefreshCw className="h-4.5 w-4.5 animate-spin text-black" />
                          Verifying secure blocks...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4.5 w-4.5" />
                          Submit Screenshot & Activate License
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>
            </motion.div>
          )}

          {/* STEP 3: TRANSACTION SUCCESS PAGE */}
          {currentStep === "success" && (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0c0c12] border border-white/10 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#1b0d3a,transparent)] opacity-15 pointer-events-none" />
              
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl scale-105">
                <CheckCircle2 className="h-10 w-10 text-emerald-450 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block">
                  Authorized & Transmitting
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase font-mono tracking-tight text-white mt-1">
                  Launch Confirmed successfully!
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed mt-2">
                  Congratulations! Your track "<strong className="text-white font-semibold font-mono">{formData.title}</strong>" is now signed and has been scheduled into the digital music pipelines.
                </p>
              </div>

              {/* simulated distribution steps */}
              <div className="bg-black/40 border border-white/5 p-5 rounded-2xl max-w-md mx-auto text-left space-y-4 font-sans">
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest font-mono block">Status Deliverables Matrix</span>
                
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-white uppercase font-sans">WAV Audio Checks Passed Complete</h4>
                    <p className="text-[10px] text-gray-500">Audio sample matches 44.1 kHz criteria perfectly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-white uppercase font-sans">Metadata Handshake Completed</h4>
                    <p className="text-[10px] text-gray-500">Primary artist name and streaming dates locked with distributors.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                  <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-white uppercase font-sans">Awaiting Platform Release</h4>
                    <p className="text-[10px] text-gray-500">Global stores deployment turnaround scheduled for <strong>{currentPlan.turnaround}</strong>.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={onBackToMain}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white text-black font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Return to Wavora Main
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}

// Sub-component: dynamic rendering of Lucide navigation icon based on active plan slug
function CompassIcon({ planId }: { planId: "basic" | "pro" | "elite" }) {
  switch (planId) {
    case "basic": return <Server className="h-6 w-6" />;
    case "pro": return <Sparkles className="h-6 w-6" />;
    case "elite": return <Star className="h-6 w-6" />;
  }
}
