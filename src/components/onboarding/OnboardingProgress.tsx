import React from "react"

interface OnboardingProgressProps {
  total: number
  current: number
}

export default function OnboardingProgress({ total, current }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 my-4" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current
        return (
          <div
            key={index}
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: isActive ? 28 : 10,
              backgroundColor: isActive ? "#C18A5A" : "#E6E0D5",
              boxShadow: isActive ? "0 2px 8px rgba(193, 138, 90, 0.3)" : "none",
            }}
          />
        )
      })}
    </div>
  )
}
