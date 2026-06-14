import React, { useState, useEffect } from "react";
import { X, CheckCircle, Music, Sparkles, Send, Youtube, Instagram, MessageSquare, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import Logo from "./Logo";

interface FreeDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreeDistributionModal({ isOpen, onClose }: FreeDistributionModalProps) {
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

  // Close on Escape modal listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

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
      newErrors.contactNumber = "WhatsApp reach contact number is required";
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

      // Try inserting into Supabase free_applications table
      let remoteAppId: string | null = null;
      try {
        const { data, error } = await supabase
          .from("free_applications")
          .insert([dbPayload])
          .select();

        if (error) {
          console.warn("Supabase insert error for free_applications (reconciling locally):", error);
        } else if (data && data[0]) {
          remoteAppId = data[0].id;
        }
      } catch (dbErr) {
        console.warn("Could not write free application to Supabase, writing to local storage.", dbErr);
      }

      // Reconcile and commit locally to guarantee offline operations work
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

      // Trigger standard sync notification event
      window.dispatchEvent(new CustomEvent("wavora_free_applications_updated"));

      // Standard artificial user feel optimization delay
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#06060A]/85 backdrop-blur-md cursor-pointer"
            id="free-modal-overlay"
          />

          {/* Modal Content Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0F] shadow-[0_0_50px_rgba(139,92,246,0.15)] z-10 text-white flex flex-col font-sans max-h-[90vh]"
            id="free-modal-wrapper"
          >
            {/* Top Glowing Gradient Line */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400" />

            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between pb-4 bg-white/2">
              <div className="flex items-center gap-3">
                <Logo hideTagline={true} width={105} height={30} className="h-7 w-auto shrink-0" />
                <div className="h-5 w-[1px] bg-white/15" />
                <div>
                  <h3 className="text-[10px] font-black tracking-wider uppercase text-emerald-400" id="free-modal-title">
                    Free Distribution Application
                  </h3>
                  <p className="text-[8px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">Selective Entry</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-y-auto p-6 space-y-6">
              {!isSubmitted ? (
                <>
                  {/* Informational Banner */}
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Selective Distribution Plan</h4>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
                      We offer free global distribution for ambitious acts. Please note that **applications are reviewed selectively**. Our curators evaluate your digital footprint, consistency, and sound identity before onboarding.
                    </p>
                    <div className="pt-2 grid grid-cols-2 gap-3 border-t border-emerald-500/10 mt-2">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-500 uppercase tracking-wider block">Royalty Split</span>
                        <span className="text-[11px] font-bold text-emerald-400">70% to Artist</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-500 uppercase tracking-wider block">Turnaround Time</span>
                        <span className="text-[11px] font-bold text-emerald-400">7-Day Release Turnaround</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-500 uppercase tracking-wider block">Support Channels</span>
                        <span className="text-[11px] font-bold text-emerald-400">WhatsApp support only</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-500 uppercase tracking-wider block">Dashboard access</span>
                        <span className="text-[11px] font-bold text-emerald-400">Full Workspace access</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Real Name & Artist Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">
                          Artist Name *
                        </label>
                        <input
                          type="text"
                          name="artistName"
                          value={formData.artistName}
                          onChange={handleInputChange}
                          placeholder="e.g. DJ Storm"
                          className={`w-full bg-white/3 border ${errors.artistName ? "border-red-500" : "border-white/10"} rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all`}
                        />
                        {errors.artistName && (
                          <span className="text-[9px] text-red-400 flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                            {errors.artistName}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">
                          Real Name *
                        </label>
                        <input
                          type="text"
                          name="realName"
                          value={formData.realName}
                          onChange={handleInputChange}
                          placeholder="e.g. Aryan Sehgal"
                          className={`w-full bg-white/3 border ${errors.realName ? "border-red-500" : "border-white/10"} rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all`}
                        />
                        {errors.realName && (
                          <span className="text-[9px] text-red-400 flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                            {errors.realName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email & Contact Number Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="artist@example.com"
                          className={`w-full bg-white/3 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all`}
                        />
                        {errors.email && (
                          <span className="text-[9px] text-red-400 flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                            {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">
                          Contact Number (WhatsApp) *
                        </label>
                        <input
                          type="text"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          placeholder="+91 XXXXX XXXXX"
                          className={`w-full bg-white/3 border ${errors.contactNumber ? "border-red-500" : "border-white/10"} rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all`}
                        />
                        {errors.contactNumber && (
                          <span className="text-[9px] text-red-400 flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                            {errors.contactNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Social links handles: YouTube & Instagram */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block flex items-center gap-1">
                          <Youtube className="h-3 w-3 text-red-500" /> YouTube Channel
                        </label>
                        <input
                          type="text"
                          name="youtubeChannel"
                          value={formData.youtubeChannel}
                          onChange={handleInputChange}
                          placeholder="e.g. youtube.com/@live"
                          className="w-full bg-white/3 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block flex items-center gap-1">
                          <Instagram className="h-3 w-3 text-pink-500" /> Instagram Username *
                        </label>
                        <input
                          type="text"
                          name="instagramId"
                          value={formData.instagramId}
                          onChange={handleInputChange}
                          placeholder="@username"
                          className={`w-full bg-white/3 border ${errors.instagramId ? "border-red-500" : "border-white/10"} rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all`}
                        />
                        {errors.instagramId && (
                          <span className="text-[9px] text-red-400 flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                            {errors.instagramId}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spotify ID */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block flex items-center gap-1">
                        <Music className="h-3 w-3 text-emerald-500" /> Spotify Artist link (if any)
                      </label>
                      <input
                        type="text"
                        name="spotifyId"
                        value={formData.spotifyId}
                        onChange={handleInputChange}
                        placeholder="Link or Spotify URI"
                        className="w-full bg-white/3 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    {/* Why free distribution */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> Why do you want Free Distribution? (Optional)
                      </label>
                      <textarea
                        name="whyFree"
                        value={formData.whyFree}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Tell us about yourself and your future music plans..."
                        className="w-full bg-white/3 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:opacity-50 text-[#070709] font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
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
                          <Send className="h-3.5 w-3.5" />
                          Apply for Free Onboarding
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Dynamic Success Pop-up inside modal */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 px-4 flex flex-col items-center text-center space-y-6"
                  id="free-success-screen"
                >
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative">
                    <CheckCircle className="h-10 w-10 text-emerald-400" />
                    <span className="absolute -inset-1 rounded-full bg-emerald-400/10 animate-ping pointer-events-none duration-1000" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white font-sans">Form Submitted Successfully!</h3>
                    <p className="text-xs text-emerald-400 uppercase font-black tracking-widest">Application Under Verification</p>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
                    We will get through your form soon, we'll notify approval or rejection in 24-48 hours in your email.
                  </p>

                  <div className="h-[1px] w-full bg-white/10 my-4" />

                  <button
                    onClick={() => {
                      onClose();
                      setIsSubmitted(false);
                      setFormData({
                        artistName: "",
                        realName: "",
                        email: "",
                        contactNumber: "",
                        youtubeChannel: "",
                        instagramId: "",
                        spotifyId: "",
                        whyFree: "",
                      });
                    }}
                    className="px-6 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                  >
                    Close Window
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
