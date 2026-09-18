import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Disc, Play, Pause, Volume2, X, Sparkles, Music, Sliders } from "lucide-react";

interface BeatStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Pad {
  id: number;
  key: string;
  name: string;
  category: "beat" | "synth" | "fx";
  color: string;
  freq: number;
  type: OscillatorType;
}

const PADS: Pad[] = [
  { id: 1, key: "1", name: "Kick Drum", category: "beat", color: "#EC4899", freq: 150, type: "sine" },
  { id: 2, key: "2", name: "Snare Crisp", category: "beat", color: "#A855F7", freq: 250, type: "triangle" },
  { id: 3, key: "3", name: "Hi-Hat Chiff", category: "beat", color: "#3B82F6", freq: 800, type: "square" },
  { id: 4, key: "4", name: "Sub Bass Drop", category: "beat", color: "#06B6D4", freq: 60, type: "sine" },
  { id: 5, key: "5", name: "Cosmic Synth C", category: "synth", color: "#10B981", freq: 261.63, type: "sawtooth" },
  { id: 6, key: "6", name: "Nebula Synth E", category: "synth", color: "#F59E0B", freq: 329.63, type: "sine" },
  { id: 7, key: "7", name: "Starlight G", category: "synth", color: "#F97316", freq: 392.00, type: "sine" },
  { id: 8, key: "8", name: "Crystal Chime", category: "fx", color: "#8B5CF6", freq: 523.25, type: "triangle" },
];

export function BeatStudio({ isOpen, onClose }: BeatStudioProps) {
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingLoop, setIsPlayingLoop] = useState(false);
  const [bpm, setBpm] = useState(120);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const loopIntervalRef = useRef<number | null>(null);

  // Keyboard shortcut listener for pads 1-8
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const pad = PADS.find(p => p.key === e.key);
      if (pad) {
        triggerPad(pad);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const triggerPad = (pad: Pad) => {
    setActivePad(pad.id);
    setTimeout(() => setActivePad(null), 200);

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = pad.type;

      if (pad.name === "Kick Drum") {
        osc.frequency.setValueAtTime(pad.freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      } else if (pad.name === "Sub Bass Drop") {
        osc.frequency.setValueAtTime(pad.freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      } else {
        osc.frequency.setValueAtTime(pad.freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  // Toggle Automated Beat Loop
  const toggleLoop = () => {
    if (isPlayingLoop) {
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
      setIsPlayingLoop(false);
    } else {
      setIsPlayingLoop(true);
      let step = 0;
      const pattern = [1, 3, 2, 3, 5, 3, 4, 8];
      const intervalMs = (60 / bpm) * 1000 * 0.5;

      loopIntervalRef.current = window.setInterval(() => {
        const padId = pattern[step % pattern.length];
        const pad = PADS.find(p => p.id === padId);
        if (pad) triggerPad(pad);
        step++;
      }, intervalMs);
    }
  };

  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed bottom-6 left-6 z-50 w-full max-w-sm rounded-3xl border border-purple-500/30 bg-[#1E293B]/95 backdrop-blur-2xl p-5 shadow-2xl shadow-purple-500/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <Disc size={16} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-white text-sm font-bold">Beat Synthesizer Studio</h3>
              <p className="text-purple-300 text-xs">Press 1-8 or tap pads to trigger beats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* 8 Drum Pads Grid */}
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {PADS.map(pad => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => triggerPad(pad)}
                className={`relative aspect-square rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center p-2 text-center group ${
                  isActive
                    ? "scale-95 shadow-2xl border-white"
                    : "border-white/10 bg-white/5 hover:border-purple-500/50 hover:scale-105"
                }`}
                style={{
                  backgroundColor: isActive ? pad.color : `${pad.color}15`,
                  boxShadow: isActive ? `0 0 25px ${pad.color}` : "none",
                }}
              >
                <span className="absolute top-1.5 left-2 text-[10px] font-mono text-gray-400 group-hover:text-white">
                  [{pad.key}]
                </span>
                <span className="text-xs font-bold text-white truncate w-full mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {pad.name.split(" ")[0]}
                </span>
                <span className="text-[9px] text-gray-300 truncate opacity-80">
                  {pad.name.split(" ")[1] ?? ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sequencer Loop Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <button
            onClick={toggleLoop}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white transition-all ${
              isPlayingLoop
                ? "bg-gradient-to-r from-pink-500 to-amber-500 shadow-lg"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            }`}
          >
            {isPlayingLoop ? <Pause size={14} /> : <Play size={14} />}
            {isPlayingLoop ? "Stop Loop" : "Auto Loop"}
          </button>

          <div className="flex items-center gap-2 text-gray-300 font-semibold">
            <span>BPM:</span>
            <input
              type="range"
              min={80}
              max={160}
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="w-16 accent-purple-500"
            />
            <span className="text-white font-mono">{bpm}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
