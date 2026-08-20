import React, { useState, useEffect } from "react"
import { FlameIcon, ZapIcon, DumbbellIcon } from "@/components/icons"
import { VeyraCharacter, Obj3D } from "@/components/VeyraChar"
import { useApp, SAMPLE_WORKOUTS } from "@/context/AppContext"
import { WorkoutRoutine } from "@/types"
import Modal from "@/components/Modal"

const categories = ["All", "Weight Loss", "Muscle Building", "Cardio", "Beginner", "Home Workout", "Gym"]
const genders = ["All", "Male", "Female"]

export default function FitnessCoach() {
  const { completeWorkout, completedWorkoutsCount } = useApp()

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

  return (
    <div className="screen-scroll">
      {/* Featured Workout Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6 animate-fade-in-up" style={{ minHeight: 340, border: "1px solid #E6E0D5" }}>
        <img src={featured.img} alt={featured.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #F7F5EF 12%, rgba(241,238,230,0.85) 60%, rgba(241,238,230,0.4) 100%)" }} />
        <div className="absolute -top-4 right-6 animate-float pointer-events-none">
          <Obj3D kind="dumbbell" size={74} />
        </div>

        <div className="relative h-full flex flex-col justify-between p-6 md:p-7" style={{ minHeight: 340 }}>
          <div className="flex items-start gap-3">
            <VeyraCharacter mood="coaching" accent="coral" size={72} />
            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 label-mono text-xs px-2.5 py-1 rounded-full glass text-[#C18A5A]">
                <ZapIcon size={11} /> TODAY'S RECOMMENDED WORKOUT
              </div>
              <p className="text-sm mt-2 font-medium text-[#6B7280] max-w-xs">Let's move, champion! Burn off calories and hit your weekly streak.</p>
            </div>
          </div>

          <div>
            <h1 className="font-display font-900 text-[#172A35] leading-[0.92]" style={{ fontSize: "2.8rem" }}>
              {featured.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 label-mono text-xs mt-3 text-[#6B7280]">
              <span className="text-[#172A35]">{featured.durationMin} MIN</span>
              <span className="text-[#C18A5A] font-bold">{featured.caloriesBurned} KCAL BURN</span>
              <span className="text-[#172A35] font-bold">{featured.difficulty.toUpperCase()}</span>
              <span>{featured.muscles.toUpperCase()}</span>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => handleStartWorkout(featured)} className="btn-primary px-7 py-3.5 flex items-center gap-2 text-sm font-700">
                <FlameIcon size={17} /> Start Workout · {featured.durationMin} min
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="glass rounded-3xl p-5 mb-7 animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#C18A5A]/20 text-[#C18A5A]">
              <FlameIcon size={20} />
            </div>
            <div>
              <div className="font-display font-800 text-xl text-[#172A35] leading-none">{completedWorkoutsCount} workouts completed</div>
              <div className="text-xs mt-1 text-[#C18A5A]">Weekly fitness streak active 🔥</div>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="font-display font-800 text-2xl text-[#172A35] leading-none">320</div>
              <div className="label-mono mt-1 text-[#6B7280]">KCAL BURNED TODAY</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category & Gender Filters */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="label-mono text-xs text-[#6B7280]">CATEGORY</span>
          <div className="flex gap-1 text-xs">
            {genders.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGender(g)}
                className={`px-2.5 py-0.5 rounded-full ${activeGender === g ? "bg-[#172A35]/20 text-[#172A35] border border-[#172A35]/40" : "text-[#6B7280]"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button key={c} className={`chip whitespace-nowrap${activeCategory === c ? " active" : ""}`} onClick={() => setActiveCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Workout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((w) => (
          <div key={w.id} className="glass rounded-2xl overflow-hidden card-hover flex flex-col justify-between">
            <div className="relative h-40">
              <img src={w.img} alt={w.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172A35]/80 to-transparent" />
              <div className="absolute top-3 left-3 label-mono text-xs px-2.5 py-1 rounded-full bg-[#C18A5A] text-[#FFFFFF] font-bold">
                {w.difficulty}
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="label-mono text-[10px] text-white/80">{w.category}</span>
                <h3 className="font-display font-700 text-white text-base leading-tight">{w.name}</h3>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <p className="text-xs text-[#6B7280] line-clamp-2">{w.description}</p>
              <div className="flex items-center justify-between text-xs text-[#6B7280] label-mono">
                <span>{w.durationMin} MIN</span>
                <span className="text-[#C18A5A] font-bold">{w.caloriesBurned} KCAL</span>
                <span>{w.equipment}</span>
              </div>
              <button onClick={() => handleStartWorkout(w)} className="btn-coral text-xs py-2.5 flex items-center justify-center gap-1.5 mt-1 font-700">
                <FlameIcon size={14} /> Start Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* WORKOUT RUNNER MODAL */}
      <Modal isOpen={!!runnerWorkout} onClose={() => setRunnerWorkout(null)} title={runnerWorkout?.name || "Active Workout"} maxWidth="lg">
        {runnerWorkout && (
          <div className="space-y-6 text-center py-2">
            {/* Veyra mascot trainer */}
            <div className="mx-auto w-fit">
              <VeyraCharacter mood={isResting ? "zen" : "coaching"} accent="coral" size={100} />
            </div>

            {/* Stage title */}
            {isResting ? (
              <div className="bg-[#172A35]/10 border border-[#172A35]/30 rounded-2xl p-4">
                <span className="label-mono text-[#172A35] block mb-1">REST PERIOD</span>
                <h3 className="font-display font-900 text-3xl text-[#172A35]">{timerSec}s</h3>
                <p className="text-xs text-[#6B7280] mt-1">Catch your breath. Next up: {runnerWorkout.exercises[exerciseIndex + 1]?.name}</p>
              </div>
            ) : (
              <div>
                <span className="label-mono text-[#C18A5A] block mb-1">
                  EXERCISE {exerciseIndex + 1} OF {runnerWorkout.exercises.length}
                </span>
                <h3 className="font-display font-900 text-2xl text-[#172A35] mb-2">{runnerWorkout.exercises[exerciseIndex]?.name}</h3>
                <p className="text-xs text-[#6B7280] max-w-sm mx-auto">{runnerWorkout.exercises[exerciseIndex]?.instructions}</p>
                {runnerWorkout.exercises[exerciseIndex]?.reps ? (
                  <div className="font-display font-800 text-3xl text-[#172A35] mt-3">{runnerWorkout.exercises[exerciseIndex]?.reps} REPS</div>
                ) : (
                  <div className="font-display font-800 text-3xl text-[#172A35] mt-3">{timerSec}s</div>
                )}
              </div>
            )}

            {/* Stepper progress */}
            <div className="flex gap-1 justify-center">
              {runnerWorkout.exercises.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === exerciseIndex ? "w-8 bg-[#C18A5A]" : i < exerciseIndex ? "w-4 bg-[#172A35]" : "w-4 bg-[#E6E0D5]"
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setIsPaused(!isPaused)} className="btn-ghost px-5 py-3 text-xs font-700">
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button onClick={handleNextExercise} className="btn-primary px-6 py-3 text-xs font-700">
                {exerciseIndex + 1 === runnerWorkout.exercises.length ? "Finish Workout 🎉" : "Next Exercise →"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
