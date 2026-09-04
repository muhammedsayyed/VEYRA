import { motion } from "framer-motion"
import { VeyraCompanion, Obj3D } from "@/components/VeyraCompanion"

export interface SlideData {
  id: number
  headline: string
  supportingText: string
  characterSpeech: string
  mood: "happy" | "cheer" | "focused" | "coaching" | "celebrate"
  accentObj?: "leaf" | "avocado" | "water" | "dumbbell" | "flame" | "berry"
  highlights: string[]
}

interface OnboardingSlideProps {
  slide: SlideData
}

const moodToCompanion = (mood: SlideData["mood"]): { mood: any; accent: any } => {
  switch (mood) {
    case "happy":
      return { mood: "happy", accent: "sage" }
    case "cheer":
      return { mood: "celebrate", accent: "ochre" }
    case "focused":
      return { mood: "focus", accent: "ink" }
    case "coaching":
      return { mood: "focus", accent: "sage" }
    case "celebrate":
      return { mood: "celebrate", accent: "clay" }
    default:
      return { mood: "idle", accent: "ink" }
  }
}

const accentGlow: Record<string, string> = {
  happy: "rgba(138,154,139,0.12)",
  cheer: "rgba(224,122,95,0.10)",
  focused: "rgba(15,26,28,0.08)",
  coaching: "rgba(138,154,139,0.10)",
  celebrate: "rgba(196,90,60,0.11)",
}

export default function OnboardingSlide({ slide }: OnboardingSlideProps) {
  const companion = moodToCompanion(slide.mood as any)
  const glow = accentGlow[slide.mood] ?? "rgba(15,26,28,0.08)"

  // Split headline for editorial treatment: first sentence = Fraunces, second = Instrument Serif if exists
  const parts = slide.headline.split(".")
  const hasTwoSentences = parts.length > 2 || (parts[0] && parts[1] && parts[1].trim().length > 0)
  const firstLine = parts[0]?.trim() ?? slide.headline
  const secondLine = parts.slice(1).join(".").trim().replace(/\.+$/, "")

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-6 sm:gap-8 lg:gap-10 items-center">
        {/* ── LEFT — editorial story ── */}
        <div className="order-2 lg:order-1 min-w-0 flex flex-col gap-4 sm:gap-5">
          {/* Chapter eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
            className="flex items-center gap-3"
          >
            <span className="hidden sm:inline-flex items-center gap-2">
              <span className="w-7 h-px bg-[var(--veyra-clay)]" aria-hidden />
              <span className="w-1 h-1 rounded-full bg-[var(--veyra-clay)]" aria-hidden />
            </span>
            <span className="font-mono text-[10px] tracking-[0.16em] font-700 text-[var(--veyra-clay)] uppercase">
              0{slide.id} — Editorial
            </span>
            <span className="h-px flex-1 max-w-[60px] bg-[#E8E0D0] hidden sm:block" aria-hidden />
            <span className="font-mono text-[9px] tracking-[0.12em] text-[#9CA3AF] uppercase hidden sm:inline">
              Intelligent • Warm • Personal
            </span>
          </motion.div>

          {/* Headline — cinematic Fraunces + Instrument Serif */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="space-y-2.5"
          >
            <h1 className="leading-[0.88] tracking-[-0.04em]">
              <span className="block font-serif font-700 text-[32px] sm:text-[42px] lg:text-[48px] text-[var(--veyra-ink)]">
                {firstLine}
                <span className="text-[var(--veyra-clay)]">.</span>
              </span>
              {hasTwoSentences && secondLine && (
                <span className="block label-serif text-[28px] sm:text-[36px] lg:text-[40px] font-400 tracking-[-0.02em] text-[var(--veyra-ink)]/85 leading-[0.9] mt-1">
                  {secondLine}.
                </span>
              )}
            </h1>

            <p className="text-[14px] sm:text-[15.5px] leading-[1.65] text-[#6B7280] font-400 max-w-[46ch] pt-1">
              {slide.supportingText}
            </p>
          </motion.div>

          {/* Speech — editorial quote, layered paper, not a cartoon bubble */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="relative mt-1"
          >
            <div
              className="relative flex gap-3.5 px-4 sm:px-5 py-4 rounded-[18px] overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid #E8E0D0",
                boxShadow: "0 10px 28px rgba(15,26,28,0.06), 0 2px 10px rgba(15,26,28,0.03), inset 0 1px 0 rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* clay accent bar */}
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[var(--veyra-clay)] opacity-90" />
              {/* soft glow */}
              <span
                aria-hidden
                className="absolute -top-10 -right-8 w-24 h-24 rounded-full blur-2xl opacity-[0.07]"
                style={{ background: "var(--veyra-ochre)" }}
              />

              <span className="hidden sm:flex w-8 h-8 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] items-center justify-center shrink-0 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-sage)] animate-pulse" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] tracking-[0.14em] font-700 text-[var(--veyra-sage)] uppercase">Veyra says</span>
                  <span className="w-px h-3 bg-[#E8E0D0]" aria-hidden />
                  <span className="font-mono text-[9px] tracking-[0.10em] text-[#9CA3AF] uppercase">Warm guidance</span>
                </div>
                <p className="label-serif italic text-[15px] sm:text-[16px] leading-[1.45] tracking-[-0.01em] text-[var(--veyra-ink)]">
                  “{slide.characterSpeech}”
                </p>
              </div>
            </div>
          </motion.div>

          {/* Highlights — editorial tags with stagger */}
          {slide.highlights.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-1.5 sm:gap-2 pt-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05, delayChildren: 0.26 } },
              }}
            >
              {slide.highlights.map((item, idx) => {
                const isPrimary = idx === 0
                return (
                  <motion.span
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 8, scale: 0.96 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-full text-[11px] sm:text-[12px] font-600 tracking-[-0.01em] whitespace-nowrap"
                    style={
                      isPrimary
                        ? {
                            background: "var(--veyra-ink)",
                            color: "var(--veyra-paper)",
                            border: "1px solid var(--veyra-ink)",
                            boxShadow: "0 4px 14px rgba(15,26,28,0.12)",
                          }
                        : {
                            background: "#FFFFFF",
                            color: "var(--veyra-ink)",
                            border: "1px solid #E8E0D0",
                            boxShadow: "0 2px 10px rgba(15,26,28,0.03)",
                          }
                    }
                  >
                    {isPrimary ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-ochre)] shrink-0" aria-hidden />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-[#E8E0D0] shrink-0 hidden sm:inline" aria-hidden />
                    )}
                    {item}
                  </motion.span>
                )
              })}
            </motion.div>
          )}

          {/* micro proof — editorial footer within slide (desktop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="hidden lg:flex items-center gap-3 pt-2"
          >
            <span className="w-8 h-px bg-[#E8E0D0]" aria-hidden />
            <span className="font-mono text-[10px] tracking-[0.12em] text-[#9CA3AF] uppercase">No tracking • No guilt • Just clarity</span>
          </motion.div>
        </div>

        {/* ── RIGHT — visual theatre — cinematic paper stage ── */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center min-h-[260px] sm:min-h-[320px] lg:min-h-[440px] py-2 lg:py-6 isolate">
          {/* ambient glow layers behind */}
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none"
          >
            <div
              className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle at 50% 50%, ${glow} 0%, transparent 68%)` }}
            />
          </motion.div>

          {/* layered paper pedestal */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[340px] lg:h-[340px] rounded-[32px] rotate-[-2deg] pointer-events-none"
            style={{
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(232,224,208,0.9)",
              boxShadow: "0 18px 48px rgba(15,26,28,0.06), 0 4px 14px rgba(15,26,28,0.03)",
              backdropFilter: "blur(8px)",
            }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[310px] lg:h-[310px] rounded-[28px] rotate-[1.2deg] pointer-events-none"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8E0D0",
              boxShadow: "0 12px 36px rgba(15,26,28,0.05), 0 2px 8px rgba(15,26,28,0.03)",
            }}
          />

          {/* soft halo behind companion */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(245,240,232,0.9) 42%, transparent 74%)",
              filter: "blur(0.5px)",
            }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* companion — paper-cut, not blob */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0.94, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            <div className="hidden sm:block">
              <VeyraCompanion mood={companion.mood} accent={companion.accent} size={170} float={true} />
            </div>
            <div className="sm:hidden">
              <VeyraCompanion mood={companion.mood} accent={companion.accent} size={132} float={true} />
            </div>
          </motion.div>

          {/* floating accent card — tactile glass/paper */}
          {slide.accentObj && (
            <motion.div
              className="absolute z-20 pointer-events-none"
              style={{ top: "6%", right: "4%" }}
              initial={{ y: 12, opacity: 0, rotate: -4, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, 1.2, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-[16px] sm:rounded-[18px] p-1 sm:p-1.5"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(232,224,208,0.95)",
                  boxShadow: "0 10px 28px rgba(15,26,28,0.08), 0 3px 10px rgba(15,26,28,0.04)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Obj3D kind={slide.accentObj} size={44} float={false} />
                {/* clay dot */}
                <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-[var(--veyra-clay)] border-2 border-white shadow-sm hidden sm:block" aria-hidden />
              </motion.div>
              {/* label under floating card — editorial */}
              <div className="hidden lg:flex justify-center mt-2">
                <span className="px-2 py-1 rounded-full bg-[var(--veyra-ink)] text-white font-mono text-[8px] tracking-[0.12em] font-700 uppercase shadow-sm">
                  {slide.accentObj} • focus
                </span>
              </div>
            </motion.div>
          )}

          {/* secondary floating — subtle, only on large */}
          <motion.div
            aria-hidden
            className="absolute z-10 left-[6%] bottom-[18%] hidden lg:block pointer-events-none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[#E8E0D0] shadow-[0_8px_20px_rgba(15,26,28,0.06)]"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--veyra-sage)] animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.12em] font-700 text-[var(--veyra-ink)] uppercase">Live</span>
              <span className="w-px h-3 bg-[#E8E0D0]" />
              <span className="font-mono text-[9px] tracking-[0.10em] text-[#6B7280]">Wellness</span>
            </motion.div>
          </motion.div>

          {/* orbital specks — cinematic */}
          <motion.span
            aria-hidden
            className="absolute left-[10%] top-[14%] w-1.5 h-1.5 rounded-full bg-[var(--veyra-ochre)] opacity-60"
            animate={{ y: [0, -7, 0], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden
            className="absolute right-[18%] bottom-[16%] w-1 h-1 rounded-full bg-[var(--veyra-sage)] opacity-50 hidden sm:block"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3.9, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          />
          <motion.span
            aria-hidden
            className="absolute right-[8%] top-[28%] w-1 h-1 rounded-full bg-[var(--veyra-clay)] opacity-35 hidden lg:block"
            animate={{ y: [0, -4, 0], x: [0, 2, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
