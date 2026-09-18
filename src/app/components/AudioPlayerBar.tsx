import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Volume2, VolumeX, X, Music, Sparkles, Disc } from "lucide-react";
import type { Post } from "../store";

interface AudioPlayerBarProps {
  currentTrack: Post | null;
  onClose: () => void;
}

export function AudioPlayerBar({ currentTrack, onClose }: AudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Synthesize ambient melody when playing
  useEffect(() => {
    if (!currentTrack) return;
    setIsPlaying(true);
    setProgress(0);

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(muted ? 0 : volume * 0.15, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      // Arpeggiated ambient harmonic pentatonic synth notes
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
      let noteIdx = 0;

      const playNextNote = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed" || !gainNodeRef.current) return;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        const freq = scale[noteIdx % scale.length];
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.01, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

        osc.connect(noteGain);
        noteGain.connect(gainNodeRef.current);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.0);

        noteIdx = Math.floor(Math.random() * scale.length);
      };

      const interval = setInterval(playNextNote, 600);

      return () => {
        clearInterval(interval);
        if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.close();
        }
      };
    } catch {
      // Fallback if Web Audio API unavailable
    }
  }, [currentTrack]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(muted ? 0 : volume * 0.15, audioCtxRef.current.currentTime);
    }
  }, [volume, muted]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioCtxRef.current) return;
    if (isPlaying) {
      audioCtxRef.current.suspend();
      setIsPlaying(false);
    } else {
      audioCtxRef.current.resume();
      setIsPlaying(true);
    }
  };

  // Progress ticker & Canvas Spectrum Visualizer
  useEffect(() => {
    if (!currentTrack || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 0.8));
    }, 300);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        let step = 0;
        const drawSpectrum = () => {
          step += 0.08;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barCount = 18;
          const barWidth = 3;
          const gap = 2.5;

          for (let i = 0; i < barCount; i++) {
            const height = Math.abs(Math.sin(step + i * 0.4) * Math.cos(step * 0.5 + i * 0.2)) * (canvas.height - 4) + 4;
            const x = i * (barWidth + gap);
            const y = (canvas.height - height) / 2;

            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, "#A855F7");
            gradient.addColorStop(1, "#EC4899");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, height, 2);
            ctx.fill();
          }
          animFrameRef.current = requestAnimationFrame(drawSpectrum);
        };
        drawSpectrum();
      }
    }

    return () => {
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentTrack, isPlaying]);

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[480px] z-50 rounded-3xl border border-purple-500/30 bg-[#1E293B]/95 backdrop-blur-xl p-4 shadow-2xl shadow-purple-500/20"
      >
        <div className="flex items-center gap-4">
          {/* Rotating Album Art / Vinyl Badge */}
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-purple-500/30">
            <img src={currentTrack.imageUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <Disc size={20} className="text-purple-300 opacity-90" />
            </motion.div>
          </div>

          {/* Track Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                Playing Audio Preview
              </span>
            </div>
            <p className="text-white text-sm font-semibold truncate mt-0.5">{currentTrack.title}</p>
            <p className="text-gray-400 text-xs truncate">Category: {currentTrack.category}</p>
          </div>

          {/* Dancing Spectrum Visualizer */}
          <div className="hidden sm:block">
            <canvas ref={canvasRef} width={100} height={32} className="w-[100px] h-[32px]" />
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            <button
              onClick={() => setMuted(!muted)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrubber progress bar */}
        <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
