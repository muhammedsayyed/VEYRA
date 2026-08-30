import React, { useState } from "react"
import veyraLogo from "@/imports/image.png"
import {
  HomeIcon,
  CompassIcon,
  CameraIcon,
  BookIcon,
  DumbbellIcon,
  BrainIcon,
  SparklesIcon,
  UserIcon,
  BellIcon,
  ShoppingCartIcon,
  CalendarIcon,
} from "@/components/icons"
import Dashboard from "@/components/Dashboard"
import DiscoverFood from "@/components/DiscoverFood"
import FoodScanner from "@/components/FoodScanner"
import FoodLog from "@/components/FoodLog"
import FitnessCoach from "@/components/FitnessCoach"
import SmartCoach from "@/components/SmartCoach"
import AIAssistant from "@/components/AIAssistant"
import Profile from "@/components/Profile"
import Preferences from "@/components/Preferences"
import Pantry from "@/components/Pantry"
import ShoppingList from "@/components/ShoppingList"
import MealPlanner from "@/components/MealPlanner"
import NotificationCenter from "@/components/NotificationCenter"
import Onboarding from "@/components/onboarding/Onboarding"
import AuthPage from "@/components/auth/AuthPage"
import { AppProvider, useApp } from "@/context/AppContext"
import ToastContainer from "@/components/Toast"
import ConfettiOverlay from "@/components/Confetti"
import { Screen } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

const navItems: { id: Screen; label: string; icon: (active: boolean) => React.ReactElement; desc: string }[] = [
  { id: "dashboard", label: "Overview", desc: "Today", icon: (a) => <HomeIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "discover", label: "Discover", desc: "1,400 recipes", icon: (a) => <CompassIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "pantry", label: "Pantry", desc: "Stock", icon: (a) => <SparklesIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "shopping", label: "Shopping", desc: "List", icon: (a) => <ShoppingCartIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "planner", label: "Planner", desc: "Week", icon: (a) => <CalendarIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "scanner", label: "Scan", desc: "Label", icon: (a) => <CameraIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "log", label: "Food Log", desc: "Track", icon: (a) => <BookIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "fitness", label: "Fitness", desc: "Move", icon: (a) => <DumbbellIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "coach", label: "Coach", desc: "Guide", icon: (a) => <BrainIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "ai", label: "Veyra AI", desc: "Chat", icon: (a) => <SparklesIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "preferences", label: "Preferences", desc: "Taste", icon: (a) => <UserIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
  { id: "profile", label: "Profile", desc: "You", icon: (a) => <UserIcon size={18} className={a ? "text-white" : "text-[#6B7280] group-hover:text-[#0F1A1C]"} /> },
]

const mobileNav: { id: Screen; label: string; icon: (a: boolean) => React.ReactElement }[] = [
  { id: "dashboard", label: "Home", icon: (a) => <HomeIcon size={20} className={a ? "text-white" : "text-[#6B7280]"} /> },
  { id: "discover", label: "Discover", icon: (a) => <CompassIcon size={20} className={a ? "text-white" : "text-[#6B7280]"} /> },
  { id: "pantry", label: "Pantry", icon: (a) => <SparklesIcon size={20} className={a ? "text-white" : "text-[#6B7280]"} /> },
  { id: "planner", label: "Plan", icon: (a) => <CalendarIcon size={20} className={a ? "text-white" : "text-[#6B7280]"} /> },
  { id: "ai", label: "AI", icon: (a) => <SparklesIcon size={20} className={a ? "text-white" : "text-[#6B7280]"} /> },
  { id: "preferences", label: "Prefs", icon: (a) => <UserIcon size={20} className={a ? "text-white" : "text-[#6B7280]"} /> },
  { id: "profile", label: "You", icon: (a) => <UserIcon size={20} className={a ? "text-white" : "text-[#6B7280]"} /> },
]

function ScreenContent() {
  const { screen, setScreen } = useApp()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="h-full overflow-hidden"
      >
        {screen === "dashboard" && <Dashboard setScreen={setScreen} />}
        {screen === "discover" && <DiscoverFood />}
        {screen === "pantry" && <Pantry />}
        {screen === "shopping" && <ShoppingList />}
        {screen === "planner" && <MealPlanner />}
        {screen === "scanner" && <FoodScanner />}
        {screen === "log" && <FoodLog />}
        {screen === "fitness" && <FitnessCoach />}
        {screen === "coach" && <SmartCoach />}
        {screen === "ai" && <AIAssistant />}
        {screen === "profile" && <Profile />}
        {screen === "preferences" && <Preferences />}
      </motion.div>
    </AnimatePresence>
  )
}

function MainLayout() {
  const { screen, setScreen, user } = useApp()
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className="app-bg flex h-full overflow-hidden relative selection:bg-[#0F1A1C] selection:text-white">
      <ToastContainer />
      <ConfettiOverlay />

      {/* Ambient — warm, editorial, not beige-heavy */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[28%] -right-[18%] w-[78%] h-[78%] rounded-full opacity-[0.035]" style={{ background: "radial-gradient(circle, #C45A3C 0%, transparent 68%)" }} />
        <div className="absolute -bottom-[18%] -left-[12%] w-[62%] h-[62%] rounded-full opacity-[0.025]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
        <div className="absolute top-[42%] left-[38%] w-[36%] h-[28%] rounded-[40%_60%_60%_40%] opacity-[0.015]" style={{ background: "radial-gradient(ellipse, #0F1A1C 0%, transparent 72%)" }} />
      </div>

      {/* Sidebar — floating paper, editorial */}
      <aside className="hidden md:flex flex-col w-[268px] shrink-0 h-full p-3 pr-0 relative z-20">
        <div className="flex flex-col h-full rounded-[28px] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(20px) saturate(1.15)", border: "1px solid rgba(232,224,208,0.9)", boxShadow: "0 10px 40px rgba(15,26,28,0.07), 0 2px 12px rgba(15,26,28,0.04)" }}>
          {/* Logo — editorial lockup */}
          <div className="px-5 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "#0F1A1C", boxShadow: "0 4px 14px rgba(15,26,28,0.16)" }}>
                <img src={veyraLogo} alt="Veyra" className="w-6 h-6 object-contain brightness-0 invert" />
              </div>
              <div>
                <div className="font-display font-800 text-[17px] tracking-tight text-[#0F1A1C] leading-none">Veyra</div>
                <div className="font-mono text-[10px] tracking-[0.14em] font-600 text-[#C45A3C] uppercase">Intelligence • 20 Kitchens</div>
              </div>
            </div>
            <div className="mt-4 h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #E8E0D0, transparent)" }} />
          </div>

          {/* Nav — editorial, warm */}
          <nav className="flex-1 px-3 overflow-y-auto space-y-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item, i) => {
              const active = screen === item.id
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.16,1,0.3,1] }}
                  onClick={() => setScreen(item.id)}
                  className={`group relative flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-[14px] transition-all ${active ? "text-white" : "text-[#6B7280] hover:text-[#0F1A1C]"}`}
                  style={active ? { background: "#0F1A1C", boxShadow: "0 4px 14px rgba(15,26,28,0.14)" } : {}}
                >
                  <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-all ${active ? "bg-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "bg-[#F5F0E8] group-hover:bg-white group-hover:shadow-sm"}`}>
                    {item.icon(active)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[13px] leading-none ${active ? "font-700 text-white" : "font-600"}`}>{item.label}</span>
                    <span className={`block text-[10px] font-mono tracking-wide truncate ${active ? "text-white/70" : "text-[#9CA3AF]"}`}>{item.desc}</span>
                  </span>
                  {item.id === "ai" && !active && <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C] animate-pulse" />}
                  {active && <motion.div layoutId="nav-indicator" className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#E07A5F]" transition={{ type: "spring", stiffness: 420, damping: 30 }} />}
                </motion.button>
              )
            })}
          </nav>

          {/* User — tactile, warm */}
          <div className="p-3">
            <button
              onClick={() => setScreen("profile")}
              className="w-full flex items-center gap-3 p-3 rounded-[16px] transition-all hover:scale-[1.01] hover:shadow-sm"
              style={{ background: "#F5F0E8", border: "1px solid #E8E0D0" }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 text-white shrink-0" style={{ background: "#0F1A1C" }}>
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[13px] font-700 text-[#0F1A1C] truncate leading-none">{user.name}</div>
                <div className="text-[11px] font-mono text-[#6B7280] truncate">{user.goal} • {user.weightKg}kg</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#8A9A8B] animate-pulse" />
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar — mobile + desktop notifications */}
      <div className="absolute top-0 left-0 md:left-[268px] right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-end gap-2 p-3 md:p-4">
          <button
            onClick={() => setShowNotifications(true)}
            className="pointer-events-auto w-9 h-9 rounded-full bg-white/92 backdrop-blur-xl border flex items-center justify-center text-[#0F1A1C] hover:scale-105 transition-transform"
            style={{ borderColor: "rgba(232,224,208,0.85)", boxShadow: "0 4px 14px rgba(15,26,28,0.06)" }}
          >
            <BellIcon size={16} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#C45A3C] border-2 border-white" />
          </button>
        </div>
      </div>

      {/* Main — cinematic depth */}
      <main className="flex-1 min-w-0 h-full overflow-hidden relative pb-16 md:pb-0">
        <ScreenContent />
      </main>

      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}

      {/* Mobile — floating paper dock */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50" style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between gap-1 px-2 py-2 rounded-[20px]"
          style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px) saturate(1.25)", border: "1px solid rgba(232,224,208,0.9)", boxShadow: "0 10px 36px rgba(15,26,28,0.12), 0 2px 10px rgba(15,26,28,0.06)" }}>
          {mobileNav.map((item) => {
            const active = screen === item.id
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`relative flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-[14px] transition-all active:scale-95 ${active ? "text-white" : "text-[#6B7280]"}`}
                style={active ? { background: "#0F1A1C", color: "#FFFBF5", boxShadow: "0 4px 12px rgba(15,26,28,0.14)" } : {}}
              >
                {item.icon(active)}
                <span className={`text-[9px] font-700 tracking-wide ${active ? "text-white" : "text-[#6B7280]"}`}>{item.label}</span>
                {active && <motion.div layoutId="mobile-indicator" className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" transition={{ type: "spring", stiffness: 420, damping: 30 }} />}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function RootGate() {
  const { onboardingCompleted, isAuthenticated } = useApp()
  if (!onboardingCompleted) return <Onboarding />
  if (!isAuthenticated) return <AuthPage />
  return <MainLayout />
}

export default function App() {
  return (
    <AppProvider>
      <RootGate />
    </AppProvider>
  )
}
