import React, { useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { FlameIcon, ZapIcon, DumbbellIcon, TrendingUpIcon, SparklesIcon, ChevronRightIcon, ClockIcon } from "@/components/icons"
import { VeyraCompanion, Obj3D } from "@/components/VeyraCompanion"
import { VeyraSticker } from "@/components/VeyraSticker"
import { useApp, SAMPLE_WORKOUTS } from "@/context/AppContext"
import { WorkoutRoutine } from "@/types"
import Modal from "@/components/Modal"

const categories = ["All", "Weight Loss", "Muscle Building", "Cardio", "Beginner", "Home Workout", "Gym"] as const
const genders = ["All", "Male", "Female"] as const

const easeVeyra: any = [0.16, 1, 0.3, 1]

export default function FitnessCoach() {
  const { completeWorkout, completedWorkoutsCount } = useApp()
  const prefersReduced = useReducedMotion()

  const [activeCategory, setActiveCategory] = useState("All")
  const [activeGender, setActiveGender] = useState("All")

  // Workout Session Runner Modal
  const [runnerWorkout, setRunnerWorkout] = useState<WorkoutRoutine | null>(null)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [timerSec, setTimerSec] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const filtered = SAMPLE_WORKOUTS.filter(
    (w) =>
      (activeCategory === "All" || w.category === activeCategory) &&
      (activeGender === "All" || !w.targetGender || w.targetGender === "All" || w.targetGender === activeGender)
  )

  const featured = SAMPLE_WORKOUTS[0]

  // Exercise runner timer loop
  useEffect(() => {
    if (!runnerWorkout || isPaused) return

    const currentEx = runnerWorkout.exercises[exerciseIndex]
    if (!currentEx) return

    const interval = setInterval(() => {
      setTimerSec((prev) => {
        if (isResting) {
          if (prev <= 1) {
            setIsResting(false)
            if (exerciseIndex + 1 < runnerWorkout.exercises.length) {
              setExerciseIndex((i) => i + 1)
              return runnerWorkout.exercises[exerciseIndex + 1].durationSec || 45
            } else {
              // Workout Finished!
              handleFinishWorkout()
              return 0
            }
          }
          return prev - 1
        } else {
          if (currentEx.durationSec && prev <= 1) {
            setIsResting(true)
            return currentEx.restSec || 15
          }
          return prev + 1
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [runnerWorkout, exerciseIndex, isResting, isPaused])

  const handleStartWorkout = (w: WorkoutRoutine) => {
    setRunnerWorkout(w)
    setExerciseIndex(0)
    setIsResting(false)
    setIsPaused(false)
    setTimerSec(w.exercises[0]?.durationSec || 0)
  }

  const handleNextExercise = () => {
    if (!runnerWorkout) return
    if (exerciseIndex + 1 < runnerWorkout.exercises.length) {
      setIsResting(true)
      setTimerSec(runnerWorkout.exercises[exerciseIndex].restSec || 15)
    } else {
      handleFinishWorkout()
    }
  }

  const handleFinishWorkout = () => {
    if (runnerWorkout) {
      completeWorkout(runnerWorkout)
      setRunnerWorkout(null)
    }
  }

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: prefersReduced ? 0 : 0.06, delayChildren: 0.08 } },
  }
  const itemV = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeVeyra } },
  }

  return (
    <div className="screen-scroll">
      <div className="mx-auto max-w-[1120px] w-full min-w-0">
        {/* ── Masthead — Veyra editorial ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeVeyra }}
          className="hidden sm:flex items-center justify-between py-2.5 mb-5 border-y border-[#E8E0D0]/70"
        >
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#9CA3AF] flex items-center gap-3">
            <span className="text-[#0F1A1C] font-700 tracking-[0.12em]">VEYRA ° COACH</span>
            <span className="w-px h-3 bg-[#E8E0D0]" />
            {completedWorkoutsCount} workouts • streak alive • premium atelier
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#9CA3AF] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C] animate-pulse" />
            Energetic • editorial • coach-led
          </span>
        </motion.div>

        {/* ── HERO — premium coach, not gym — ink, energetic but refined ── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeVeyra }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-[#0F1A1C]/10 mb-6"
          style={{ background: "#0F1A1C" }}
        >
          {/* grain + glows — clay + sage */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
            <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #C45A3C 0%, transparent 68%)" }} />
            <div className="absolute -bottom-32 -left-40 w-[620px] h-[620px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 100%)" }} />
          </div>

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-0 items-stretch min-h-[380px]">
            {/* left — editorial coach */}
            <div className="p-6 sm:p-8 lg:p-9 flex flex-col justify-between min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 label-mono !text-[#0F1A1C] !tracking-[0.12em] px-2.5 py-1 rounded-full bg-white font-700 !text-[10px]">
                    <ZapIcon size={11} /> Today’s session
                  </span>
                  <span className="inline-flex items-center gap-1.5 label-mono !text-white/70 !tracking-[0.12em] px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Vey coaching
                  </span>
                </div>

                <div className="mt-4 flex gap-4 sm:gap-6 items-center min-w-0">
                  <div className="hidden sm:flex shrink-0 items-center gap-3">
                    <div className="w-[108px] h-[108px] sm:w-[132px] sm:h-[132px] lg:w-[168px] lg:h-[168px] rounded-[20px] bg-white/10 backdrop-blur border border-white/10 grid place-items-center overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                      <VeyraSticker name="06_weightlifting" size={92} alt="Veyra weightlifting coach" float={true} className="sm:hidden" />
                      <VeyraSticker name="06_weightlifting" size={112} alt="Veyra weightlifting coach" float={true} className="hidden sm:block lg:hidden" />
                      <VeyraSticker name="06_weightlifting" size={148} alt="Veyra weightlifting coach" float={true} className="hidden lg:block" />
                    </div>
                    <div className="hidden lg:block w-px h-12 bg-white/10 shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] sm:text-[14px] leading-[1.6] text-white/70 font-400 max-w-[38ch]" style={{ fontFamily: "Inter, sans-serif" }}>
                      Let’s move with intent. Coach Vey picked a balanced burn — strong, clean, satisfying.
                    </p>
                    <div className="hidden lg:flex items-center gap-2 mt-2.5">
                      <span className="w-6 h-px bg-white/15" />
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/40">Veyra coaching • weightlifting atelier</span>
                    </div>
                  </div>
                </div>

                <h1 className="mt-4 display-xl text-[30px] sm:text-[42px] font-light leading-[0.88] tracking-[-0.04em] text-white text-balance">
                  <span className="font-display font-800 tracking-[-0.03em] text-white">{featured.name}</span>
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-white/55 max-w-[40ch] line-clamp-2" style={{ fontFamily: "Inter, sans-serif" }}>{featured.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#0F1A1C] text-xs font-700">
                    <ClockIcon size={12} /> {featured.durationMin} MIN
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C45A3C] text-white text-xs font-700">
                    <FlameIcon size={12} /> {featured.caloriesBurned} KCAL
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white/70 text-xs font-600 uppercase tracking-wide">
                    {featured.difficulty} • {featured.muscles}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => handleStartWorkout(featured)} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#0F1A1C] text-sm font-800 hover:gap-3 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                  <span className="w-7 h-7 rounded-full bg-[#0F1A1C] text-white grid place-items-center">
                    <FlameIcon size={14} />
                  </span>
                  Start session · {featured.durationMin} min
                </button>
                <span className="hidden sm:inline-flex items-center text-xs font-600 text-white/45 px-3">
                  Coached • spring lift • tactile
                </span>
              </div>
            </div>

            {/* right — cinematic image plate */}
            <div className="relative p-4 sm:p-5 lg:p-6 flex items-stretch lg:pl-2 min-w-0">
              <div className="relative w-full rounded-[24px] overflow-hidden border border-white/12 bg-black min-h-[260px] sm:min-h-[320px]">
                <img src={featured.img} alt={featured.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,26,28,0.08) 0%, rgba(15,26,28,0.28) 55%, rgba(15,26,28,0.78) 100%)" }} />
                {/* floating dumbbell — refined Obj3D */}
                <div className="absolute -top-2 right-6 hidden sm:block pointer-events-none opacity-90">
                  <div className={prefersReduced ? "" : "animate-float"}>
                    <Obj3D kind="dumbbell" size={54} float={!prefersReduced} />
                  </div>
                </div>
                {/* paper badge cluster */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                  <span className="inline-flex label-mono !text-white !tracking-wide px-2.5 py-1 rounded-full bg-[#C45A3C] shadow-sm !text-[10px]">Featured • {featured.tag || "Recommended"}</span>
                  <span className="hidden sm:inline-flex label-mono !text-[#0F1A1C] !tracking-wide px-2 py-1 rounded-full bg-white/92 backdrop-blur border border-white/60 !text-[10px]">{featured.equipment}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/96 backdrop-blur border border-white/60 text-[#0F1A1C] text-xs font-700 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#8A9A8B] animate-pulse" /> Coach Vey • ready when you are
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-white/70 font-mono text-[10px] tracking-wide uppercase">
                    <span className="hidden sm:inline">Full body • bodyweight • premium pace</span>
                    <span className="sm:hidden">{featured.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }} />
          <div className="relative flex items-center justify-between px-6 sm:px-8 py-3">
            <span className="label-mono !text-white/45 flex items-center gap-2 !tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Live fitness • {filtered.length} programs • {completedWorkoutsCount} completed
            </span>
            <span className="hidden sm:inline-flex label-mono !text-white/35 !tracking-[0.14em]">Premium pace — not a gym poster</span>
          </div>
        </motion.section>

        {/* ── Progress — editorial strip, not cards — metrics with Veyra warmth ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: easeVeyra }}
          className="glass rounded-[24px] sm:rounded-[28px] overflow-hidden mb-6"
        >
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E0D0]/70">
            <div className="p-5 flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-[14px] bg-[#C45A3C]/12 border border-[#C45A3C]/15 text-[#C45A3C] grid place-items-center shrink-0">
                <FlameIcon size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-display font-800 text-[20px] leading-none tracking-tight text-[#0F1A1C]">{completedWorkoutsCount} workouts</div>
                <div className="label-mono !text-[#9CA3AF] mt-1 !tracking-wide">Completed • streak alive</div>
                <div className="h-1.5 w-20 rounded-full overflow-hidden bg-[#F5F0E8] mt-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((completedWorkoutsCount / 5) * 100, 100)}%` }} transition={{ duration: 0.9, ease: easeVeyra, delay: 0.3 }} className="h-full rounded-full" style={{ background: "#C45A3C" }} />
                </div>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-[14px] bg-[#0F1A1C]/7 border border-[#0F1A1C]/10 text-[#0F1A1C] grid place-items-center shrink-0">
                <ZapIcon size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-display font-800 text-[20px] leading-none text-[#0F1A1C]">
                  320 <span className="text-sm font-600 text-[#6B7280]">kcal</span>
                </div>
                <div className="label-mono !text-[#9CA3AF] mt-1 !tracking-wide">Burned today • keep moving</div>
                <div className="inline-flex items-center gap-1.5 mt-2 label-mono !text-white !text-[10px] px-2 py-1 rounded-full bg-[#0F1A1C] !tracking-wide">64% of daily burn</div>
              </div>
            </div>

            <div className="p-5 flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-[14px] bg-[#8A9A8B]/12 border border-[#8A9A8B]/15 text-[#8A9A8B] grid place-items-center shrink-0">
                <TrendingUpIcon size={16} />
              </div>
              <div className="min-w-0">
                <div className="font-display font-800 text-[20px] leading-none text-[#0F1A1C]">42 <span className="text-sm font-600 text-[#6B7280]">min</span></div>
                <div className="label-mono !text-[#9CA3AF] mt-1 !tracking-wide">Active • weekly momentum</div>
                <div className="h-1.5 w-20 rounded-full overflow-hidden bg-[#F5F0E8] mt-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 0.9, ease: easeVeyra, delay: 0.45 }} className="h-full rounded-full" style={{ background: "#8A9A8B" }} />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center justify-between px-5 py-2.5 bg-[#F5F0E8]/60 border-t border-[#E8E0D0]/60">
            <span className="label-mono !text-[#9CA3AF] flex items-center gap-2 !tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Coach insight • steady burn wins
            </span>
            <span className="font-mono text-[10px] text-[#9CA3AF]">2-day streak — next workout unlocks momentum</span>
          </div>
        </motion.section>

        {/* ── Filters — tactile, editorial ── */}
        <div className="mb-5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-baseline gap-2 min-w-0">
              <h2 className="font-serif italic text-[18px] sm:text-[19px] tracking-[-0.02em] text-[#0F1A1C] leading-none">
                Browse <span className="font-display not-italic font-800 text-[#0F1A1C]">coaching</span>
              </h2>
              <span className="hidden sm:inline label-mono !text-[#9CA3AF] !tracking-[0.12em]">curated • tactile filters</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="label-mono !text-[#9CA3AF] hidden sm:inline !tracking-[0.12em]">Focus</span>
              <div className="flex gap-1 p-1 rounded-full bg-[#F5F0E8] border border-[#E8E0D0]/60">
                {genders.map((g) => (
                  <button
                    key={g}
                    onClick={() => setActiveGender(g)}
                    className={`px-3 py-1 rounded-full text-[11px] font-700 transition-all ${activeGender === g ? "bg-[#0F1A1C] text-white shadow-sm" : "text-[#6B7280] hover:text-[#0F1A1C]"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* categories — pill shelf */}
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory min-w-0" style={{ scrollbarWidth: "none" }}>
            {categories.map((c) => {
              const active = activeCategory === c
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`chip snap-start shrink-0 transition-all ${active ? "active" : ""}`}
                  style={
                    active
                      ? {}
                      : { background: "#FFFFFF", borderColor: "#E8E0D0", color: "#6B7280" }
                  }
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Workout Grid — premium atelier — energetic but refined ── */}
        <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((w) => (
            <motion.article
              key={w.id}
              variants={itemV}
              whileHover={prefersReduced ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="group relative rounded-[24px] overflow-hidden border bg-white flex flex-col hover:shadow-[0_16px_40px_rgba(15,26,28,0.10),0_4px_14px_rgba(15,26,28,0.06)] hover:border-[#0F1A1C]/10 will-change-transform min-w-0"
              style={{ borderColor: "#E8E0D0", boxShadow: "0 8px 24px rgba(15,26,28,0.04)" }}
            >
              <div className="relative h-44 overflow-hidden bg-[#F5F0E8]">
                <motion.img
                  src={w.img}
                  alt={w.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: prefersReduced ? 1 : 1.06 }}
                  transition={{ duration: 0.7, ease: easeVeyra }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A1C]/75 via-[#0F1A1C]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "radial-gradient(600px circle at 28% 18%, rgba(255,255,255,0.08), transparent 60%)" }} />
                <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                  <span className="label-mono !text-[#0F1A1C] !text-[10px] !tracking-wide px-2.5 py-1 rounded-full bg-white/95 backdrop-blur border border-white/60 shadow-sm !normal-case">{w.difficulty}</span>
                  {w.tag && <span className="label-mono !text-white !text-[10px] px-2.5 py-1 rounded-full bg-[#C45A3C] shadow-sm !tracking-wide !normal-case">{w.tag}</span>}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="label-mono !text-white/70 !text-[10px] !tracking-[0.12em]">{w.category} • {w.equipment}</span>
                  <h3 className="font-display font-800 text-[17px] leading-[1.1] tracking-tight text-white mt-1 line-clamp-2">{w.name}</h3>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1 min-w-0">
                <p className="text-xs leading-relaxed text-[#6B7280] line-clamp-2" style={{ fontFamily: "Inter, sans-serif" }}>{w.description}</p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-[12px] bg-[#F5F0E8] border border-[#E8E0D0]/60 p-2 text-center min-w-0">
                    <div className="font-display font-800 text-sm leading-none text-[#0F1A1C]">{w.durationMin}</div>
                    <div className="label-mono !text-[#9CA3AF] mt-1 !text-[9px]">min</div>
                  </div>
                  <div className="rounded-[12px] bg-[#0F1A1C] text-white p-2 text-center min-w-0">
                    <div className="font-display font-800 text-sm leading-none">{w.caloriesBurned}</div>
                    <div className="label-mono !text-white/60 mt-1 !text-[9px]">kcal</div>
                  </div>
                  <div className="rounded-[12px] bg-white border border-[#E8E0D0] p-2 text-center min-w-0">
                    <div className="font-display font-800 text-xs leading-tight text-[#0F1A1C] truncate">{w.muscles.split(",")[0]}</div>
                    <div className="label-mono !text-[#9CA3AF] mt-1 !text-[9px]">focus</div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#F5F0E8] flex items-center justify-between gap-3">
                  <span className="label-mono !text-[#9CA3AF] !tracking-wide !text-[10px] truncate">{w.exercises.length} moves • coached</span>
                  <button
                    onClick={() => handleStartWorkout(w)}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full bg-[#0F1A1C] text-white text-xs font-700 hover:bg-[#1D2A2E] hover:gap-2 transition-all shadow-[0_4px_14px_rgba(15,26,28,0.14)] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20"
                  >
                    Start <span className="w-5 h-5 rounded-full bg-white text-[#0F1A1C] grid place-items-center text-[11px]">→</span>
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-[28px] border border-[#E8E0D0] bg-[#FFFBF5] p-10 text-center relative overflow-hidden min-w-0">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
            <div className="relative">
              <div className="mx-auto w-fit">
                <VeyraCompanion mood="think" accent="sage" size={72} float={false} />
              </div>
              <p className="font-serif italic text-xl text-[#0F1A1C] mt-3">No sessions match</p>
              <p className="text-sm text-[#6B7280] mt-1 max-w-[32ch] mx-auto leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>Try another focus or reset filters — your next move is nearby.</p>
              <button onClick={() => { setActiveCategory("All"); setActiveGender("All") }} className="mt-4 btn-primary px-5 py-2.5 text-xs">Clear filters</button>
            </div>
          </motion.div>
        )}

        <p className="mt-8 text-center label-mono !text-[#9CA3AF] !tracking-[0.12em]">Coach system • premium pace • Veyra tactile — winter 2026</p>
      </div>

      {/* WORKOUT RUNNER MODAL — coach-like, premium, tactile */}
      <Modal isOpen={!!runnerWorkout} onClose={() => setRunnerWorkout(null)} title={runnerWorkout?.name || "Active Session"} maxWidth="lg">
        {runnerWorkout && (
          <div className="space-y-5 text-center py-1">
            {/* coach stage — VeyraCompanion focused */}
            <div className="relative rounded-[22px] overflow-hidden border border-[#E8E0D0] p-5" style={{ background: "linear-gradient(145deg, #FFFBF5 0%, #F5F0E8 60%, #E8E0D0 100%)" }}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />
              <div className="relative flex flex-col items-center gap-3">
                <VeyraCompanion mood={isResting ? "think" : "focus"} accent="clay" size={86} float={false} />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1A1C] text-white label-mono !text-white !tracking-[0.12em] !text-[10px]">
                  <span className={`w-2 h-2 rounded-full ${isPaused ? "bg-[#C45A3C]" : "bg-[#8A9A8B] animate-pulse"}`} />
                  {isPaused ? "Paused" : isResting ? "Recover" : "Active"}
                </div>
              </div>
            </div>

            {/* stage — exercise or rest */}
            <AnimatePresence mode="wait">
              {isResting ? (
                <motion.div
                  key="rest"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: easeVeyra }}
                  className="rounded-[20px] border border-[#0F1A1C]/10 bg-[#0F1A1C] text-white p-5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-[0.06]" style={{ background: "radial-gradient(520px circle at 100% 0%, #E07A5F 0%, transparent 60%)" }} />
                  <div className="relative">
                    <span className="label-mono !text-white/60 !tracking-[0.14em]">Rest • breathe • reset</span>
                    <div className="display-xl text-[44px] leading-none tracking-[-0.04em] mt-2" style={{ color: "white" }}>{timerSec}s</div>
                    <p className="text-xs leading-relaxed text-white/60 mt-2 max-w-sm mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
                      Catch breath. Next up: <span className="text-white font-700">{runnerWorkout.exercises[exerciseIndex + 1]?.name || "Finish"}</span>
                    </p>
                    <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-white/10 max-w-[220px] mx-auto">
                      <motion.div initial={{ width: "100%" }} animate={{ width: `${((runnerWorkout.exercises[exerciseIndex]?.restSec || 15) - timerSec) / (runnerWorkout.exercises[exerciseIndex]?.restSec || 15) * 100}%` }} className="h-full rounded-full bg-white" transition={{ duration: 0.5 }} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={exerciseIndex}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: easeVeyra }}
                  className="rounded-[20px] border border-[#E8E0D0] bg-white p-5"
                >
                  <span className="label-mono !text-[#C45A3C] font-700 !tracking-[0.12em]">
                    Move {exerciseIndex + 1} of {runnerWorkout.exercises.length} • {runnerWorkout.exercises[exerciseIndex]?.muscles}
                  </span>
                  <h3 className="font-display font-800 text-[20px] leading-tight text-[#0F1A1C] mt-1">{runnerWorkout.exercises[exerciseIndex]?.name}</h3>
                  <p className="text-xs leading-relaxed text-[#6B7280] max-w-sm mx-auto mt-2" style={{ fontFamily: "Inter, sans-serif" }}>{runnerWorkout.exercises[exerciseIndex]?.instructions}</p>
                  <div className="mt-4 inline-flex flex-col items-center gap-1">
                    {runnerWorkout.exercises[exerciseIndex]?.reps ? (
                      <>
                        <span className="display-xl text-[36px] leading-none tracking-[-0.03em] text-[#0F1A1C]">{runnerWorkout.exercises[exerciseIndex]?.reps}</span>
                        <span className="label-mono !text-[#9CA3AF] !tracking-[0.14em]">reps • controlled</span>
                      </>
                    ) : (
                      <>
                        <span className="display-xl text-[36px] leading-none tracking-[-0.03em] text-[#0F1A1C]">{timerSec}s</span>
                        <span className="label-mono !text-[#9CA3AF] !tracking-[0.14em]">hold • steady</span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* stepper — tactile dots */}
            <div className="flex gap-1.5 justify-center flex-wrap">
              {runnerWorkout.exercises.map((_, i) => (
                <motion.span
                  key={i}
                  layout
                  animate={{ width: i === exerciseIndex ? 32 : 16 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className={`h-1.5 rounded-full ${i === exerciseIndex ? "bg-[#C45A3C]" : i < exerciseIndex ? "bg-[#0F1A1C]" : "bg-[#E8E0D0]"}`}
                />
              ))}
            </div>
            <div className="label-mono !text-[#9CA3AF] !tracking-wide">{exerciseIndex + 1} / {runnerWorkout.exercises.length} • {isResting ? "Resting" : "Working"}</div>

            {/* controls — tactile */}
            <div className="flex gap-2 justify-center pt-1">
              <button onClick={() => setIsPaused(!isPaused)} className={`px-5 py-3 rounded-full text-xs font-700 border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${isPaused ? "bg-[#0F1A1C] text-white border-[#0F1A1C]" : "bg-white text-[#0F1A1C] border-[#E8E0D0] hover:border-[#0F1A1C]"}`}>
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button onClick={handleNextExercise} className="btn-primary px-6 py-3 text-xs font-700 inline-flex items-center gap-1.5">
                {exerciseIndex + 1 === runnerWorkout.exercises.length ? "Finish workout 🎉" : "Next move →"}
              </button>
            </div>

            <button onClick={() => setRunnerWorkout(null)} className="text-xs font-600 text-[#9CA3AF] hover:text-[#0F1A1C] transition-colors underline underline-offset-4 decoration-[#E8E0D0]">Exit session</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
