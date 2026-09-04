import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { VeyraLogo } from "@/components/brand/VeyraLogo"
import OnboardingSlide, { SlideData } from "./OnboardingSlide"
import OnboardingProgress from "./OnboardingProgress"
import { useApp } from "@/context/AppContext"

const slides: SlideData[] = [
  {
    id: 1,
    headline: "Meet Veyra.",
    supportingText: "Your personal wellness companion for smarter nutrition, movement, and everyday habits.",
    characterSpeech: "Hey! I'm Veyra. I'll help you make healthier choices without making life complicated.",
    mood: "happy",
    accentObj: "leaf",
    highlights: ["Smarter Nutrition", "Daily Habits", "Personal Guidance"],
  },
  {
    id: 2,
    headline: "Understand what you eat.",
    supportingText: "Discover meals, explore nutrition, and keep track of what goes into your day.",
    characterSpeech: "Tell me what you're eating and I'll help you understand it.",
    mood: "cheer",
    accentObj: "avocado",
    highlights: ["Discover recipes", "Calories & Macros", "Protein", "Carbs & Fat", "Daily food logging"],
  },
  {
    id: 3,
    headline: "Scan. Know. Choose better.",
    supportingText: "Use the food scanner to quickly understand products and make more informed choices.",
    characterSpeech: "Just scan it. I'll help you understand what's inside.",
    mood: "focused",
    accentObj: "water",
    highlights: ["Barcode scanning", "Product lookup", "Nutri-Score", "Nutrition analysis", "Food safety insights"],
  },
  {
    id: 4,
    headline: "Your wellness goes beyond food.",
    supportingText: "Track movement, hydration, daily progress, and healthy habits in one place.",
    characterSpeech: "Small steps every day can make a big difference.",
    mood: "coaching",
    accentObj: "dumbbell",
    highlights: ["Fitness & Workouts", "Hydration tracking", "Daily progress", "Streaks", "Personal Goals"],
  },
  {
    id: 5,
    headline: "Meet your personal AI coach.",
    supportingText: "Veyra learns from your progress and helps you make better decisions throughout your day.",
    characterSpeech: "I'm here whenever you need a little guidance.",
    mood: "celebrate",
    accentObj: "flame",
    highlights: ["Smart Coach", "AI Assistant", "Personalized recommendations", "Food insights", "Goal awareness", "Daily guidance"],
  },
]

interface OnboardingProps {
  onFinish?: () => void
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const { completeOnboarding } = useApp()
  const [currentIndex, setCurrentIndex] = useState(0)

  const isLast = currentIndex === slides.length - 1
  const isFirst = currentIndex === 0

  const handleNext = useCallback(() => {
    if (isLast) {
      completeOnboarding()
      if (onFinish) onFinish()
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [isLast, completeOnboarding, onFinish])

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleSkip = useCallback(() => {
    completeOnboarding()
    if (onFinish) onFinish()
  }, [completeOnboarding, onFinish])

  // Keyboard navigation — preserve logic, enhance interaction
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        handleBack()
      } else if (e.key === "Escape" && !isLast) {
        handleSkip()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handleNext, handleBack, handleSkip, isLast])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full flex flex-col relative overflow-hidden bg-[var(--veyra-paper)] selection:bg-[var(--veyra-ink)] selection:text-white">
        {/* ── Cinematic paper + lighting ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(1000px circle at 12% 10%, rgba(196,90,60,0.07) 0%, transparent 56%), radial-gradient(900px circle at 92% 94%, rgba(138,154,139,0.09) 0%, transparent 58%), radial-gradient(700px circle at 48% 42%, rgba(224,122,95,0.045) 0%, transparent 64%), var(--veyra-paper)",
          }}
        />
        {/* grain */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.28] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
          }}
        />
        {/* top hairline */}
        <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E8E0D0] to-transparent opacity-80" />

        {/* drifting ambient orbs — subtle */}
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-24 sm:-top-20 sm:-left-16 w-[380px] h-[380px] sm:w-[520px] sm:h-[520px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,224,208,0.85) 0%, transparent 72%)" }}
          animate={{ x: [0, 10, 0], y: [0, -6, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 -right-20 sm:-bottom-24 sm:-right-16 w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,90,60,0.08) 0%, transparent 70%)" }}
          animate={{ x: [0, -12, 0], y: [0, 8, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />

        {/* ── Header — official VEYRA brand */}
        <header className="relative z-20 w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <VeyraLogo size="sm" className="max-w-[150px] h-auto" />
            <div className="min-w-0 hidden lg:flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#C9B99A] opacity-60" aria-hidden />
              <span className="font-mono text-[9px] tracking-[0.12em] text-[#9CA3AF] uppercase">Intelligent food • personal</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* keyboard hint — desktop */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[10px] font-mono tracking-[0.08em] text-[#9CA3AF] shadow-sm">
              <span className="w-4 h-4 rounded-[6px] bg-[#F5F0E8] border border-[#E8E0D0] flex items-center justify-center text-[9px] font-700 text-[#6B7280]">←</span>
              <span className="w-4 h-4 rounded-[6px] bg-[#F5F0E8] border border-[#E8E0D0] flex items-center justify-center text-[9px] font-700 text-[#6B7280]">→</span>
              <span className="hidden xl:inline">to navigate</span>
            </span>

            {!isLast && (
              <motion.button
                onClick={handleSkip}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-600 tracking-[-0.01em] transition-all bg-white border border-[#E8E0D0] text-[#6B7280] hover:text-[var(--veyra-ink)] hover:border-[var(--veyra-ink)]/15 hover:shadow-sm"
                style={{ boxShadow: "0 2px 10px rgba(15,26,28,0.04)" }}
              >
                Skip
                <span className="hidden sm:inline opacity-60">→</span>
              </motion.button>
            )}
          </div>
        </header>

        {/* Editorial kicker — strong first impression */}
        <div className="relative z-20 w-full max-w-[580px] mx-auto px-4 sm:px-6 mt-3 sm:mt-4 flex justify-center shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/88 backdrop-blur-md border border-[#E8E0D0]/80 shadow-[0_2px_12px_rgba(15,26,28,0.04)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-sage)] animate-pulse shrink-0" aria-hidden />
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.14em] font-600 text-[#6B7280] uppercase whitespace-nowrap">Intelligent food</span>
            <span className="w-px h-3 bg-[#E8E0D0] hidden sm:block" aria-hidden />
            <span className="hidden sm:inline font-mono text-[9px] tracking-[0.14em] font-600 text-[#6B7280] uppercase">Wellness</span>
            <span className="hidden sm:inline w-px h-3 bg-[#E8E0D0]" aria-hidden />
            <span className="hidden sm:inline font-mono text-[9px] tracking-[0.14em] font-600 text-[#6B7280] uppercase">Personalization</span>
            <span className="w-px h-3 bg-[#E8E0D0] sm:hidden" aria-hidden />
            <span className="sm:hidden font-mono text-[9px] tracking-[0.14em] font-700 text-[var(--veyra-ink)] uppercase">Personal</span>
          </motion.div>
        </div>

        {/* ── Main — cinematic progressive reveal with depth ── */}
        <main className="relative z-10 flex-1 flex items-center justify-center py-4 sm:py-6 lg:py-8 min-h-0 w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slides[currentIndex].id}
              initial={{ opacity: 0, x: 18, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -18, scale: 0.99 }}
              transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
              // swipe gesture for mobile — progressive interaction
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) handleNext()
                else if (info.offset.x > 60) handleBack()
              }}
            >
              <OnboardingSlide slide={slides[currentIndex]} />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Footer — tactile progress + controls ── */}
        <footer className="relative z-20 w-full max-w-[520px] mx-auto px-4 sm:px-6 pb-[max(16px,env(safe-area-inset-bottom))] sm:pb-7 flex flex-col items-center gap-4 sm:gap-5 shrink-0">
          <OnboardingProgress total={slides.length} current={currentIndex} />

          <div className="w-full flex items-center gap-3">
            {!isFirst ? (
              <motion.button
                onClick={handleBack}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 sm:py-3.5 rounded-[14px] text-[13px] sm:text-sm font-700 tracking-[-0.01em] bg-white border border-[#E8E0D0] text-[var(--veyra-ink)] hover:bg-[#F5F0E8] hover:border-[var(--veyra-ink)]/10 transition-colors shadow-sm"
                style={{ boxShadow: "0 2px 10px rgba(15,26,28,0.04)" }}
              >
                Back
              </motion.button>
            ) : (
              <div className="flex-1 hidden sm:block" aria-hidden />
            )}

            <motion.button
              onClick={handleNext}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="flex-[1.7] py-3.5 rounded-[14px] text-[13px] sm:text-sm font-800 tracking-[-0.01em] text-white relative overflow-hidden flex items-center justify-center gap-2.5"
              style={{
                background: "var(--veyra-ink)",
                boxShadow: "0 8px 24px rgba(15,26,28,0.16), 0 2px 8px rgba(15,26,28,0.08)",
              }}
            >
              <span aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 55%)" }} />
              <span className="relative">{isLast ? "Get Started" : "Continue"}</span>
              <span
                aria-hidden
                className="relative w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] leading-none backdrop-blur"
              >
                →
              </span>
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] leading-none min-h-[16px]">
            {!isLast ? (
              <>
                <span className="font-mono text-[10px] tracking-[0.12em] text-[#9CA3AF] uppercase">Prefer to explore?</span>
                <button
                  onClick={handleSkip}
                  className="font-600 text-[#6B7280] hover:text-[var(--veyra-ink)] underline underline-offset-4 decoration-[#E8E0D0] hover:decoration-[var(--veyra-ink)]/30 transition-colors"
                >
                  Skip intro
                </button>
                <span className="hidden sm:inline font-mono text-[9px] tracking-[0.10em] text-[#9CA3AF] ml-1">• swipe or use arrows</span>
              </>
            ) : (
              <span className="label-serif italic text-[13px] text-[#9CA3AF]">Your wellness story starts now —</span>
            )}
          </div>

          {/* swipe indicator — mobile */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 opacity-40">
            <span className="w-8 h-px bg-[#E8E0D0]" aria-hidden />
            <span className="font-mono text-[9px] tracking-[0.12em] text-[#9CA3AF] uppercase">Swipe to navigate</span>
            <span className="w-8 h-px bg-[#E8E0D0]" aria-hidden />
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
