import React, { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { DropletIcon, FlameIcon, ZapIcon, ChevronRightIcon, SparklesIcon } from "@/components/icons"
import { VeyraCompanion, Obj3D } from "@/components/VeyraCompanion"
import { VeyraCharacter } from "@/components/VeyraChar"
import { useApp } from "@/context/AppContext"
import { buildVeyraUserContext } from "@/services/ai/aiContext"
import { VeyraAIService } from "@/services/ai/aiService"

const easeVeyra = [0.16, 1, 0.3, 1] as const

function useCountUp(target: number, decimals = 0, duration = 1100) {
  const [val, setVal] = useState(0)
  const prefersReduced = useReducedMotion()
  useEffect(() => {
    if (prefersReduced) {
      setVal(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, prefersReduced])
  return decimals ? val.toFixed(decimals) : Math.round(val).toString()
}

export default function SmartCoach() {
  const { user, meals, waterLiters, addWater, setScreen, mascotMood, scannedProduct, activeWorkout } = useApp()
  const prefersReduced = useReducedMotion()

  const wellnessScore = Math.min(100, Math.round(((meals.reduce((s, m) => s + m.calories, 0) / user.dailyCalories) * 40) + ((waterLiters / user.dailyWater) * 30) + 30))
  const scoreDisplay = useCountUp(wellnessScore / 10, 1)
  const percentDisplay = useCountUp(wellnessScore, 0)

  const context = buildVeyraUserContext(user, meals, waterLiters, scannedProduct, activeWorkout)
  const recommendations = VeyraAIService.generateSmartCoachRecommendations(context)

  const R = 78
  const C = 2 * Math.PI * R
  const [ringProgress, setRingProgress] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setRingProgress(wellnessScore / 100), 80)
    return () => clearTimeout(t)
  }, [wellnessScore])

  const firstName = user.name ? user.name.split(" ")[0] : "Friend"

  return (
    <div className="screen-scroll bg-[#FFFBF5] relative">
      {/* ambient — subtle paper wash, not beige heavy */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full opacity-[0.025]" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
        <div className="absolute top-[48%] -left-24 w-[520px] h-[520px] rounded-full opacity-[0.02]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative max-w-[1160px] mx-auto">
        {/* Eyebrow — atelier ledger */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: prefersReduced ? 0 : 0.4, ease: easeVeyra }} className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[10px] font-700 tracking-[0.14em] uppercase">
            <SparklesIcon size={11} className="text-[#E07A5F]" /> Veyra • Atelier Coach
          </span>
          <span className="h-px w-6 bg-[#E8E0D0] hidden sm:block" />
          <span className="label-mono hidden sm:inline">Live synthesis • {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-700 text-[#0F1A1C] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Context synced • {meals.length} meals
          </span>
        </motion.div>

        {/* ── Drafting hero — two-pane atelier table ── */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.55, ease: easeVeyra }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-[#E8E0D0] bg-white shadow-[0_12px_36px_rgba(15,26,28,0.06)]"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-28 -right-20 w-[420px] h-[420px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
            <div className="absolute -bottom-24 -left-12 w-[520px] h-[520px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
          </div>

          <div className="relative border-b border-[#E8E0D0]/60 bg-white px-4 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center text-xs font-800">V</span>
              <div>
                <div className="label-mono !text-[#0F1A1C]">Wellness Atelier • No. 041</div>
                <div className="text-[11px] text-[#6B7280] font-600">Your day, composed by Veyra — not a dashboard, a companion</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex label-mono px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0]">Intelligence active</span>
              <span className="px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-xs font-700">{user.goal}</span>
            </div>
          </div>

          <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-0">
            {/* Left — Instrument panel */}
            <div className="p-5 sm:p-7 lg:p-8 lg:border-r border-[#E8E0D0]/60">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]" />
                <span className="label-mono !text-[#0F1A1C]">Today’s Composition</span>
                <span className="h-px flex-1 bg-[#E8E0D0]/60 ml-2 hidden sm:block" />
              </div>

              <h1 className="font-display font-800 text-[26px] sm:text-[32px] leading-[0.95] tracking-tight text-[#0F1A1C] mt-3">
                Your wellness, <br />
                <span className="font-serif italic font-400 text-[#8A9A8B]">understood</span> — and guided.
              </h1>
              <p className="text-[13px] leading-relaxed text-[#6B7280] mt-3 max-w-[46ch]">
                Veyra reads your meals, hydration, and goal in real time. No charts for charts’ sake — just a clear signal and what to do next.
              </p>

              {/* Gauge — drafting compass */}
              <div className="mt-7 flex flex-col sm:flex-row gap-6 sm:gap-7 items-center sm:items-start">
                <div className="relative shrink-0" style={{ width: 176, height: 176 }}>
                  <div className="absolute inset-3 rounded-full blur-2xl opacity-[0.06]" style={{ background: "#0F1A1C" }} />
                  <svg width="176" height="176" viewBox="0 0 176 176" className="absolute inset-0 -rotate-90">
                    <circle cx="88" cy="88" r={R} fill="none" stroke="#E8E0D0" strokeWidth="12" />
                    <circle
                      cx="88"
                      cy="88"
                      r={R}
                      fill="none"
                      stroke="url(#scoreAtelier)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={C}
                      strokeDashoffset={prefersReduced ? C * (1 - wellnessScore / 100) : C * (1 - ringProgress)}
                      style={{ transition: prefersReduced ? "none" : "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
                    />
                    <defs>
                      <linearGradient id="scoreAtelier" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0F1A1C" />
                        <stop offset="100%" stopColor="#8A9A8B" />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 24 }).map((_, i) => {
                      const a = (i / 24) * Math.PI * 2
                      const r1 = 88 - R - 12
                      const r2 = 88 - R - 8
                      const x1 = 88 + Math.cos(a) * r1
                      const y1 = 88 + Math.sin(a) * r1
                      const x2 = 88 + Math.cos(a) * r2
                      const y2 = 88 + Math.sin(a) * r2
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E8E0D0" strokeWidth={i % 6 === 0 ? 1.1 : 0.6} opacity={i % 6 === 0 ? 0.85 : 0.45} />
                    })}
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="font-display font-900 leading-none tracking-tight text-[#0F1A1C]" style={{ fontSize: 52 }}>{percentDisplay}</div>
                      <div className="label-mono mt-1">Wellness / 100</div>
                      <div className="mt-1.5 inline-flex px-2 py-0.5 rounded-full bg-white border border-[#E8E0D0] text-[10px] font-700 text-[#0F1A1C]">{scoreDisplay} / 10</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E0D0] shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                    <span className="text-[11px] font-700 text-[#0F1A1C]">Signal for today</span>
                  </div>
                  <p className="font-display font-800 text-[15px] leading-tight text-[#0F1A1C] mt-3">
                    <span className="text-[#0F1A1C]">Nice work, {firstName}.</span> Keep the rhythm.
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-[#6B7280] mt-1.5">
                    <span className="font-700 text-[#0F1A1C]">{context.nutrition.caloriesRemaining.toLocaleString()} kcal</span> • <span className="font-700 text-[#0F1A1C]">{context.nutrition.proteinRemaining}g protein</span> left — tuned to your {user.goal.toLowerCase()} ritual.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E0D0] text-xs font-700 text-[#0F1A1C] shadow-sm">◐ {meals.length} meals logged</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E0D0] text-xs font-700 text-[#0F1A1C] shadow-sm">⬥ {waterLiters.toFixed(1)}L water</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F1A1C] text-white text-xs font-700 shadow-sm">✦ {user.dailyCalories} kcal target</span>
                  </div>
                </div>
              </div>

              {/* ledger strip — white cards, not beige */}
              <div className="mt-7 grid grid-cols-3 gap-2">
                {[
                  { k: "KCAL LEFT", v: context.nutrition.caloriesRemaining.toLocaleString(), c: "#0F1A1C" },
                  { k: "PROTEIN", v: `${context.nutrition.proteinRemaining}g`, c: "#1D2A2E" },
                  { k: "HYDRATION", v: `${waterLiters.toFixed(1)}L`, c: "#8A9A8B" },
                ].map((s) => (
                  <div key={s.k} className="rounded-2xl bg-white border border-[#E8E0D0] p-3 text-center shadow-sm">
                    <div className="label-mono !text-[9px]">{s.k}</div>
                    <div className="font-display font-800 text-[15px] mt-1" style={{ color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Companion podium */}
            <div className="p-5 sm:p-7 lg:p-8 bg-[#FFFBF5]/30 flex flex-col">
              <div className="flex items-center gap-2">
                <span className="label-mono !text-[#0F1A1C]">Companion Podium</span>
                <span className="w-1 h-1 rounded-full bg-[#E8E0D0]" />
                <span className="text-[11px] font-600 text-[#6B7280]">Synced</span>
                <span className="ml-auto hidden sm:inline-flex w-7 h-7 rounded-full bg-white border border-[#E8E0D0] place-items-center text-[#9CA3AF] text-xs">◎</span>
              </div>

              <div className="mt-4 rounded-[24px] border border-[#E8E0D0] bg-white p-5 sm:p-6 flex flex-col items-center text-center shadow-[0_8px_24px_rgba(15,26,28,0.05)] relative overflow-hidden flex-1">
                <div className="absolute -top-10 -right-10 w-32 h-32 opacity-[0.03] pointer-events-none" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
                <div className="absolute top-3 right-3 opacity-50 hidden sm:block"><Obj3D kind="leaf" size={36} float={!prefersReduced} /></div>
                <div className="absolute bottom-3 left-3 opacity-50 hidden sm:block"><Obj3D kind="water" size={30} float={!prefersReduced} /></div>

                <div className="relative mt-1">
                  <div className="absolute inset-0 blur-2xl opacity-[0.06] rounded-full" style={{ background: "#8A9A8B" }} />
                  <VeyraCompanion mood={(mascotMood as any) === "happy" || (mascotMood as any) === "celebrate" ? "happy" : (mascotMood as any) === "think" ? "think" : "idle"} accent="sage" size={118} float={!prefersReduced} />
                </div>

                <div className="hidden sm:block mt-1">
                  <VeyraCharacter mood={mascotMood as any} accent="mint" size={26} float={false} />
                </div>

                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F1A1C] text-white text-xs font-700 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
                  I’m reading your day live
                </div>
                <p className="text-[12.5px] leading-relaxed text-[#6B7280] mt-3 max-w-[32ch]">
                  Pantry, scans, and taste are in memory. Ask in <span className="font-700 text-[#0F1A1C]">Veyra AI</span> for a next step — or act on a brief below.
                </p>

                <div className="mt-4 w-full grid grid-cols-2 gap-2 text-left">
                  <div className="rounded-2xl bg-white border border-[#E8E0D0] px-3 py-2.5">
                    <div className="label-mono !text-[9px]">Goal</div>
                    <div className="text-sm font-700 text-[#0F1A1C] mt-0.5">{user.goal}</div>
                    <div className="text-[11px] text-[#6B7280]">{user.activityLevel} • {user.weightKg}kg</div>
                  </div>
                  <div className="rounded-2xl bg-white border border-[#E8E0D0] px-3 py-2.5">
                    <div className="label-mono !text-[9px]">Context</div>
                    <div className="text-xs font-600 text-[#0F1A1C] mt-0.5 leading-relaxed">
                      {meals.length} meals • {waterLiters.toFixed(1)}L<br />
                      {scannedProduct ? `Scan: ${scannedProduct.name.slice(0, 18)}` : "No scan today"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setScreen("ai")}
                  className="mt-4 w-full py-3 rounded-full bg-[#0F1A1C] text-white text-sm font-700 shadow-[0_6px_16px_rgba(15,26,28,0.14)] hover:bg-[#1D2A2E] hover:-translate-y-px active:translate-y-0 transition-all inline-flex items-center justify-center gap-1.5"
                >
                  Talk to Veyra <ChevronRightIcon size={14} />
                </button>
                <span className="label-mono mt-2 !text-[9px]">Private • On-device • Instant</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Briefs — dossier, tactile, not orange blocks ── */}
        <div className="mt-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
            <h2 className="font-display font-800 text-[18px] sm:text-[20px] tracking-tight text-[#0F1A1C]">
              Intelligence Briefs <span className="font-serif italic font-400 text-[#8A9A8B]">— for you</span>
            </h2>
            <span className="hidden sm:inline-flex label-mono px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] shadow-sm">3 signals • Live analysis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReduced ? 0 : 0.07 * i, duration: 0.5, ease: easeVeyra }}
                className="group relative overflow-hidden rounded-[22px] border border-[#E8E0D0] bg-white flex flex-col shadow-[0_8px_24px_rgba(15,26,28,0.05)] hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,26,28,0.08)] transition-all"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2.5px]" style={{ background: i === 2 ? "#8A9A8B" : i === 1 ? "#0F1A1C" : "#1D2A2E" }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 62%)" }} />

                <div className="relative flex items-start gap-4 p-5 pb-0">
                  <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
                    <span className="label-mono !text-[9px]">Brief</span>
                    <span className="w-8 h-8 rounded-full border border-[#E8E0D0] bg-white grid place-items-center font-mono text-[11px] font-700 text-[#0F1A1C]">0{i + 1}</span>
                    <span className="w-px h-6 bg-[#E8E0D0]/60 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E0D0] flex items-center justify-center text-[#0F1A1C] shrink-0">
                        {i === 0 ? <ZapIcon size={16} /> : i === 1 ? <DropletIcon size={16} /> : <FlameIcon size={16} />}
                      </div>
                      <span className="label-mono px-2 py-1 rounded-full bg-white border border-[#E8E0D0] !text-[#6B7280]">{rec.category}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`text-[10px] font-800 tracking-[0.14em] uppercase px-2 py-0.5 rounded-full border ${rec.impact === "High" ? "bg-[#0F1A1C] text-white border-[#0F1A1C]" : rec.impact === "Optimal" ? "bg-white text-[#5A7D5A] border-[#8A9A8B]/30" : "bg-white text-[#6B7280] border-[#E8E0D0]"}`}>
                        {rec.impact} impact
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#E8E0D0]" />
                      <span className="text-[11px] font-600 text-[#9CA3AF]">Veyra insight</span>
                    </div>
                    <h3 className="font-display font-800 text-[14.5px] leading-tight tracking-tight text-[#0F1A1C] mt-2">{rec.title}</h3>
                    <p className="text-[12.5px] leading-relaxed text-[#6B7280] mt-2 min-h-[54px]">{rec.description}</p>
                  </div>
                </div>

                <div className="relative p-5 pt-4 mt-auto">
                  <button
                    onClick={() => {
                      if (rec.actionLabel.includes("Water")) addWater(0.25)
                      else if (rec.actionLabel.includes("Workout")) setScreen("fitness")
                      else setScreen("discover")
                    }}
                    className={`w-full py-2.5 text-[13px] font-700 inline-flex items-center justify-center gap-1.5 rounded-full transition-all hover:-translate-y-px active:translate-y-0 ${i === 0 ? "bg-[#0F1A1C] text-white shadow-[0_6px_16px_rgba(15,26,28,0.14)] hover:bg-[#1D2A2E]" : i === 1 ? "bg-white border border-[#0F1A1C] text-[#0F1A1C] hover:bg-[#FFFBF5]" : "bg-white border border-[#0F1A1C] text-[#0F1A1C] hover:bg-[#0F1A1C] hover:text-white"}`}
                  >
                    {rec.actionLabel} <ChevronRightIcon size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 rounded-[18px] border border-[#E8E0D0] bg-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm">
            <span className="inline-flex items-center gap-1.5 text-xs font-700 text-[#0F1A1C]">
              <SparklesIcon size={14} className="text-[#8A9A8B]" /> Want a deeper plan?
            </span>
            <span className="text-xs text-[#6B7280] flex-1">Open Veyra AI — it already knows your pantry, recent scans, and today’s macros.</span>
            <button onClick={() => setScreen("ai")} className="shrink-0 px-4 py-2 rounded-full bg-[#0F1A1C] text-white text-xs font-700 hover:bg-[#1D2A2E] transition-colors">
              Talk to Veyra →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
