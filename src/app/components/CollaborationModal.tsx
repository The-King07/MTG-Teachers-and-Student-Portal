import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, X, Send, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import type { Post } from "../store";

interface CollaborationModalProps {
  post?: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

const COLLAB_TYPES = [
  { label: "🎵 Audio & Vocal Co-production", value: "audio" },
  { label: "🎨 Visual Illustration / Cover Art", value: "visual" },
  { label: "📝 Story Extension / Poetry Sequel", value: "story" },
  { label: "📸 Co-shooting / Remix Project", value: "remix" },
];

export function CollaborationModal({ post, isOpen, onClose }: CollaborationModalProps) {
  const [collabType, setCollabType] = useState("audio");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    toast.success("Collaboration proposal sent to creator! 🎉");
    setTimeout(() => {
      setSubmitted(false);
      setMessage("");
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#1E293B]/95 backdrop-blur-2xl p-6 shadow-2xl z-10 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Users size={16} />
              </div>
              <div>
                <h3 className="text-white text-base font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Co-create & Remix Proposal
                </h3>
                <p className="text-gray-400 text-xs">Collaborate on {post?.title ?? "this project"}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                Collaboration Type
              </label>
              <div className="space-y-2">
                {COLLAB_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setCollabType(type.value)}
                    className={`w-full p-3 rounded-xl text-xs font-semibold text-left border transition-all ${
                      collabType === type.value
                        ? "border-purple-500 bg-purple-500/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-300 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                Your Proposal / Idea
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your creative idea for this remix or collaboration..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 text-sm resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitted || !message.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitted ? <Check size={16} /> : <Send size={16} />}
              {submitted ? "Proposal Sent!" : "Send Collaboration Proposal"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
