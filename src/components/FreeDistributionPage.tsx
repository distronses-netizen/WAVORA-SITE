import React, { useState } from "react";
import { X, CheckCircle, Music, Sparkles, Send, Youtube, Instagram, MessageSquare, AlertCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import Logo from "./Logo";

interface FreeDistributionPageProps {
  onBackToMain: () => void;
}

export default function FreeDistributionPage({ onBackToMain }: FreeDistributionPageProps) {
  const [formData, setFormData] = useState({
    artistName: "",
    realName: "",
    email: "",
    contactNumber: "",
    youtubeChannel: "",
    instagramId: "",
    spotifyId: "",
    whyFree: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.artistName.trim()) newErrors.artistName = "Artist name is required";
    if (!formData.realName.trim()) newErrors.realName = "Real name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email formatting";
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "WhatsApp return contact is required";
    }
    if (!formData.instagramId.trim()) {
      newErrors.instagramId = "Instagram handle or profile ID is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const dbPayload = {
        artist_name: formData.artistName,
        real_name: formData.realName,
        email: formData.email,
        contact_number: formData.contactNumber,
        youtube_channel: formData.youtubeChannel || null,
        instagram_id: formData.instagramId,
        spotify_id: formData.spotifyId || null,
        why_free: formData.whyFree || null,
        status: "pending",
      };

      let remoteAppId: string | null = null;
      try {
        const { data, error } = await supabase
          .from("free_applications")
          .insert([dbPayload])
          .select();

        if (error) {
          console.error("Supabase insert error for free_applications:", error);
          setErrors({ submit: `Failed to save to database: ${error.message}. Please check your connection or database configuration.` });
          setIsSubmitting(false);
          return;
        } else if (data && data[0]) {
          remoteAppId = data[0].id;
        }
      } catch (dbErr: any) {
        console.error("Could not write free application to Supabase:", dbErr);
        setErrors({ submit: `Database connection error: ${dbErr.message || "Unknown error"}. Please make sure your Supabase environment variables are configured in Vercel.` });
        setIsSubmitting(false);
        return;
      }

      const clientPayload = {
        id: remoteAppId || `free-${Date.now()}`,
        artistName: formData.artistName,
        realName: formData.realName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        youtubeChannel: formData.youtubeChannel,
        instagramId: formData.instagramId,
        spotifyId: formData.spotifyId,
        whyFree: formData.whyFree,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const stored = localStorage.getItem("wavora_free_applications");
      let list: any[] = [];
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch {
          list = [];
        }
      }
      list.unshift(clientPayload);
      localStorage.setItem("wavora_free_applications", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("wavora_free_applications_updated"));

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1500);

    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col font-sans relative selection:bg-purple-500/30 selection:text-purple-200">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />

      {/* Basic Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-[#07070A]/80 backdrop-blur-md z-40 px-4 sm:px-6 flex items-center justify-between">
        <button
          onClick={onBackToMain}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <div className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Return Home</span>
        </button>
        <Logo width={100} height={28} className="h-6 sm:h-7 w-auto block" />
        <div className="w-[100px]" /> {/* Empty spacer for centering */}
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-[#0B0B0F] rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(16,185,129,0.07)] overflow-hidden flex flex-col"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />
          <div className="p-6 md:p-10 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="h-3 w-3" />
                Selective Free Program
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Apply for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Free Distribution</span></h1>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <p className="text-xs text-gray-400 leading-relaxed font-normal text-center max-w-xl mx-auto">
                    We offer free global distribution for ambitious acts. Please note that **applications are reviewed selectively**. Our curators evaluate your digital footprint, consistency, and sound identity before onboarding.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5 bg-[#050507] p-6 rounded-2xl border border-white/5">
                    {/* Real Name & Artist Name Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                          Artist Name *
                        </label>
                        <input
                          type="text"
                          name="artistName"
                          value={formData.artistName}
                          onChange={handleInputChange}
                          placeholder="e.g. DJ Storm"
                          className={`w-full bg-white/5 border ${errors.artistName ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all`}
                        />
                        {errors.artistName && (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.artistName}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                          Real Name *
                        </label>
                        <input
                          type="text"
                          name="realName"
                          value={formData.realName}
                          onChange={handleInputChange}
                          placeholder="e.g. Aryan Sehgal"
                          className={`w-full bg-white/5 border ${errors.realName ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all`}
                        />
                        {errors.realName && (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.realName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="artist@example.com"
                          className={`w-full bg-white/5 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all`}
                        />
                        {errors.email && (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                          WhatsApp Number *
                        </label>
                        <input
                          type="text"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          placeholder="+91 XXXXX XXXXX"
                          className={`w-full bg-white/5 border ${errors.contactNumber ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all`}
                        />
                        {errors.contactNumber && (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.contactNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                          <Youtube className="h-3.5 w-3.5 text-red-500" /> YouTube Channel
                        </label>
                        <input
                          type="text"
                          name="youtubeChannel"
                          value={formData.youtubeChannel}
                          onChange={handleInputChange}
                          placeholder="e.g. youtube.com/@live"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                          <Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram Username *
                        </label>
                        <input
                          type="text"
                          name="instagramId"
                          value={formData.instagramId}
                          onChange={handleInputChange}
                          placeholder="@username"
                          className={`w-full bg-white/5 border ${errors.instagramId ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all`}
                        />
                        {errors.instagramId && (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.instagramId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                        <Music className="h-3.5 w-3.5 text-emerald-500" /> Spotify Artist Link (If any)
                      </label>
                      <input
                        type="text"
                        name="spotifyId"
                        value={formData.spotifyId}
                        onChange={handleInputChange}
                        placeholder="Link or Spotify URI"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> Why do you want Free Distribution? (Optional)
                      </label>
                      <textarea
                        name="whyFree"
                        value={formData.whyFree}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Tell us about yourself and your future music plans..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all resize-none"
                      />
                    </div>

                    {errors.submit && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>{errors.submit}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:opacity-50 text-[#070709] font-bold text-xs sm:text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-[#070709]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Application...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Free Application
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 px-4 flex flex-col items-center text-center space-y-6"
                >
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative">
                    <CheckCircle className="h-12 w-12 text-emerald-400" />
                    <span className="absolute -inset-1 rounded-full bg-emerald-400/10 animate-ping pointer-events-none duration-1000" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">Application Received!</h3>
                    <p className="text-xs md:text-sm text-emerald-400 uppercase font-black tracking-widest">Currently Under Review</p>
                  </div>

                  <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-md">
                    Thank you. We will evaluate your profile and get back to you with an approval or rejection within 24-48 hours via email or WhatsApp.
                  </p>

                  <div className="pt-6">
                    <button
                      onClick={onBackToMain}
                      className="px-8 py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-white transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Homepage
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
