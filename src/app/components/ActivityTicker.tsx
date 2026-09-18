import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles, Heart, UserPlus, Zap } from "lucide-react";

interface ActivityItem {
  id: string;
  icon: typeof Flame;
  color: string;
  text: string;
  linkText: string;
  linkUrl: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: "1", icon: Zap, color: "#A855F7", text: "Marcus Osei published a new street photography work", linkText: "Neon Streets at 3AM", linkUrl: "/post/p2" },
  { id: "2", icon: Heart, color: "#EC4899", text: "Kai Rivera appreciated a digital painting", linkText: "Nebula Dreams", linkUrl: "/post/p1" },
  { id: "3", icon: Sparkles, color: "#06B6D4", text: "Priya Nair submitted an entry to", linkText: "The Space Between Stars", linkUrl: "/post/p4" },
  { id: "4", icon: UserPlus, color: "#10B981", text: "Nova Chen just hit 1.2K followers!", linkText: "View Profile", linkUrl: "/profile/u1" },
];

export function ActivityTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % ACTIVITIES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = ACTIVITIES[index];
  const Icon = current.icon;

  return (
    <div className="w-full bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 border-b border-purple-500/20 py-2 px-4 text-xs font-medium text-purple-200 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 flex-shrink-0">
            <Zap size={11} className="animate-pulse text-amber-300" /> Live Pulse
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 truncate"
            >
              <Icon size={13} style={{ color: current.color }} className="flex-shrink-0" />
              <span className="text-gray-300 truncate">{current.text}</span>
              <Link to={current.linkUrl} className="text-purple-300 hover:text-white underline font-semibold flex-shrink-0">
                {current.linkText} →
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <span className="hidden md:inline text-[11px] text-gray-500">Real-time creator events</span>
      </div>
    </div>
  );
}
