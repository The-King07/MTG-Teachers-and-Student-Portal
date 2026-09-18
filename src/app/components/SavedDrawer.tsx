import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, X, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { store, Post } from "../store";

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAVED_POSTS_KEY = "talentverse_saved_posts_v1";

export function SavedDrawer({ isOpen, onClose }: SavedDrawerProps) {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  const loadSaved = () => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(SAVED_POSTS_KEY) ?? "[]");
      const posts = ids.map(id => store.getPost(id)).filter((p): p is Post => Boolean(p));
      setSavedPosts(posts);
    } catch {
      setSavedPosts([]);
    }
  };

  useEffect(() => {
    if (isOpen) loadSaved();
  }, [isOpen]);

  const removeSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(SAVED_POSTS_KEY) ?? "[]");
      const updated = ids.filter(x => x !== id);
      localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(updated));
      setSavedPosts(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="fixed inset-y-0 right-0 w-full max-w-md bg-[#1E293B] border-l border-white/10 shadow-2xl p-6 flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-amber-300">
              <Bookmark size={20} fill="currentColor" />
              <h2 className="text-white text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Saved Collections
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {savedPosts.length === 0 ? (
              <div className="text-center py-20 text-gray-400 space-y-3">
                <Bookmark size={36} className="mx-auto text-gray-600" />
                <p className="text-sm">No saved works in your collection yet.</p>
                <p className="text-xs text-gray-500">Click the bookmark icon on any post to save it here.</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-semibold hover:bg-purple-500/30 transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Discover Works
                </button>
              </div>
            ) : (
              savedPosts.map(post => {
                const author = store.getUser(post.authorId);
                return (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all group"
                  >
                    <img src={post.imageUrl} alt={post.title} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-purple-300 transition-colors">
                        {post.title}
                      </p>
                      <p className="text-gray-400 text-xs truncate">by {author?.displayName ?? "Creator"}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        {post.category}
                      </span>
                    </div>
                    <button
                      onClick={e => removeSaved(post.id, e)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove from collection"
                    >
                      <Trash2 size={15} />
                    </button>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 text-xs text-gray-500 flex justify-between">
            <span>{savedPosts.length} work{savedPosts.length === 1 ? "" : "s"} saved</span>
            <span>Persisted in browser</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
