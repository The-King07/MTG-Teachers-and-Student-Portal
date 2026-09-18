import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Upload, Loader2, ArrowLeft, Sparkles, Tag, X, Paintbrush, Link2, Sparkle } from "lucide-react";
import * as api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Category } from "../store";
import { DigitalCanvas } from "../components/DigitalCanvas";

interface CreatePostProps {
  onOpenAI?: () => void;
}

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Art", value: "art" },
  { label: "Photography", value: "photography" },
  { label: "Music", value: "music" },
  { label: "Writing", value: "writing" },
  { label: "Design", value: "design" },
  { label: "Video", value: "video" },
  { label: "Other", value: "other" },
];

const PLACEHOLDER_IMAGES: Record<Category, string> = {
  art: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
  photography: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
  music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
  writing: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
  design: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
  video: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
  other: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
};

export function CreatePost({ onOpenAI }: CreatePostProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<Category>("art");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "draw">("url");

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "#0F172A" }}>
        <div className="text-center">
          <p className="text-gray-400 mb-4">Sign in to share your work</p>
          <Link to="/auth" className="text-purple-400 hover:text-purple-300 font-semibold">Sign in →</Link>
        </div>
      </div>
    );
  }

  const previewUrl = imageUrl || PLACEHOLDER_IMAGES[category];

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    setError("");
    setLoading(true);
    try {
      const post = await api.createPost({
        title: title.trim(),
        description: description.trim(),
        imageUrl: previewUrl,
        category,
        tags,
      });
      toast.success("Published! Your work is live in the TalentVerse ✨");
      navigate(`/profile/${user.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:bg-purple-500/5 transition-all text-sm";

  return (
    <div
      className="min-h-screen pt-20 pb-16 bg-transparent"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/feed" className="w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
                Create New Work
              </h1>
              <p className="text-gray-400 text-sm">Publish your authentic creation to the universe</p>
            </div>
          </div>

          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition-all"
          >
            <Sparkles size={14} /> Get AI Spark Prompt
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2.5">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        category === c.value
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                          : "border border-white/10 text-gray-400 hover:text-white bg-white/5"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">Work Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Give your work a name…"
                  className={inputClass}
                  maxLength={80}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">Story / Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell the inspiration and story behind this creation…"
                  rows={4}
                  className={`${inputClass} resize-none`}
                  maxLength={600}
                />
              </div>

              {/* Image Input Switcher: URL vs Digital Canvas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider">Artwork Media</label>
                  <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        imageMode === "url" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Link2 size={12} /> Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("draw")}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        imageMode === "draw" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Paintbrush size={12} /> Paint Studio
                    </button>
                  </div>
                </div>

                {imageMode === "url" ? (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://… (leave blank for default category wallpaper)"
                    className={inputClass}
                  />
                ) : (
                  <DigitalCanvas onExportImage={dataUrl => setImageUrl(dataUrl)} />
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">Tags (up to 5)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Type tag & hit Enter..."
                      className={`${inputClass} pl-9`}
                      disabled={tags.length >= 5}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={tags.length >= 5 || !tagInput.trim()}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white disabled:opacity-40 text-xs font-semibold transition-colors"
                  >
                    Add Tag
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2.5">
                    {tags.map(t => (
                      <span key={t} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold">
                        #{t}
                        <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                          <X size={12} className="hover:text-white ml-0.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 hover:scale-[1.01] shadow-2xl shadow-purple-500/30 disabled:opacity-60 disabled:scale-100"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #EC4899, #F97316)",
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? "Publishing Work…" : "Publish to TalentVerse"}
              </button>
            </form>
          </motion.div>

          {/* Live Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit space-y-3"
          >
            <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">Live Work Preview</p>
            <div className="rounded-3xl overflow-hidden border border-purple-500/30 bg-[#1E293B]/80 backdrop-blur-2xl shadow-2xl">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.other; }}
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold text-white px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 uppercase tracking-wider">
                  {category}
                </span>
              </div>
              <div className="p-5">
                <p className="text-white text-base font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {title || "Your Work Title Here"}
                </p>
                <p className="text-gray-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                  {description || "The story and inspiration behind your work will be displayed here..."}
                </p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-white/10">
                  <img src={user.avatarUrl} alt={user.displayName} className="w-7 h-7 rounded-full border border-purple-500/30" />
                  <span className="text-gray-300 text-xs font-semibold">{user.displayName}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
