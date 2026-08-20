import React, { useState } from "react"
import { PlusIcon, ScanIcon, SparklesIcon } from "@/components/icons"
import { VeyraCharacter, Obj3D } from "@/components/VeyraChar"
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
}[] = [
  { id: "breakfast", label: "Breakfast", emoji: "🌅", time: "8:00 AM", target: 450, obj: "berry" },
  { id: "lunch", label: "Lunch", emoji: "☀️", time: "1:00 PM", target: 620, obj: "leaf" },
  { id: "snack", label: "Snacks", emoji: "🌤️", time: "4:00 PM", target: 200, obj: "avocado" },
  { id: "dinner", label: "Dinner", emoji: "🌙", time: "7:00 PM", target: 680, obj: "flame" },
  { id: "drinks", label: "Drinks", emoji: "💧", time: "All day", target: 0, obj: "water" },
]

export default function FoodLog() {
  const { user, meals, addMeal, removeMeal, updateMealQuantity, setScreen } = useApp()

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

  return (
    <div className="screen-scroll">
      {/* Editorial header */}
      <div className="flex items-end justify-between mb-5 animate-fade-in-up">
        <div>
          <div className="label-mono mb-2" style={{ color: "#C18A5A" }}>
            NUTRITION · JOURNAL
          </div>
          <h1 className="font-display display-xl text-[#172A35]">
            Food
            <br />
            Log
          </h1>
        </div>
        <div className="flex gap-1 p-1 rounded-xl glass">
          {dates.map((d) => (
            <button
              key={d.val}
              onClick={() => setDate(d.val)}
              className="px-3 py-1.5 rounded-lg text-xs font-display font-600 transition-all"
              style={
                date === d.val
                  ? { background: "#172A35", color: "#FFFFFF" }
                  : { color: "#6B7280" }
              }
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== HERO: remaining budget ===== */}
      <div className="liquid-glass rounded-[28px] p-6 mb-6 relative overflow-hidden animate-fade-in-up stagger-1">
        <div className="absolute top-5 right-6 animate-float pointer-events-none opacity-90">
          <Obj3D kind="avocado" size={54} />
        </div>

        <div className="relative">
          <div className="label-mono mb-5" style={{ color: "#6B7280" }}>
            {date === 0 ? "TODAY" : date === -1 ? "YESTERDAY" : "PAST 7 DAYS AVERAGE"} · {totalCal} KCAL IN
          </div>

          <div className="flex items-end gap-4">
            <div className="shrink-0 -mb-1">
              <VeyraCharacter mood={overBudget ? "concerned" : calPct >= 55 ? "cheer" : "happy"} accent={overBudget ? "coral" : "mint"} size={104} />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="font-display font-900 leading-none"
                  style={{ fontSize: "3.6rem", letterSpacing: "-0.04em", color: overBudget ? "#B96D62" : "#172A35" }}
                >
                  {Math.abs(remaining)}
                </span>
                <span className="font-display font-700 text-lg" style={{ color: overBudget ? "#B96D62" : "#C18A5A" }}>
                  {overBudget ? "kcal over budget" : "kcal left today"}
                </span>
              </div>
              <div className="text-sm mt-1.5 font-medium text-[#28302E]">
                {proteinLeft > 0 ? (
                  <>
                    {proteinLeft}g protein to go · <span style={{ color: "#6B7280" }}>{100 - calPct}% of budget open</span>
                  </>
                ) : (
                  <>
                    Protein goal met! · <span style={{ color: "#C18A5A" }}>Strong day</span>
                  </>
                )}
              </div>
              <div className="progress-track h-2.5 mt-3.5 max-w-xs">
                <div
                  className="progress-fill"
                  style={{
                    width: `${calPct}%`,
                    background: overBudget ? "#B96D62" : "#172A35",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Supporting macro strip */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 pt-5" style={{ borderTop: "1px solid #E6E0D5" }}>
            {[
              { label: "Protein", cur: totalProtein, goal: user.dailyProtein, unit: "g", meaning: `${proteinLeft}g to go`, primary: true },
              { label: "Carbs", cur: totalCarbs, goal: user.dailyCarbs, unit: "g", meaning: "on track", primary: false },
              { label: "Fat", cur: totalFat, goal: user.dailyFat, unit: "g", meaning: "balanced", primary: false },
            ].map((m) => (
              <div key={m.label}>
                <div className="label-mono mb-1" style={{ color: m.primary ? "#C18A5A" : "#6B7280" }}>
                  {m.label}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-800 text-xl leading-none" style={{ color: m.primary ? "#172A35" : "#28302E" }}>
                    {m.cur}
                  </span>
                  <span className="text-xs" style={{ color: "#6B7280" }}>
                    /{m.goal}{m.unit}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  {m.meaning}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick add bar */}
      <div className="flex gap-2 mb-7 overflow-x-auto pb-1 animate-fade-in-up stagger-2">
        <button
          onClick={() => {
            setSelectedSection("lunch")
            setAddModalOpen(true)
          }}
          className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm shrink-0"
        >
          <span style={{ color: "#172A35" }}>
            <PlusIcon size={14} />
          </span>
          Log Meal
        </button>
        <button onClick={() => setScreen("scanner")} className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm shrink-0">
          <span style={{ color: "#172A35" }}>
            <ScanIcon size={14} />
          </span>
          Scan Food
        </button>
        <button onClick={() => setScreen("ai")} className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm shrink-0">
          <span style={{ color: "#C18A5A" }}>
            <SparklesIcon size={14} />
          </span>
          Ask AI
        </button>
      </div>

      {/* ===== TIMELINE — MEAL BY MEAL ===== */}
      <div className="label-mono mb-4" style={{ color: "#6B7280" }}>
        MEAL BY MEAL BREAKDOWN
      </div>

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "#E6E0D5" }} />

        <div className="space-y-6">
          {mealSections.map((section) => {
            const isOpen = expanded.has(section.id)
            const sectionEntries = meals.filter((m) => m.sectionId === section.id)
            const sectionCal = sectionEntries.reduce((s, e) => s + e.calories, 0)
            const sectionProtein = sectionEntries.reduce((s, e) => s + e.protein, 0)
            const isEmpty = sectionEntries.length === 0

            return (
              <div key={section.id} className="relative animate-fade-in-up">
                <div
                  className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full"
                  style={{ background: isEmpty ? "#E6E0D5" : "#172A35" }}
                />

                {/* Section header */}
                <button onClick={() => toggle(section.id)} className="w-full flex items-center justify-between mb-3 text-left group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{section.emoji}</span>
                    <div>
                      <div className="font-display font-800 text-[#172A35] text-lg leading-none">{section.label}</div>
                      <div className="label-mono mt-1" style={{ color: "#6B7280" }}>
                        {section.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="font-display font-800 text-xl text-[#172A35]">{sectionCal}</span>
                        <span className="text-xs text-[#6B7280]">kcal</span>
                      </div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition-transform shrink-0"
                      style={{ background: "#F1EEE6", transform: isOpen ? "rotate(90deg)" : "none" }}
                    >
                      ›
                    </div>
                  </div>
                </button>

                {isOpen &&
                  (isEmpty ? (
                    <div className="glass rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden">
                      <VeyraCharacter mood="wink" accent="mint" size={66} />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-700 text-[#172A35] text-sm">Nothing logged yet</p>
                        <p className="text-xs mt-1 text-[#6B7280]">Add a meal or product to track your macros.</p>
                        <button
                          onClick={() => {
                            setSelectedSection(section.id)
                            setAddModalOpen(true)
                          }}
                          className="btn-primary text-xs px-4 py-2 flex items-center gap-2 mt-3"
                        >
                          <PlusIcon size={14} /> Add {section.label}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden glass">
                      <div className="label-mono px-3.5 pt-3 pb-1" style={{ color: "#C18A5A" }}>
                        {sectionProtein}G PROTEIN FROM THIS MEAL
                      </div>
                      {sectionEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-3 p-3.5 border-t border-[#E6E0D5] hover:bg-[#F1EEE6]/50 transition-colors">
                          <img
                            src={entry.img || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=80&h=80&fit=crop&auto=format"}
                            alt={entry.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-600 text-sm text-[#172A35] truncate">{entry.name}</p>
                            <p className="text-xs text-[#6B7280] mt-0.5">
                              {entry.grams}g · {entry.protein}g protein · {entry.carbs}g carbs · {entry.fat}g fat
                            </p>
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-3">
                            <div>
                              <div className="font-display font-800 text-base text-[#172A35]">{entry.calories}</div>
                              <div className="label-mono text-[9px] text-[#9CA3AF]">KCAL</div>
                            </div>
                            <button
                              onClick={() => {
                                setEditingMealId(entry.id)
                                setEditGrams(entry.grams)
                                setEditModalOpen(true)
                              }}
                              className="text-xs text-[#172A35] hover:underline px-1 font-bold"
                            >
                              Edit
                            </button>
                            <button onClick={() => removeMeal(entry.id)} className="text-xs text-[#B96D62] hover:text-[#B96D62]/80 px-1 font-bold">
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== ADD FOOD MODAL ===== */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Log New Meal or Food">
        <form onSubmit={handleAddFoodSubmit} className="space-y-4">
          <div>
            <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Meal Time / Category</label>
            <select
              value={selectedSection}
              onChange={(e: any) => setSelectedSection(e.target.value)}
              className="input-field w-full py-2.5 px-3 text-sm"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snack">Snack</option>
              <option value="dinner">Dinner</option>
              <option value="drinks">Drinks</option>
            </select>
          </div>

          <div>
            <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Select from Product Library</label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
              {SAMPLE_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedPresetFood(prod)
                    setCustomName(prod.name)
                    setCustomGrams(prod.portionGrams || 100)
                  }}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedPresetFood.id === prod.id ? "border-[#172A35] bg-[#172A35]/10 text-[#172A35]" : "border-[#E6E0D5] glass text-[#6B7280]"
                  }`}
                >
                  <span className="font-semibold text-[#172A35]">{prod.name}</span>
                  <span className="text-[#6B7280]">
                    {prod.calories} kcal ({prod.protein}g P)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Portion Size ({customGrams}g)</label>
            <input
              type="range"
              min="30"
              max="500"
              step="10"
              value={customGrams}
              onChange={(e) => setCustomGrams(Number(e.target.value))}
              className="w-full accent-[#172A35]"
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-sm font-700 mt-2">
            Confirm &amp; Add to Log
          </button>
        </form>
      </Modal>

      {/* ===== EDIT PORTION MODAL ===== */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Portion Quantity">
        <div className="space-y-4">
          <div>
            <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Grams ({editGrams}g)</label>
            <input
              type="range"
              min="20"
              max="600"
              step="10"
              value={editGrams}
              onChange={(e) => setEditGrams(Number(e.target.value))}
              className="w-full accent-[#172A35]"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSavePortionEdit} className="btn-primary flex-1 py-3 text-sm font-700">
              Save Changes
            </button>
            <button onClick={() => setEditModalOpen(false)} className="btn-ghost px-4 py-3 text-sm">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
