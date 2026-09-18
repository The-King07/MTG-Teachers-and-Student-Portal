import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";

interface SplashScreenProps {
  onComplete?: () => void;
}

// Background floating stars
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3,
  duration: Math.random() * 2 + 1.5,
}));

const SUBTITLE = "Where Creativity Glows Brighter";

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<"reveal" | "splitting" | "done">("reveal");
  const [typedChars, setTypedChars] = useState(0);
  const typeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Typewriter starts after logo appears (~600ms)
    const startType = setTimeout(() => {
      typeRef.current = setInterval(() => {
        setTypedChars(n => {
          if (n >= SUBTITLE.length) {
            clearInterval(typeRef.current!);
            return n;
          }
          return n + 1;
        });
      }, 38);
    }, 700);

    const timer1 = setTimeout(() => setStage("splitting"), 2800);
    const timer2 = setTimeout(() => {
      setStage("done");
      onComplete?.();
    }, 3700);

    return () => {
      clearTimeout(startType);
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (typeRef.current) clearInterval(typeRef.current);
    };
  }, [onComplete]);

  const handleEnter = () => {
    if (typeRef.current) clearInterval(typeRef.current);
    setStage("splitting");
    setTimeout(() => {
      setStage("done");
      onComplete?.();
    }, 900);
  };

  if (stage === "done") return null;

  return (
    <div className="fixed inset-0 z-[250] overflow-hidden pointer-events-auto select-none bg-[#05070D]">

      {/* Floating star particles */}
      <div className="absolute inset-0 z-[251] pointer-events-none overflow-hidden">
        {STARS.map(star => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.1, 0.9, 0.1],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Ambient purple glow */}
      <div
        className="absolute inset-0 z-[251] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.35) 0%, rgba(236, 72, 153, 0.12) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* CENTER BRANDING */}
      <AnimatePresence>
        {stage === "reveal" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(14px)" }}
            transition={{ duration: 0.65 }}
            className="absolute inset-0 z-[260] flex flex-col items-center justify-center text-center p-6"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.15, rotate: -200, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.05 }}
              className="relative mb-7"
            >
              {/* Outer orbit ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-5 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #A855F7, #EC4899, #F97316, #06B6D4, #A855F7)",
                  opacity: 0.55,
                  filter: "blur(6px)",
                }}
              />
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-3 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)",
                }}
              />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center shadow-2xl border-2 border-white/30">
                <Sparkles size={56} className="text-white drop-shadow-lg" />
              </div>
            </motion.div>

            {/* Title — staggered letter entrance */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Talent
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #c084fc, #f472b6, #fb923c)", backgroundSize: "200%", animation: "gradient-x 3s ease infinite" }}
              >
                Verse
              </span>
            </motion.h1>

            {/* Typewriter subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-purple-200 text-xs md:text-sm font-semibold uppercase tracking-[0.28em] max-w-md mb-10 h-5 flex items-center justify-center gap-0"
            >
              <span>{SUBTITLE.slice(0, typedChars)}</span>
              {typedChars < SUBTITLE.length && (
                <span className="inline-block w-0.5 h-4 bg-purple-300 ml-0.5 animate-blink" />
              )}
            </motion.div>

            {/* Enter button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleEnter}
              className="relative flex items-center gap-2.5 px-9 py-3.5 rounded-full text-white font-bold text-sm shadow-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #A855F7, #EC4899, #F97316)",
                boxShadow: "0 0 40px rgba(168, 85, 247, 0.55), 0 0 80px rgba(236,72,153,0.2)",
              }}
            >
              {/* Shimmer sweep */}
              <motion.span
                className="absolute inset-0 bg-white/20 skew-x-[-20deg]"
                initial={{ x: "-150%" }}
                animate={{ x: "250%" }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
              />
              Enter Universe <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP SHUTTER */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: stage === "splitting" ? "-100%" : 0 }}
        transition={{ duration: 0.88, ease: [0.77, 0, 0.175, 1] }}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#05070D] border-b border-purple-500/40 z-[255]"
      />

      {/* BOTTOM SHUTTER */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: stage === "splitting" ? "100%" : 0 }}
        transition={{ duration: 0.88, ease: [0.77, 0, 0.175, 1] }}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#05070D] border-t border-purple-500/40 z-[255]"
      />

      {/* SPLIT SEAM GLOW */}
      {stage === "splitting" && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.85 }}
          className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 z-[258] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, #A855F7, #EC4899, #06B6D4, #F97316, transparent)",
            boxShadow: "0 0 50px #EC4899, 0 0 100px #A855F7",
          }}
        />
      )}
    </div>
  );
}
