import React, { useState } from "react"
import veyraLogo from "@/imports/image.png"
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

  const handleNext = () => {
    if (isLast) {
      completeOnboarding()
      if (onFinish) onFinish()
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    completeOnboarding()
    if (onFinish) onFinish()
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden"
      style={{ background: "#F7F5EF" }}
    >
      {/* Ambient background decoration */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: "#E6E0D5" }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "#C18A5A" }}
      />

      {/* Header with Logo & Brand Name */}
      <header className="relative z-20 flex items-center justify-between w-full max-w-2xl mx-auto pt-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "#FFFFFF", border: "1px solid #E6E0D5" }}
          >
            <img src={veyraLogo} alt="Veyra" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <div className="font-display font-800 text-lg text-[#172A35] leading-none">VEYRA</div>
            <div className="text-xs font-semibold tracking-wide" style={{ color: "#C18A5A" }}>
              Wellness AI
            </div>
          </div>
        </div>

        {/* Skip button at top right */}
        {!isLast && (
          <button
            onClick={handleSkip}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-[#6B7280] hover:text-[#172A35] hover:bg-[#F1EEE6]"
          >
            Skip
          </button>
        )}
      </header>

      {/* Main Slide Content */}
      <main className="relative z-20 flex-1 flex items-center justify-center py-6">
        <OnboardingSlide key={slides[currentIndex].id} slide={slides[currentIndex]} />
      </main>

      {/* Footer Navigation Controls */}
      <footer className="relative z-20 w-full max-w-md mx-auto pb-4 flex flex-col items-center gap-2">
        <OnboardingProgress total={slides.length} current={currentIndex} />

        <div className="w-full flex items-center gap-3 mt-2">
          {currentIndex > 0 && (
            <button
              onClick={handleBack}
              className="btn-ghost flex-1 py-3 text-sm font-semibold"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="btn-primary flex-1 py-3.5 text-base font-bold tracking-wide shadow-lg"
          >
            {isLast ? "Get Started" : "Next"}
          </button>
        </div>

        {!isLast && (
          <button
            onClick={handleSkip}
            className="text-xs font-medium mt-1 text-[#6B7280] hover:text-[#172A35] underline underline-offset-4"
          >
            Skip intro
          </button>
        )}
      </footer>
    </div>
  )
}
