import { useEffect, useRef, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { Sparkles, Palette, ArrowRight, Star, Play, Flame, Compass, CheckCircle2 } from "lucide-react";
import { store, Post } from "../store";

interface LandingProps {
  onPlayAudio?: (post: Post) => void;
  onOpenAI?: () => void;
}

const ROLE_BY_CATEGORY: Record<string, string> = {
  art: "Digital Artist",
  photography: "Photographer",
  music: "Music Producer",
  writing: "Poet & Writer",
  design: "Designer",
  video: "Video Creator",
  other: "Creator",
};

const CREATIVE_CHALLENGES = [
  { title: "One Color Study", description: "Create using one dominant color shade and high contrast accent lighting.", accent: "#06B6D4", tag: "onecolor", icon: Palette },
  { title: "Midnight Mood", description: "Capture the serene essence of an urban landscape after midnight.", accent: "#A855F7", tag: "midnight", icon: Star },
  { title: "30 Second Micro-Story", description: "Write, composite, or compose a complete miniature world.", accent: "#F97316", tag: "microstory", icon: Flame },
];

// Animated count-up hook
function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// Stat card with count-up
function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  const numericValue = parseInt(value.replace(/,/g, ""), 10) || 0;
  const { count, ref } = useCountUp(numericValue);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, scale: 1.03 }}
      className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-4 py-5 relative overflow-hidden"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
    >
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      <Icon size={16} className="text-purple-400 mb-2" />
      <p className="text-white text-3xl font-extrabold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {count.toLocaleString()}
      </p>
      <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mt-1">{label}</p>
    </motion.div>
  );
}

const HERO_WORDS = ["Where authentic talent"];

export function Landing({ onPlayAudio, onOpenAI }: LandingProps) {
  const showcasePosts = useMemo(() => store.getPosts({ limit: 6 }), []);

  const creators = useMemo(
    () =>
      [...store.users.values()]
        .sort((a, b) => b.followerCount - a.followerCount)
        .slice(0, 4)
        .map(u => ({
          id: u.id,
          name: u.displayName,
          role: ROLE_BY_CATEGORY[u.category] ?? "Creator",
          avatar: u.avatarUrl,
          followers: u.followerCount >= 1000 ? `${(u.followerCount / 1000).toFixed(1)}K` : String(u.followerCount),
        })),
    []
  );

  const landingStats = useMemo(() => {
    const posts = [...store.posts.values()];
    const users = [...store.users.values()];
    const categories = new Set(posts.map(post => post.category));
    return [
      { label: "published works", value: posts.length.toLocaleString(), icon: Sparkles },
      { label: "creator profiles", value: users.length.toLocaleString(), icon: Star },
      { label: "creative fields", value: categories.size.toLocaleString(), icon: Palette },
    ];
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      <div className="relative pt-32 pb-24 px-4 z-10">

        {/* ── Hero ── */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-purple-500/40 bg-purple-500/10 text-purple-200 text-xs font-semibold shadow-lg backdrop-blur-md relative overflow-hidden"
              style={{ boxShadow: "0 0 20px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.1)" }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              />
              <Sparkles size={14} className="text-amber-300 animate-spin-slow" />
              The Premium Creative Universe
            </motion.div>

            {/* H1 — staggered word reveal */}
            <h1
              className="text-5xl md:text-7xl mb-6 leading-none tracking-tight font-extrabold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white block"
              >
                Where authentic talent
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.38 }}
                className="text-transparent bg-clip-text block"
                style={{
                  backgroundImage: "linear-gradient(135deg, #c084fc, #f472b6, #fb923c, #c084fc)",
                  backgroundSize: "200% 200%",
                  animation: "gradient-x 4s ease infinite",
                }}
              >
                glows brighter
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              TalentVerse is a sanctuary for digital artists, musicians, writers, and photographers to showcase their creations in real-time.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.62 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/auth?mode=register"
                  className="group relative inline-flex items-center gap-2 px-9 py-4 rounded-full text-white font-bold transition-all duration-300 shadow-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #A855F7, #EC4899, #F97316)",
                    boxShadow: "0 0 40px rgba(168, 85, 247, 0.45), 0 0 80px rgba(236,72,153,0.2)",
                  }}
                >
                  {/* Shimmer */}
                  <motion.span
                    className="absolute inset-0 bg-white/15 skew-x-[-20deg]"
                    initial={{ x: "-150%" }}
                    animate={{ x: "250%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
                  />
                  Ignite Your Creative Spark
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/feed"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-gray-200 border border-white/20 hover:border-purple-500/60 hover:text-white font-semibold transition-all duration-300 bg-white/5 backdrop-blur-xl"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
                >
                  <Compass size={18} className="text-cyan-400" />
                  Explore Universe
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-14">
              {landingStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Featured Showcase Grid ── */}
        <div className="max-w-6xl mx-auto mt-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3">
                <Play size={12} /> Featured Works
              </div>
              <h2
                className="text-white font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem" }}
              >
                Featured Creative Expressions
              </h2>
              <p className="text-gray-400 text-base mt-1">Tap any work to view details or play audio</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcasePosts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.94, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                >
                  <div
                    className="relative group rounded-3xl overflow-hidden border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl shadow-xl hover:border-purple-500/40 transition-all duration-300"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
                  >
                    {/* Hover glow border */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.12)" }} />

                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                      {/* Top shimmer edge on hover */}
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {p.category === "music" && (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onPlayAudio?.(p)}
                          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-purple-500/50"
                        >
                          <Play size={22} className="ml-0.5" />
                        </motion.button>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40 mb-2 inline-block">
                          {p.category}
                        </span>
                        <Link
                          to={`/post/${p.id}`}
                          className="block text-white text-lg font-bold hover:text-purple-300 transition-colors"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {p.title}
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Featured Creators ── */}
        <div className="max-w-5xl mx-auto mt-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
                <Star size={12} /> Verified Creators
              </div>
              <h2
                className="text-white font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem" }}
              >
                Top Verified Creators
              </h2>
              <p className="text-gray-400">Discover master creators behind the finest works</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {creators.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <Link
                    to={`/profile/${c.id}`}
                    className="group block text-center p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 shadow-xl relative overflow-hidden"
                  >
                    {/* Hover shimmer */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)" }} />

                    {/* Avatar with rotating gradient ring */}
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "conic-gradient(from 0deg, #A855F7, #EC4899, #06B6D4, #A855F7)", filter: "blur(3px)" }}
                      />
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/40 group-hover:border-transparent transition-colors">
                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <p className="text-white text-base font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</p>
                    <p className="text-gray-400 text-xs mb-3">{c.role}</p>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors">
                      {c.followers} followers
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Weekly Sparks Challenges ── */}
        <div className="max-w-5xl mx-auto mt-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-3">
                  <Flame size={12} /> Weekly Challenges
                </div>
                <h2
                  className="text-white font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem" }}
                >
                  Weekly Sparks Challenges
                </h2>
                <p className="text-gray-400">Join community prompt challenges and unleash your creativity</p>
              </div>
              <Link to="/create" className="inline-flex items-center gap-2 text-sm text-purple-300 font-semibold hover:text-white transition-colors">
                Start a Challenge <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CREATIVE_CHALLENGES.map((challenge, i) => (
                <motion.div
                  key={challenge.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  whileHover={{ y: -6 }}
                  className="group rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 relative overflow-hidden transition-all duration-300"
                >
                  {/* Animated border shimmer on hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 0 1px ${challenge.accent}50, 0 0 30px ${challenge.accent}18` }}
                  />
                  {/* Top glow line */}
                  <div
                    className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${challenge.accent}80, transparent)` }}
                  />

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-11 h-11 rounded-2xl mb-5 flex items-center justify-center shadow-lg transition-all"
                    style={{ background: `${challenge.accent}22`, color: challenge.accent, boxShadow: `0 0 16px ${challenge.accent}30` }}
                  >
                    <challenge.icon size={20} />
                  </motion.div>

                  <h3 className="text-white text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{challenge.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{challenge.description}</p>
                  <Link
                    to="/create"
                    className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                    style={{ color: challenge.accent }}
                  >
                    Accept Prompt #{challenge.tag} <ArrowRight size={13} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── CTA Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto mt-28 text-center p-12 rounded-3xl border border-purple-500/25 relative overflow-hidden backdrop-blur-2xl shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(88,28,135,0.3) 0%, rgba(131,24,67,0.2) 50%, rgba(88,28,135,0.3) 100%)",
          }}
        >
          {/* Animated gradient sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.1), rgba(236,72,153,0.08), transparent)",
              backgroundSize: "200% 100%",
            }}
          />

          {/* Floating sparkle particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.2, 0.7, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2.5 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            >
              <Sparkles size={12 + (i % 3) * 4} className="text-purple-400" />
            </motion.div>
          ))}

          <div className="relative z-10">
            <h2
              className="text-white mb-4 font-extrabold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.6rem" }}
            >
              Ready to Share Your Masterpiece?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">Join the premium community of creators and ignite your artistic spark today.</p>
            <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/auth?mode=register"
                className="relative inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #EC4899, #F97316)",
                  boxShadow: "0 0 50px rgba(168, 85, 247, 0.55)",
                }}
              >
                <motion.span
                  className="absolute inset-0 bg-white/15 skew-x-[-20deg]"
                  initial={{ x: "-150%" }}
                  animate={{ x: "250%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
                />
                <Sparkles size={20} />
                Start Creating Free
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
