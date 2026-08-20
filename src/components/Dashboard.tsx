import React, { useState, useEffect, useRef } from "react"
import { VeyraCharacter, Obj3D } from "@/components/VeyraChar"
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

/* Count-up hook — animates a number from 0 to target on mount */
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

function NutritionCore({ started, pct, kcalLeft }: { started: boolean; pct: number; kcalLeft: number }) {
  const size = 208
  const level = started ? Math.min(pct, 100) : 0
  const surfaceY = 200 - (level / 100) * 196
  const left = Math.round(useCountUp(kcalLeft, 1200, started))
  const id = "core"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={`glass${id}`} cx="36%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1EEE6" />
            <stop offset="100%" stopColor="#E6E0D5" />
          </radialGradient>
          <linearGradient id={`liquid${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#172A35" />
            <stop offset="100%" stopColor="#315A63" />
          </linearGradient>
          <clipPath id={`clip${id}`}>
            <circle cx="100" cy="100" r="94" />
          </clipPath>
        </defs>

        {/* sphere */}
        <circle cx="100" cy="100" r="94" fill={`url(#glass${id})`} stroke="#E6E0D5" strokeWidth="2" />

        {/* liquid fill with animated wave surface */}
        <g clipPath={`url(#clip${id})`}>
          <g style={{ transform: `translateY(${surfaceY - 6}px)`, transition: "transform 1.6s cubic-bezier(0.34,1.4,0.4,1)" }}>
            <g className="animate-wave">
              <path d="M0,6 q25,-12 50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 L400,220 L0,220 Z" fill={`url(#liquid${id})`} opacity="0.95" />
            </g>
            <g className="animate-wave-slow">
              <path d="M0,10 q25,12 50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 L400,220 L0,220 Z" fill="#C18A5A" opacity="0.35" />
            </g>
          </g>
        </g>

        {/* gloss highlight */}
        <ellipse cx="72" cy="58" rx="30" ry="18" fill="rgba(255,255,255,0.4)" />
      </svg>

      {/* center overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
        <div className="label-mono" style={{ fontSize: 10, color: "#6B7280" }}>
          {Math.round(pct)}% · {pct >= 100 ? "GOAL MET" : "ON TRACK"}
        </div>
        <div className="font-display font-800 text-[#172A35] leading-none mt-1" style={{ fontSize: 46 }}>
          {left}
        </div>
        <div className="text-xs font-semibold mt-0.5" style={{ color: "#6B7280" }}>
          kcal left today
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ setScreen }: { setScreen: (s: Screen) => void }) {
  const { user, meals, waterLiters, addWater, resetWater, mascotMood } = useApp()

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  const [started, setStarted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 200)
    return () => clearTimeout(t)
  }, [])

  // Calculate live nutrition totals
  const totalCal = meals.reduce((sum, m) => sum + m.calories, 0)
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0)
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0)
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0)

  const kcalLeft = Math.max(user.dailyCalories - totalCal, 0)
  const proteinLeft = Math.max(user.dailyProtein - totalProtein, 0)
  const pctCal = Math.min((totalCal / user.dailyCalories) * 100, 100)
  const waterPct = Math.min((waterLiters / user.dailyWater) * 100, 100)

  const macros = [
    { label: "Protein", cur: totalProtein, goal: user.dailyProtein, unit: "g", color: "#172A35", key: true },
    { label: "Carbs", cur: totalCarbs, goal: user.dailyCarbs, unit: "g", color: "#315A63", key: false },
    { label: "Fat", cur: totalFat, goal: user.dailyFat, unit: "g", color: "#C18A5A", key: false },
  ]

  const context = buildVeyraUserContext(user, meals, waterLiters)
  const insight = VeyraAIService.generateDashboardInsight(context)

  return (
    <div className="screen-scroll">
      {/* ── Hero section ──────────────────────────────────── */}
      <div className="relative mb-8 animate-fade-in-up">
        {/* Floating 3D depth pieces */}
        <div className="absolute right-2 top-0 animate-float pointer-events-none opacity-90">
          <Obj3D kind="water" size={64} />
        </div>
        <div className="absolute right-24 top-16 animate-float2 pointer-events-none hidden sm:block opacity-80">
          <Obj3D kind="avocado" size={52} />
        </div>
        <div className="absolute right-14 -top-2 animate-float-delay pointer-events-none hidden sm:block opacity-80">
          <Obj3D kind="berry" size={40} />
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="relative z-10 max-w-[70%]">
            <p className="label-mono mb-2.5" style={{ color: "#C18A5A" }}>
              {dateStr} · 12 DAY STREAK
            </p>
            <h1 className="display-xl text-[#172A35]">
              {greeting},<br />
              <span style={{ color: "#C18A5A" }}>{user.name.split(" ")[0]}.</span>
            </h1>
            <p className="text-sm mt-3.5" style={{ color: "#6B7280" }}>
              You're at <span className="text-[#172A35] font-semibold">{Math.round(pctCal)}%</span> of today's goal — {proteinLeft > 0 ? `${proteinLeft}g protein remaining` : "protein target complete!"}.
            </p>
          </div>
          {/* Mascot reacting with stateful mood */}
          <div className="relative z-10 shrink-0 -mb-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => setScreen("ai")}>
            <VeyraCharacter mood={mascotMood} accent="mint" size={116} />
          </div>
        </div>
      </div>

      {/* ── Macro ring focal + insight strip ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8">
        {/* Nutrition Core focal element */}
        <div className="lg:col-span-3 glass rounded-3xl p-6 relative overflow-hidden">
          <div className="relative flex flex-col sm:flex-row items-center gap-7">
            <div className="shrink-0">
              <NutritionCore started={started} pct={pctCal} kcalLeft={kcalLeft} />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-1">
                <p className="label-mono" style={{ color: "#6B7280" }}>
                  TODAY'S FUEL
                </p>
                <button onClick={() => setScreen("log")} className="chip flex items-center gap-1">
                  Log <ChevronRightIcon size={12} />
                </button>
              </div>
              <h3 className="font-display font-800 text-xl text-[#172A35] leading-snug mb-4">
                {proteinLeft > 0 ? (
                  <>Nicely balanced — <span style={{ color: "#C18A5A" }}>{proteinLeft}g protein</span> left to hit your goal.</>
                ) : (
                  <><span style={{ color: "#172A35" }}>Protein goal met!</span> Excellent fueling performance today.</>
                )}
              </h3>
              <div className="space-y-3">
                {macros.map((m) => {
                  const leftAmt = Math.max(m.goal - m.cur, 0)
                  const p = Math.min((m.cur / m.goal) * 100, 100)
                  return (
                    <div key={m.label}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-semibold text-[#172A35] flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ background: m.color }}
                          />
                          {m.label}
                        </span>
                        <span className="text-xs" style={{ color: "#6B7280" }}>
                          <span className="text-[#172A35] font-semibold">{leftAmt}{m.unit}</span> left
                        </span>
                      </div>
                      <div className="progress-track h-2">
                        <div
                          className="progress-fill h-full"
                          style={{
                            width: `${started ? p : 0}%`,
                            background: m.color,
                            transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)",
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AI insight strip */}
        <div className="lg:col-span-2 glass-mint rounded-3xl p-5 relative overflow-hidden card-hover" onClick={() => setScreen("ai")}>
          <div className="relative flex items-center gap-2 mb-3">
            <span style={{ color: "#C18A5A" }}>
              <SparklesIcon size={14} />
            </span>
            <span className="label-mono" style={{ color: "#C18A5A" }}>
              VEYRA AI · {insight.tag.toUpperCase()}
            </span>
          </div>
          <div className="relative flex items-start gap-3">
            <div className="shrink-0 -mt-1">
              <VeyraCharacter mood="think" accent="mint" size={62} float={false} />
            </div>
            <div>
              <p className="font-display font-700 text-[#172A35] text-sm mb-1">{insight.title}</p>
              <p className="font-display font-500 text-[#28302E] text-xs leading-snug">
                {insight.body}
              </p>
            </div>
          </div>
          <div className="relative flex gap-2 mt-5">
            <button onClick={(e) => { e.stopPropagation(); setScreen("discover") }} className="btn-primary text-xs px-4 py-2.5">
              Find Protein
            </button>
            <button onClick={(e) => { e.stopPropagation(); setScreen("ai") }} className="btn-ghost text-xs px-4 py-2.5">
              Ask Veyra
            </button>
          </div>
        </div>
      </div>

      {/* ── Secondary metrics row ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Steps", cur: 7480, goal: "10,000", unit: "", color: "#172A35", icon: <TrendingUpIcon size={16} />, pct: 75 },
          { label: "Burned", cur: 320, goal: "500", unit: "kcal", color: "#C18A5A", icon: <FlameIcon size={16} />, pct: 64 },
          { label: "Water", cur: waterLiters, goal: user.dailyWater.toString(), unit: "L", color: "#315A63", icon: <DropletIcon size={16} />, pct: waterPct, dec: true },
          { label: "Active", cur: 42, goal: "60", unit: "min", color: "#172A35", icon: <ZapIcon size={16} />, pct: 70 },
        ].map((m, i) => (
          <div key={m.label} className={`glass card-hover rounded-2xl p-4.5 flex flex-col gap-3 animate-fade-in-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(23,42,53,0.08)", color: m.color }}>
                {m.icon}
              </div>
              <span className="label-mono" style={{ fontSize: 10, color: "#6B7280" }}>
                {Math.round(m.pct)}%
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-800 text-2xl text-[#172A35]">{m.dec ? m.cur.toFixed(1) : m.cur.toLocaleString()}</span>
                <span className="text-xs" style={{ color: "#6B7280" }}>
                  {m.unit}
                </span>
              </div>
              <div className="label-mono mt-0.5" style={{ fontSize: 10, color: "#9CA3AF" }}>
                OF {m.goal}{m.unit}
              </div>
            </div>
            <div className="progress-track h-1.5">
              <div
                className="progress-fill h-full"
                style={{ width: `${Math.min(m.pct, 100)}%`, background: m.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions bar ────────────────────── */}
      <h2 className="font-display font-800 text-xl text-[#172A35] mb-3.5">Jump in</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setScreen("scanner")}
          className="col-span-2 sm:row-span-2 sm:col-span-2 glass rounded-3xl p-6 flex flex-col justify-between items-start card-hover text-left relative overflow-hidden min-h-[130px] sm:min-h-[175px]"
        >
          <div className="absolute -bottom-4 -right-2 animate-float pointer-events-none opacity-90">
            <Obj3D kind="leaf" size={72} />
          </div>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(23,42,53,0.08)", color: "#172A35" }}>
            <CameraIcon size={20} />
          </div>
          <div className="relative">
            <div className="font-display font-800 text-lg text-[#172A35]">Scan Food</div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              Instant AI nutrition breakdown &amp; product comparison
            </div>
          </div>
        </button>

        <button onClick={() => setScreen("log")} className="glass rounded-2xl p-4.5 flex flex-col items-start gap-3 card-hover text-left">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(23,42,53,0.08)", color: "#172A35" }}>
            <PlusIcon size={16} />
          </div>
          <span className="font-display font-700 text-sm text-[#172A35]">Log Meal</span>
        </button>

        <button onClick={() => setScreen("fitness")} className="glass rounded-2xl p-4.5 flex flex-col items-start gap-3 card-hover text-left">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(193,138,90,0.16)", color: "#C18A5A" }}>
            <DumbbellIcon size={16} />
          </div>
          <span className="font-display font-700 text-sm text-[#172A35]">Workout</span>
        </button>

        <button onClick={() => setScreen("coach")} className="glass rounded-2xl p-4.5 flex flex-col items-start gap-3 card-hover text-left">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(23,42,53,0.08)", color: "#172A35" }}>
            <BookIcon size={16} />
          </div>
          <span className="font-display font-700 text-sm text-[#172A35]">Coach</span>
        </button>

        <button onClick={() => setScreen("ai")} className="glass rounded-2xl p-4.5 flex flex-col items-start gap-3 card-hover text-left">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(193,138,90,0.16)", color: "#C18A5A" }}>
            <BrainIcon size={16} />
          </div>
          <span className="font-display font-700 text-sm text-[#172A35]">Ask AI</span>
        </button>
      </div>

      {/* ── Meals + side column ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Meals timeline */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-800 text-xl text-[#172A35]">Today's Logged Meals</h2>
            <button onClick={() => setScreen("log")} className="text-xs font-semibold flex items-center gap-1" style={{ color: "#C18A5A" }}>
              View All <ChevronRightIcon size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {meals.map((meal, i) => (
              <div key={meal.id} className={`glass rounded-2xl p-4 flex items-center gap-4 card-hover animate-fade-in-up stagger-${i + 1}`}>
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: "#F1EEE6" }}>
                  <img src={meal.img || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=80&h=80&fit=crop&auto=format"} alt={meal.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="label-mono uppercase" style={{ fontSize: 10, color: "#6B7280" }}>
                    {meal.sectionId}
                  </span>
                  <p className="font-display font-600 text-sm text-[#172A35] truncate mt-0.5">{meal.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    {meal.time} · {meal.grams}g
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display font-700 text-[#172A35] text-sm">{meal.calories}</div>
                  <div className="label-mono" style={{ fontSize: 10, color: "#9CA3AF" }}>
                    KCAL
                  </div>
                  <div className="text-xs mt-0.5 font-bold" style={{ color: "#172A35" }}>
                    {meal.protein}g P
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Hydration widget */}
          <div className="glass rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 animate-float2 pointer-events-none">
              <Obj3D kind="water" size={72} />
            </div>
            <div className="relative">
              <div className="label-mono mb-1" style={{ color: "#315A63" }}>
                HYDRATION
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-800 text-3xl text-[#172A35]">{waterLiters.toFixed(2).replace(/\.?0+$/, "")}</span>
                <span className="text-sm" style={{ color: "#6B7280" }}>
                  / {user.dailyWater} L
                </span>
              </div>
              <div className="progress-track h-2.5 mt-3">
                <div className="progress-fill h-full" style={{ width: `${waterPct}%`, background: "#315A63" }} />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => addWater(0.25)} className="btn-primary text-xs px-3 py-2 flex items-center gap-1 flex-1 justify-center">
                  <PlusIcon size={14} /> +250 ml
                </button>
                <button onClick={resetWater} className="btn-ghost text-xs px-3 py-2" aria-label="Reset water">
                  Reset
                </button>
              </div>
              {waterLiters >= user.dailyWater && (
                <p className="label-mono mt-3 text-center" style={{ color: "#315A63" }}>
                  GOAL REACHED · HYDRATED 💧
                </p>
              )}
            </div>
          </div>

          {/* Fitness summary */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-700 text-sm text-[#172A35]">Fitness Summary</h3>
              <button onClick={() => setScreen("fitness")} className="text-xs" style={{ color: "#C18A5A" }}>
                View
              </button>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Morning Run", val: "3.2 km", pct: 64, color: "#172A35" },
                { label: "Calories Burned", val: "320 kcal", pct: 53, color: "#C18A5A" },
                { label: "Active Minutes", val: "42 min", pct: 70, color: "#315A63" },
              ].map((f) => (
                <div key={f.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: "#6B7280" }}>{f.label}</span>
                    <span className="font-semibold text-[#172A35]">{f.val}</span>
                  </div>
                  <div className="progress-track h-1.5">
                    <div className="progress-fill h-full" style={{ width: `${f.pct}%`, background: f.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
