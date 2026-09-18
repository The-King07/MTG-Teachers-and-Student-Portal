import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react";
import { Bookmark, Heart, MessageCircle, Trash2, Play, Sparkles, Clock } from "lucide-react";
import type { Post, User } from "../store";
import * as api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../lib/time";

interface PostCardProps {
  post: Post;
  author: User;
  onDelete?: (postId: string) => void;
  onPlayAudio?: (post: Post) => void;
}

const CATEGORY_COLORS: Record<string, { gradient: string; glow: string; shadow: string }> = {
  art:          { gradient: "from-purple-500 to-pink-500",   glow: "rgba(168,85,247,0.35)",  shadow: "0 8px 32px rgba(168,85,247,0.25)" },
  music:        { gradient: "from-blue-500 to-cyan-400",     glow: "rgba(59,130,246,0.35)",  shadow: "0 8px 32px rgba(59,130,246,0.25)" },
  writing:      { gradient: "from-emerald-500 to-teal-400",  glow: "rgba(16,185,129,0.35)",  shadow: "0 8px 32px rgba(16,185,129,0.25)" },
  photography:  { gradient: "from-orange-500 to-amber-400",  glow: "rgba(249,115,22,0.35)",  shadow: "0 8px 32px rgba(249,115,22,0.25)" },
  design:       { gradient: "from-violet-500 to-purple-400", glow: "rgba(139,92,246,0.35)",  shadow: "0 8px 32px rgba(139,92,246,0.25)" },
  video:        { gradient: "from-red-500 to-rose-400",      glow: "rgba(239,68,68,0.35)",   shadow: "0 8px 32px rgba(239,68,68,0.25)" },
  other:        { gradient: "from-gray-500 to-slate-400",    glow: "rgba(100,116,139,0.35)", shadow: "0 8px 32px rgba(100,116,139,0.25)" },
};

const SAVED_POSTS_KEY = "talentverse_saved_posts_v1";

function readSavedPosts(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVED_POSTS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

// Starburst particle for like
function HeartBurst({ trigger }: { trigger: number }) {
  const PARTICLES = 8;
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <>
          {Array.from({ length: PARTICLES }).map((_, i) => {
            const angle = (i / PARTICLES) * 360;
            const rad = (angle * Math.PI) / 180;
            const dist = 22 + Math.random() * 10;
            const tx = Math.cos(rad) * dist;
            const ty = Math.sin(rad) * dist;
            return (
              <motion.span
                key={`${trigger}-${i}`}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-1.5 h-1.5 rounded-full bg-pink-400 pointer-events-none"
                style={{ top: "50%", left: "50%", marginTop: -3, marginLeft: -3 }}
              />
            );
          })}
        </>
      )}
    </AnimatePresence>
  );
}

export function PostCard({ post, author, onDelete, onPlayAudio }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liking, setLiking] = useState(false);
  const [burst, setBurst] = useState(0);
  const [saved, setSaved] = useState(false);

  // 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [7, -7]), { stiffness: 400, damping: 28 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-7, 7]), { stiffness: 400, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  useEffect(() => {
    setLikeCount(post.likeCount);
    setSaved(readSavedPosts().has(post.id));
    if (!user) { setLiked(false); return; }
    let alive = true;
    api.isPostLiked(post.id).then(isLiked => { if (alive) setLiked(isLiked); });
    return () => { alive = false; };
  }, [post.id, post.likeCount, user]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const savedPosts = readSavedPosts();
    if (savedPosts.has(post.id)) { savedPosts.delete(post.id); setSaved(false); }
    else { savedPosts.add(post.id); setSaved(true); }
    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify([...savedPosts]));
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user || liking) return;
    setLiking(true);
    try {
      if (liked) {
        await api.unlikePost(post.id);
        setLiked(false); setLikeCount(c => c - 1);
      } else {
        await api.likePost(post.id);
        setLiked(true); setLikeCount(c => c + 1);
        setBurst(b => b + 1);
      }
    } finally { setLiking(false); }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this post?")) return;
    await api.deletePost(post.id);
    onDelete?.(post.id);
  };

  const handleAudioPlay = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    onPlayAudio?.(post);
  };

  const cat = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.other;
  const isOwner = user?.id === post.authorId;

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000"
    >
      <Link to={`/post/${post.id}`} className="group block">
        <div
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#1E293B]/70 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50"
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
            transition: "box-shadow 0.3s ease, border-color 0.3s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = cat.shadow; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.35)"; }}
        >
          {/* Image */}
          <div className="aspect-[4/3] overflow-hidden relative">
            <img
              src={post.imageUrl}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-black/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

            {/* Top shimmer line on hover */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            {/* Category pill */}
            <span className={`absolute top-3 left-3 text-[10px] font-bold text-white px-3 py-1 rounded-full bg-gradient-to-r ${cat.gradient} shadow-md uppercase tracking-wider`}>
              {post.category}
            </span>

            {/* Audio play button */}
            {post.category === "music" && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleAudioPlay}
                className="absolute inset-0 m-auto w-13 h-13 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-purple-500/50"
                style={{ width: 52, height: 52 }}
                title="Play Audio Spectrum"
              >
                <Play size={20} className="ml-0.5" />
              </motion.button>
            )}

            {/* Delete button (owner) */}
            {isOwner && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Delete post"
              >
                <Trash2 size={14} />
              </motion.button>
            )}

            {/* Save button */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className={`absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center transition-all ${
                saved ? "text-amber-300 bg-amber-500/20 border border-amber-500/40" : "text-gray-300 hover:text-white hover:bg-black/80"
              }`}
              aria-label={saved ? "Remove from saved" : "Save post"}
            >
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3
              className="text-white text-base mb-1.5 line-clamp-1 group-hover:text-purple-300 transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
            >
              {post.title}
            </h3>
            <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">{post.description}</p>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium hover:bg-purple-500/20 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-3 border-t border-white/[0.07]"
              style={{ background: "linear-gradient(90deg, rgba(168,85,247,0.04), transparent, rgba(236,72,153,0.04))" }}
            >
              <Link
                to={`/profile/${author.id}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-2.5 group/author"
              >
                <img
                  src={author.avatarUrl}
                  alt={author.displayName}
                  className="w-7 h-7 rounded-full border border-purple-500/30 group-hover/author:border-purple-400 transition-colors"
                />
                <div>
                  <span className="text-gray-300 text-xs font-semibold group-hover/author:text-white transition-colors block truncate max-w-[90px]">
                    {author.displayName}
                  </span>
                  <span className="text-gray-500 text-[10px] flex items-center gap-0.5">
                    <Clock size={9} />
                    {timeAgo(post.createdAt)}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                {/* Like button with starburst */}
                <button
                  onClick={handleLike}
                  className={`relative flex items-center gap-1.5 transition-colors ${liked ? "text-pink-400" : "hover:text-pink-400"}`}
                >
                  <HeartBurst trigger={burst} />
                  <motion.span
                    key={liked ? "on" : "off"}
                    initial={{ scale: liked ? 0.5 : 1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 15 }}
                  >
                    <Heart size={14} fill={liked ? "currentColor" : "none"} />
                  </motion.span>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={likeCount}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {likeCount}
                    </motion.span>
                  </AnimatePresence>
                </button>

                <span className="flex items-center gap-1">
                  <MessageCircle size={14} />
                  {post.commentCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
