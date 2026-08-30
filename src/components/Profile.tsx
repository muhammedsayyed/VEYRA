import React, { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { CheckIcon, SparklesIcon } from "@/components/icons"
import { VeyraCompanion } from "@/components/VeyraCompanion"
import { useApp } from "@/context/AppContext"
import Modal from "@/components/Modal"
import { UserProfile } from "@/types"
import WeightHistory from "@/components/WeightHistory"

const tabs = ["Overview", "Goals", "Nutrition", "Settings"] as const
const easeVeyra = [0.16, 1, 0.3, 1] as const

function Ring({ value, max, color, label, center, sub }: { value: number; max: number; color: string; label: string; center: string; sub?: string }) {
  const pct = Math.min(1, value / max)
  const r = 36
  const c = 2 * Math.PI * r
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative" style={{ width: 96, height: 96 }}>
        <div className="absolute inset-2 rounded-full blur-xl opacity-[0.08]" style={{ background: color }} />
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#E8E0D0" strokeWidth="8" />
          <motion.circle
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: prefersReduced ? 0 : 1.2, ease: easeVeyra, delay: prefersReduced ? 0 : 0.14 }}
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
          />
        </svg>
        <svg width="96" height="96" className="absolute inset-0 -rotate-90 pointer-events-none" style={{ opacity: 0.28 }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const a = (i / 20) * Math.PI * 2
            const x1 = 48 + Math.cos(a) * 44
            const y1 = 48 + Math.sin(a) * 44
            const x2 = 48 + Math.cos(a) * 46
            const y2 = 48 + Math.sin(a) * 46
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={i % 5 === 0 ? 1 : 0.5} opacity={i % 5 === 0 ? 0.45 : 0.2} />
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <span className="font-display font-800 text-[#0F1A1C] text-[15px] leading-none tracking-tight">{center}</span>
            <span className="font-mono block text-[9px] tracking-[0.12em] uppercase text-[#9CA3AF] mt-0.5">of {max}{sub ? ` ${sub}` : ""}</span>
          </div>
        </div>
      </div>
      <div className="text-center">
        <span className="label-mono !text-[10px] text-[#0F1A1C]">{label}</span>
        {sub && <span className="font-mono block text-[10px] text-[#8A9A8B] mt-0.5">{sub}</span>}
      </div>
    </motion.div>
  )
}

export default function Profile() {
  const { user, updateUser, logout } = useApp()
  const prefersReduced = useReducedMotion()

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview")
  const [editModalOpen, setEditModalOpen] = useState(false)

  const [editForm, setEditForm] = useState<Partial<UserProfile>>({
    name: user.name,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    targetWeightKg: user.targetWeightKg,
    goal: user.goal,
    activityLevel: user.activityLevel,
    dailyCalories: user.dailyCalories,
    dailyProtein: user.dailyProtein,
  })

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser(editForm)
    setEditModalOpen(false)
  }

  const dietPrefs = ["Mediterranean", "Low Carb", "High Protein", "Balanced", "Vegetarian", "Vegan", "Keto"]
  const bmi = (user.weightKg / Math.pow(user.heightCm / 100, 2)).toFixed(1)

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReduced ? 0 : 0.4, ease: easeVeyra }}
      className="screen-scroll bg-[#FFFBF5] relative"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -right-24 w-[560px] h-[560px] rounded-full opacity-[0.025]" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
        <div className="absolute top-[58%] -left-24 w-[520px] h-[520px] rounded-full opacity-[0.02]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-[1160px] mx-auto">
        {/* Eyebrow */}
        <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[10px] font-700 tracking-[0.14em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" /> Atelier • Personal Dossier
          </span>
          <span className="h-px w-6 bg-[#E8E0D0] hidden sm:block" />
          <span className="label-mono hidden sm:inline !text-[#8A9A8B]">Tactile • Editorial • Private • No. 041</span>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-700 text-[#0F1A1C] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Encrypted • Local
          </span>
        </motion.div>

        {/* ── Dossier Cover — premium, mono seal, tactile ── */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.55, ease: easeVeyra }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-[#E8E0D0] bg-white shadow-[0_12px_36px_rgba(15,26,28,0.06)]"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
            <div className="absolute -bottom-20 -left-12 w-80 h-80 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
            <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 H60 M30 0 V60' stroke='%230F1A1C' stroke-opacity='0.04' stroke-width='0.5'/%3E%3C/svg%3E")` }} />
          </div>

          {/* top meta bar — ledger */}
          <div className="relative flex flex-wrap items-center gap-2 px-5 sm:px-7 pt-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[10px] font-700 tracking-[0.14em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Member since 2024
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-700 text-[#0F1A1C]">
              <span className="w-1 h-1 rounded-full bg-[#C45A3C]" /> 12-day streak
            </span>
            <span className="hidden lg:inline-flex label-mono px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] !text-[#6B7280]">{user.email}</span>
            <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-700 text-[#0F1A1C]">{user.dailyCalories.toLocaleString()} kcal • {user.dailyProtein}g protein</span>
          </div>

          <div className="relative grid lg:grid-cols-[auto_1fr_360px] gap-6 lg:gap-7 p-5 sm:p-7">
            {/* Seal — mono, tactile */}
            <div className="flex gap-4 lg:gap-5">
              <div className="relative shrink-0">
                <div className="w-[92px] h-[92px] sm:w-[100px] sm:h-[100px] rounded-[20px] grid place-items-center text-[30px] font-display font-800 tracking-tight shadow-[0_8px_20px_rgba(15,26,28,0.12)] border border-[#0F1A1C]" style={{ background: "#0F1A1C", color: "#FFFBF5" }}>
                  {user.name.charAt(0)}
                </div>
                {/* mono seal */}
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-[#E8E0D0] grid place-items-center shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-[#0F1A1C] grid place-items-center">
                    <CheckIcon size={10} className="text-white" />
                  </span>
                </div>
                <div className="hidden lg:flex absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
                  <span className="label-mono !text-[9px] text-[#9CA3AF] whitespace-nowrap">MEMBER EDITION • VEYRA 041 • PAPER</span>
                </div>
              </div>
              <div className="min-w-0 lg:hidden">
                <h2 className="font-display font-800 tracking-tight text-[#0F1A1C] text-[22px] leading-none">{user.name}</h2>
                <p className="text-sm text-[#6B7280] truncate mt-1">{user.email}</p>
                <p className="font-serif italic text-[13px] text-[#6B7280] mt-1">Crafting a <span className="text-[#C45A3C] font-600">{user.goal.toLowerCase()}</span> ritual.</p>
              </div>
            </div>

            {/* Center — identity editorial */}
            <div className="min-w-0">
              <h2 className="hidden lg:block font-display font-800 tracking-tight text-[#0F1A1C] text-[28px] leading-none">{user.name}</h2>
              <p className="hidden lg:block font-serif italic text-[13.5px] text-[#6B7280] mt-1.5">Crafting a <span className="text-[#C45A3C] font-600">{user.goal.toLowerCase()}</span> ritual — editorial, not extreme.</p>
              <div className="flex flex-wrap gap-1.5 mt-3 lg:mt-4">
                {[
                  { label: user.goal, variant: "ink" },
                  { label: `${user.weightKg} kg → ${user.targetWeightKg} kg`, variant: "line" },
                  { label: user.activityLevel, variant: "sage" },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`px-2.5 py-1 rounded-full text-xs font-700 border capitalize ${
                      tag.variant === "ink" ? "bg-[#0F1A1C] text-white border-[#0F1A1C]" : tag.variant === "sage" ? "bg-white text-[#3D5A3D] border-[#8A9A8B]/30" : "bg-white text-[#0F1A1C] border-[#E8E0D0]"
                    }`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-2 mt-3.5">
                <span className="label-mono !text-[#9CA3AF]">Dossier verified • {user.age} yrs • {user.heightCm} cm • {user.units}</span>
              </div>
            </div>

            {/* Instrument panel — bento, white not beige */}
            <div className="lg:border-l lg:border-[#E8E0D0]/70 lg:pl-7 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white border border-[#E8E0D0] p-3 text-center shadow-sm">
                  <div className="label-mono !text-[9px]">BMI EST.</div>
                  <div className="font-display font-800 text-[#0F1A1C] text-[16px] mt-1">{bmi}</div>
                  <div className="mt-1.5 h-1 rounded-full bg-[#E8E0D0] overflow-hidden">
                    <div className="h-full bg-[#0F1A1C] rounded-full" style={{ width: "58%" }} />
                  </div>
                </div>
                <div className="rounded-2xl bg-white border border-[#E8E0D0] p-3 text-center shadow-sm">
                  <div className="label-mono !text-[9px]">HEIGHT</div>
                  <div className="font-display font-800 text-[#1D2A2E] text-[16px] mt-1">{user.heightCm}<span className="text-[10px] font-mono text-[#9CA3AF]">cm</span></div>
                  <div className="label-mono !text-[9px] mt-1 !text-[#8A9A8B] normal-case tracking-normal">Atelier ref</div>
                </div>
                <div className="rounded-2xl bg-white border border-[#E8E0D0] p-3 text-center shadow-sm">
                  <div className="label-mono !text-[9px]">AGE</div>
                  <div className="font-display font-800 text-[#0F1A1C] text-[16px] mt-1">{user.age}</div>
                  <div className="label-mono !text-[9px] mt-1 !text-[#8A9A8B] normal-case tracking-normal">Years</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditForm({
                      name: user.name,
                      age: user.age,
                      heightCm: user.heightCm,
                      weightKg: user.weightKg,
                      targetWeightKg: user.targetWeightKg,
                      goal: user.goal,
                      activityLevel: user.activityLevel,
                      dailyCalories: user.dailyCalories,
                      dailyProtein: user.dailyProtein,
                    })
                    setEditModalOpen(true)
                  }}
                  className="flex-1 py-2.5 rounded-full bg-[#0F1A1C] text-white text-sm font-700 shadow-[0_6px_16px_rgba(15,26,28,0.14)] hover:bg-[#1D2A2E] hover:-translate-y-px active:translate-y-0 transition-all"
                >
                  Edit Dossier
                </button>
                <span className="hidden sm:inline-flex items-center px-3 py-2 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-600 text-[#6B7280]">Private</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#E8E0D0]/60" />
          <div className="px-5 sm:px-7 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-white">
            <span className="label-mono !text-[9px]">Veyra Intelligence • Your data stays yours • Atelier paper</span>
            <span className="label-mono !text-[9px] hidden sm:inline">Tar. {user.dailyCalories} kcal • Pro. {user.dailyProtein}g • {user.units}</span>
          </div>
        </motion.div>

        {/* ── Ledger nav + content — 220px sticky ── */}
        <div className="mt-6 grid lg:grid-cols-[220px_1fr] gap-4 sm:gap-5">
          {/* Ledger nav */}
          <div className="lg:sticky lg:top-4 self-start">
            <div className="flex lg:flex-col gap-1.5 p-1.5 rounded-[18px] lg:rounded-[18px] bg-white border border-[#E8E0D0] overflow-x-auto lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-sm">
              {tabs.map((tab, idx) => {
                const active = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-full lg:rounded-[12px] text-[13px] font-700 transition-all whitespace-nowrap lg:w-full text-left ${active ? "bg-[#0F1A1C] text-white shadow-sm" : "text-[#6B7280] hover:text-[#0F1A1C] hover:bg-[#FFFBF5] border border-transparent hover:border-[#E8E0D0]"}`}
                  >
                    <span className="font-mono text-[10px] tracking-[0.12em] w-7 text-center shrink-0 opacity-60">0{idx+1}</span>
                    <span className="w-px h-4 bg-current opacity-20 hidden lg:block shrink-0" />
                    <span className="flex-1">{tab}</span>
                    {active && <span className="hidden lg:block w-1.5 h-1.5 rounded-full bg-[#E07A5F] shrink-0" />}
                  </button>
                )
              })}
            </div>
            <div className="hidden lg:block mt-4 rounded-2xl border border-[#E8E0D0] bg-white p-4 shadow-sm">
              <div className="label-mono">Atelier Note</div>
              <p className="text-xs leading-relaxed text-[#6B7280] mt-2">Your profile tunes Discover, Planner, and Veyra AI instantly. Stored locally, synced encrypted.</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-600 text-[#0F1A1C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B]" /> Live sync active
              </div>
            </div>
            <div className="hidden lg:block mt-3 rounded-2xl border border-dashed border-[#E8E0D0] bg-[#FFFBF5]/40 p-3">
              <div className="label-mono !text-[9px]">Veyra • Paper 041</div>
              <div className="flex gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C] mt-1.5 shrink-0" />
                <p className="text-[11px] leading-relaxed text-[#6B7280]">Bento metrics, swatches, and tactile dossiers — editorial, measured, calm.</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === "Overview" && (
                <motion.div
                  key="overview"
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: prefersReduced ? 0 : 0.35, ease: easeVeyra }}
                  className="space-y-4 sm:space-y-5"
                >
                  <div className="rounded-[24px] sm:rounded-[28px] border border-[#E8E0D0] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,26,28,0.05)]">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                      <h3 className="label-mono text-[#6B7280]">Body Atelier • Tactile Dials</h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-700 text-[#0F1A1C]"><span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Live • Synced</span>
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-6 sm:gap-4">
                      <Ring value={user.weightKg} max={120} color="#0F1A1C" label="Current" center={`${user.weightKg}`} sub="kg" />
                      <Ring value={user.targetWeightKg} max={120} color="#8A9A8B" label="Target" center={`${user.targetWeightKg}`} sub="kg" />
                      <Ring value={user.heightCm} max={220} color="#1D2A2E" label="Height" center={`${user.heightCm}`} sub="cm" />
                      <div className="flex-1 min-w-[140px] rounded-2xl bg-white border border-[#E8E0D0] p-4 shadow-sm">
                        <div className="label-mono">Life Rhythm</div>
                        <div className="mt-3 space-y-3">
                          <div>
                            <div className="label-mono !text-[#0F1A1C]">AGE</div>
                            <div className="font-display font-800 text-xl text-[#0F1A1C] leading-none mt-1">{user.age} yrs</div>
                          </div>
                          <div className="h-px bg-[#E8E0D0]" />
                          <div>
                            <div className="label-mono !text-[#0F1A1C]">GOAL</div>
                            <div className="font-display font-800 text-sm text-[#0F1A1C] leading-none mt-1">{user.goal}</div>
                            <div className="text-[11px] text-[#6B7280] mt-1 capitalize">{user.activityLevel} activity</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[18px] border border-[#E8E0D0] bg-white p-4 sm:p-5 relative overflow-hidden shadow-sm">
                      <div className="absolute -bottom-6 -right-6 opacity-70 hidden sm:block">
                        <VeyraCompanion mood="think" accent="sage" size={84} float={false} />
                      </div>
                      <div className="relative pr-0 sm:pr-20">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]" />
                          <span className="label-mono !text-[#0F1A1C]">Veyra Intelligence</span>
                        </div>
                        <p className="font-serif text-[14px] leading-relaxed text-[#0F1A1C] mt-2">
                          Your dossier is tuned for <span className="font-700">{user.goal}</span>. Daily rhythm: <span className="font-700">{user.dailyCalories.toLocaleString()} kcal</span> and <span className="font-700">{user.dailyProtein}g protein</span> — editorial, not extreme.
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1.5">Adjust in Goals • Changes sync to Discover, Planner, and AI instantly.</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <WeightHistory />
                  </div>
                </motion.div>
              )}

              {activeTab === "Goals" && (
                <motion.div
                  key="goals"
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: prefersReduced ? 0 : 0.35, ease: easeVeyra }}
                  className="rounded-[24px] sm:rounded-[28px] border border-[#E8E0D0] bg-white p-5 sm:p-7 shadow-[0_8px_24px_rgba(15,26,28,0.05)]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
                    <h3 className="font-display font-800 text-[18px] tracking-tight text-[#0F1A1C]">Daily Nutrition Targets</h3>
                    <span className="label-mono px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0]">Blueprint • Auto-calculated</span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: "CALORIES", value: `${user.dailyCalories.toLocaleString()}`, unit: "kcal", color: "#0F1A1C", accent: "#0F1A1C" },
                      { label: "PROTEIN", value: `${user.dailyProtein}`, unit: "g", color: "#1D2A2E", accent: "#8A9A8B" },
                      { label: "CARBS", value: `${user.dailyCarbs}`, unit: "g", color: "#2C3A2E", accent: "#8A9A8B" },
                      { label: "FAT", value: `${user.dailyFat}`, unit: "g", color: "#0F1A1C", accent: "#C45A3C" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-[18px] border border-[#E8E0D0] p-4 sm:p-5 bg-white hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,26,28,0.06)] transition-all relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: m.accent, opacity: 0.9 }} />
                        <div className="label-mono">{m.label}</div>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="font-display font-800 text-[20px] leading-none tracking-tight" style={{ color: m.color }}>
                            {m.value}
                          </span>
                          <span className="text-xs font-700 text-[#6B7280]">{m.unit}</span>
                        </div>
                        <div className="mt-4 h-1 rounded-full bg-[#E8E0D0] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: "72%", background: m.accent }} />
                        </div>
                        <div className="label-mono !text-[9px] mt-2">Daily target • Atelier ref</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#E8E0D0] bg-white px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center justify-between shadow-sm">
                    <p className="text-xs leading-relaxed text-[#6B7280] flex-1">These adapt when you update weight, height, or goal. Veyra keeps Discover and Meal Planner in sync.</p>
                    <button onClick={() => setActiveTab("Nutrition")} className="shrink-0 px-4 py-2 rounded-full bg-[#0F1A1C] text-white text-xs font-700 hover:bg-[#1D2A2E] transition-colors">
                      Tune nutrition →
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "Nutrition" && (
                <motion.div
                  key="nutrition"
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: prefersReduced ? 0 : 0.35, ease: easeVeyra }}
                  className="rounded-[24px] sm:rounded-[28px] border border-[#E8E0D0] bg-white p-5 sm:p-7 shadow-[0_8px_24px_rgba(15,26,28,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display font-800 text-[18px] tracking-tight text-[#0F1A1C]">Dietary Preferences</h3>
                      <p className="text-xs leading-relaxed text-[#6B7280] mt-1 max-w-[52ch]">Select what you follow. Veyra personalizes Discover, Pantry suggestions, and AI recipes — toggle to taste.</p>
                    </div>
                    <span className="hidden sm:inline-flex label-mono px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0]">{(user.dietaryPreferences || []).length} active</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
                    {dietPrefs.map((d) => {
                      const active = (user.dietaryPreferences || []).includes(d)
                      return (
                        <button
                          key={d}
                          onClick={() => {
                            const current = user.dietaryPreferences || []
                            const next = current.includes(d) ? current.filter((v) => v !== d) : [...current, d]
                            updateUser({ dietaryPreferences: next })
                          }}
                          className={`group relative overflow-hidden text-left rounded-2xl border p-3.5 flex items-center justify-between gap-2 transition-all hover:-translate-y-0.5 ${active ? "bg-[#0F1A1C] border-[#0F1A1C] text-white shadow-[0_8px_16px_rgba(15,26,28,0.14)]" : "bg-white border-[#E8E0D0] text-[#0F1A1C] hover:border-[#0F1A1C] hover:shadow-sm"}`}
                        >
                          <span className={`text-[13px] font-700 leading-tight ${active ? "text-white" : "text-[#0F1A1C]"}`}>{d}</span>
                          <span className={`w-6 h-6 rounded-full grid place-items-center border text-[11px] shrink-0 ${active ? "bg-white text-[#0F1A1C] border-white" : "bg-white border-[#E8E0D0] text-[#9CA3AF] group-hover:border-[#0F1A1C] group-hover:text-[#0F1A1C]"}`}>
                            {active ? "✓" : "+"}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#E8E0D0] bg-white p-4 flex gap-3 items-start shadow-sm">
                    <span className="w-8 h-8 rounded-xl bg-white border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] shrink-0">
                      <SparklesIcon size={14} />
                    </span>
                    <p className="text-xs leading-relaxed text-[#6B7280]">
                      Prefer more control? Open <span className="font-700 text-[#0F1A1C]">Preferences</span> for allergens, cuisines, and AI frequency — same profile, finer grain.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "Settings" && (
                <motion.div
                  key="settings"
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: prefersReduced ? 0 : 0.35, ease: easeVeyra }}
                  className="rounded-[24px] sm:rounded-[28px] border border-[#E8E0D0] bg-white p-5 sm:p-7 shadow-[0_8px_24px_rgba(15,26,28,0.05)]"
                >
                  <h3 className="font-display font-800 text-[18px] tracking-tight text-[#0F1A1C]">App Settings</h3>
                  <p className="text-xs text-[#6B7280] mt-1">Tactile controls for your Veyra ritual — all local to your profile.</p>

                  <div className="mt-6 divide-y divide-[#E8E0D0]/60 rounded-2xl border border-[#E8E0D0] overflow-hidden">
                    <div className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-white">
                      <div className="min-w-0">
                        <div className="text-sm font-700 text-[#0F1A1C]">Units</div>
                        <div className="text-xs text-[#6B7280]">Metric or Imperial across the app</div>
                      </div>
                      <button
                        onClick={() => updateUser({ units: user.units === "metric" ? "imperial" : "metric" })}
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F1A1C] text-white text-xs font-700 shadow-sm hover:bg-[#1D2A2E] transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full ${user.units === "metric" ? "bg-[#8A9A8B]" : "bg-white/40"}`} />
                        {user.units === "metric" ? "Metric" : "Imperial"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-[#FFFBF5]/30">
                      <div className="min-w-0">
                        <div className="text-sm font-700 text-[#0F1A1C]">Theme Mode</div>
                        <div className="text-xs text-[#6B7280]">Light · Dark · System (atelier light)</div>
                      </div>
                      <span className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-[#E8E0D0] text-xs font-700 capitalize text-[#0F1A1C]">{user.theme}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-white">
                      <div className="min-w-0">
                        <div className="text-sm font-700 text-[#0F1A1C]">AI Proactive Frequency</div>
                        <div className="text-xs text-[#6B7280]">How often Veyra nudges you</div>
                      </div>
                      <button
                        onClick={() => {
                          const next = user.aiProactiveFrequency === "high" ? "medium" : user.aiProactiveFrequency === "medium" ? "low" : "high"
                          updateUser({ aiProactiveFrequency: next })
                        }}
                        className="shrink-0 px-4 py-2 rounded-full bg-white border border-[#0F1A1C] text-[#0F1A1C] text-xs font-700 hover:bg-[#FFFBF5] transition-colors capitalize inline-flex items-center gap-1.5"
                      >
                        {user.aiProactiveFrequency} <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-[#FFFBF5]/30">
                      <div className="min-w-0">
                        <div className="text-sm font-700 text-[#B85C4A]">Account Session</div>
                        <div className="text-xs text-[#6B7280]">Sign out safely — your data is persisted</div>
                      </div>
                      <button onClick={logout} className="shrink-0 px-5 py-2.5 rounded-full bg-white border border-[#B85C4A] text-[#B85C4A] text-xs font-800 hover:bg-[#B85C4A] hover:text-white hover:-translate-y-px transition-all">
                        Log Out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editModalOpen && (
          <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Personal Dossier">
            <motion.form
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              onSubmit={handleSaveProfile}
              className="space-y-4"
            >
              <div>
                <label className="label-mono block mb-1.5">Full Name</label>
                <input className="input-field w-full py-3 px-3.5 text-sm" value={editForm.name || ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-mono block mb-1.5">Age (yrs)</label>
                  <input type="number" className="input-field w-full py-3 px-3.5 text-sm" value={editForm.age || 28} onChange={(e) => setEditForm((f) => ({ ...f, age: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label-mono block mb-1.5">Height (cm)</label>
                  <input type="number" className="input-field w-full py-3 px-3.5 text-sm" value={editForm.heightCm || 178} onChange={(e) => setEditForm((f) => ({ ...f, heightCm: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-mono block mb-1.5">Current Weight (kg)</label>
                  <input type="number" className="input-field w-full py-3 px-3.5 text-sm" value={editForm.weightKg || 82} onChange={(e) => setEditForm((f) => ({ ...f, weightKg: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label-mono block mb-1.5">Target Weight (kg)</label>
                  <input type="number" className="input-field w-full py-3 px-3.5 text-sm" value={editForm.targetWeightKg || 75} onChange={(e) => setEditForm((f) => ({ ...f, targetWeightKg: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label className="label-mono block mb-1.5">Primary Goal</label>
                <select value={editForm.goal || "Lose Weight"} onChange={(e: any) => setEditForm((f) => ({ ...f, goal: e.target.value }))} className="input-field w-full py-3 px-3.5 text-sm">
                  <option value="Lose Weight">Lose Weight</option>
                  <option value="Build Muscle">Build Muscle</option>
                  <option value="Maintain Weight">Maintain Weight</option>
                  <option value="Improve Fitness">Improve Fitness</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-mono block mb-1.5">Daily Calories</label>
                  <input type="number" className="input-field w-full py-3 px-3.5 text-sm" value={editForm.dailyCalories || 2100} onChange={(e) => setEditForm((f) => ({ ...f, dailyCalories: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label-mono block mb-1.5">Daily Protein (g)</label>
                  <input type="number" className="input-field w-full py-3 px-3.5 text-sm" value={editForm.dailyProtein || 130} onChange={(e) => setEditForm((f) => ({ ...f, dailyProtein: Number(e.target.value) }))} />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 text-sm font-700 mt-2">
                Save Dossier Changes
              </button>
              <p className="text-center label-mono !text-[10px]">Updates sync instantly across the app</p>
            </motion.form>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
