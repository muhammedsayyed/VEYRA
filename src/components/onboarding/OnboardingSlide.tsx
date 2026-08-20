import React from "react"
import VeyraCharacter, { Obj3D } from "@/components/VeyraChar"
import { VeyMood } from "@/types"

export interface SlideData {
  id: number
  headline: string
  supportingText: string
  characterSpeech: string
  mood: VeyMood
  accentObj?: "leaf" | "avocado" | "water" | "dumbbell" | "flame" | "berry"
  highlights: string[]
}

interface OnboardingSlideProps {
  slide: SlideData
}

export default function OnboardingSlide({ slide }: OnboardingSlideProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto w-full animate-fade-in-up">
      {/* Mascot visual container */}
      <div className="relative mb-6 flex items-center justify-center min-h-[170px] w-full">
        {/* Decorative ambient aura */}
        <div
          className="absolute w-44 h-44 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #C18A5A 0%, rgba(247,245,239,0) 70%)" }}
        />

        {/* Mascot */}
        <div className="relative z-10">
          <VeyraCharacter mood={slide.mood} size={135} float={true} />
        </div>

        {/* 3D floating object accent */}
        {slide.accentObj && (
          <div className="absolute -top-1 -right-2 sm:right-6 z-20 pointer-events-none">
            <Obj3D kind={slide.accentObj} size={54} float={true} />
          </div>
        )}
      </div>

      {/* Speech bubble */}
      <div
        className="relative mb-6 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold max-w-sm"
        style={{
          background: "#FFFFFF",
          color: "#172A35",
          border: "1px solid #E6E0D5",
          boxShadow: "0 4px 16px rgba(23, 42, 53, 0.05)",
        }}
      >
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t border-l"
          style={{ background: "#FFFFFF", borderColor: "#E6E0D5" }}
        />
        <span>"{slide.characterSpeech}"</span>
      </div>

      {/* Copy */}
      <h1 className="font-display font-800 text-2xl sm:text-3xl text-[#172A35] leading-tight mb-3">
        {slide.headline}
      </h1>
      <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed mb-6 px-2">
        {slide.supportingText}
      </p>

      {/* Feature Badges */}
      {slide.highlights.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {slide.highlights.map((item, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: "#F1EEE6",
                color: "#172A35",
                border: "1px solid #E6E0D5",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
