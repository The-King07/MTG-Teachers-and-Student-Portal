import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles, Plus, Bookmark, User as UserIcon, ArrowRight, X, Music, Palette, Camera, Feather } from "lucide-react";
import { store, Post, User } from "../store";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSaved?: () => void;
  onOpenAI?: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenSaved, onOpenAI }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { posts: [], creators: [] };
    const q = query.toLowerCase();
    const posts = [...store.posts.values()]
      .filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)) || p.category.includes(q))
      .slice(0, 4);
    const creators = [...store.users.values()]
      .filter(u => u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.skills.some(s => s.toLowerCase().includes(q)))
      .slice(0, 4);
    return { posts, creators };
  }, [query]);

  const quickActions = [
    { label: "Create New Post", icon: Plus, action: () => { navigate("/create"); onClose(); } },
    { label: "Ask Spark AI Muse", icon: Sparkles, action: () => { onOpenAI?.(); onClose(); } },
    { label: "Open Saved Collections", icon: Bookmark, action: () => { onOpenSaved?.(); onClose(); } },
    { label: "Explore Art Category", icon: Palette, action: () => { navigate("/feed"); onClose(); } },
    { label: "Explore Music Track Works", icon: Music, action: () => { navigate("/feed"); onClose(); } },
    { label: "Explore Photography", icon: Camera, action: () => { navigate("/feed"); onClose(); } },
    { label: "Explore Writing & Poetry", icon: Feather, action: () => { navigate("/feed"); onClose(); } },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Dialog Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-[#1E293B]/95 shadow-2xl shadow-purple-500/20 overflow-hidden z-10"
        >
          {/* Header Input */}
          <div className="relative border-b border-white/10 p-4 flex items-center gap-3">
            <Search className="text-purple-400" size={20} />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search works, creators, tags, or type a command…"
              className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-base font-medium"
            />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results Container */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
            {query.trim() === "" ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-3 px-2">
                  Quick Actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickActions.map(({ label, icon: Icon, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 text-left transition-all text-sm text-gray-200 hover:text-white group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon size={16} />
                      </div>
                      <span className="flex-1 font-medium">{label}</span>
                      <ArrowRight size={14} className="text-gray-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Posts results */}
                {searchResults.posts.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2 px-2">
                      Works ({searchResults.posts.length})
                    </p>
                    <div className="space-y-2">
                      {searchResults.posts.map(post => (
                        <button
                          key={post.id}
                          onClick={() => { navigate(`/post/${post.id}`); onClose(); }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/10 text-left transition-all group"
                        >
                          <img src={post.imageUrl} alt={post.title} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate group-hover:text-purple-300 transition-colors">
                              {post.title}
                            </p>
                            <p className="text-gray-400 text-xs truncate">{post.description}</p>
                          </div>
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 uppercase">
                            {post.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Creators results */}
                {searchResults.creators.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2 px-2">
                      Creators ({searchResults.creators.length})
                    </p>
                    <div className="space-y-2">
                      {searchResults.creators.map(creator => (
                        <button
                          key={creator.id}
                          onClick={() => { navigate(`/profile/${creator.id}`); onClose(); }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/10 text-left transition-all group"
                        >
                          <img src={creator.avatarUrl} alt={creator.displayName} className="w-10 h-10 rounded-full border border-purple-500/30" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate group-hover:text-purple-300 transition-colors">
                              {creator.displayName}
                            </p>
                            <p className="text-gray-400 text-xs">@{creator.username}</p>
                          </div>
                          <span className="text-xs text-gray-400">{creator.followerCount.toLocaleString()} followers</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.posts.length === 0 && searchResults.creators.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    No results found for "<span className="text-white">{query}</span>"
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="border-t border-white/10 px-4 py-2.5 bg-black/30 flex items-center justify-between text-xs text-gray-400">
            <span>Navigation: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Cmd+K</kbd> to toggle</span>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">ESC</kbd> to exit</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
