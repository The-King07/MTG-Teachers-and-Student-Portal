import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { NavBar } from "./components/NavBar";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Feed } from "./pages/Feed";
import { Profile } from "./pages/Profile";
import { CreatePost } from "./pages/CreatePost";
import { PostDetail } from "./pages/PostDetail";
import { LiveBackground } from "./components/LiveBackground";
import { ActivityTicker } from "./components/ActivityTicker";
import { CommandPalette } from "./components/CommandPalette";
import { AudioPlayerBar } from "./components/AudioPlayerBar";
import { SparkMuseAI } from "./components/SparkMuseAI";
import { SavedDrawer } from "./components/SavedDrawer";
import { SplashScreen } from "./components/SplashScreen";
import { BeatStudio } from "./components/BeatStudio";
import { ThemeSelector, COSMIC_THEMES, CosmicTheme } from "./components/ThemeSelector";
import type { Post } from "./store";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);
  const [sparkAIOpen, setSparkAIOpen] = useState(false);
  const [beatStudioOpen, setBeatStudioOpen] = useState(false);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<CosmicTheme>(COSMIC_THEMES[0]);
  const [currentTrack, setCurrentTrack] = useState<Post | null>(null);

  const handlePlayAudio = (post: Post) => {
    setCurrentTrack(post);
  };

  const handleReplayIntro = () => {
    setShowSplash(true);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-purple-500 selection:text-white bg-[#0B0F19]">
          {/* Fullscreen Split-Open Cinematic Splash Intro */}
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

          {/* Live Background Engine */}
          <LiveBackground />

          {/* Fixed Shell Elements */}
          <div className="relative z-30">
            <NavBar
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
              onOpenSaved={() => setSavedDrawerOpen(true)}
              onOpenAI={() => setSparkAIOpen(true)}
              onOpenBeatStudio={() => setBeatStudioOpen(true)}
              onOpenThemeSelector={() => setThemeSelectorOpen(true)}
              onReplayIntro={handleReplayIntro}
            />
            <div className="pt-16">
              <ActivityTicker />
            </div>
          </div>

          {/* Main Content */}
          <main className="relative z-10 bg-transparent">
            <Routes>
              <Route path="/" element={<Landing onPlayAudio={handlePlayAudio} onOpenAI={() => setSparkAIOpen(true)} />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/feed" element={<Feed onPlayAudio={handlePlayAudio} onOpenAI={() => setSparkAIOpen(true)} />} />
              <Route path="/profile/:id" element={<Profile onPlayAudio={handlePlayAudio} />} />
              <Route path="/create" element={<CreatePost onOpenAI={() => setSparkAIOpen(true)} />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Interactive Drawers, Modals & Overlays */}
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onOpenSaved={() => setSavedDrawerOpen(true)}
            onOpenAI={() => setSparkAIOpen(true)}
          />

          <SavedDrawer
            isOpen={savedDrawerOpen}
            onClose={() => setSavedDrawerOpen(false)}
          />

          <SparkMuseAI
            isOpen={sparkAIOpen}
            onToggle={() => setSparkAIOpen(prev => !prev)}
          />

          <BeatStudio
            isOpen={beatStudioOpen}
            onClose={() => setBeatStudioOpen(false)}
          />

          <ThemeSelector
            isOpen={themeSelectorOpen}
            onClose={() => setThemeSelectorOpen(false)}
            onSelectTheme={theme => setCurrentTheme(theme)}
            currentThemeId={currentTheme.id}
          />

          <AudioPlayerBar
            currentTrack={currentTrack}
            onClose={() => setCurrentTrack(null)}
          />

          <Toaster theme="dark" position="bottom-right" richColors closeButton />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
