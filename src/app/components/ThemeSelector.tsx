import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette, Check, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

export interface CosmicTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bgGrad: string;
}

export const COSMIC_THEMES: CosmicTheme[] = [
  { id: "nebula", name: "Nebula Purple", primary: "#A855F7", secondary: "#EC4899", bgGrad: "from-purple-900/30 to-pink-900/20" },
  { id: "cyber", name: "Cyber Neon", primary: "#06B6D4", secondary: "#EC4899", bgGrad: "from-cyan-900/30 to-pink-900/20" },
  { id: "midnight", name: "Deep Space", primary: "#3B82F6", secondary: "#8B5CF6", bgGrad: "from-blue-900/30 to-purple-900/20" },
  { id: "emerald", name: "Emerald Aurora", primary: "#10B981", secondary: "#06B6D4", bgGrad: "from-emerald-900/30 to-cyan-900/20" },
];

const THEME_KEY = "talentverse_cosmic_theme_v1";

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: CosmicTheme) => void;
  currentThemeId: string;
}

export function ThemeSelector({ isOpen, onClose, onSelectTheme, currentThemeId }: ThemeSelectorProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#1E293B]/95 backdrop-blur-2xl p-6 shadow-2xl z-10 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Palette size={16} />
              </div>
              <div>
                <h3 className="text-white text-base font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Cosmic Visual Theme
                </h3>
                <p className="text-gray-400 text-xs">Customize your universe aesthetic</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {COSMIC_THEMES.map(theme => {
              const isSelected = currentThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme);
                    localStorage.setItem(THEME_KEY, theme.id);
                    toast.success(`Theme set to ${theme.name} ✨`);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected ? "border-white bg-white/10 ring-2 ring-purple-400 shadow-xl" : "border-white/10 bg-white/5 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-bold truncate">{theme.name}</span>
                    {isSelected && <Check size={16} className="text-purple-300" />}
                  </div>

                  {/* Swatch color dots */}
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: theme.primary }} />
                    <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: theme.secondary }} />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
