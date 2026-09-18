import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { motion, useInView } from "motion/react";
import { toast } from "sonner";
import { Users, Heart, Edit3, Check, X, Loader2, Award, TrendingUp, Eye, Sparkles, BarChart2, Grid } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PostCard } from "../components/PostCard";
import * as api from "../services/api";
import { store } from "../store";
import type { User, Post } from "../store";
import { useAuth } from "../context/AuthContext";

interface ProfileProps {
  onPlayAudio?: (post: Post) => void;
}

// Animated count-up for profile stats
function AnimatedStat({ value, label }: { value: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const step = value / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div ref={ref} className="rounded-2xl bg-white/5 p-4 border border-white/5 text-center hover:bg-white/[0.08] transition-colors">
      <p className="text-white text-2xl font-extrabold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {count.toLocaleString()}
      </p>
      <p className="text-gray-400 text-xs uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

// Ripple effect for follow button
function RippleButton({ onClick, children, className, style }: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
    onClick();
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden ${className}`} style={style}>
      {ripples.map(r => (
        <motion.span
          key={r.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 6, opacity: 0 }}
          transition={{ duration: 0.55 }}
        />
      ))}
      {children}
    </button>
  );
}

export function Profile({ onPlayAudio }: ProfileProps) {
  const { id } = useParams<{ id: string }>();
  const { user: me, refreshUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editName, setEditName] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"works" | "analytics">("works");

  const isMe = me?.id === id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getUser(id),
      api.getPosts({ authorId: id }),
      me ? api.isFollowing(id) : Promise.resolve(false),
    ]).then(([u, ps, f]) => {
      setProfile(u);
      setPosts(ps);
      setFollowing(f);
      setEditBio(u.bio);
      setEditName(u.displayName);
      setEditSkills(u.skills.join(", "));
      setLoading(false);
    });
  }, [id, me]);

  const handleFollow = async () => {
    if (!me) return;
    if (following) {
      await api.unfollowUser(id!);
      setFollowing(false);
      setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount - 1 } : prev);
      toast.success(`Unfollowed @${profile?.username}`);
    } else {
      await api.followUser(id!);
      setFollowing(true);
      setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount + 1 } : prev);
      toast.success(`Now following ${profile?.displayName} 🎉`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const skillsArray = editSkills.split(",").map(s => s.trim()).filter(Boolean);
    const updated = await api.updateUser(id!, { bio: editBio, displayName: editName, skills: skillsArray });
    setProfile(updated);
    setEditing(false);
    setSaving(false);
    refreshUser();
    toast.success("Profile updated!");
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setProfile(prev => prev ? { ...prev, postCount: prev.postCount - 1 } : prev);
  };

  const analyticsData = [
    { month: "Jan", views: 420, likes: 180 },
    { month: "Feb", views: 780, likes: 320 },
    { month: "Mar", views: 1250, likes: 540 },
    { month: "Apr", views: 2100, likes: 890 },
    { month: "May", views: 3400, likes: 1420 },
    { month: "Jun", views: profile ? profile.followerCount * 4 : 4500, likes: profile ? profile.followerCount * 2 : 2100 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 size={32} className="text-purple-400" />
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-transparent">
      {/* Hero Banner */}
      <div className="w-full h-52 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F97316 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&q=80') center/cover",
            mixBlendMode: "overlay",
            opacity: 0.35,
          }}
        />
        {/* Animated gradient sweep on banner */}
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="-mt-20 mb-8 rounded-3xl border border-white/10 bg-[#1E293B]/85 backdrop-blur-2xl p-6 shadow-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(168,85,247,0.1), 0 24px 64px rgba(0,0,0,0.5)" }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar with rotating gradient ring */}
              <div className="relative group flex-shrink-0">
                {/* Rotating orbit ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 rounded-[2rem]"
                  style={{
                    background: "conic-gradient(from 0deg, #A855F7, #EC4899, #F97316, #06B6D4, #A855F7)",
                    filter: "blur(4px)",
                    opacity: 0.7,
                  }}
                />
                <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-[#1E293B] shadow-2xl">
                  <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                </div>
                <div
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1.5 shadow-lg border-2 border-[#1E293B]"
                  title="Verified TalentVerse Creator"
                >
                  <Award size={14} className="text-white" />
                </div>
              </div>

              <div className="space-y-1 pb-1">
                {editing ? (
                  <div className="space-y-2 max-w-md">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Display Name"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-purple-500/60 font-semibold focus:shadow-[0_0_0_2px_rgba(168,85,247,0.15)]"
                    />
                    <textarea
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      rows={2}
                      placeholder="Bio..."
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-purple-500/60 resize-none focus:shadow-[0_0_0_2px_rgba(168,85,247,0.15)]"
                    />
                    <input
                      value={editSkills}
                      onChange={e => setEditSkills(e.target.value)}
                      placeholder="Skills (comma separated)..."
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs w-full focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_0_2px_rgba(168,85,247,0.15)]"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {profile.displayName}
                      </h1>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-semibold">
                        {profile.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">@{profile.username}</p>
                    {profile.bio && <p className="text-gray-300 text-sm max-w-xl pt-1 leading-relaxed">{profile.bio}</p>}
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 self-stretch md:self-end justify-end">
              {isMe ? (
                editing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity"
                      style={{ background: "linear-gradient(135deg, #A855F7, #EC4899)", boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Save Profile
                    </motion.button>
                    <button
                      onClick={() => setEditing(false)}
                      className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm hover:bg-white/5 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-gray-200 hover:text-white text-sm font-semibold transition-all hover:bg-white/10 hover:border-white/25"
                  >
                    <Edit3 size={15} /> Edit Profile
                  </motion.button>
                )
              ) : me ? (
                <RippleButton
                  onClick={handleFollow}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    following
                      ? "border border-white/10 bg-white/5 text-gray-300 hover:text-red-400 hover:border-red-500/20"
                      : "text-white hover:opacity-90 shadow-lg"
                  }`}
                  style={following ? {} : {
                    background: "linear-gradient(135deg, #A855F7, #EC4899)",
                    boxShadow: "0 0 20px rgba(168,85,247,0.3)",
                  }}
                >
                  {following ? "Following" : "Follow Creator"}
                </RippleButton>
              ) : (
                <Link
                  to="/auth"
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #A855F7, #EC4899)" }}
                >
                  Follow
                </Link>
              )}
            </div>
          </div>

          {/* Skills Badges */}
          {profile.skills.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-5 pt-4 border-t border-white/10">
              {profile.skills.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="text-xs px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-300 bg-purple-500/10 font-medium cursor-default"
                  style={{ boxShadow: "0 0 10px rgba(168,85,247,0.12)" }}
                >
                  ✦ {s}
                </motion.span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10">
            <AnimatedStat value={profile.postCount} label="Works" />
            <AnimatedStat value={profile.followerCount} label="Followers" />
            <AnimatedStat value={profile.followingCount} label="Following" />
          </div>
        </motion.div>

        {/* Tab Switcher with animated underline */}
        <div className="relative flex gap-3 mb-6 border-b border-white/10 pb-0">
          {(["works", "analytics"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === tab ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab === "works" ? <Grid size={15} /> : <BarChart2 size={15} />}
              {tab === "works" ? `Created Works (${posts.length})` : "Analytics & Growth"}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #A855F7, #EC4899)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "works" ? (
          <div className="pb-16">
            {posts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                <Sparkles size={32} className="text-purple-400/50 mx-auto mb-3" />
                <p className="text-gray-400 text-base mb-2">No creative works published yet</p>
                {isMe && (
                  <Link to="/create" className="text-sm font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                    Publish your first work →
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PostCard post={post} author={profile} onDelete={handleDeletePost} onPlayAudio={onPlayAudio} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="pb-16 space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Eye, color: "text-purple-400", border: "border-purple-500/20", label: "Total Work Impressions", value: "12,480", trend: "↑ +28% this month", trendColor: "text-emerald-400" },
                { icon: Heart, color: "text-pink-400", border: "border-pink-500/20", label: "Appreciation Rate", value: "94.2%", trend: `Top 5% in ${profile.category}`, trendColor: "text-pink-300" },
                { icon: TrendingUp, color: "text-cyan-400", border: "border-cyan-500/20", label: "Creator Score", value: "980 / 1000", trend: "Ultra Pro Creator Badge", trendColor: "text-cyan-300" },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-3xl border ${card.border} bg-[#1E293B]/80 p-5 backdrop-blur-xl relative overflow-hidden`}
                >
                  <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                  <div className={`flex items-center gap-2 ${card.color} mb-2`}>
                    <card.icon size={18} />
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">{card.label}</span>
                  </div>
                  <p className="text-white text-3xl font-extrabold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{card.value}</p>
                  <p className={`${card.trendColor} text-xs font-semibold mt-1`}>{card.trend}</p>
                </motion.div>
              ))}
            </div>

            {/* Area Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-white/10 bg-[#1E293B]/80 p-6 backdrop-blur-xl"
            >
              <h3 className="text-white text-base font-bold mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Growth & Engagement Trend (6 Months)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        borderColor: "#A855F7",
                        borderRadius: "14px",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(168,85,247,0.2)",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" name="Views" />
                    <Area type="monotone" dataKey="likes" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#colorLikes)" name="Likes" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
