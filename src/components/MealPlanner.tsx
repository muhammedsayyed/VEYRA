import React, { useState, useEffect } from "react"
import { useApp } from "@/context/AppContext"
import { WeeklyMealPlan, MealPlanSlot } from "@/types"
import { SparklesIcon, CalendarIcon, PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, RefreshIcon, CheckIcon } from "@/components/icons"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEAL_TYPES: ("Breakfast" | "Lunch" | "Dinner" | "Snack")[] = ["Breakfast", "Lunch", "Dinner", "Snack"]

export default function MealPlanner() {
  const { mealPlan, getMealPlanApi, saveMealPlanApi, generateMealPlanApi, addToast } = useApp()

  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff))
    return monday.toISOString().split("T")[0]
  })

  const [planData, setPlanData] = useState<WeeklyMealPlan>({
    weekStartDate: currentWeekStart,
    days: {
      Monday: [
        { mealType: "Breakfast", recipeTitle: "Greek Yogurt & Berries", calories: 320, protein: 24, carbs: 35, fat: 6, prepTimeMin: 10, country: "Greece" },
        { mealType: "Lunch", recipeTitle: "Mediterranean Grilled Chicken Bowl", calories: 520, protein: 42, carbs: 30, fat: 16, prepTimeMin: 20, country: "Italy" },
        { mealType: "Dinner", recipeTitle: "Egyptian Lentil Soup & Salad", calories: 410, protein: 22, carbs: 62, fat: 9, prepTimeMin: 25, country: "Egypt" },
        { mealType: "Snack", recipeTitle: "Handful of Roasted Almonds", calories: 170, protein: 6, carbs: 5, fat: 14, prepTimeMin: 2, country: "Global" },
      ],
      Tuesday: [
        { mealType: "Breakfast", recipeTitle: "Avocado & Egg Toast", calories: 380, protein: 18, carbs: 32, fat: 20, prepTimeMin: 12, country: "USA" },
        { mealType: "Lunch", recipeTitle: "Japanese Teriyaki Salmon Bowl", calories: 580, protein: 44, carbs: 55, fat: 18, prepTimeMin: 22, country: "Japan" },
        { mealType: "Dinner", recipeTitle: "Grilled Turkey & Vegetable Skewers", calories: 450, protein: 40, carbs: 20, fat: 12, prepTimeMin: 20, country: "Turkey" },
        { mealType: "Snack", recipeTitle: "Protein Shake with Banana", calories: 220, protein: 25, carbs: 24, fat: 3, prepTimeMin: 3, country: "USA" },
      ],
    },
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDay, setSelectedDay] = useState("Monday")

  useEffect(() => {
    let isMounted = true
    getMealPlanApi(currentWeekStart).then((res) => {
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
    })
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

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-display font-800 text-[#172A35]">Weekly Meal Planner</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#C18A5A]/15 text-[#C18A5A]">
              Week of {currentWeekStart}
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Plan your 7-day nutrition, align with your calorie & protein goals, and let Veyra AI build your weekly menu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#FFFFFF] rounded-xl border p-1" style={{ borderColor: "#E6E0D5" }}>
            <button onClick={handlePrevWeek} className="p-1.5 text-[#6B7280] hover:text-[#172A35]">
              <ChevronLeftIcon size={16} />
            </button>
            <span className="text-xs font-bold px-2 text-[#172A35]">{currentWeekStart}</span>
            <button onClick={handleNextWeek} className="p-1.5 text-[#6B7280] hover:text-[#172A35]">
              <ChevronRightIcon size={16} />
            </button>
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-[#FFFFFF] shadow-sm transition-all disabled:opacity-50"
            style={{ background: "#C18A5A" }}
          >
            <SparklesIcon size={16} />
            <span>{isGenerating ? "Generating..." : "Generate My Weekly Plan"}</span>
          </button>
        </div>
      </div>

      {/* Days navigation pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b" style={{ borderColor: "#E6E0D5" }}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day
          const slots = planData.days[day] || []
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-[#172A35] text-[#FFFFFF] shadow-sm"
                  : "bg-[#FFFFFF] text-[#6B7280] border hover:bg-[#F1EEE6]"
              }`}
              style={!isSelected ? { borderColor: "#E6E0D5" } : {}}
            >
              <span>{day}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-[#C18A5A] text-[#FFFFFF]" : "bg-[#F1EEE6] text-[#172A35]"}`}>
                {slots.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Day View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-[#172A35] flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#C18A5A]" />
            <span>{selectedDay}'s Menu</span>
          </h3>
          <span className="text-xs text-[#6B7280] font-semibold">
            Total Calories: {daySlots.reduce((sum, s) => sum + s.calories, 0)} kcal • Protein: {daySlots.reduce((sum, s) => sum + s.protein, 0)}g
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEAL_TYPES.map((type) => {
            const slotsForType = daySlots.filter((s) => s.mealType === type)

            return (
              <div
                key={type}
                className="bg-[#FFFFFF] rounded-2xl border p-4 flex flex-col justify-between space-y-3"
                style={{ borderColor: "#E6E0D5" }}
              >
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "#F1EEE6" }}>
                  <h4 className="font-bold text-sm text-[#172A35] font-display uppercase tracking-wider">{type}</h4>
                  <button
                    onClick={() => handleAddCustomSlot(selectedDay, type)}
                    className="p-1 rounded-lg text-[#C18A5A] hover:bg-[#C18A5A]/10 text-xs font-bold flex items-center gap-1"
                  >
                    <PlusIcon size={14} />
                    <span>Add</span>
                  </button>
                </div>

                {slotsForType.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#6B7280] italic">
                    No meal scheduled for {type.toLowerCase()}. Click "+ Add" above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {slotsForType.map((slot, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F7F5EF] p-3 rounded-xl border flex items-center justify-between gap-3"
                        style={{ borderColor: "#E6E0D5" }}
                      >
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-[#172A35] truncate font-display">{slot.recipeTitle}</h5>
                          <div className="text-xs text-[#6B7280] flex items-center gap-2 mt-0.5">
                            <span>{slot.calories} kcal</span>
                            <span>•</span>
                            <span className="text-[#315A63] font-semibold">{slot.protein}g protein</span>
                            {slot.prepTimeMin && <span>• {slot.prepTimeMin}m</span>}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveSlot(selectedDay, daySlots.indexOf(slot))}
                          className="p-1.5 text-[#6B7280] hover:text-[#EF4444] shrink-0"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
