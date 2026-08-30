import React, { useState } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { PlusIcon, ScanIcon, SparklesIcon, DropletIcon, TrashIcon, EditIcon, ChevronRightIcon } from "@/components/icons"
import { VeyraCompanion, Obj3D } from "@/components/VeyraCompanion"
import { useApp, SAMPLE_PRODUCTS } from "@/context/AppContext"
import Modal from "@/components/Modal"

type Obj = "avocado" | "water" | "berry" | "dumbbell" | "leaf" | "flame"

const mealSections: {
  id: "breakfast" | "lunch" | "snack" | "dinner" | "drinks"
  label: string
  emoji: string
  time: string
  target: number
  obj: Obj
  accent: string
}[] = [
  { id: "breakfast", label: "Breakfast", emoji: "🌅", time: "8:00 AM", target: 450, obj: "berry", accent: "#C45A3C" },
  { id: "lunch", label: "Lunch", emoji: "☀️", time: "1:00 PM", target: 620, obj: "leaf", accent: "#0F1A1C" },
  { id: "snack", label: "Snacks", emoji: "🌤️", time: "4:00 PM", target: 200, obj: "avocado", accent: "#8A9A8B" },
  { id: "dinner", label: "Dinner", emoji: "🌙", time: "7:00 PM", target: 680, obj: "flame", accent: "#C45A3C" },
  { id: "drinks", label: "Drinks", emoji: "💧", time: "All day", target: 0, obj: "water", accent: "#1D2A2E" },
]

const easeVeyra: any = [0.16, 1, 0.3, 1]

export default function FoodLog() {
  const { user, meals, addMeal, removeMeal, updateMealQuantity, setScreen, waterLiters, addWater, resetWater } = useApp()

  const prefersReduced = useReducedMotion()
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["breakfast", "lunch", "snack", "dinner"]))
  const [date, setDate] = useState(0) // 0 = today, -1 = yesterday, 7 = past 7 days summary

  // Add Food Modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<"breakfast" | "lunch" | "snack" | "dinner" | "drinks">("breakfast")
  const [selectedPresetFood, setSelectedPresetFood] = useState(SAMPLE_PRODUCTS[0])
  const [customName, setCustomName] = useState("")
  const [customGrams, setCustomGrams] = useState(150)

  // Edit Portion Modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [editGrams, setEditGrams] = useState(100)

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const dates = [
    { label: "Yesterday", val: -1 },
    { label: "Today", val: 0 },
    { label: "Past 7 Days", val: 7 },
  ]

  // Totals calculations
  const totalCal = meals.reduce((s, m) => s + m.calories, 0)
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0)
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0)
  const totalFat = meals.reduce((s, m) => s + m.fat, 0)

  const calPct = Math.min(Math.round((totalCal / user.dailyCalories) * 100), 100)
  const remaining = user.dailyCalories - totalCal
  const proteinLeft = Math.max(user.dailyProtein - totalProtein, 0)
  const overBudget = remaining < 0
  const waterPct = Math.min((waterLiters / user.dailyWater) * 100, 100)

  const handleAddFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = customName.trim() || selectedPresetFood.name
    const ratio = customGrams / (selectedPresetFood.portionGrams || 100)

    addMeal({
      foodId: selectedPresetFood.id,
      name,
      sectionId: selectedSection,
      servings: 1,
      grams: customGrams,
      calories: Math.round(selectedPresetFood.calories * ratio),
      protein: Math.round(selectedPresetFood.protein * ratio),
      carbs: Math.round(selectedPresetFood.carbs * ratio),
      fat: Math.round(selectedPresetFood.fat * ratio),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      img: selectedPresetFood.img,
    })

    setAddModalOpen(false)
    setCustomName("")
  }

  const handleSavePortionEdit = () => {
    if (editingMealId) {
      updateMealQuantity(editingMealId, editGrams, 1)
      setEditModalOpen(false)
    }
  }

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: prefersReduced ? 0 : 0.06, delayChildren: 0.08 } },
  }
  const itemV = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeVeyra } },
  }

  return (
    <div className="screen-scroll">
      <div className="mx-auto max-w-[1120px] w-full min-w-0">
        {/* ── Masthead — Veyra editorial, warm ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeVeyra }}
          className="hidden sm:flex items-center justify-between py-2.5 mb-5 border-y border-[#E8E0D0]/70"
        >
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#9CA3AF] flex items-center gap-3">
            <span className="text-[#0F1A1C] font-700 tracking-[0.12em]">VEYRA ° JOURNAL</span>
            <span className="w-px h-3 bg-[#E8E0D0]" />
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} • Intake log
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#9CA3AF] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
            {meals.length} entries • {waterLiters.toFixed(1)}L water
          </span>
        </motion.div>

        {/* ── Editorial Header — display-xl + Instrument Serif ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 min-w-0">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeVeyra }} className="min-w-0">
            <div className="inline-flex items-center gap-2 flex-wrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C]" />
              <span className="label-mono !text-[#C45A3C] !tracking-[0.16em]">Nutrition · Journal — 2026</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded-full bg-[#0F1A1C] text-white ml-2">
                {meals.length} entries
              </span>
            </div>
            <h1 className="mt-2 flex flex-wrap items-baseline gap-x-2">
              <span className="display-xl text-[36px] sm:text-[48px] font-light leading-[0.88] tracking-[-0.04em] text-[#0F1A1C]">Food</span>
              <span className="font-display font-800 text-[36px] sm:text-[48px] leading-[0.88] tracking-[-0.02em] text-[#0F1A1C]">Log</span>
              <span className="label-serif text-[#C45A3C] text-[40px] sm:text-[52px] leading-none">.</span>
            </h1>
            <p className="text-[13px] leading-[1.6] text-[#6B7280] max-w-[42ch] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
              Tactile daily record. Paper-soft, ink-precise. Every gram tells the day’s story.
            </p>
          </motion.div>

          {/* Date segmented — tactile paper pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: easeVeyra }}
            className="flex gap-1 p-1 rounded-full bg-[#F5F0E8] border border-[#E8E0D0]/80 self-start sm:self-auto shrink-0"
          >
            {dates.map((d) => (
              <button
                key={d.val}
                onClick={() => setDate(d.val)}
                className={`px-4 py-2 rounded-full text-xs font-700 transition-all relative overflow-hidden ${date === d.val ? "text-white shadow-sm" : "text-[#6B7280] hover:text-[#0F1A1C]"}`}
                style={date === d.val ? { background: "#0F1A1C" } : {}}
              >
                {date === d.val && (
                  <motion.span layoutId="journal-date-pill-v2" className="absolute inset-0 rounded-full bg-[#0F1A1C]" transition={{ type: "spring", stiffness: 420, damping: 28 }} style={{ zIndex: -1 }} />
                )}
                <span className="relative">{d.label}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* ── HERO — ink premium, tactile, Veyra universe ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeVeyra }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] mb-5 border border-[#0F1A1C]/10"
          style={{ background: "#0F1A1C" }}
        >
          {/* ambience — warm clay + sage */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
            <div className="absolute -top-28 -right-24 w-[520px] h-[520px] rounded-full opacity-[0.09]" style={{ background: "radial-gradient(circle, #C45A3C 0%, transparent 68%)" }} />
            <div className="absolute -bottom-40 -left-40 w-[560px] h-[560px] rounded-full opacity-[0.055]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
            <div aria-hidden className="absolute -bottom-4 right-6 hidden lg:block font-serif font-700 leading-none select-none pointer-events-none" style={{ fontSize: 112, letterSpacing: "-0.06em", color: "rgba(255,255,255,0.035)" }}>
              {String(calPct).padStart(2, "0")}
            </div>
          </div>

          <div className="relative grid lg:grid-cols-[1.08fr_0.92fr] gap-6 sm:gap-8 p-5 sm:p-8 lg:p-9 items-center">
            {/* left — copy + metrics — editorial */}
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white/75">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-600">
                  {date === 0 ? "Today" : date === -1 ? "Yesterday" : "Past 7 days"} · {totalCal.toLocaleString()} kcal in
                </span>
              </div>

              <div className="mt-4 flex items-end gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <motion.span
                      key={remaining}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: easeVeyra }}
                      className="display-xl leading-none tracking-[-0.05em]"
                      style={{ fontSize: "52px", color: overBudget ? "#E8B896" : "#FFFFFF", fontVariationSettings: '"opsz" 72' }}
                    >
                      {Math.abs(remaining).toLocaleString()}
                    </motion.span>
                    <span className="font-display font-700 text-[13px] sm:text-sm" style={{ color: overBudget ? "#E8B896" : "#E07A5F" }}>
                      {overBudget ? "kcal over" : "kcal left"}
                    </span>
                  </div>
                  <p className="text-[13px] leading-[1.5] text-white/65 mt-2 max-w-[30ch]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {proteinLeft > 0 ? (
                      <>
                        <span className="text-[#E07A5F] font-700">{proteinLeft}g protein</span> to go · <span className="text-white/45">{100 - calPct}% budget open</span>
                      </>
                    ) : (
                      <>
                        Protein complete · <span className="text-[#E07A5F]">Strong day</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* progress — tactile, dual layer, ink on paper feel */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="label-mono !text-white/45 !normal-case tracking-[0.12em]">Daily budget • {user.dailyCalories.toLocaleString()} kcal</span>
                  <span className="font-mono text-[10px] tracking-wide text-white/60">{calPct}% filled</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden bg-white/10 backdrop-blur border border-white/10 p-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${calPct}%` }}
                    transition={{ duration: 1.1, ease: easeVeyra, delay: 0.35 }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: overBudget ? "#C45A3C" : "linear-gradient(90deg, #E07A5F 0%, #FFFFFF 100%)" }}
                  >
                    <span className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)", animation: !prefersReduced ? "shimmer 2s ease 0.8s both" : "none" }} />
                  </motion.div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <span className="h-1 rounded-full" style={{ background: calPct >= 25 ? "rgba(224,122,95,0.9)" : "rgba(255,255,255,0.12)" }} />
                  <span className="h-1 rounded-full" style={{ background: calPct >= 55 ? "rgba(224,122,95,0.95)" : "rgba(255,255,255,0.12)" }} />
                  <span className="h-1 rounded-full" style={{ background: calPct >= 85 ? "#FFFFFF" : "rgba(255,255,255,0.12)" }} />
                </div>
              </div>

              {/* macro triptych — inline, paper on ink */}
              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: "Protein", cur: totalProtein, goal: user.dailyProtein, unit: "g", accent: "#FFFFFF", sub: `${proteinLeft}g to go` },
                  { label: "Carbs", cur: totalCarbs, goal: user.dailyCarbs, unit: "g", accent: "rgba(255,255,255,0.85)", sub: "on track" },
                  { label: "Fat", cur: totalFat, goal: user.dailyFat, unit: "g", accent: "rgba(255,255,255,0.72)", sub: "balanced" },
                ].map((m, i) => {
                  const p = Math.min((m.cur / m.goal) * 100, 100)
                  return (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: easeVeyra }}
                      className="rounded-[16px] bg-white/[0.07] backdrop-blur border border-white/10 p-3 sm:p-3.5"
                    >
                      <div className="label-mono !text-white/45 !text-[9px]">{m.label}</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-display font-800 text-[18px] leading-none" style={{ color: m.accent }}>
                          {m.cur}
                        </span>
                        <span className="font-mono text-[10px] text-white/35">
                          /{m.goal}
                          {m.unit}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-white/35 mt-1 truncate">{m.sub}</div>
                      <div className="h-1 rounded-full overflow-hidden bg-white/10 mt-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ delay: 0.5 + i * 0.08, duration: 0.9, ease: easeVeyra }} className="h-full rounded-full bg-white/80" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* right — character stage + hydration — warm, editorial */}
            <div className="relative flex flex-col items-center lg:items-end gap-5 min-h-[280px] justify-center min-w-0">
              {/* subtle plate */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[180px] rounded-[28px] opacity-[0.04]" style={{ background: "radial-gradient(ellipse at center, #FFFFFF 0%, transparent 70%)" }} />
              </div>

              <div className="relative">
                <div className="absolute inset-0 blur-[36px] opacity-20 rounded-full" style={{ background: "radial-gradient(circle, #E07A5F 0%, transparent 70%)" }} />
                <VeyraCompanion mood={overBudget ? "think" : calPct >= 55 ? "celebrate" : "happy"} accent={overBudget ? "clay" : "sage"} size={152} float={!prefersReduced} />
                {/* floating badges */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="absolute -top-1 -right-2 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#0F1A1C] border border-[#E8E0D0] shadow-sm text-xs font-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: overBudget ? "#C45A3C" : "#8A9A8B" }} />
                  {overBudget ? "Over budget" : calPct >= 90 ? "Almost there" : "On track"}
                </motion.div>
                <div className="absolute -bottom-1 -left-6 hidden sm:block pointer-events-none opacity-60">
                  <div className={prefersReduced ? "" : "animate-float"}>
                    <Obj3D kind="avocado" size={30} float={!prefersReduced} />
                  </div>
                </div>
              </div>

              {/* hydration — tactile card on ink — refined */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.55, ease: easeVeyra }}
                className="relative w-full max-w-[340px] rounded-[20px] overflow-hidden border border-white/10 bg-white p-4"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)", borderColor: "rgba(255,255,255,0.10)" }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.04]" style={{ background: "radial-gradient(circle, #1D2A2E 0%, transparent 70%)" }} />
                <div className="absolute -top-6 -right-6 opacity-60 pointer-events-none">
                  <Obj3D kind="water" size={42} float={false} />
                </div>
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="label-mono !text-[#1D2A2E] flex items-center gap-1.5 !tracking-[0.14em]">
                        <DropletIcon size={12} /> Hydration
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-serif text-[22px] font-700 tracking-[-0.02em] text-[#0F1A1C] leading-none">{waterLiters.toFixed(1)}</span>
                        <span className="text-xs font-600 text-[#6B7280]">/ {user.dailyWater} L</span>
                      </div>
                      <p className="font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-1">{Math.round(waterPct)}% of goal • keep sipping</p>
                    </div>
                    <span className={`hidden sm:inline-flex label-mono !text-[10px] px-2 py-1 rounded-full font-700 !normal-case !tracking-wide ${waterPct >= 100 ? "bg-[#8A9A8B] text-white" : "bg-[#0F1A1C] text-white"}`}>
                      {waterPct >= 100 ? "Goal met ✓" : "On track"}
                    </span>
                  </div>

                  <div className="h-2 rounded-full overflow-hidden bg-[#F5F0E8] border border-[#E8E0D0] mt-3 p-0.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(waterPct, 100)}%` }} transition={{ duration: 0.9, ease: easeVeyra, delay: 0.4 }} className="h-full rounded-full" style={{ background: "#1D2A2E" }} />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    <span className="h-1 rounded-full" style={{ background: waterPct >= 24 ? "#1D2A2E" : "#E8E0D0" }} />
                    <span className="h-1 rounded-full" style={{ background: waterPct >= 56 ? "#1D2A2E" : "#E8E0D0" }} />
                    <span className="h-1 rounded-full" style={{ background: waterPct >= 88 ? "#1D2A2E" : "#E8E0D0" }} />
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addWater(0.25)}
                      className="btn-primary text-xs px-3 py-2.5 flex-1 inline-flex items-center justify-center gap-1.5"
                    >
                      <PlusIcon size={12} /> +250 ml
                    </button>
                    <button
                      onClick={() => addWater(0.5)}
                      className="btn-ghost text-xs px-3 py-2.5"
                      style={{ borderColor: "#E8E0D0" }}
                    >
                      +500 ml
                    </button>
                    <button onClick={resetWater} aria-label="Reset water" className="w-9 h-9 rounded-xl bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:text-[#0F1A1C] transition-colors shrink-0">
                      ↺
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* bottom editorial rule */}
          <div className="relative h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }} />
          <div className="relative flex items-center justify-between gap-3 px-6 sm:px-8 py-3">
            <span className="label-mono !text-white/45 hidden sm:inline-flex items-center gap-2 !tracking-[0.14em] !normal-case">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Live journal • {meals.length} meals • {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="label-mono !text-white/45 sm:hidden !tracking-[0.14em] !normal-case">{meals.length} meals • {Math.round(calPct)}% budget</span>
            <button onClick={() => setScreen("scanner")} className="inline-flex items-center gap-1.5 text-xs font-700 text-white hover:text-[#E07A5F] transition-colors">
              Scan food <ChevronRightIcon size={12} />
            </button>
          </div>
        </motion.section>

        {/* ── Quick actions — editorial, tactile ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-2 mb-6"
        >
          <motion.button variants={itemV} onClick={() => { setSelectedSection("lunch"); setAddModalOpen(true) }} className="btn-primary px-5 py-3 inline-flex items-center gap-2 text-sm">
            <span className="w-6 h-6 rounded-full bg-white/15 backdrop-blur grid place-items-center">
              <PlusIcon size={12} />
            </span>
            Log Meal
          </motion.button>
          <motion.button variants={itemV} onClick={() => setScreen("scanner")} className="btn-ghost px-5 py-3 inline-flex items-center gap-2 text-sm bg-white hover:bg-[#FFFBF5]">
            <span className="w-6 h-6 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#0F1A1C]">
              <ScanIcon size={12} />
            </span>
            Scan Food
          </motion.button>
          <motion.button variants={itemV} onClick={() => setScreen("ai")} className="btn-ghost px-5 py-3 inline-flex items-center gap-2 text-sm bg-white hover:bg-[#FFFBF5]">
            <span className="w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center">
              <SparklesIcon size={12} />
            </span>
            Ask Veyra
          </motion.button>
          <motion.span variants={itemV} className="hidden sm:inline-flex items-center gap-2 ml-auto label-mono !text-[#9CA3AF] !tracking-[0.12em] !normal-case">
            <span className="w-px h-4 bg-[#E8E0D0]" /> Tactile edits — spring & lift
          </motion.span>
        </motion.div>

        {/* ── TIMELINE — premium editorial, Veyra — tactile log ── */}
        <div className="flex items-baseline justify-between gap-4 mb-4 min-w-0">
          <h2 className="font-serif italic text-[20px] sm:text-[22px] tracking-[-0.02em] text-[#0F1A1C] leading-none">
            Meal by <span className="font-display not-italic font-800 text-[#0F1A1C]">meal</span>
            <span className="label-mono !text-[#9CA3AF] ml-2 !tracking-[0.12em] hidden sm:inline">breakdown</span>
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1.5 label-mono !text-[#9CA3AF] !tracking-[0.12em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]" /> Timeline • 320–1440
          </span>
        </div>

        <div className="relative pl-4 sm:pl-6 min-w-0">
          {/* spine — mist */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "linear-gradient(180deg, #E8E0D0 0%, rgba(232,224,208,0.2) 100%)" }} />

          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
            {mealSections.map((section) => {
              const isOpen = expanded.has(section.id)
              const sectionEntries = meals.filter((m) => m.sectionId === section.id)
              const sectionCal = sectionEntries.reduce((s, e) => s + e.calories, 0)
              const sectionProtein = sectionEntries.reduce((s, e) => s + e.protein, 0)
              const isEmpty = sectionEntries.length === 0

              return (
                <motion.div key={section.id} variants={itemV} className="relative min-w-0">
                  {/* node — editorial dot */}
                  <motion.div
                    animate={{ scale: isEmpty ? 1 : 1.05 }}
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    className="absolute -left-4 sm:-left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center"
                    style={{ borderColor: isEmpty ? "#E8E0D0" : section.accent, background: isEmpty ? "#F5F0E8" : section.accent, boxShadow: isEmpty ? "none" : `0 2px 10px ${section.accent}30` }}
                  >
                    <span className="w-1 h-1 rounded-full bg-white opacity-80" />
                  </motion.div>

                  {/* Section card — paper on spine — tactile */}
                  <div className={`rounded-[22px] overflow-hidden border transition-all duration-300 min-w-0 ${isOpen ? "bg-white border-[#E8E0D0] shadow-[0_8px_28px_rgba(15,26,28,0.06)]" : "bg-white/70 backdrop-blur border-[#E8E0D0]/70 hover:bg-white hover:shadow-sm hover:-translate-y-0.5"}`}>
                    {/* header */}
                    <button onClick={() => toggle(section.id)} className="w-full flex items-center justify-between gap-3 p-4 sm:p-4 text-left group min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[20px] sm:text-xl shrink-0 w-9 h-9 rounded-[12px] bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center">
                          {section.emoji}
                        </span>
                        <div className="min-w-0">
                          <div className="font-display font-800 text-[15px] sm:text-[16px] leading-none text-[#0F1A1C] flex flex-wrap items-baseline gap-1.5">
                            {section.label}
                            <span className="label-mono !text-white !bg-[#0F1A1C] px-1.5 py-0.5 rounded-full hidden sm:inline !text-[10px] !tracking-wide">
                              {sectionEntries.length}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-1 truncate">{section.time} • target {section.target ? `${section.target} kcal` : "free"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="font-display font-800 text-[18px] leading-none text-[#0F1A1C]">{sectionCal}</span>
                            <span className="font-mono text-[10px] text-[#9CA3AF]">kcal</span>
                          </div>
                          <div className="font-mono text-[10px] text-[#9CA3AF]">{sectionProtein}g protein</div>
                        </div>
                        <div className="sm:hidden text-right">
                          <div className="font-display font-800 text-[14px] leading-none text-[#0F1A1C]">{sectionCal}</div>
                          <div className="font-mono text-[9px] text-[#9CA3AF]">KCAL</div>
                        </div>
                        <span
                          className={`w-8 h-8 rounded-full border grid place-items-center shrink-0 transition-all duration-300 ${isOpen ? "bg-[#0F1A1C] border-[#0F1A1C] text-white rotate-90" : "bg-[#F5F0E8] border-[#E8E0D0] text-[#6B7280] group-hover:bg-white group-hover:border-[#0F1A1C] group-hover:text-[#0F1A1C]"}`}
                        >
                          <ChevronRightIcon size={14} />
                        </span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: easeVeyra }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 sm:px-4 pb-4">
                            <div className="h-px w-full bg-[#F5F0E8] mb-3" />
                            {isEmpty ? (
                              <div className="rounded-[18px] p-5 flex gap-4 items-center relative overflow-hidden bg-[#FFFBF5] border border-[#E8E0D0]/60 min-w-0">
                                <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                                <div className="shrink-0 relative">
                                  <VeyraCompanion mood="warm" accent="sage" size={56} float={false} />
                                  <div className="absolute -top-1 -right-2 opacity-60">
                                    <Obj3D kind={section.obj} size={18} float={false} />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0 relative">
                                  <p className="font-display font-700 text-sm text-[#0F1A1C] leading-tight">Nothing logged yet</p>
                                  <p className="text-xs leading-relaxed text-[#6B7280] mt-1">Add a plate to this window — Veyra will balance your day around it.</p>
                                  <button
                                    onClick={() => {
                                      setSelectedSection(section.id)
                                      setAddModalOpen(true)
                                    }}
                                    className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 mt-3"
                                  >
                                    <PlusIcon size={12} /> Add {section.label}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-[18px] overflow-hidden border border-[#E8E0D0]/60 bg-white min-w-0">
                                <div className="px-3.5 py-2 flex items-center justify-between bg-[#F5F0E8]/60 border-b border-[#E8E0D0]/60">
                                  <span className="label-mono !text-[#0F1A1C] !text-[10px]">{sectionProtein}G PROTEIN · {sectionEntries.length} item{sectionEntries.length > 1 ? "s" : ""}</span>
                                  <span className="font-mono text-[10px] text-[#9CA3AF] hidden sm:inline">{sectionCal} kcal total</span>
                                </div>
                                <div className="divide-y divide-[#F5F0E8]">
                                  {sectionEntries.map((entry, ei) => (
                                    <motion.div
                                      key={entry.id}
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: ei * 0.04, duration: 0.4, ease: easeVeyra }}
                                      whileHover={prefersReduced ? {} : { x: 1 }}
                                      className="flex items-center gap-3 p-3 sm:p-3.5 hover:bg-[#FFFBF5] transition-colors group/entry min-w-0"
                                    >
                                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] overflow-hidden shrink-0 bg-[#F5F0E8] border border-[#E8E0D0] relative">
                                        <img src={entry.img || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=80&h=80&fit=crop&auto=format"} alt={entry.name} className="w-full h-full object-cover group-hover/entry:scale-[1.04] transition-transform duration-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-display font-700 text-[13px] sm:text-sm leading-tight text-[#0F1A1C] truncate">{entry.name}</p>
                                        <p className="font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-0.5 truncate">
                                          {entry.grams}g · {entry.protein}g P · {entry.carbs}g C · {entry.fat}g F · {entry.time}
                                        </p>
                                      </div>
                                      <div className="text-right shrink-0 flex items-center gap-1 sm:gap-2 pl-2 border-l border-[#F5F0E8] ml-1">
                                        <div className="hidden sm:block text-right mr-1">
                                          <div className="font-display font-800 text-[15px] leading-none text-[#0F1A1C]">{entry.calories}</div>
                                          <div className="label-mono !text-[#9CA3AF] !text-[9px]">KCAL</div>
                                        </div>
                                        <div className="sm:hidden text-right mr-1">
                                          <div className="font-display font-800 text-sm leading-none text-[#0F1A1C]">{entry.calories}</div>
                                          <div className="font-mono text-[9px] text-[#9CA3AF]">KCAL</div>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setEditingMealId(entry.id)
                                            setEditGrams(entry.grams)
                                            setEditModalOpen(true)
                                          }}
                                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] hover:bg-[#0F1A1C] hover:text-white hover:border-[#0F1A1C] transition-all active:scale-95"
                                          aria-label="Edit portion"
                                        >
                                          <EditIcon size={12} />
                                        </button>
                                        <button
                                          onClick={() => removeMeal(entry.id)}
                                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#C45A3C] hover:bg-[#C45A3C] hover:text-white hover:border-[#C45A3C] transition-all active:scale-95"
                                          aria-label="Remove"
                                        >
                                          <TrashIcon size={12} />
                                        </button>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        <p className="mt-8 text-center label-mono !text-[#9CA3AF] !tracking-[0.12em]">Tactile log • Spring motion • Veyra editorial — aligned with Dashboard & Discover</p>

        {/* ===== ADD FOOD MODAL ===== */}
        <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Log New Meal" maxWidth="lg">
          <form onSubmit={handleAddFoodSubmit} className="space-y-5">
            {/* Section picker — tactile pills */}
            <div>
              <div className="label-mono !text-[#9CA3AF] mb-2">Meal window</div>
              <div className="flex flex-wrap gap-2 p-1 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] w-fit">
                {(["breakfast", "lunch", "snack", "dinner", "drinks"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSection(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-700 capitalize transition-all ${selectedSection === s ? "bg-[#0F1A1C] text-white shadow-sm" : "text-[#6B7280] hover:text-[#0F1A1C]"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="label-mono !text-[#9CA3AF] mb-2">Product library</div>
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {SAMPLE_PRODUCTS.map((prod) => {
                  const active = selectedPresetFood.id === prod.id
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetFood(prod)
                        setCustomName(prod.name)
                        setCustomGrams(prod.portionGrams || 100)
                      }}
                      className={`p-3 rounded-[14px] border text-left flex items-center gap-3 transition-all ${active ? "border-[#0F1A1C] bg-[#0F1A1C]/5 shadow-sm" : "border-[#E8E0D0] bg-white hover:border-[#0F1A1C]/20 hover:shadow-sm"}`}
                    >
                      <img src={prod.img} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#E8E0D0] shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block font-display font-700 text-xs leading-tight text-[#0F1A1C] truncate">{prod.name}</span>
                        <span className="block font-mono text-[10px] text-[#9CA3AF] mt-0.5">{prod.protein}g P · {prod.carbs}g C · {prod.fat}g F</span>
                      </span>
                      <span className={`shrink-0 font-mono text-[11px] px-2 py-1 rounded-full font-700 ${active ? "bg-[#0F1A1C] text-white" : "bg-[#F5F0E8] text-[#6B7280]"}`}>
                        {prod.calories} kcal
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[16px] bg-[#FFFBF5] border border-[#E8E0D0] p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="label-mono !text-[#9CA3AF]">Portion</div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="display-xl text-[28px] leading-none tracking-[-0.02em] text-[#0F1A1C]">{customGrams}</span>
                    <span className="text-xs font-600 text-[#6B7280]">g</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] tracking-wide text-[#9CA3AF]">{Math.round(selectedPresetFood.calories * (customGrams / (selectedPresetFood.portionGrams || 100)))} kcal</div>
                  <div className="font-mono text-[10px] text-[#9CA3AF]">{Math.round(selectedPresetFood.protein * (customGrams / (selectedPresetFood.portionGrams || 100)))}g protein</div>
                </div>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={customGrams}
                onChange={(e) => setCustomGrams(Number(e.target.value))}
                className="w-full mt-3 accent-[#0F1A1C] h-1.5"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#9CA3AF] mt-1">
                <span>30g</span>
                <span>500g</span>
              </div>
            </div>

            <div>
              <div className="label-mono !text-[#9CA3AF] mb-1.5">Custom name (optional)</div>
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={selectedPresetFood.name}
                className="input-field w-full py-3 px-4 text-sm"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-sm font-700 inline-flex items-center justify-center gap-2">
              <PlusIcon size={14} /> Confirm & Add to Log
            </button>

            <p className="text-center font-mono text-[10px] tracking-wide text-[#9CA3AF]">Tactile — warm paper, satisfying check.</p>
          </form>
        </Modal>

        {/* ===== EDIT PORTION MODAL ===== */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Portion" maxWidth="sm">
          <div className="space-y-5">
            <div className="rounded-[16px] bg-[#FFFBF5] border border-[#E8E0D0] p-5 text-center">
              <div className="label-mono !text-[#9CA3AF]">Grams</div>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="display-xl text-[34px] leading-none tracking-[-0.03em] text-[#0F1A1C]">{editGrams}</span>
                <span className="text-sm font-600 text-[#6B7280]">g</span>
              </div>
              <input
                type="range"
                min="20"
                max="600"
                step="10"
                value={editGrams}
                onChange={(e) => setEditGrams(Number(e.target.value))}
                className="w-full mt-4 accent-[#0F1A1C]"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#9CA3AF] mt-1">
                <span>20g</span>
                <span>600g</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSavePortionEdit} className="btn-primary flex-1 py-3 text-sm font-700">
                Save changes
              </button>
              <button onClick={() => setEditModalOpen(false)} className="btn-ghost px-6 py-3 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
