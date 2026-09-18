import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    params.get("mode") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/feed");
  }, [user, navigate]);

  // Sync mode from URL
  useEffect(() => {
    setMode(params.get("mode") === "register" ? "register" : "login");
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!username.trim()) { setError("Username is required"); setLoading(false); return; }
        if (!displayName.trim()) { setError("Display name is required"); setLoading(false); return; }
        await register(email, username.trim().toLowerCase().replace(/\s+/g, "_"), password, displayName.trim());
      }
      navigate("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:bg-purple-500/5 transition-all text-sm";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-20 bg-transparent"
    >
      {/* Bg glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #A855F7, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl p-8 shadow-2xl" style={{ boxShadow: "0 0 60px rgba(168,85,247,0.1)" }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              Talent<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Verse</span>
            </span>
          </Link>

          {/* Toggle tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === m
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "register" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "register" ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 ml-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your creative name"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 ml-1">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="your_handle"
                        className={`${inputClass} pl-8`}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Min. 6 characters" : "••••••••"}
                    className={`${inputClass} pr-10`}
                    minLength={mode === "register" ? 6 : undefined}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 disabled:scale-100"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #EC4899)",
                  boxShadow: "0 0 20px rgba(168,85,247,0.3)",
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Please wait…" : mode === "login" ? "Enter the Universe" : "Begin Your Journey"}
              </button>

              {mode === "login" && (
                <p className="text-center text-xs text-gray-500">
                  Demo: use any seed email like <span className="text-gray-300">nova@example.com</span> with any password
                </p>
              )}
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
