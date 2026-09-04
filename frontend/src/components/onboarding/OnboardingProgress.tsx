import { motion } from "framer-motion"

interface OnboardingProgressProps {
  total: number
  current: number
}

export default function OnboardingProgress({ total, current }: OnboardingProgressProps) {
  const progress = ((current + 1) / total) * 100

  return (
    <div
      className="w-full flex flex-col items-center gap-3.5"
      aria-label={`Step ${current + 1} of ${total}`}
      role="group"
    >
      {/* Editorial header — chapter + numeric */}
      <div className="w-full max-w-[420px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-[#E8E0D0] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-clay)] animate-pulse" aria-hidden />
            <span className="font-mono text-[9px] tracking-[0.14em] font-700 text-[#6B7280] uppercase">Chapter</span>
          </span>
          <span className="flex items-baseline gap-1">
            <span className="font-serif text-[14px] font-700 tracking-tight text-[var(--veyra-ink)] tabular-nums">
              0{current + 1}
            </span>
            <span className="text-[#C9B99A] font-light mx-0.5" aria-hidden>
              —
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-[#9CA3AF] tabular-nums">0{total}</span>
          </span>
          <span className="hidden sm:inline-flex h-px w-6 bg-[#E8E0D0]" aria-hidden />
          <span className="hidden md:inline font-mono text-[9px] tracking-[0.12em] text-[#9CA3AF] uppercase">
            {current === 0 && "Meet Veyra"}
            {current === 1 && "Understand"}
            {current === 2 && "Scan & Know"}
            {current === 3 && "Beyond Food"}
            {current === 4 && "AI Coach"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline font-mono text-[10px] tracking-[0.08em] text-[#9CA3AF] tabular-nums">
            {Math.round(progress)}%
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F0E8] border border-[#E8E0D0]">
            <span className="w-1 h-1 rounded-full bg-[var(--veyra-sage)]" aria-hidden />
            <span className="font-mono text-[9px] tracking-[0.12em] font-700 text-[#6B7280] uppercase">
              {total - current - 1 === 0 ? "Final" : `${total - current - 1} left`}
            </span>
          </span>
        </div>
      </div>

      {/* Stepped circles with connecting rail */}
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] flex items-center justify-between gap-1.5 sm:gap-2">
        {/* rail behind */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-px bg-[#E8E0D0]" aria-hidden />
        <motion.div
          className="absolute left-3 top-1/2 -translate-y-1/2 h-px bg-[var(--veyra-ink)]"
          initial={false}
          animate={{ width: `calc(${(current / (total - 1)) * 100}% * 0.92)` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
        />

        {Array.from({ length: total }).map((_, index) => {
          const isActive = index === current
          const isPast = index < current
          const isFuture = index > current

          return (
            <div key={index} className="relative z-10 flex flex-col items-center gap-1">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative flex items-center justify-center rounded-full border"
                style={{
                  width: isActive ? 32 : 26,
                  height: isActive ? 32 : 26,
                  background: isActive ? "var(--veyra-ink)" : isPast ? "var(--veyra-clay)" : "#FFFFFF",
                  borderColor: isActive ? "var(--veyra-ink)" : isPast ? "var(--veyra-clay)" : "#E8E0D0",
                  boxShadow: isActive
                    ? "0 4px 14px rgba(15,26,28,0.14), 0 2px 8px rgba(15,26,28,0.06)"
                    : isPast
                      ? "0 2px 8px rgba(196,90,60,0.18)"
                      : "0 2px 8px rgba(15,26,28,0.03)",
                }}
                aria-hidden
              >
                {isPast ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    className="font-mono text-[10px] font-700 tabular-nums"
                    style={{ color: isActive ? "white" : isFuture ? "#9CA3AF" : "white" }}
                  >
                    {index + 1}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="progress-active-ring"
                    className="absolute inset-[-4px] rounded-full border pointer-events-none"
                    style={{ borderColor: "rgba(196,90,60,0.18)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                )}
              </motion.div>

              {/* tiny label under active */}
              <motion.span
                aria-hidden
                className="font-mono text-[8px] tracking-[0.14em] uppercase font-700"
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 2 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ color: isActive ? "var(--veyra-clay)" : "transparent" }}
              >
                Now
              </motion.span>
            </div>
          )
        })}
      </div>

      {/* Thin fill track — editorial, subtle */}
      <div className="w-full max-w-[220px] sm:max-w-[280px] h-px bg-[#E8E0D0] relative overflow-hidden rounded-full mt-0.5">
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{ background: "linear-gradient(90deg, var(--veyra-ink) 0%, var(--veyra-clay) 100%)" }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute top-0 h-full w-10 opacity-35"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(224,122,95,0.9), transparent)",
            left: `${Math.max(0, progress - 10)}%`,
          }}
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  )
}
