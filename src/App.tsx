import React from "react"
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
} from "@/components/icons"
import Dashboard from "@/components/Dashboard"
import DiscoverFood from "@/components/DiscoverFood"
import FoodScanner from "@/components/FoodScanner"
import FoodLog from "@/components/FoodLog"
import FitnessCoach from "@/components/FitnessCoach"
import SmartCoach from "@/components/SmartCoach"
import AIAssistant from "@/components/AIAssistant"
import Profile from "@/components/Profile"
import Onboarding from "@/components/onboarding/Onboarding"
import AuthPage from "@/components/auth/AuthPage"
import { AppProvider, useApp } from "@/context/AppContext"
import ToastContainer from "@/components/Toast"
import ConfettiOverlay from "@/components/Confetti"
import { Screen } from "@/types"

const navItems: { id: Screen; label: string; icon: (active: boolean) => React.ReactElement }[] = [
  { id: "dashboard", label: "Overview", icon: (a) => <HomeIcon size={18} className={a ? "text-[#C18A5A]" : ""} /> },
  { id: "discover", label: "Discover", icon: (a) => <CompassIcon size={18} className={a ? "text-[#C18A5A]" : ""} /> },
  { id: "scanner", label: "Scanner", icon: (a) => <CameraIcon size={18} className={a ? "text-[#C18A5A]" : ""} /> },
  { id: "log", label: "Food Log", icon: (a) => <BookIcon size={18} className={a ? "text-[#C18A5A]" : ""} /> },
  { id: "fitness", label: "Fitness", icon: (a) => <DumbbellIcon size={18} className={a ? "text-[#C18A5A]" : ""} /> },
  { id: "coach", label: "Smart Coach", icon: (a) => <BrainIcon size={18} className={a ? "text-[#C18A5A]" : ""} /> },
  { id: "ai", label: "AI Assistant", icon: (a) => <SparklesIcon size={18} className={a ? "text-[#C18A5A]" : ""} /> },
  { id: "profile", label: "Profile", icon: (a) => <UserIcon size={18} className={a ? "text-[#C18A5A]" : ""} /> },
]

const mobileNav: { id: Screen; label: string; icon: (a: boolean) => React.ReactElement }[] = [
  { id: "dashboard", label: "Home", icon: (a) => <HomeIcon size={20} className={a ? "text-[#C18A5A]" : "text-[#6B7280]"} /> },
  { id: "discover", label: "Discover", icon: (a) => <CompassIcon size={20} className={a ? "text-[#C18A5A]" : "text-[#6B7280]"} /> },
  { id: "scanner", label: "Scan", icon: (a) => <CameraIcon size={20} className={a ? "text-[#C18A5A]" : "text-[#6B7280]"} /> },
  { id: "log", label: "Log", icon: (a) => <BookIcon size={20} className={a ? "text-[#C18A5A]" : "text-[#6B7280]"} /> },
  { id: "ai", label: "AI", icon: (a) => <SparklesIcon size={20} className={a ? "text-[#C18A5A]" : "text-[#6B7280]"} /> },
  { id: "profile", label: "Profile", icon: (a) => <UserIcon size={20} className={a ? "text-[#C18A5A]" : "text-[#6B7280]"} /> },
]

function ScreenContent() {
  const { screen, setScreen } = useApp()
  switch (screen) {
    case "dashboard":
      return <Dashboard setScreen={setScreen} />
    case "discover":
      return <DiscoverFood />
    case "scanner":
      return <FoodScanner />
    case "log":
      return <FoodLog />
    case "fitness":
      return <FitnessCoach />
    case "coach":
      return <SmartCoach />
    case "ai":
      return <AIAssistant />
    case "profile":
      return <Profile />
  }
}

function MainLayout() {
  const { screen, setScreen, user } = useApp()

  return (
    <div className="app-bg flex h-full overflow-hidden relative">
      <ToastContainer />
      <ConfettiOverlay />

      {/* ── Sidebar (desktop) ─────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 h-full border-r relative z-20"
        style={{ borderColor: "#E6E0D5", background: "#F1EEE6" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: "#E6E0D5" }}>
          <div
            className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "#FFFFFF", border: "1px solid #E6E0D5" }}
          >
            <img src={veyraLogo} alt="Veyra" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <div className="font-display font-800 text-base text-[#172A35] leading-tight">Veyra</div>
            <div className="text-xs font-semibold" style={{ color: "#C18A5A" }}>Wellness AI</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const active = screen === item.id
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`nav-item w-full text-left${active ? " active" : ""}`}
              >
                {item.icon(active)}
                <span>{item.label}</span>
                {item.id === "ai" && (
                  <span
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#C18A5A", color: "#FFFFFF", fontSize: "10px" }}
                  >
                    AI
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User card */}
        <div className="px-3 pb-4">
          <button
            onClick={() => setScreen("profile")}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:border-[#172A35]/40"
            style={{ background: "#FFFFFF", border: "1px solid #E6E0D5", boxShadow: "0 2px 8px rgba(23,42,53,0.03)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#FFFFFF] shrink-0"
              style={{ background: "#172A35" }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-semibold text-[#172A35] font-display truncate">{user.name}</div>
              <div className="text-xs truncate" style={{ color: "#6B7280" }}>Goal: {user.goal}</div>
            </div>
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="flex-1 min-w-0 h-full overflow-hidden relative pb-16 md:pb-0" style={{ background: "#F7F5EF" }}>
        <ScreenContent />
      </main>

      {/* ── Mobile bottom nav ──────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-1 py-1.5 z-50 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
        style={{
          background: "#F1EEE6",
          borderTop: "1px solid #E6E0D5",
        }}
      >
        {mobileNav.map((item) => {
          const active = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
              style={active ? { background: "rgba(23,42,53,0.08)" } : {}}
            >
              {item.icon(active)}
              <span className="text-[10px] font-medium font-display" style={{ color: active ? "#C18A5A" : "#6B7280" }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function RootGate() {
  const { onboardingCompleted, isAuthenticated } = useApp()

  if (!onboardingCompleted) {
    return <Onboarding />
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return <MainLayout />
}

export default function App() {
  return (
    <AppProvider>
      <RootGate />
    </AppProvider>
  )
}
