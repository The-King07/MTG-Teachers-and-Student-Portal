import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, Palette, PenTool, Lightbulb, Copy, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SparkMuseAIProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ART_PROMPTS = [
  "A glowing bio-luminescent lotus floating on a quiet glass lake under dual moons.",
  "Urban street portrait during a rainy midnight in Neo-Tokyo with golden umbrella reflections.",
  "Surreal clockwork galaxy with brass planets and crystal nebulae spinning softly.",
  "Minimalist architectural study focusing on light shadows across curved warm concrete.",
  "Character concept: An ancient cartographer mapping emotional constellations.",
];

const POEM_OPENERS = [
  "\"The quietest hours are written in shades of indigo...\"",
  "\"We left our shadows by the river and walked into the morning sun...\"",
  "\"A sound like rain falling upwards through the silver trees...\"",
  "\"Between the heartbeat and the breath lies the universe we built...\"",
];

const COLOR_PALETTES = [
  { name: "Cosmic Neon", colors: ["#A855F7", "#EC4899", "#3B82F6", "#06B6D4"] },
  { name: "Golden Sunset", colors: ["#F97316", "#F59E0B", "#EF4444", "#8B5CF6"] },
  { name: "Emerald Cyberpunk", colors: ["#10B981", "#06B6D4", "#1E293B", "#34D399"] },
  { name: "Soft Twilight", colors: ["#6366F1", "#8B5CF6", "#EC4899", "#F472B6"] },
];

export function SparkMuseAI({ isOpen, onToggle }: SparkMuseAIProps) {
  const [activeTab, setActiveTab] = useState<"art" | "story" | "colors">("art");
  const [currentPrompt, setCurrentPrompt] = useState(ART_PROMPTS[0]);
  const [currentStory, setCurrentStory] = useState(POEM_OPENERS[0]);
  const [currentPalette, setCurrentPalette] = useState(COLOR_PALETTES[0]);
  const [copied, setCopied] = useState(false);

  const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateNew = () => {
    if (activeTab === "art") setCurrentPrompt(getRandomItem(ART_PROMPTS));
    if (activeTab === "story") setCurrentStory(getRandomItem(POEM_OPENERS));
    if (activeTab === "colors") setCurrentPalette(getRandomItem(COLOR_PALETTES));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger floating button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #A855F7, #EC4899, #F97316)",
          boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
        }}
      >
        <Sparkles size={18} className="animate-spin-slow" />
        <span className="text-sm font-bold">Spark Muse AI</span>
      </button>

      {/* Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-20 right-6 z-50 w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#1E293B]/95 backdrop-blur-2xl p-5 shadow-2xl shadow-purple-500/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">Spark Muse AI Assistant</h3>
                  <p className="text-purple-300 text-xs">Your creative inspiration generator</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Feature Tabs */}
            <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 my-4">
              {[
                { id: "art", label: "Art Idea", icon: Palette },
                { id: "story", label: "Story/Poem", icon: PenTool },
                { id: "colors", label: "Colors", icon: Lightbulb },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === t.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Generated Content Box */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4 relative min-h-[110px] flex flex-col justify-between">
              {activeTab === "art" && (
                <div>
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">Concept Art Prompt</p>
                  <p className="text-white text-sm leading-relaxed font-medium">{currentPrompt}</p>
                </div>
              )}

              {activeTab === "story" && (
                <div>
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">Writing Starter</p>
                  <p className="text-purple-100 text-sm italic leading-relaxed">{currentStory}</p>
                </div>
              )}

              {activeTab === "colors" && (
                <div>
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-2">{currentPalette.name}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {currentPalette.colors.map(c => (
                      <div key={c} className="text-center group">
                        <div
                          className="h-12 rounded-xl border border-white/20 shadow-md group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: c }}
                        />
                        <span className="text-[10px] text-gray-400 font-mono mt-1 block">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeTab === "art"
                        ? currentPrompt
                        : activeTab === "story"
                        ? currentStory
                        : currentPalette.colors.join(", ")
                    )
                  }
                  className="flex items-center gap-1 text-xs text-purple-300 hover:text-white transition-colors"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={generateNew}
              className="w-full py-2.5 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={14} /> Generate New Spark
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
