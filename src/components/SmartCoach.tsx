import React, { useEffect, useState } from "react"
import { DropletIcon, FlameIcon, ZapIcon, ChevronRightIcon } from "@/components/icons"
import { VeyraCharacter, Obj3D } from "@/components/VeyraChar"
import { useApp } from "@/context/AppContext"
import { buildVeyraUserContext } from "@/services/ai/aiContext"
import { VeyraAIService } from "@/services/ai/aiService"

function useCountUp(target: number, decimals = 0, duration = 1100) {
  const [val, setVal] = useState(0)
  useEffect(() => {
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
  }, [target, duration])
  return decimals ? val.toFixed(decimals) : Math.round(val).toString()
}

export default function SmartCoach() {
  const { user, meals, waterLiters, addWater, setScreen, mascotMood, scannedProduct, activeWorkout } = useApp()

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
    <div className="screen-scroll">
      {/* HERO: Wellness Command Center */}
      <div className="relative overflow-hidden rounded-3xl mb-8 liquid-glass p-6 pt-7">
        <div className="absolute top-6 right-4 animate-float pointer-events-none opacity-90">
          <Obj3D kind="leaf" size={52} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="label-mono" style={{ color: "#C18A5A" }}>
              VEYRA · SMART COACH
            </span>
          </div>
          <h1 className="font-display font-800 text-3xl text-[#172A35] leading-none mb-6">
            Wellness Command Center
          </h1>

          <div className="flex items-center gap-5">
            <div className="relative shrink-0" style={{ width: 176, height: 176 }}>
              <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
                <defs>
                  <linearGradient id="scoreRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#172A35" />
                    <stop offset="100%" stopColor="#315A63" />
                  </linearGradient>
                </defs>
                <circle cx="88" cy="88" r={R} fill="none" stroke="#E6E0D5" strokeWidth="12" />
                <circle
                  cx="88"
                  cy="88"
                  r={R}
                  fill="none"
                  stroke="url(#scoreRing)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - ringProgress)}
                  style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-900 text-[#172A35] leading-none" style={{ fontSize: 60 }}>
                  {percentDisplay}
                </span>
                <span className="label-mono mt-1" style={{ color: "#6B7280" }}>
                  WELLNESS · / 100
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="relative flex justify-center mb-1">
                <div className="animate-float2">
                  <VeyraCharacter mood={mascotMood} accent="mint" size={104} />
                </div>
              </div>
              <p className="font-display font-800 text-[#172A35] text-lg leading-tight text-center">
                <span style={{ color: "#C18A5A" }}>Great progress, {firstName}!</span>
              </p>
              <p className="text-xs leading-relaxed text-center mt-1.5" style={{ color: "#6B7280" }}>
                {scoreDisplay}/10 wellness index · {context.nutrition.caloriesRemaining} kcal and {context.nutrition.proteinRemaining}g protein left today for your {user.goal.toLowerCase()} plan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Signal Cards */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display font-700 text-xl text-[#172A35]">AI Contextual Recommendations</h2>
          <span className="label-mono" style={{ color: "#6B7280" }}>
            LIVE ANALYSIS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="glass rounded-2xl p-5 card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#172A35]/12 text-[#172A35]">
                    {i === 0 ? <ZapIcon size={18} /> : i === 1 ? <DropletIcon size={18} /> : <FlameIcon size={18} />}
                  </div>
                  <span className="label-mono text-[#172A35]">{rec.category}</span>
                </div>
                <h3 className="font-display font-700 text-[#172A35] text-base mb-1">
                  {rec.title}
                </h3>
                <p className="text-xs text-[#6B7280] mb-4 leading-relaxed">
                  {rec.description}
                </p>
              </div>
              <button
                onClick={() => {
                  if (rec.actionLabel.includes('Water')) addWater(0.25)
                  else if (rec.actionLabel.includes('Workout')) setScreen('fitness')
                  else setScreen('discover')
                }}
                className={`w-full py-2.5 text-xs font-700 flex items-center justify-center gap-1 ${i === 2 ? 'btn-coral' : 'btn-primary'}`}
              >
                {rec.actionLabel} <ChevronRightIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

