import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { Heart, MessageCircle, ArrowLeft, Send, Loader2, Users, Palette, Sparkles } from "lucide-react";
import * as api from "../services/api";
import { store } from "../store";
import type { Post, User, Comment } from "../store";
import { useAuth } from "../context/AuthContext";
import { CollaborationModal } from "../components/CollaborationModal";

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Map<string, User>>(new Map());
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentBody, setCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collabOpen, setCollabOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getPost(id),
      api.getComments(id),
      user ? api.isPostLiked(id) : Promise.resolve(false),
    ]).then(([p, cs, lk]) => {
      setPost(p);
      setLikeCount(p.likeCount);
      setLiked(lk);
      const auth = store.getUser(p.authorId);
      if (auth) setAuthor(auth);
      setComments(cs);
      const caMap = new Map<string, User>();
      for (const c of cs) {
        const u = store.getUser(c.authorId);
        if (u) caMap.set(c.authorId, u);
      }
      setCommentAuthors(caMap);
      setLoading(false);
    });
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      await api.unlikePost(id!);
      setLiked(false);
      setLikeCount(c => c - 1);
    } else {
      await api.likePost(id!);
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !user) return;
    setSubmitting(true);
    const comment = await api.addComment(id!, commentBody.trim());
    setComments(prev => [...prev, comment]);
    setCommentAuthors(prev => new Map(prev).set(user.id, user));
    setCommentBody("");
    setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "#0F172A" }}>
        <Loader2 size={32} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!post || !author) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "#0F172A" }}>
        <p className="text-gray-400">Post not found</p>
      </div>
    );
  }

  const mockExtractedPalette = ["#A855F7", "#EC4899", "#3B82F6", "#06B6D4"];

  return (
    <div className="min-h-screen pt-20 bg-transparent">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/feed" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors font-semibold">
          <ArrowLeft size={16} />
          Back to Discover
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl bg-[#1E293B]/80 backdrop-blur-xl"
            >
              <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-[550px]" />
            </motion.div>

            {/* Extracted Color Palette Bar */}
            <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <Palette size={15} /> Extracted Palette
              </div>
              <div className="flex gap-2">
                {mockExtractedPalette.map(c => (
                  <div key={c} className="w-6 h-6 rounded-full border border-white/20 shadow-md" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </div>
          </div>

          {/* Info + comments */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Author */}
              <div className="flex items-center justify-between">
                <Link to={`/profile/${author.id}`} className="flex items-center gap-3 group">
                  <img src={author.avatarUrl} alt={author.displayName} className="w-11 h-11 rounded-full border-2 border-purple-500/30 group-hover:border-purple-400 transition-colors" />
                  <div>
                    <p className="text-white text-base font-bold group-hover:text-purple-300 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{author.displayName}</p>
                    <p className="text-gray-400 text-xs">@{author.username}</p>
                  </div>
                </Link>

                <button
                  onClick={() => setCollabOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition-all"
                  title="Propose Co-creation or Remix"
                >
                  <Users size={13} /> Remix
                </button>
              </div>

              {/* Title & desc */}
              <h1 className="text-white font-extrabold text-2xl leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{post.title}</h1>
              <p className="text-gray-300 text-sm leading-relaxed">{post.description}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map(t => (
                    <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">#{t}</span>
                  ))}
                </div>
              )}

              {/* Likes */}
              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                <button
                  onClick={handleLike}
                  disabled={!user}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${liked ? "text-pink-400" : "text-gray-300 hover:text-pink-400"} disabled:cursor-default`}
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  {likeCount} likes
                </button>
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <MessageCircle size={18} />
                  {post.commentCount} comments
                </span>
              </div>
            </motion.div>

            {/* Comments */}
            <div className="flex-1 rounded-3xl border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl p-5">
              <h3 className="text-white text-sm font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Community Discussion</h3>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-xs">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  comments.map(c => {
                    const ca = commentAuthors.get(c.authorId);
                    return (
                      <div key={c.id} className="flex gap-3">
                        {ca && <img src={ca.avatarUrl} alt={ca.displayName} className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className="text-xs text-purple-300 font-semibold mb-0.5">{ca?.displayName ?? "Unknown"}</p>
                          <p className="text-white text-sm">{c.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {user ? (
                <form onSubmit={handleComment} className="flex gap-2">
                  <input
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    placeholder="Write a constructive comment…"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!commentBody.trim() || submitting}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </form>
              ) : (
                <Link to="/auth" className="text-xs text-purple-400 font-semibold hover:text-purple-300">Sign in to join discussion →</Link>
              )}
            </div>
          </div>
        </div>

        {/* Collaboration Remix Modal */}
        <CollaborationModal
          post={post}
          isOpen={collabOpen}
          onClose={() => setCollabOpen(false)}
        />
      </div>
    </div>
  );
}
