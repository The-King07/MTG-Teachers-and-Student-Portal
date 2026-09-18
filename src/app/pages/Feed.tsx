import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Clock3, Flame, Search, SlidersHorizontal, Sparkles, TrendingUp, Users, MessageSquare, X } from "lucide-react";
import { PostCard } from "../components/PostCard";
import * as api from "../services/api";
import { store } from "../store";
import type { Post, User, Category } from "../store";

interface FeedProps {
  onPlayAudio?: (post: Post) => void;
  onOpenAI?: () => void;
}

const CATEGORIES: { label: string; value: Category | "all"; emoji: string }[] = [
  { label: "All Works",    value: "all",         emoji: "✦" },
  { label: "Art",          value: "art",          emoji: "🎨" },
  { label: "Photography",  value: "photography",  emoji: "📷" },
  { label: "Music",        value: "music",        emoji: "🎵" },
  { label: "Writing",      value: "writing",      emoji: "✍️" },
  { label: "Design",       value: "design",       emoji: "🖌️" },
  { label: "Video",        value: "video",        emoji: "🎬" },
];

export function Feed({ onPlayAudio, onOpenAI }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Map<string, User>>(new Map());
  const [category, setCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "discussed">("newest");
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  const stats = useMemo(() => {
    const allPosts = [...store.posts.values()];
    const allUsers = [...store.users.values()];
    return [
      { label: "Works shared",    value: allPosts.length.toLocaleString(),                                icon: Sparkles,      color: "text-purple-400" },
      { label: "Creators",        value: allUsers.length.toLocaleString(),                               icon: Users,         color: "text-pink-400" },
      { label: "Total reactions", value: allPosts.reduce((sum, p) => sum + p.likeCount, 0).toLocaleString(), icon: Flame,    color: "text-amber-400" },
    ];
  }, [posts.length]);

  const featuredCreators = useMemo(
    () => [...store.users.values()].sort((a, b) => b.followerCount - a.followerCount).slice(0, 4),
    [posts.length]
  );

  const loadPosts = async (cat: Category | "all") => {
    setLoading(true);
    const fetched = await api.getPosts(cat === "all" ? {} : { category: cat });
    setPosts(fetched);
    const authorMap = new Map<string, User>();
    for (const p of fetched) {
      if (!authorMap.has(p.authorId)) {
        const u = store.getUser(p.authorId);
        if (u) authorMap.set(p.authorId, u);
      }
    }
    setAuthors(authorMap);
    setLoading(false);
  };

  useEffect(() => { loadPosts(category); }, [category]);

  const handleDelete = (postId: string) => setPosts(prev => prev.filter(p => p.id !== postId));

  const trendingTags = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach(post => post.tags.forEach(tag => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts
      .filter(p => {
        const author = authors.get(p.authorId);
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)) ||
          author?.displayName.toLowerCase().includes(q) ||
          author?.username.toLowerCase().includes(q);
        const matchesTag = !activeTag || p.tags.includes(activeTag);
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return b.likeCount - a.likeCount;
        if (sortBy === "discussed") return b.commentCount - a.commentCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [activeTag, authors, posts, search, sortBy]);

  return (
    <div className="min-h-screen pt-20 bg-transparent">
      <div className="relative max-w-7xl mx-auto px-4 py-8 z-10">

        {/* Header */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-end">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 text-xs text-cyan-300 border border-cyan-400/25 bg-cyan-400/10 backdrop-blur-md rounded-full px-3.5 py-1 mb-3 font-semibold">
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <TrendingUp size={13} />
              </motion.span>
              Live Creative Feed
            </div>
            <h1 className="text-white mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.5rem", fontWeight: 800 }}>
              Discover Works
            </h1>
            <p className="text-gray-400 max-w-2xl text-sm">Explore authentic creations from artists, musicians, writers, and makers.</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -3, scale: 1.03 }}
                className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-4 py-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                <Icon size={16} className={`${color} mb-1`} />
                <p className="text-white text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
                <p className="text-gray-400 text-[11px] font-medium leading-tight">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search + Sort */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? "text-purple-400" : "text-gray-500"}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search works, creators, or tags…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-white/5 backdrop-blur-xl text-white placeholder-gray-500 focus:outline-none text-sm transition-all"
              style={{
                borderColor: searchFocused ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.1)",
                boxShadow: searchFocused ? "0 0 0 3px rgba(168,85,247,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort pills */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-1.5">
            {[
              { label: "Newest",    value: "newest"    as const, icon: Clock3 },
              { label: "Popular",   value: "popular"   as const, icon: Flame },
              { label: "Discussed", value: "discussed" as const, icon: MessageSquare },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setSortBy(item.value)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  sortBy === item.value ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {sortBy === item.value && (
                  <motion.div
                    layoutId="sort-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "linear-gradient(135deg, #A855F7, #EC4899)", boxShadow: "0 0 12px rgba(168,85,247,0.3)" }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <item.icon size={14} />
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 flex-wrap mb-5"
        >
          {CATEGORIES.map(c => (
            <motion.button
              key={c.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setCategory(c.value); setActiveTag(""); }}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                category === c.value
                  ? "text-white shadow-lg"
                  : "border border-white/10 text-gray-300 hover:text-white hover:border-purple-500/40 bg-white/5 backdrop-blur-xl"
              }`}
              style={category === c.value ? {
                background: "linear-gradient(135deg, #A855F7, #EC4899)",
                boxShadow: "0 0 16px rgba(168,85,247,0.35)",
              } : {}}
            >
              <span>{c.emoji}</span>
              {c.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Trending Tags */}
        <AnimatePresence>
          {trendingTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 flex-wrap mb-7"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mr-1">
                <SlidersHorizontal size={13} />
                Trending:
              </div>
              {trendingTags.map((tag, i) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    activeTag === tag
                      ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-200"
                      : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-purple-400/30"
                  }`}
                  style={activeTag === tag ? { boxShadow: "0 0 10px rgba(6,182,212,0.2)" } : {}}
                >
                  <span className="text-cyan-400">#</span>{tag}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid + Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Posts */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-3xl bg-white/5 border border-white/5 aspect-[4/3] relative overflow-hidden"
                >
                  <div className="absolute inset-0 animate-shimmer" />
                </motion.div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-xl"
            >
              <Sparkles size={40} className="text-purple-400/40 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-1 font-semibold">No creative works found</p>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={() => { setSearch(""); setActiveTag(""); setCategory("all"); }}
                className="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all"
                style={{ background: "linear-gradient(135deg, #A855F7, #EC4899)" }}
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400 font-medium">
                  Showing <span className="text-white font-bold">{filteredPosts.length}</span> work{filteredPosts.length === 1 ? "" : "s"}
                </p>
                {activeTag && (
                  <button
                    onClick={() => setActiveTag("")}
                    className="flex items-center gap-1 text-xs text-cyan-300 hover:text-white transition-colors"
                  >
                    <X size={12} />
                    Clear #{activeTag}
                  </button>
                )}
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-2 gap-6 space-y-6">
                {filteredPosts.map((post, i) => {
                  const author = authors.get(post.authorId);
                  if (!author) return null;
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="break-inside-avoid mb-6"
                    >
                      <PostCard post={post} author={author} onDelete={handleDelete} onPlayAudio={onPlayAudio} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-24">
            {/* Featured Creators */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              <h3 className="text-white font-bold text-base mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Featured Creators
              </h3>
              <p className="text-gray-400 text-xs mb-4">Follow creators with momentum.</p>
              <div className="space-y-2">
                {featuredCreators.map((creator, i) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                  >
                    <Link
                      to={`/profile/${creator.id}`}
                      className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-white/[0.07] transition-all group border border-transparent hover:border-purple-500/20"
                    >
                      <div className="relative">
                        <img
                          src={creator.avatarUrl}
                          alt={creator.displayName}
                          className="w-10 h-10 rounded-full border border-purple-500/30 group-hover:border-purple-400 transition-colors"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1E293B]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-semibold truncate group-hover:text-purple-300 transition-colors">{creator.displayName}</p>
                        <p className="text-gray-400 text-xs truncate">@{creator.username}</p>
                      </div>
                      <span className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {creator.followerCount.toLocaleString()}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Muse Banner */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-3xl border border-purple-500/30 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(88,28,135,0.35) 0%, rgba(131,24,67,0.25) 50%, rgba(88,28,135,0.35) 100%)",
              }}
            >
              {/* Floating sparkles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ right: `${12 + i * 20}%`, top: `${15 + i * 18}%` }}
                  animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  <Sparkles size={10 + i * 3} className="text-purple-400" />
                </motion.div>
              ))}

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={14} className="animate-spin-slow" /> Spark Muse AI
                </div>
                <h3 className="text-white font-bold text-base mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Need Inspiration?
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed mb-4">
                  Generate concept art prompts, story starters, or custom color palettes instantly.
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onOpenAI}
                  className="relative w-full py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #A855F7, #EC4899)",
                    boxShadow: "0 0 20px rgba(168,85,247,0.3)",
                  }}
                >
                  <motion.span
                    className="absolute inset-0 bg-white/15 skew-x-[-20deg]"
                    initial={{ x: "-150%" }}
                    animate={{ x: "250%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  />
                  <Sparkles size={13} /> Open AI Muse Assistant
                </motion.button>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}
