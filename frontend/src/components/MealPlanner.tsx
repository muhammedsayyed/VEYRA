import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { WeeklyMealPlan, MealPlanSlot } from "@/types"
import { SparklesIcon, CalendarIcon, PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon, ClockIcon } from "@/components/icons"
import { VeyraCompanion } from "@/components/VeyraCompanion"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEAL_TYPES: ("Breakfast" | "Lunch" | "Dinner" | "Snack")[] = ["Breakfast", "Lunch", "Dinner", "Snack"]

const mealTypeColors: Record<string, string> = {
  Breakfast: "#0F1A1C",
  Lunch: "#1D2A2E",
  Dinner: "#C45A3C",
  Snack: "#8A9A8B",
}

const mealTypeAccentBg: Record<string, string> = {
  Breakfast: "rgba(15,26,28,0.06)",
  Lunch: "rgba(29,42,46,0.07)",
  Dinner: "rgba(196,90,60,0.08)",
  Snack: "rgba(138,154,139,0.12)",
}

const mealTypeIcons: Record<string, React.ReactNode> = {
  Breakfast: <span role="img" aria-label="breakfast">🌅</span>,
  Lunch: <span role="img" aria-label="lunch">☀️</span>,
  Dinner: <span role="img" aria-label="dinner">🌙</span>,
  Snack: <span role="img" aria-label="snack">🍿</span>,
}

const easeVeyra: any = [0.16, 1, 0.3, 1]

function dateForDay(weekStart: string, dayName: string) {
  try {
    const base = new Date(weekStart)
    const idx = DAYS.indexOf(dayName)
    if (idx < 0) return null
    const d = new Date(base)
    d.setDate(base.getDate() + idx)
    return d
  } catch {
    return null
  }
}

function formatDayDate(d: Date | null) {
  if (!d) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function MealPlanner() {
  const { getMealPlanApi, saveMealPlanApi, generateMealPlanApi, addToast } = useApp()
  const prefersReduced = useReducedMotion()

  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(today.setDate(diff))
    return monday.toISOString().split("T")[0]
  })

  const [planData, setPlanData] = useState<WeeklyMealPlan>({
    weekStartDate: currentWeekStart,
    days: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDay, setSelectedDay] = useState("Monday")

  useEffect(() => {
    let isMounted = true
    const fetchPlan = async () => {
      const res = await getMealPlanApi(currentWeekStart)
      if (isMounted && res && res.mealsJson) {
        try {
          const parsed = typeof res.mealsJson === "string" ? JSON.parse(res.mealsJson) : res.mealsJson
          if (parsed && parsed.days) {
            setPlanData({ weekStartDate: currentWeekStart, days: parsed.days })
          }
        } catch {
          // ignore parse error
        }
      }
    }
    fetchPlan()
    return () => { isMounted = false }
  }, [currentWeekStart])

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() - 7)
    setCurrentWeekStart(d.toISOString().split("T")[0])
  }

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + 7)
    setCurrentWeekStart(d.toISOString().split("T")[0])
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    addToast("Veyra AI is crafting your personalized Weekly Meal Plan...", "info")
    try {
      const generated = await generateMealPlanApi(currentWeekStart)
      if (generated && generated.mealsJson) {
        const parsed = typeof generated.mealsJson === "string" ? JSON.parse(generated.mealsJson) : generated.mealsJson
        if (parsed && parsed.days) {
          setPlanData({ weekStartDate: currentWeekStart, days: parsed.days })
          addToast("Weekly Meal Plan generated successfully! 🎉", "success")
        }
      }
    } catch (e) {
      addToast("Could not generate plan right now. Try again.", "warning")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRemoveSlot = async (dayName: string, index: number) => {
    const updatedDays = { ...planData.days }
    const daySlots = [...(updatedDays[dayName] || [])]
    daySlots.splice(index, 1)
    updatedDays[dayName] = daySlots
    const nextPlan = { ...planData, days: updatedDays }
    setPlanData(nextPlan)
    await saveMealPlanApi(currentWeekStart, nextPlan)
    addToast("Meal removed from plan", "info")
  }

  const handleAddCustomSlot = async (dayName: string, mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack") => {
    const title = prompt(`Enter ${mealType} name:`)
    if (!title || !title.trim()) return
    const newSlot: MealPlanSlot = {
      mealType,
      recipeTitle: title.trim(),
      calories: 400,
      protein: 30,
      carbs: 40,
      fat: 12,
      prepTimeMin: 15,
    }
    const updatedDays = { ...planData.days }
    const daySlots = [...(updatedDays[dayName] || []), newSlot]
    updatedDays[dayName] = daySlots
    const nextPlan = { ...planData, days: updatedDays }
    setPlanData(nextPlan)
    await saveMealPlanApi(currentWeekStart, nextPlan)
    addToast(`Added "${title.trim()}" to ${dayName}'s ${mealType}`, "success")
  }

  const daySlots = planData.days[selectedDay] || []

  const weekEnd = useMemo(() => {
    try {
      const d = new Date(currentWeekStart)
      d.setDate(d.getDate() + 6)
      return d.toISOString().split("T")[0]
    } catch {
      return currentWeekStart
    }
  }, [currentWeekStart])

  const weekStats = useMemo(() => {
    const all = Object.values(planData.days).flat()
    return {
      totalMeals: all.length,
      totalKcal: all.reduce((s, x) => s + (x.calories || 0), 0),
      totalProtein: all.reduce((s, x) => s + (x.protein || 0), 0),
    }
  }, [planData.days])

  const dayKcal = daySlots.reduce((sum, s) => sum + s.calories, 0)
  const dayProtein = daySlots.reduce((sum, s) => sum + s.protein, 0)

  const todayStr = new Date().toISOString().split("T")[0]

  return (
    <div className="screen-scroll">
      <div className="mx-auto max-w-[1160px]">
        {/* ── Masthead ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easeVeyra }}
          className="hidden sm:flex items-center justify-between py-2.5 mb-5 border-y border-[#E8E0D0]/70"
        >
          <span className="font-mono text-[10px] tracking-[0.16em] font-semibold text-[#9CA3AF] uppercase flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[#C45A3C]" /> VEYRA ° PLANNER — EDITION 2026
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase hidden lg:block">Weekly rhythm • Editorial grid • AI craft</span>
          <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#0F1A1C] uppercase">{weekStats.totalMeals} meals • {weekStats.totalKcal.toLocaleString()} kcal</span>
        </motion.div>

        {/* ── Hero — ink editorial + paper atelier week ── */}
        <motion.section
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeVeyra }}
          className="relative overflow-hidden rounded-[32px] mb-6 border border-[rgba(15,26,28,0.08)]"
          style={{ background: "#0F1A1C" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
            <div className="absolute -top-24 -right-24 w-[560px] h-[560px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle at 30% 30%, #C45A3C 0%, transparent 68%)" }} />
            <div className="absolute -bottom-32 -left-24 w-[520px] h-[520px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle at 60% 60%, #8A9A8B 0%, transparent 72%)" }} />
            <div className="hidden lg:block absolute -bottom-2 right-8 font-serif font-bold leading-none select-none pointer-events-none" style={{ fontSize: 122, letterSpacing: "-0.06em", color: "rgba(255,251,245,0.03)" }}>week</div>
          </div>

          <div className="relative grid lg:grid-cols-[1.12fr_0.88fr] gap-0">
            {/* left editorial */}
            <div className="p-6 sm:p-8 lg:p-9 lg:pr-7 flex flex-col min-w-0">
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
                  <p className="font-mono text-[10px] tracking-[0.16em] font-semibold text-white/45 uppercase">Planner • 7-day rhythm • Timeline</p>
                </div>

                <h1 className="mt-4 font-serif text-[34px] sm:text-[46px] lg:text-[52px] font-light leading-[0.88] tracking-[-0.04em] text-white text-balance">
                  <span className="font-serif font-light">Meal </span>
                  <span className="font-display font-extrabold tracking-[-0.04em]">Planner</span>
                  <span className="font-serif italic font-normal text-[#E07A5F]">.</span>
                </h1>

                <p className="mt-4 text-[13.5px] sm:text-[14px] leading-[1.7] text-white/60 max-w-[44ch] font-normal" style={{ fontFamily: "Inter, sans-serif" }}>
                  A calm weekly timeline — nutrition targets, fresh produce, and one-tap AI generation. Navigate days like an editorial calendar.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.02, y: -1 }}
                    whileTap={prefersReduced ? {} : { scale: 0.98 }}
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#0F1A1C] text-[13px] font-bold tracking-tight shadow-[0_8px_24px_rgba(0,0,0,0.14)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center">
                      <SparklesIcon size={12} />
                    </span>
                    {isGenerating ? "Crafting your week…" : "Generate weekly plan"}
                  </motion.button>

                  <span className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/[0.08] backdrop-blur border border-white/10 text-white/70 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#8A9A8B] animate-pulse" />
                    {weekStats.totalMeals} meals • {weekStats.totalKcal.toLocaleString()} kcal
                  </span>

                  <span className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#C45A3C] text-white text-xs font-bold">
                    <CalendarIcon size={12} />
                    Week of {currentWeekStart}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-2 font-mono tracking-[0.12em] uppercase text-white/45">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                  Timeline
                </span>
                <span className="hidden sm:inline h-3 w-px bg-white/10" />
                <span className="font-mono text-white/55 truncate">
                  {currentWeekStart} → {weekEnd} • {selectedDay} selected
                </span>
              </div>
            </div>

            {/* right atelier — week nav + mini preview */}
            <div className="relative p-4 sm:p-5 lg:p-6 flex items-stretch lg:pl-2 min-w-0">
              <div
                className="relative w-full rounded-[24px] overflow-hidden border border-white/10 p-4 sm:p-5 flex flex-col bg-[#FFFBF5]"
                style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
              >
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="font-serif italic text-[74px] leading-none tracking-[-0.04em] text-[#0F1A1C]/[0.055] select-none">week</span>
                </div>
                <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

                <div className="relative flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase">Atelier — week nav</span>
                  <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-[#0F1A1C] text-white font-bold">{isGenerating ? "AI • working" : "Ready"}</span>
                </div>

                {/* week nav pill */}
                <div className="relative flex items-center justify-between gap-2 p-1.5 rounded-full bg-white border border-[#E8E0D0] shadow-[0_4px_16px_rgba(15,26,28,0.06)]">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevWeek}
                    className="w-8 h-8 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] hover:bg-white hover:border-[#0F1A1C]/15 transition-colors"
                    aria-label="Previous week"
                  >
                    <ChevronLeftIcon size={14} />
                  </motion.button>
                  <div className="text-center min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase">Week</div>
                    <div className="font-display font-bold text-xs text-[#0F1A1C] leading-none mt-0.5 truncate px-2">
                      {currentWeekStart} → {weekEnd}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextWeek}
                    className="w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center hover:bg-[#1D2A2E] transition-colors"
                    aria-label="Next week"
                  >
                    <ChevronRightIcon size={14} />
                  </motion.button>
                </div>

                {/* mini day dots grid */}
                <div className="relative mt-4 grid grid-cols-7 gap-1.5">
                  {DAYS.map((d) => {
                    const dDate = dateForDay(currentWeekStart, d)
                    const isToday = dDate ? dDate.toISOString().split("T")[0] === todayStr : false
                    const count = (planData.days[d] || []).length
                    const isSel = selectedDay === d
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDay(d)}
                        className={`rounded-[14px] p-2 text-center border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${isSel ? "bg-[#0F1A1C] border-[#0F1A1C] text-white shadow-[0_6px_16px_rgba(15,26,28,0.12)]" : "bg-white border-[#E8E0D0]/70 text-[#0F1A1C] hover:border-[#0F1A1C]/15 hover:shadow-sm"}`}
                      >
                        <div className={`font-mono text-[9px] tracking-[0.1em] font-semibold uppercase leading-none ${isSel ? "text-white/60" : "text-[#9CA3AF]"}`}>{d.slice(0, 2)}</div>
                        <div className={`font-display font-extrabold text-[11px] leading-none mt-1 ${isSel ? "text-white" : "text-[#0F1A1C]"}`}>{formatDayDate(dDate).split(" ")[1] || "—"}</div>
                        {isToday && <span className={`mx-auto mt-1 block w-1 h-1 rounded-full ${isSel ? "bg-[#E07A5F]" : "bg-[#C45A3C]"}`} />}
                        <span className={`mt-1 inline-flex items-center justify-center font-mono text-[9px] font-bold min-w-[16px] h-[16px] rounded-full px-1 ${isSel ? "bg-white/15 text-white" : count > 0 ? "bg-[#0F1A1C] text-white" : "bg-[#F5F0E8] text-[#9CA3AF]"}`}>{count}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="relative mt-3 rounded-[14px] bg-white border border-[#E8E0D0]/60 p-3 flex items-center gap-3 shadow-[0_2px_10px_rgba(15,26,28,0.04)]">
                  <div className="w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0">
                    <SparklesIcon size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-xs leading-none text-[#0F1A1C]">AI generation</div>
                    <div className="font-mono text-[10px] text-[#6B7280] truncate">One tap crafts 7 days — balanced & priced by locale</div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isGenerating ? "bg-[#C45A3C] animate-pulse" : "bg-[#8A9A8B]"}`} />
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-px w-full opacity-[0.06] bg-white" />
        </motion.section>

        {/* ── Days shelf — tactile scroll + layoutId ── */}
        <div className="mb-5">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div className="flex items-baseline gap-3 min-w-0">
              <h2 className="font-serif italic text-[19px] sm:text-[21px] tracking-[-0.02em] text-[#0F1A1C] leading-none">
                Days <span className="font-display not-italic font-extrabold">— atelier</span>
              </h2>
              <span className="hidden sm:inline font-mono text-[10px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase">7-day timeline • tactile scroll</span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase hidden sm:inline-flex items-center gap-1.5">drag → <span className="w-6 h-px bg-[#E8E0D0] hidden md:block" /></span>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scroll-px-2 -mx-1 px-1" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
            {DAYS.map((day) => {
              const isSelected = selectedDay === day
              const slots = planData.days[day] || []
              const dDate = dateForDay(currentWeekStart, day)
              const isToday = dDate ? dDate.toISOString().split("T")[0] === todayStr : false
              const dayKc = slots.reduce((s, x) => s + x.calories, 0)
              return (
                <motion.button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  className={`snap-start shrink-0 w-[148px] sm:w-[168px] h-[112px] rounded-[20px] p-4 text-left relative overflow-hidden border flex flex-col justify-between group transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${
                    isSelected ? "text-white border-[#0F1A1C] shadow-[0_10px_30px_rgba(15,26,28,0.16)]" : "bg-white border-[#E8E0D0] text-[#0F1A1C] hover:border-[#0F1A1C]/12 hover:shadow-[0_8px_24px_rgba(15,26,28,0.07)] hover:-translate-y-0.5"
                  }`}
                  style={isSelected ? { background: "#0F1A1C" } : {}}
                >
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute inset-0 rounded-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: isSelected ? "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 60%)" : "linear-gradient(180deg, rgba(255,255,255,0.7), transparent 60%)" }} />
                  <div className="relative">
                    <div className={`font-mono text-[10px] tracking-[0.1em] font-semibold uppercase flex items-center gap-1.5 ${isSelected ? "text-white/60" : "text-[#9CA3AF]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-[#C45A3C] animate-pulse" : isSelected ? "bg-[#E07A5F]" : "bg-[#E8E0D0]"}`} />
                      {formatDayDate(dDate) || day}
                      {isToday && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#C45A3C] text-white text-[8px] font-bold">TODAY</span>}
                    </div>
                    <div className="font-display font-extrabold text-[15px] leading-none mt-1">{day}</div>
                    <div className={`font-mono text-[10px] mt-1 ${isSelected ? "text-white/55" : "text-[#9CA3AF]"}`}>{slots.length === 0 ? "Empty" : `${slots.length} meals • ${dayKc} kcal`}</div>
                  </div>
                  <div className="relative flex items-center gap-1.5">
                    <span className={`font-mono text-[10px] font-bold px-2 py-1 rounded-full ${isSelected ? "bg-white/15 text-white" : slots.length ? "bg-[#0F1A1C] text-white" : "bg-[#F5F0E8] text-[#9CA3AF]"}`}>{slots.length}</span>
                    <span className="flex-1 flex gap-1">
                      {MEAL_TYPES.map((t) => {
                        const has = slots.some((s) => s.mealType === t)
                        return <span key={t} className="flex-1 h-1.5 rounded-full" style={{ background: has ? mealTypeColors[t] : isSelected ? "rgba(255,255,255,0.12)" : "#F5F0E8", opacity: has ? 1 : 0.9 }} />
                      })}
                    </span>
                  </div>
                  {isSelected && <motion.div layoutId="planner-day-active-v2" className="absolute inset-0 rounded-[20px] border-2 border-white/10 pointer-events-none" transition={{ type: "spring", stiffness: 420, damping: 28 }} />}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Selected Day — editorial timeline with animated transitions ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay + currentWeekStart}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: easeVeyra }}
            className="space-y-4"
          >
            {/* day header — editorial */}
            <div className="rounded-[24px] overflow-hidden border bg-white shadow-[0_8px_24px_rgba(15,26,28,0.04)]" style={{ borderColor: "#E8E0D0" }}>
              <div className="h-[3px] w-full bg-[#0F1A1C]" />
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0">
                    <CalendarIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase">
                      {(() => {
                        const d = dateForDay(currentWeekStart, selectedDay)
                        return d ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : selectedDay
                      })()}
                    </div>
                    <h3 className="font-serif text-[22px] sm:text-[24px] leading-none tracking-[-0.02em] text-[#0F1A1C] mt-1">
                      {selectedDay}’s <span className="font-display font-extrabold">menu</span><span className="font-serif italic font-normal text-[#C45A3C]">.</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F1A1C] text-white text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
                        {dayKcal.toLocaleString()} kcal
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] text-[#0F1A1C] text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1D2A2E]" />
                        {dayProtein}g protein
                      </span>
                      <span className="font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase hidden sm:inline">{daySlots.length} meals • timeline</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 pl-2 pr-3 py-2 rounded-full bg-[#F5F0E8] border border-[#E8E0D0]">
                    <span className="w-6 h-6 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#0F1A1C]">
                      <SparklesIcon size={11} />
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[#6B7280] uppercase">{weekStats.totalMeals} in week</span>
                  </div>
                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.02 }}
                    whileTap={prefersReduced ? {} : { scale: 0.98 }}
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#C45A3C] text-white text-xs font-bold shadow-[0_6px_16px_rgba(196,90,60,0.22)] disabled:opacity-60"
                  >
                    <SparklesIcon size={14} />
                    {isGenerating ? "Generating…" : "AI • regenerate"}
                  </motion.button>
                </div>
              </div>

              {/* progress strip */}
              <div className="px-5 sm:px-6 pb-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-[#F5F0E8] overflow-hidden flex">
                  {MEAL_TYPES.map((t) => {
                    const c = daySlots.filter((s) => s.mealType === t).length
                    const pct = daySlots.length ? (c / Math.max(daySlots.length, 1)) * 100 : 0
                    return <div key={t} className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: mealTypeColors[t], opacity: c ? 1 : 0.15 }} />
                  })}
                </div>
                <span className="font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase hidden sm:inline">Distribution</span>
              </div>
            </div>

            {/* ── Meal grid — editorial cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {MEAL_TYPES.map((type, typeIdx) => {
                const slotsForType = daySlots.filter((s) => s.mealType === type)
                const totalForType = slotsForType.reduce((s, x) => s + x.calories, 0)
                return (
                  <motion.div
                    key={type}
                    initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReduced ? 0 : typeIdx * 0.06, duration: 0.55, ease: easeVeyra }}
                    className="group relative rounded-[24px] overflow-hidden bg-white border flex flex-col min-h-[186px] hover:shadow-[0_12px_32px_rgba(15,26,28,0.06)] transition-shadow"
                    style={{ borderColor: "#E8E0D0", boxShadow: "0 8px 24px rgba(15,26,28,0.03)" }}
                  >
                    <div className="h-[3px] w-full" style={{ background: mealTypeColors[type] }} />
                    <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.86'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

                    <div className="p-5 flex flex-col flex-1 relative">
                      <div className="flex items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: "#F5F0E8" }}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-9 h-9 rounded-[12px] grid place-items-center text-[13px] shrink-0 border" style={{ background: mealTypeAccentBg[type], borderColor: `${mealTypeColors[type]}12`, color: mealTypeColors[type] }}>
                            {mealTypeIcons[type]}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-display font-extrabold text-[13px] tracking-tight leading-none uppercase" style={{ color: mealTypeColors[type] }}>
                              {type}
                            </h4>
                            <p className="font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-1 leading-none">
                              {slotsForType.length === 0 ? "No meal scheduled" : `${slotsForType.length} ${slotsForType.length === 1 ? "meal" : "meals"} • ${totalForType} kcal`}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={prefersReduced ? {} : { scale: 1.03 }}
                          whileTap={prefersReduced ? {} : { scale: 0.97 }}
                          onClick={() => handleAddCustomSlot(selectedDay, type)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-xs font-bold hover:bg-[#0F1A1C] hover:text-white hover:border-[#0F1A1C] transition-colors shrink-0"
                          style={{ borderColor: "#E8E0D0", color: "#0F1A1C" }}
                        >
                          <PlusIcon size={12} />
                          Add
                        </motion.button>
                      </div>

                      {slotsForType.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-7 text-center rounded-[16px] border border-dashed bg-[#FFFBF5]/60 mt-4" style={{ borderColor: "#E8E0D0" }}>
                          <VeyraCompanion mood="think" accent="sage" size={48} float={false} />
                          <p className="font-display font-bold text-xs text-[#0F1A1C] mt-3">No {type.toLowerCase()} yet</p>
                          <p className="text-[11px] leading-relaxed text-[#6B7280] mt-1 max-w-[22ch]" style={{ fontFamily: "Inter, sans-serif" }}>Tap “Add” to place a custom slot — Veyra keeps the timeline calm.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 mt-4 flex-1">
                          <AnimatePresence initial={false}>
                            {slotsForType.map((slot, idx) => {
                              const globalIdx = daySlots.indexOf(slot)
                              return (
                                <motion.div
                                  key={`${slot.recipeTitle}-${idx}`}
                                  layout={!prefersReduced}
                                  initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
                                  transition={{ duration: 0.35, ease: easeVeyra }}
                                  className="group/slot relative flex items-center gap-3 p-3.5 rounded-[16px] border bg-[#FFFBF5] hover:bg-white hover:border-[#0F1A1C]/10 hover:shadow-[0_8px_20px_rgba(15,26,28,0.06)] transition-all"
                                  style={{ borderColor: "#E8E0D0" }}
                                >
                                  <div className="w-10 h-10 rounded-[12px] bg-white border border-[#E8E0D0] grid place-items-center shrink-0 shadow-sm">
                                    <span className="w-2 h-2 rounded-full" style={{ background: mealTypeColors[type] }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-display font-bold text-[13px] leading-tight tracking-tight text-[#0F1A1C] truncate pr-2">{slot.recipeTitle}</div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C]">
                                        {slot.calories} kcal
                                      </span>
                                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: mealTypeAccentBg[type], color: mealTypeColors[type], border: `1px solid ${mealTypeColors[type]}14` }}>
                                        {slot.protein}g P
                                      </span>
                                      {slot.prepTimeMin ? (
                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#6B7280]">
                                          <ClockIcon size={10} /> {slot.prepTimeMin}m
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                  <motion.button
                                    whileHover={prefersReduced ? {} : { scale: 1.06 }}
                                    whileTap={prefersReduced ? {} : { scale: 0.94 }}
                                    onClick={() => handleRemoveSlot(selectedDay, globalIdx)}
                                    aria-label={`Remove ${slot.recipeTitle}`}
                                    className="w-7 h-7 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#9CA3AF] hover:text-[#B85C4A] hover:border-[#B85C4A]/20 hover:bg-[#FEF2F2] transition-colors shrink-0 opacity-0 group-hover/slot:opacity-100 sm:opacity-100"
                                  >
                                    <TrashIcon size={12} />
                                  </motion.button>
                                </motion.div>
                              )
                            })}
                          </AnimatePresence>
                        </div>
                      )}

                      {slotsForType.length > 0 && (
                        <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: "#F5F0E8" }}>
                          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#9CA3AF]">{slotsForType.length} slots • editorial</span>
                          <span className="font-mono text-[10px] font-semibold text-[#6B7280]">{totalForType} kcal • {slotsForType.reduce((s, x) => s + x.protein, 0)}g protein</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="rounded-[16px] border border-dashed bg-white/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: "#E8E0D0" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] shrink-0">
                  <CheckIcon size={12} />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-xs text-[#0F1A1C] leading-none">Timeline tip</div>
                  <div className="font-mono text-[11px] text-[#6B7280] mt-1 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>Each day supports multiple slots per meal — build a true calendar, not just one card.</div>
                </div>
              </div>
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] hidden sm:inline-flex items-center gap-1.5 shrink-0">Veyra planner • smooth transitions <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /></span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
