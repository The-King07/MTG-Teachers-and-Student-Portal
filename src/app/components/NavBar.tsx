import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Menu, X, Plus, Search, LogOut, User as UserIcon, Bookmark, Command, Play, Disc, Palette } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavBarProps {
  onOpenCommandPalette: () => void;
  onOpenSaved: () => void;
  onOpenAI: () => void;
  onOpenBeatStudio?: () => void;
  onOpenThemeSelector?: () => void;
  onReplayIntro?: () => void;
}

export function NavBar({ onOpenCommandPalette, onOpenSaved, onOpenAI, onOpenBeatStudio, onOpenThemeSelector, onReplayIntro }: NavBarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Scroll-aware opacity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300"
      style={{
        borderColor: scrolled ? "rgba(168,85,247,0.25)" : "rgba(168,85,247,0.12)",
        background: scrolled
          ? "rgba(10, 14, 28, 0.95)"
          : "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to="/"
          onClick={onReplayIntro}
          className="flex items-center gap-2 group flex-shrink-0"
          title="Replay Cinematic Intro"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
          >
            <Sparkles size={18} className="text-white animate-spin-slow" />
          </motion.div>
          <span
            className="text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1.2rem" }}
          >
            Talent
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #c084fc, #f472b6, #fb923c)", backgroundSize: "200%", animation: "gradient-x 3s ease infinite" }}
            >
              Verse
            </span>
          </span>
        </Link>

        {/* Search / Command Palette Trigger */}
        <motion.button
          whileFocus={{ scale: 1.01 }}
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 text-gray-400 hover:text-white transition-all text-xs w-full max-w-sm focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_0_2px_rgba(168,85,247,0.2)]"
        >
          <Search size={14} className="text-purple-400" />
          <span className="flex-1 text-left truncate">Search works, creators, tags...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-300 border border-white/10">
            <Command size={10} /> K
          </kbd>
        </motion.button>

        {/* Desktop Links & Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Discover link with active indicator */}
          <div className="relative">
            <Link
              to="/feed"
              className={`text-sm font-semibold transition-colors pb-1 ${isActive("/feed") ? "text-purple-400" : "text-gray-300 hover:text-white"}`}
            >
              Discover
            </Link>
            {isActive("/feed") && (
              <motion.div
                layoutId="nav-active-dot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"
                style={{ boxShadow: "0 0 8px rgba(168,85,247,0.8)" }}
              />
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onOpenBeatStudio}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-all"
            title="Beat Synthesizer Studio"
          >
            <Disc size={14} className="animate-spin-slow" />
            Beats
          </motion.button>

          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-amber-300 transition-colors"
            title="Saved Collections"
          >
            <Bookmark size={15} />
            Saved
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onOpenAI}
            className="flex items-center gap-1.5 text-sm font-semibold text-purple-300 hover:text-pink-300 transition-colors"
            title="Spark Muse AI"
          >
            <Sparkles size={15} className="animate-spin-slow" />
            AI Spark
          </motion.button>

          <button
            onClick={onOpenThemeSelector}
            className="p-2 text-gray-300 hover:text-cyan-300 transition-colors rounded-full hover:bg-cyan-500/10"
            title="Cosmic Themes"
          >
            <Palette size={16} />
          </button>

          {user && (
            <div className="relative">
              <Link
                to={`/profile/${user.id}`}
                className={`text-sm font-semibold transition-colors pb-1 ${location.pathname.startsWith("/profile/" + user.id) ? "text-purple-400" : "text-gray-300 hover:text-white"}`}
              >
                My Profile
              </Link>
              {location.pathname.startsWith("/profile/" + user.id) && (
                <motion.div
                  layoutId="nav-active-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"
                  style={{ boxShadow: "0 0 8px rgba(168,85,247,0.8)" }}
                />
              )}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/create"
                  className="relative flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold shadow-lg transition-all overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #A855F7, #EC4899, #F97316)",
                    boxShadow: "0 0 20px rgba(168,85,247,0.35)",
                  }}
                >
                  <Plus size={14} />
                  Create Work
                </Link>
              </motion.div>

              {/* Avatar dropdown */}
              <div className="relative group">
                <button
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-500/40 hover:border-purple-400 transition-colors"
                  style={{ boxShadow: "0 0 12px rgba(168,85,247,0.2)" }}
                >
                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                </button>
                <div className="absolute right-0 top-11 w-52 py-2 bg-[#1A2235] border border-purple-500/20 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="px-4 py-2 border-b border-white/10 mb-1">
                    <p className="text-white text-xs font-bold truncate">{user.displayName}</p>
                    <p className="text-gray-400 text-[11px] truncate">@{user.username}</p>
                  </div>
                  <Link to={`/profile/${user.id}`} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <UserIcon size={14} /> Profile & Analytics
                  </Link>
                  <button onClick={onReplayIntro} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-300 hover:text-purple-300 hover:bg-white/5 transition-colors">
                    <Play size={14} /> Replay Splash Intro
                  </button>
                  <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <Link to="/auth" className="text-sm text-gray-300 hover:text-white font-semibold transition-colors">Sign in</Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/auth?mode=register"
                  className="px-5 py-2 rounded-full text-white text-xs font-bold shadow-lg transition-all"
                  style={{
                    background: "linear-gradient(135deg, #A855F7, #EC4899)",
                    boxShadow: "0 0 16px rgba(168,85,247,0.3)",
                  }}
                >
                  Join Free
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenCommandPalette}
            className="p-2 text-purple-400 hover:text-white"
          >
            <Search size={20} />
          </button>
          <button
            className="text-gray-300 hover:text-white p-1"
            onClick={() => setMenuOpen(o => !o)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={menuOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu — animated slide down */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-purple-500/20 bg-[#0C1120]/98 backdrop-blur-2xl px-4 py-4 flex flex-col gap-1"
          >
            <Link to="/feed" className="text-gray-300 hover:text-white text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-medium" onClick={() => setMenuOpen(false)}>Discover Feed</Link>
            <button onClick={() => { onOpenBeatStudio?.(); setMenuOpen(false); }} className="text-left text-pink-300 text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-medium">Beat Synthesizer Studio</button>
            <button onClick={() => { onOpenSaved(); setMenuOpen(false); }} className="text-left text-gray-300 hover:text-amber-300 text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-medium">Saved Collections</button>
            <button onClick={() => { onOpenAI(); setMenuOpen(false); }} className="text-left text-purple-300 hover:text-white text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-medium">Spark Muse AI</button>
            <button onClick={() => { onOpenThemeSelector?.(); setMenuOpen(false); }} className="text-left text-cyan-300 text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-medium">Cosmic Theme Selector</button>
            <button onClick={() => { onReplayIntro?.(); setMenuOpen(false); }} className="text-left text-purple-300 text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-medium">Replay Splash Intro</button>
            <div className="border-t border-white/10 my-1 pt-1">
              {user ? (
                <>
                  <Link to={`/profile/${user.id}`} className="block text-gray-300 hover:text-white text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-medium" onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <Link
                    to="/create"
                    className="block text-center py-2.5 px-3 rounded-xl text-white text-sm font-bold mt-1"
                    style={{ background: "linear-gradient(135deg, #A855F7, #EC4899)" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    + Create Post
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left text-red-400 text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors mt-1">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="block text-gray-300 hover:text-white text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>Sign in</Link>
                  <Link
                    to="/auth?mode=register"
                    className="block text-center py-2.5 px-3 rounded-xl text-white text-sm font-bold mt-1"
                    style={{ background: "linear-gradient(135deg, #A855F7, #EC4899)" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
