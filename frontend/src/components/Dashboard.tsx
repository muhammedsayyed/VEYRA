import React, { useState, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { VeyraCompanion } from "@/components/VeyraCompanion"
import { VeyraSticker } from "@/components/VeyraSticker"
import {
  FlameIcon,
  DropletIcon,
  ZapIcon,
  TrendingUpIcon,
  SparklesIcon,
  ChevronRightIcon,
  PlusIcon,
  CameraIcon,
  BookIcon,
  DumbbellIcon,
  BrainIcon,
} from "@/components/icons"
import { useApp } from "@/context/AppContext"
import { Screen } from "@/types"
import { buildVeyraUserContext } from "@/services/ai/aiContext"
import { VeyraAIService } from "@/services/ai/aiService"

/* ── helpers ─────────────────────────────────────────────── */

function useCountUp(target: number, duration = 1200, start = true) {
  const [val, setVal] = useState(0)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    if (!start) return
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [target, duration, start])
  return val
}

function toCompanionMood(m: string): "idle" | "happy" | "think" | "celebrate" | "focus" | "warm" {
  switch (m) {
    case "celebrate":
      return "celebrate"
    case "think":
    case "concerned":
    case "warn":
    case "zen":
      return "think"
    case "coaching":
    case "focused":
    case "focus":
      return "focus"
    case "happy":
    case "cheer":
    case "wave":
    case "wink":
    case "hydrated":
      return "happy"
    case "hungry":
      return "warm"
    default:
      return "idle"
  }
}

/* ── Fuel Ring — editorial, tactile, warm ───────────────── */

function FuelRing({ pct, kcalLeft, started }: { pct: number; kcalLeft: number; started: boolean }) {
  const left = Math.round(useCountUp(kcalLeft, 1300, started))
  const clamped = Math.min(Math.max(pct, 0), 100)
  const size = 224
  const stroke = 11
  const r = 88
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c
  const id = "fuel-veyra"

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 100%, rgba(196,90,60,0.06) 0%, transparent 62%)",
          filter: "blur(1px)",
        }}
      />
      <div className="absolute inset-[10px] rounded-full blur-[20px] opacity-[0.06] pointer-events-none" style={{ background: "#0F1A1C" }} />

      <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }} className="relative">
        <defs>
          <linearGradient id={`track-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5F0E8" />
            <stop offset="100%" stopColor="#E8E0D0" />
          </linearGradient>
          <linearGradient id={`progress-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F1A1C" />
            <stop offset="58%" stopColor="#1D2A2E" />
            <stop offset="100%" stopColor="#C45A3C" />
          </linearGradient>
          <linearGradient id={`progress-alt-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C45A3C" />
            <stop offset="100%" stopColor="#E07A5F" />
          </linearGradient>
          <filter id={`shadow-${id}`}>
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0F1A1C" floodOpacity="0.06" />
          </filter>
        </defs>

        <circle cx="100" cy="100" r={r} fill="white" stroke={`url(#track-${id})`} strokeWidth={stroke} filter={`url(#shadow-${id})`} />
        <circle cx="100" cy="100" r={r - stroke / 2 - 2} fill="white" opacity={0.9} />
        <circle cx="100" cy="100" r={r - stroke / 2 - 2} fill="none" stroke="rgba(15,26,28,0.04)" strokeWidth={1} />

        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={pct >= 100 ? `url(#progress-alt-${id})` : `url(#progress-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={started ? offset : c}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "100px 100px",
            transition: "stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        {clamped > 4 && (
          <circle
            cx="100"
            cy="12"
            r="4.2"
            fill={pct >= 100 ? "#E07A5F" : "#0F1A1C"}
            opacity={started ? 1 : 0}
            style={{
              transform: `rotate(${clamped * 3.6}deg)`,
              transformOrigin: "100px 100px",
              transition: "transform 1.6s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease 0.6s",
              filter: "drop-shadow(0 2px 8px rgba(15,26,28,0.18))",
            }}
          />
        )}
        <ellipse cx="72" cy="52" rx="22" ry="11" fill="white" opacity={0.42} />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C] animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold text-[#8A9A8B]">
            {Math.round(pct)}% • {pct >= 100 ? "Complete" : pct > 72 ? "Almost there" : "On track"}
          </span>
        </div>

        <div
          className="font-serif font-bold leading-none text-[#0F1A1C] mt-1.5"
          style={{ fontSize: 48, letterSpacing: "-0.045em", fontVariationSettings: '"opsz" 72' }}
        >
          {left.toLocaleString()}
        </div>
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold text-[#9CA3AF] mt-1">kcal left today</div>

        <div className="mt-2.5 inline-flex items-center rounded-full bg-[#0F1A1C] text-[#FFFBF5] px-2.5 py-1">
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase font-bold leading-none">
            {pct >= 100 ? "✓ Goal met" : `${Math.max(0, Math.round(100 - pct))}% remaining`}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard ─────────────────────────────────────────── */

export default function Dashboard({ setScreen }: { setScreen: (s: Screen) => void }) {
  const { user, meals, waterLiters, addWater, resetWater, mascotMood } = useApp()
  const prefersReduced = useReducedMotion()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 180)
    return () => clearTimeout(t)
  }, [])

  const totalCal = meals.reduce((sum, m) => sum + m.calories, 0)
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0)
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0)
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0)
  const kcalLeft = Math.max(user.dailyCalories - totalCal, 0)
  const proteinLeft = Math.max(user.dailyProtein - totalProtein, 0)
  const pctCal = Math.min((totalCal / user.dailyCalories) * 100, 100)
  const waterPct = Math.min((waterLiters / user.dailyWater) * 100, 100)

  const macros = [
    { label: "Protein", cur: totalProtein, goal: user.dailyProtein, unit: "g", color: "#0F1A1C" },
    { label: "Carbs", cur: totalCarbs, goal: user.dailyCarbs, unit: "g", color: "#1D2A2E" },
    { label: "Fat", cur: totalFat, goal: user.dailyFat, unit: "g", color: "#C45A3C" },
  ]

  const context = buildVeyraUserContext(user, meals, waterLiters)
  const insight = VeyraAIService.generateDashboardInsight(context)
  const companionMood = toCompanionMood(mascotMood)
  const companionAccent: "ink" | "clay" | "sage" | "ochre" =
    companionMood === "celebrate" ? "ochre" : companionMood === "think" ? "sage" : companionMood === "warm" ? "clay" : companionMood === "focus" ? "ink" : "clay"

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: prefersReduced ? 0 : 0.06, delayChildren: 0.08 } },
  } as const
  const item = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  } as const

  return (
    <div className="screen-scroll">
      <div className="mx-auto max-w-[1160px] w-full">
        {/* ── Masthead ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden sm:flex items-center justify-between py-3 mb-6 border-y border-[#E8E0D0]/70"
        >
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#9CA3AF] flex items-center gap-3">
            <span className="text-[#0F1A1C] font-bold tracking-[0.14em]">VEYRA</span>
            <span className="w-px h-3 bg-[#E8E0D0] hidden sm:block" />
            <span className="hidden md:inline">{dateStr}</span>
            <span className="hidden lg:inline text-[#9CA3AF]/80">• Day 12 — ritual in motion</span>
          </span>
          <span className="font-mono text-[10px] tracking-[0.13em] uppercase text-[#9CA3AF] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse hidden sm:block" />
            <span className="hidden md:inline">Live</span> • {meals.length} meals • {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </motion.div>

        {/* ── HERO — PRIMARY: who you are, today's state, next action ── */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] mb-6 sm:mb-8"
          style={{ background: "#0F1A1C" }}
        >
          {/* ambient — warm, cinematic, not beige-heavy */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.055]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
            />
            <div
              className="absolute -top-24 -right-16 w-[520px] h-[520px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(196,90,60,0.10) 0%, transparent 68%)" }}
            />
            <div
              className="absolute -bottom-32 -left-20 w-[600px] h-[480px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(138,154,139,0.07) 0%, transparent 70%)" }}
            />
            <div className="absolute top-[34%] left-[36%] w-[420px] h-[340px] rounded-[45%_55%_50%_50%] opacity-[0.03]" style={{ background: "radial-gradient(ellipse, #FFFBF5 0%, transparent 70%)" }} />
            <div
              aria-hidden
              className="absolute -bottom-3 right-6 lg:right-8 font-serif font-bold leading-none select-none pointer-events-none hidden lg:block"
              style={{ fontSize: 132, letterSpacing: "-0.06em", color: "rgba(255,251,245,0.03)" }}
            >
              {String(Math.round(pctCal)).padStart(2, "0")}
            </div>
          </div>

          <div className="relative grid lg:grid-cols-[1.08fr_0.92fr] gap-6 sm:gap-8 p-5 sm:p-8 lg:p-10 items-center">
            {/* copy — strong editorial hierarchy */}
            <motion.div variants={item} className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold text-white/90">{user.goal}</span>
                </span>
                <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                <span className="font-mono text-[10px] tracking-[0.13em] uppercase font-medium text-white/45 truncate max-w-[180px] sm:max-w-none">{dateStr}</span>
              </div>

              {/* headline — Fraunces display 700 + Outfit UI 800 */}
              <h1 className="mt-5 sm:mt-6">
                <span className="font-serif block text-[30px] min-[375px]:text-[33px] sm:text-[46px] lg:text-[52px] font-light leading-[0.9] tracking-[-0.04em] text-[#FFFBF5]/90"> {greeting}, </span>
                <span className="block text-[30px] min-[375px]:text-[33px] sm:text-[46px] lg:text-[52px] font-bold leading-[0.9] tracking-[-0.035em] text-white mt-1 flex flex-wrap items-baseline gap-x-2 sm:gap-x-3">
                  <span className="font-serif font-bold tracking-[-0.04em]">{user.name.split(" ")[0]}</span>
                  <span className="font-serif italic font-normal text-[#E07A5F] text-[30px] sm:text-[46px] leading-none">.</span>
                  <span className="hidden sm:inline-flex items-center ml-1">
                    <span className="font-mono text-[10px] tracking-[0.15em] font-semibold text-white/35 uppercase border border-white/10 rounded-full px-2.5 py-1">Today is yours</span>
                  </span>
                </span>
              </h1>

              <div className="mt-4 sm:mt-5 max-w-[46ch]">
                <p className="text-[13px] sm:text-[14px] leading-[1.7] text-white/65" style={{ fontFamily: "Inter, sans-serif" }}>
                  You&apos;re at{" "}
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-white text-[#0F1A1C] text-[11px] sm:text-xs font-extrabold leading-none mx-1 align-middle">
                    {Math.round(pctCal)}%
                  </span>{" "}
                  of your fuel.{" "}
                  {proteinLeft > 0 ? (
                    <>
                      <span className="text-[#E07A5F] font-bold">{proteinLeft}g protein</span> still open — close the gap with a clean, intentional plate.
                    </>
                  ) : (
                    <span className="text-white font-semibold">Protein complete — beautifully done.</span>
                  )}{" "}
                  <span className="hidden sm:inline text-white/40">Veyra is tracking live, so you don&apos;t have to.</span>
                </p>
              </div>

              {/* today pills — tactile metrics */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white text-[#0F1A1C] text-[11px] sm:text-xs font-bold tracking-tight leading-none">
                  <span className="w-2 h-2 rounded-full bg-[#C45A3C] shrink-0" />
                  <span className="truncate">
                    {totalCal.toLocaleString()} / {user.dailyCalories.toLocaleString()} kcal
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#C45A3C] text-white text-[11px] sm:text-xs font-bold leading-none">
                  <DropletIcon size={14} /> {waterLiters.toFixed(1)}L water
                </span>
                <span className="hidden lg:inline-flex items-center px-3 py-2 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white/70 text-[11px] font-semibold leading-none">
                  {meals.length} meals • {Math.round(pctCal)}% fuel • {Math.round(waterPct)}% water
                </span>
              </div>

              {/* next actions — primary CTA restrained: clay only for primary */}
              <div className="mt-6 sm:mt-7 flex flex-wrap gap-2.5">
                <button
                  onClick={() => setScreen("log")}
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#0F1A1C] text-[13px] font-bold hover:gap-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98]"
                >
                  Log today&apos;s plate <ChevronRightIcon size={14} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
                <button
                  onClick={() => setScreen("scanner")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white text-[13px] font-semibold hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.98]"
                >
                  <CameraIcon size={14} className="shrink-0" /> Scan food
                </button>
                <button
                  onClick={() => setScreen("ai")}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-white/70 text-[13px] font-medium hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Ask Veyra <span className="text-white/30">→</span>
                </button>
              </div>

              <div className="mt-5 sm:mt-6 flex items-center gap-3 text-white/35">
                <span className="h-px w-8 bg-white/15 hidden sm:block shrink-0" />
                <span className="font-mono text-[10px] tracking-[0.11em] uppercase leading-none">No tracking fatigue — just one clear next step</span>
              </div>
            </motion.div>

            {/* companion stage — warm, paper-cut, alive — tactile, not green ball */}
            <motion.div
              variants={item}
              className="relative flex justify-center lg:justify-end items-center min-h-[280px] sm:min-h-[320px] lg:min-h-[380px] mt-2 lg:mt-0"
            >
              <div className="absolute inset-0 lg:left-4 flex items-center justify-center pointer-events-none">
                <div
                  className="w-[380px] sm:w-[500px] h-[260px] sm:h-[320px] rounded-[40px] opacity-[0.09]"
                  style={{ background: "radial-gradient(ellipse at center, #FFFBF5 0%, transparent 70%)" }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[360px] h-[360px] rounded-full blur-[56px] opacity-30" style={{ background: "radial-gradient(circle, #C45A3C 0%, transparent 68%)" }} />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1 right-2 sm:right-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-white/60 shadow-sm z-10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase font-bold text-[#0F1A1C]">Vey is with you</span>
              </motion.div>

              <div className="relative">
                <div
                  className="absolute -inset-7 rounded-[36px] pointer-events-none hidden sm:block"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
                <button
                  onClick={() => setScreen("ai")}
                  className="relative block hover:scale-[1.02] active:scale-[0.99] transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-[28px]"
                  aria-label="Open Veyra AI"
                >
                  <VeyraSticker name="sos" size={340} className="w-[260px] sm:w-[320px] lg:w-[360px] h-auto" alt="Veyra SOS companion" />
                </button>

                <div className="absolute -bottom-4 -left-3 sm:-left-8 bg-white rounded-2xl px-3.5 py-2.5 flex items-center gap-3 shadow-[0_8px_28px_rgba(15,26,28,0.14)] border border-[#E8E0D0]/70 max-w-[240px]">
                  <div className="w-9 h-9 rounded-xl grid place-items-center text-white shrink-0" style={{ background: "#0F1A1C" }}>
                    <FlameIcon size={16} />
                  </div>
                  <div className="leading-none min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.11em] uppercase font-semibold text-[#9CA3AF]">Fuel</div>
                    <div className="font-display font-extrabold text-[12px] sm:text-[13px] text-[#0F1A1C] mt-0.5 truncate">
                      {Math.round(pctCal)}% • {kcalLeft.toLocaleString()} kcal left
                    </div>
                  </div>
                </div>

                <div className="absolute -top-3 -right-2 lg:-right-6 hidden lg:flex bg-[#FFFBF5] rounded-2xl px-3.5 py-2.5 items-center gap-2.5 shadow-[0_8px_20px_rgba(15,26,28,0.10)] border border-[#E8E0D0]">
                  <div className="w-7 h-7 rounded-full grid place-items-center text-white shrink-0" style={{ background: "#1D2A2E" }}>
                    <DropletIcon size={12} />
                  </div>
                  <div className="leading-none">
                    <div className="font-mono text-[9px] tracking-[0.11em] uppercase font-semibold text-[#9CA3AF]">Water</div>
                    <div className="text-xs font-bold text-[#0F1A1C]">{waterLiters.toFixed(1)}L • {Math.round(waterPct)}%</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 hidden xl:flex items-center gap-2 text-white/30">
                <span className="w-6 h-px bg-white/20" />
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase">Tap companion to chat</span>
              </div>
            </motion.div>
          </div>

          {/* hero footer — live ticker — deliberate divider, not card */}
          <div className="relative h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
          <div className="relative flex flex-wrap items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse shrink-0" />
            <span className="font-mono text-[10px] tracking-[0.11em] uppercase text-white/55 hidden sm:inline truncate">
              Live nutrition • {meals.length} meals • {Math.round(pctCal)}% fuel • {waterLiters.toFixed(1)}L water • Updated {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="font-mono text-[10px] tracking-[0.11em] uppercase text-white/55 sm:hidden truncate">
              {meals.length} meals • {Math.round(pctCal)}% fuel • {waterLiters.toFixed(1)}L
            </span>
            <button onClick={() => setScreen("log")} className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-white hover:text-[#E07A5F] transition-colors shrink-0">
              Open food log <ChevronRightIcon size={12} />
            </button>
          </div>
        </motion.section>

        {/* ── SECONDARY: Fuel detail + Insight ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-6 sm:mb-8"
        >
          {/* Fuel card — paper, refined — veyra-card (#FFFFFF 1px #E8E0D0) */}
          <div className="lg:col-span-7 rounded-[28px] p-5 sm:p-7 relative overflow-hidden bg-white border border-[#E8E0D0] shadow-[0_4px_20px_rgba(15,26,28,0.04)]">
            <div className="absolute top-0 right-0 w-64 h-40 opacity-[0.03] pointer-events-none" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 opacity-[0.02] pointer-events-none" style={{ background: "radial-gradient(circle, #C45A3C 0%, transparent 70%)" }} />

            <div className="relative">
              <div className="flex items-start justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold text-[#8A9A8B] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C] shrink-0" />
                    Today&apos;s Fuel
                  </p>
                  <h3 className="font-serif text-[20px] sm:text-[23px] leading-[1.05] tracking-[-0.02em] text-[#0F1A1C] mt-2">
                    {proteinLeft > 0 ? (
                      <>
                        Balanced — <span className="text-[#C45A3C] italic font-normal"> {proteinLeft}g protein</span> to close
                      </>
                    ) : (
                      <>
                        Protein complete — <span className="italic font-normal text-[#1D2A2E]">excellent</span>
                      </>
                    )}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#9CA3AF] mt-1.5 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                    {totalCal.toLocaleString()} of {user.dailyCalories.toLocaleString()} kcal • {meals.length} meals • {waterLiters.toFixed(1)}L water
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" /> {Math.round(pctCal)}% fuel
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="shrink-0">
                  <FuelRing pct={pctCal} kcalLeft={kcalLeft} started={started} />
                </div>

                <div className="flex-1 w-full min-w-0">
                  <div className="space-y-4">
                    {macros.map((m, i) => {
                      const leftAmt = Math.max(m.goal - m.cur, 0)
                      const p = Math.min((m.cur / m.goal) * 100, 100)
                      return (
                        <motion.div
                          key={m.label}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="group"
                        >
                          <div className="flex items-baseline justify-between mb-1.5 gap-2">
                            <span className="text-[13px] font-bold tracking-tight text-[#0F1A1C] flex items-center gap-2 min-w-0" style={{ fontFamily: "Outfit, sans-serif" }}>
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                              <span className="truncate">{m.label}</span>
                              <span className="hidden md:inline font-mono text-[10px] font-medium tracking-wide text-[#9CA3AF] ml-1 truncate">
                                {m.cur} / {m.goal}
                                {m.unit}
                              </span>
                            </span>
                            <span className="text-xs text-[#6B7280] shrink-0" style={{ fontFamily: "Inter, sans-serif" }}>
                              <span className="text-[#0F1A1C] font-bold">
                                {leftAmt}
                                {m.unit}
                              </span>{" "}
                              <span className="text-[#9CA3AF]">left</span>
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden relative" style={{ background: "#E8E0D0" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${started ? p : 0}%` }}
                              transition={{ delay: 0.5 + i * 0.08, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full relative overflow-hidden"
                              style={{ background: m.color }}
                            >
                              <span
                                className="absolute inset-0 opacity-[0.18]"
                                style={{
                                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                                  transform: "translateX(-100%)",
                                  animation: prefersReduced ? "none" : `shimmer 2.2s ease ${0.9 + i * 0.2}s both`,
                                }}
                              />
                            </motion.div>
                          </div>
                          <div className="flex justify-between mt-1 gap-2">
                            <span className="font-mono text-[10px] tracking-wide text-[#9CA3AF]">{Math.round(p)}% filled</span>
                            <span className="font-mono text-[10px] text-[#C45A3C] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">Keep going →</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E8E0D0]/70 flex items-center justify-between gap-3 flex-wrap">
                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#9CA3AF]">Goal: {user.dailyCalories.toLocaleString()} kcal</span>
                    <button
                      onClick={() => setScreen("log")}
                      className="text-xs font-bold text-[#0F1A1C] inline-flex items-center gap-1 hover:gap-1.5 transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 rounded-full px-1"
                    >
                      Manage meals <ChevronRightIcon size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insight — ink editorial, companion-forward — veyra-hero */}
          <motion.button
            onClick={() => setScreen("ai")}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={prefersReduced ? {} : { y: -3 }}
            whileTap={prefersReduced ? {} : { scale: 0.99 }}
            className="lg:col-span-5 rounded-[28px] p-5 sm:p-7 relative overflow-hidden text-left group flex flex-col min-h-[320px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 w-full"
            style={{ background: "#0F1A1C" }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(620px circle at 88% 0%, #E07A5F 0%, transparent 56%)" }} />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />

            <div className="relative flex items-center gap-2 mb-5">
              <span className="w-7 h-7 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 shrink-0">
                <SparklesIcon size={13} className="text-[#E07A5F]" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase truncate">Veyra AI • {insight.tag.toUpperCase()}</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-[#8A9A8B] animate-pulse shrink-0" />
            </div>

            <div className="relative flex gap-4 items-start min-w-0">
              <div className="shrink-0 -ml-1 hidden sm:block">
                <VeyraCompanion mood="think" accent="sage" size={68} float={false} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif font-bold text-[17px] sm:text-[18px] leading-[1.25] tracking-tight text-white">{insight.title}</p>
                <p className="text-[13px] leading-[1.65] text-white/60 mt-2.5 line-clamp-4" style={{ fontFamily: "Inter, sans-serif" }}>
                  {insight.body}
                </p>
              </div>
            </div>

            <div className="relative mt-auto pt-6 sm:pt-7">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#0F1A1C] text-xs font-extrabold group-hover:gap-2 transition-all">
                  Find protein <ChevronRightIcon size={12} className="shrink-0" />
                </span>
                <span className="inline-flex items-center px-4 py-2.5 rounded-full bg-white/10 backdrop-blur text-white text-xs font-semibold border border-white/10">Ask Veyra</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-white/30">
                <span className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase shrink-0">Personal • Live context</span>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* ── Metrics — editorial strip, breathing — secondary ─────── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[24px] sm:rounded-[28px] overflow-hidden mb-6 sm:mb-8 bg-white border border-[#E8E0D0] shadow-[0_4px_20px_rgba(15,26,28,0.04)]"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E0D0]/70">
            {[
              { label: "Steps", cur: 7480, goal: "10,000", unit: "", color: "#0F1A1C", icon: <TrendingUpIcon size={16} />, pct: 75 },
              { label: "Burned", cur: 320, goal: "500", unit: "kcal", color: "#C45A3C", icon: <FlameIcon size={16} />, pct: 64 },
              { label: "Water", cur: waterLiters, goal: user.dailyWater.toString(), unit: "L", color: "#1D2A2E", icon: <DropletIcon size={16} />, pct: waterPct, dec: true },
              { label: "Active", cur: 42, goal: "60", unit: "min", color: "#0F1A1C", icon: <ZapIcon size={16} />, pct: 70 },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative p-4 sm:p-5 flex flex-col gap-3 group hover:bg-[#FFFBF5]/60 transition-colors min-w-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ background: `${m.color}10`, color: m.color, borderColor: `${m.color}14` }}
                  >
                    {m.icon}
                  </div>
                  <span className="font-mono text-[10px] px-2 py-1 rounded-full font-bold tracking-wide text-white shrink-0" style={{ background: m.pct >= 100 ? "#8A9A8B" : "#0F1A1C" }}>
                    {Math.round(m.pct)}%
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="font-serif font-bold text-[22px] sm:text-[24px] tracking-[-0.02em] text-[#0F1A1C] leading-none">
                      {m.dec ? (m.cur as number).toFixed(1) : (m.cur as number).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-[#6B7280]">{m.unit}</span>
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#9CA3AF] mt-1 truncate">
                    {m.label} • of {m.goal}
                    {m.unit}
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E8E0D0" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(m.pct, 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                </div>
                <span className="absolute bottom-0 left-4 right-4 h-px bg-[#0F1A1C] opacity-0 group-hover:opacity-[0.06] transition-opacity hidden lg:block pointer-events-none" />
              </motion.div>
            ))}
          </div>

          <div className="hidden sm:flex items-center justify-between px-5 py-2.5 bg-[#FFFBF5]/50 border-t border-[#E8E0D0]/60">
            <span className="font-mono text-[10px] tracking-[0.13em] uppercase text-[#9CA3AF]">Pulse • Today • Updated live</span>
            <button onClick={() => setScreen("fitness")} className="text-xs font-bold text-[#0F1A1C] inline-flex items-center gap-1 hover:gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15 rounded-full px-1">
              Fitness <ChevronRightIcon size={12} />
            </button>
          </div>
        </motion.section>

        {/* ── Quick actions — curated, asymmetric — tertiary, not dominant ─── */}
        <div className="mb-3 flex items-baseline justify-between gap-4 flex-wrap">
          <h2 className="font-serif text-[20px] sm:text-[22px] font-light italic tracking-[-0.02em] text-[#0F1A1C] leading-none">
            Jump in<span className="font-display not-italic font-extrabold tracking-tight"> — quick actions</span>
          </h2>
          <span className="hidden sm:block font-mono text-[10px] tracking-[0.15em] text-[#9CA3AF] uppercase shrink-0">Choose your next step</span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            whileHover={prefersReduced ? {} : { y: -3 }}
            whileTap={prefersReduced ? {} : { scale: 0.99 }}
            onClick={() => setScreen("scanner")}
            className="col-span-2 lg:row-span-2 relative overflow-hidden rounded-[28px] p-6 sm:p-7 flex flex-col justify-between items-start text-left group min-h-[168px] lg:min-h-[216px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 w-full"
            style={{ background: "#0F1A1C", color: "white" }}
          >
            <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{ background: "radial-gradient(520px circle at 100% 0%, #E07A5F 0%, transparent 62%)" }} />
            <div className="absolute -bottom-10 -right-10 opacity-[0.08] group-hover:opacity-[0.13] group-hover:scale-[1.04] transition-all duration-700 pointer-events-none hidden sm:block">
              <div className="w-[120px] h-[120px] rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #FFFBF5 0%, #E8E0D0 55%, #C45A3C 100%)", opacity: 0.12 }} />
            </div>

            <div className="relative w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 group-hover:bg-white/15 transition-colors shrink-0">
              <CameraIcon size={20} className="text-white" />
            </div>

            <div className="relative mt-6 w-full">
              <div className="font-serif font-bold text-[22px] sm:text-[24px] leading-none tracking-tight">Scan Food</div>
              <div className="text-[13px] leading-relaxed text-white/60 mt-2 max-w-[22ch]" style={{ fontFamily: "Inter, sans-serif" }}>
                Instant AI breakdown &amp; product comparison
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white">
                Start scanning <span className="w-5 h-5 rounded-full bg-white text-[#0F1A1C] grid place-items-center group-hover:translate-x-0.5 transition-transform shrink-0 text-[11px]">→</span>
              </div>
            </div>
          </motion.button>

          {[
            { label: "Log Meal", icon: <PlusIcon size={16} />, screen: "log" as Screen, bg: "#FFFFFF", color: "#0F1A1C", note: "Add • Edit • Balance" },
            { label: "Workout", icon: <DumbbellIcon size={16} />, screen: "fitness" as Screen, bg: "#FFFBF5", color: "#0F1A1C", note: "Move • Sweat • Recover" },
            { label: "Coach", icon: <BookIcon size={16} />, screen: "coach" as Screen, bg: "#FFFFFF", color: "#0F1A1C", note: "Guidance • Daily tip" },
            { label: "Ask AI", icon: <BrainIcon size={16} />, screen: "ai" as Screen, bg: "#FFFBF5", color: "#C45A3C", accent: true, note: "Chat • Plan • Insight" },
          ].map((a, i) => (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={prefersReduced ? {} : { y: -3 }}
              whileTap={prefersReduced ? {} : { scale: 0.98 }}
              onClick={() => setScreen(a.screen)}
              className="rounded-[22px] sm:rounded-[24px] p-4 sm:p-[18px] flex flex-col items-start gap-3 text-left group border min-h-[110px] sm:min-h-[112px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15 w-full min-w-0"
              style={{ background: a.bg, borderColor: a.accent ? "#0F1A1C" : "#E8E0D0", boxShadow: "0 4px 20px rgba(15,26,28,0.04)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  background: a.accent ? "#0F1A1C" : "rgba(15,26,28,0.06)",
                  color: a.accent ? "#FFFBF5" : a.color,
                  borderColor: a.accent ? "#0F1A1C" : "rgba(15,26,28,0.06)",
                }}
              >
                {a.icon}
              </div>
              <div className="mt-auto w-full min-w-0">
                <div className="font-display font-extrabold text-[13px] sm:text-[14px] leading-none text-[#0F1A1C] flex items-center justify-between w-full gap-2">
                  <span className="truncate">{a.label}</span> <span className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">→</span>
                </div>
                <div className="font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-1 truncate">{a.note}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Journal — SECONDARY: meals + Hydration / TERTIARY side ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-8"
        >
          {/* meals — secondary prominence */}
          <div className="lg:col-span-7 xl:col-span-8 min-w-0">
            <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
              <h2 className="font-serif text-[19px] sm:text-[22px] italic tracking-[-0.02em] text-[#0F1A1C] leading-none">
                Today&apos;s <span className="font-display not-italic font-extrabold">logged meals</span>
              </h2>
              <button onClick={() => setScreen("log")} className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#C45A3C] hover:gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C45A3C]/20 rounded-full px-1">
                View all <ChevronRightIcon size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {meals.length === 0 ? (
                <div className="rounded-[20px] p-8 sm:p-10 text-center bg-white border border-[#E8E0D0] shadow-[0_4px_20px_rgba(15,26,28,0.04)]">
                  <div className="w-10 h-10 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] grid place-items-center mx-auto text-[#0F1A1C]">
                    <PlusIcon size={18} />
                  </div>
                  <p className="font-display font-bold text-sm text-[#0F1A1C] mt-3">No meals yet</p>
                  <p className="text-xs leading-relaxed text-[#6B7280] mt-1 max-w-[32ch] mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
                    Scan or log your first meal — Veyra will build your day around it.
                  </p>
                  <div className="mt-4 flex justify-center gap-2 flex-wrap">
                    <button onClick={() => setScreen("scanner")} className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#0F1A1C] text-white text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20">
                      Scan food
                    </button>
                    <button onClick={() => setScreen("log")} className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-white border border-[#E8E0D0] text-xs font-semibold text-[#0F1A1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15">
                      Log meal
                    </button>
                  </div>
                </div>
              ) : (
                meals.map((meal, i) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={prefersReduced ? {} : { y: -2 }}
                    className="group rounded-[20px] p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 bg-white border border-[#E8E0D0] shadow-[0_2px_12px_rgba(15,26,28,0.03)] hover:shadow-md transition-shadow min-w-0"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-[#FFFBF5] border border-[#E8E0D0]/70">
                      <img
                        src={meal.img || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=80&h=80&fit=crop"}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] tracking-[0.11em] uppercase px-1.5 py-0.5 rounded-full bg-[#0F1A1C] text-white leading-none">{meal.sectionId}</span>
                        <span className="hidden sm:inline font-mono text-[10px] text-[#9CA3AF] truncate">{meal.time}</span>
                      </div>
                      <p className="font-display font-bold text-[13px] sm:text-sm text-[#0F1A1C] truncate mt-1 leading-none">{meal.name}</p>
                      <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5 flex-wrap" style={{ fontFamily: "Inter, sans-serif" }}>
                        <span className="sm:hidden">{meal.time} •</span> {meal.grams}g • {meal.carbs}g C • {meal.fat}g F
                      </p>
                    </div>
                    <div className="text-right shrink-0 pl-2 border-l border-[#E8E0D0]/60 ml-1 min-w-[64px]">
                      <div className="font-serif font-bold text-[#0F1A1C] text-[15px] leading-none">{meal.calories}</div>
                      <div className="font-mono text-[10px] tracking-wide text-[#9CA3AF]">KCAL</div>
                      <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] text-[11px] font-bold text-[#0F1A1C] leading-none">
                        {meal.protein}g P
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              {meals.length > 0 && (
                <button
                  onClick={() => setScreen("log")}
                  className="sm:hidden w-full mt-1 inline-flex items-center justify-center gap-1 text-xs font-bold text-[#0F1A1C] py-2.5 rounded-full border border-[#E8E0D0] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15"
                >
                  View all meals <ChevronRightIcon size={12} />
                </button>
              )}
            </div>
          </div>

          {/* side — hydration secondary, fitness/tertiary stacked — calm, not card-overload */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 min-w-0">
            {/* Hydration — tactile, warm accent — secondary weight */}
            <div className="rounded-[24px] p-5 relative overflow-hidden bg-white border border-[#E8E0D0] shadow-[0_4px_20px_rgba(15,26,28,0.04)]">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-[0.035] pointer-events-none" style={{ background: "radial-gradient(circle, #1D2A2E 0%, transparent 70%)" }} />
              <div className="relative">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#1D2A2E] flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D2A2E] shrink-0" /> Hydration
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                      <span className="font-serif text-[30px] font-bold tracking-[-0.03em] text-[#0F1A1C] leading-none">{waterLiters.toFixed(2).replace(/\.?0+$/, "")}</span>
                      <span className="text-sm font-medium text-[#6B7280] leading-none" style={{ fontFamily: "Inter, sans-serif" }}>
                        / {user.dailyWater} L
                      </span>
                    </div>
                    <p className="font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-1">{Math.round(waterPct)}% of daily goal</p>
                  </div>
                  <span className="hidden sm:inline-flex font-mono text-[10px] px-2 py-1 rounded-full bg-[#1D2A2E] text-white shrink-0 font-semibold leading-none">
                    {waterPct >= 100 ? "Goal met" : "Keep sipping"}
                  </span>
                </div>

                <div className="h-2.5 rounded-full overflow-hidden mt-4" style={{ background: "#E8E0D0" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${waterPct}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: "#1D2A2E" }}
                  >
                    <span
                      className="absolute inset-0 opacity-15"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                        animation: prefersReduced || waterPct < 8 ? "none" : "shimmer 1.8s ease 0.6s both",
                      } as React.CSSProperties}
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <span className="h-1 rounded-full" style={{ background: waterPct >= 25 ? "#1D2A2E" : "#E8E0D0" }} />
                  <span className="h-1 rounded-full" style={{ background: waterPct >= 55 ? "#1D2A2E" : "#E8E0D0" }} />
                  <span className="h-1 rounded-full" style={{ background: waterPct >= 85 ? "#1D2A2E" : "#E8E0D0" }} />
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => addWater(0.25)}
                    className="flex-1 justify-center inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-[#0F1A1C] text-white text-xs font-bold hover:bg-[#1D2A2E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 active:scale-[0.98]"
                  >
                    <PlusIcon size={14} className="shrink-0" /> +250 ml
                  </button>
                  <button
                    onClick={resetWater}
                    className="px-4 py-2.5 rounded-full bg-white border border-[#E8E0D0] text-xs font-semibold text-[#0F1A1C] hover:bg-[#FFFBF5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15 active:scale-[0.98]"
                  >
                    Reset
                  </button>
                </div>

                {waterLiters >= user.dailyWater ? (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[10px] tracking-[0.09em] uppercase text-center mt-3 text-[#1D2A2E] font-bold">
                    ✓ Goal reached • beautifully hydrated
                  </motion.p>
                ) : (
                  <p className="font-mono text-[10px] tracking-wide text-center mt-3 text-[#9CA3AF]">Tap +250 ml to log a glass</p>
                )}
              </div>
            </div>

            {/* Fitness — editorial, minimal — tertiary */}
            <div className="rounded-[22px] p-5 bg-white border border-[#E8E0D0] shadow-[0_4px_20px_rgba(15,26,28,0.04)]">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h3 className="font-display font-extrabold text-[13px] sm:text-[14px] tracking-tight text-[#0F1A1C] flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0">
                    <DumbbellIcon size={12} />
                  </span>
                  <span className="truncate">Fitness Summary</span>
                </h3>
                <button onClick={() => setScreen("fitness")} className="text-xs font-bold text-[#C45A3C] inline-flex items-center gap-1 hover:gap-1.5 transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C45A3C]/20 rounded-full px-1">
                  View <ChevronRightIcon size={12} />
                </button>
              </div>

              <div className="space-y-3.5">
                {[
                  { label: "Morning Run", val: "3.2 km", pct: 64, color: "#0F1A1C" },
                  { label: "Calories Burned", val: "320 kcal", pct: 53, color: "#C45A3C" },
                  { label: "Active Minutes", val: "42 min", pct: 70, color: "#1D2A2E" },
                ].map((f, i) => (
                  <div key={f.label} className="min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1.5 gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
                      <span className="text-[#6B7280] font-medium truncate">{f.label}</span>
                      <span className="font-bold text-[#0F1A1C] shrink-0">{f.val}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E8E0D0" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${f.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.07, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: f.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E0D0]/60 flex items-center gap-2 text-[#9CA3AF] min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse shrink-0" />
                <span className="font-mono text-[10px] tracking-wide truncate">2 workouts completed this week</span>
              </div>
            </div>

            {/* Pantry / Shopping — editorial duo, tertiary */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "Pantry", label: "Smart\nPantry", sub: "View items", screen: "pantry" as Screen, accent: "#C45A3C", bg: "#FFFFFF" },
                { k: "Shopping", label: "Shopping\nList", sub: "View list", screen: "shopping" as Screen, accent: "#1D2A2E", bg: "#FFFBF5" },
              ].map((card) => (
                <button
                  key={card.k}
                  onClick={() => setScreen(card.screen)}
                  className="rounded-[20px] p-4 text-left flex flex-col justify-between hover:shadow-md transition-all group min-h-[108px] sm:min-h-[112px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15 bg-white border border-[#E8E0D0] min-w-0 w-full"
                  style={{ background: card.bg }}
                >
                  <span className="font-mono text-[9px] tracking-[0.16em] uppercase font-bold truncate" style={{ color: card.accent }}>
                    {card.k}
                  </span>
                  <span className="font-serif font-bold text-[15px] leading-[1.05] tracking-tight text-[#0F1A1C] mt-2 whitespace-pre-line">{card.label}</span>
                  <span className="text-xs font-semibold text-[#6B7280] mt-3 flex items-center justify-between w-full gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
                    <span className="truncate">{card.sub}</span> <span className="w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center group-hover:translate-x-0.5 transition-transform shrink-0 text-[11px]">→</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Planner — tertiary */}
            <button
              onClick={() => setScreen("planner")}
              className="rounded-[20px] p-4 flex items-center justify-between text-left hover:shadow-md transition-all group border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15 bg-white min-w-0 w-full"
              style={{ borderColor: "#E8E0D0", boxShadow: "0 4px 20px rgba(15,26,28,0.04)" }}
            >
              <div className="min-w-0">
                <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#0F1A1C] font-bold">Meal Planner</span>
                <div className="font-serif font-bold text-[15px] leading-none tracking-tight text-[#0F1A1C] mt-1">Weekly Menu</div>
                <div className="text-xs text-[#6B7280] mt-0.5 truncate" style={{ fontFamily: "Inter, sans-serif" }}>
                  AI-planned grid • Prep smarter
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#0F1A1C] text-white text-xs font-bold group-hover:gap-1.5 transition-all shrink-0 ml-3">
                Plan <ChevronRightIcon size={12} />
              </span>
            </button>
          </div>
        </motion.div>

        {/* footer whisper — editorial closing */}
        <div className="flex items-center justify-center gap-2 py-2 flex-wrap">
          <span className="h-px w-8 bg-[#E8E0D0] hidden sm:block" />
          <span className="font-serif italic text-xs text-[#9CA3AF]">crafted for your ritual</span>
          <span className="h-px w-8 bg-[#E8E0D0] hidden sm:block" />
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
