import React, { useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { FoodItem } from "@/types"
import { SparklesIcon, XIcon } from "@/components/icons"
import { VeyraCompanion } from "@/components/VeyraCompanion"
import { fetchRecipes, fetchRecipeDetail, mapDetailToFoodItem, RecipeSummaryDto } from "@/services/api/foodApi"

interface WhatShouldIEatModalProps {
  onClose: () => void
  onSelectRecipe: (recipe: FoodItem) => void
}

export default function WhatShouldIEatModal({ onClose, onSelectRecipe }: WhatShouldIEatModalProps) {
  const { pantryItems } = useApp()
  const shouldReduceMotion = useReducedMotion()

  const [budget, setBudget] = useState<string>("any")
  const [maxCalories, setMaxCalories] = useState<number>(600)
  const [minProtein, setMinProtein] = useState<number>(20)
  const [mealType, setMealType] = useState<string>("any")
  const [cuisine, setCuisine] = useState<string>("any")
  const [usePantryOnly, setUsePantryOnly] = useState<boolean>(false)

  const [catalog, setCatalog] = useState<RecipeSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activePantryNames = pantryItems.filter((i) => !i.isUsed).map((i) => i.name.toLowerCase())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const countryMap: Record<string, string> = {
          italian: "it",
          egyptian: "eg",
          japanese: "jp",
        }
        const countryCode = cuisine !== "any" ? (countryMap[cuisine.toLowerCase()] || undefined) : undefined
        const res = await fetchRecipes({ country: countryCode, limit: 50, sort: 'popular' })
        if (!cancelled) setCatalog(res.items)
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load recommendations")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [cuisine])

  const handleSelect = async (item: RecipeSummaryDto) => {
    try {
      const detail = await fetchRecipeDetail(item.slug || item.id)
      if (detail) {
        onSelectRecipe(mapDetailToFoodItem(detail))
      } else {
        const { mapSummaryToFoodItem } = await import("@/services/api/foodApi")
        onSelectRecipe(mapSummaryToFoodItem(item) as any)
      }
      onClose()
    } catch {
      const { mapSummaryToFoodItem } = await import("@/services/api/foodApi")
      onSelectRecipe(mapSummaryToFoodItem(item) as any)
      onClose()
    }
  }

  const filtered = catalog.filter((recipe) => {
    const cals = recipe.nutrition?.calories ?? 0
    const prot = recipe.nutrition?.protein ?? 0
    if (cals > maxCalories) return false
    if (prot < minProtein) return false
    if (mealType !== "any") {
      const cats = recipe.categories.map(c => c.slug.toLowerCase())
      const slug = mealType.toLowerCase()
      if (!cats.includes(slug) && !cats.includes(mealType.toLowerCase())) {
        const hasMealCat = ["breakfast","lunch","dinner","snack"].some(m => cats.includes(m))
        if (hasMealCat) return false
      }
    }
    if (usePantryOnly && activePantryNames.length > 0) {
    }
    if (budget !== "any") {
      const cost = recipe.homePrepCost ?? 9999
      if (budget === "low" && cost > 200) return false
      if (budget === "medium" && (cost < 100 || cost > 600)) return false
      if (budget === "high" && cost < 500) return false
    }
    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F1A1C]/60 backdrop-blur-[12px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as any }}
        className="relative w-full max-w-[560px] max-h-[92vh] sm:max-h-[88vh] bg-[#FFFBF5] rounded-[28px] overflow-hidden flex flex-col border border-[#E8E0D0]"
        style={{ boxShadow: "0 24px 64px rgba(15,26,28,0.18), 0 6px 20px rgba(15,26,28,0.1)" }}
      >
        {/* header — editorial ink */}
        <div className="relative shrink-0 bg-[#0F1A1C] p-5 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #C45A3C 0%, transparent 70%)" }} />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="hidden sm:block shrink-0 -mt-1">
                <VeyraCompanion mood="happy" accent="clay" size={52} float={false} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white text-[#0F1A1C] grid place-items-center sm:hidden">
                    <SparklesIcon size={12} />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-white/50 uppercase">Veyra Companion • Atelier Pick</span>
                </div>
                <h3 className="font-serif text-[22px] sm:text-[24px] font-light italic tracking-[-0.02em] text-white leading-none mt-1">What should <span className="font-display not-italic font-extrabold text-white">I eat?</span></h3>
                <p className="text-xs leading-relaxed text-white/60 mt-1.5 max-w-[36ch]" style={{ fontFamily: "Inter, sans-serif" }}>
                  Tell Veyra your preference — she’ll surface tailored picks from 1,400 verified plates.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white grid place-items-center hover:bg-white hover:text-[#0F1A1C] transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
              <XIcon size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 bg-[#FFFBF5]">

          {/* Filter controls — tactile paper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-[20px] bg-white border border-[#E8E0D0] p-4 shadow-[0_4px_16px_rgba(15,26,28,0.04)]">
            <div className="sm:col-span-2 flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C]" />
              <span className="font-mono text-[10px] tracking-[0.12em] font-semibold uppercase text-[#9CA3AF]">Refine your table</span>
              <span className="ml-auto font-mono text-[10px] px-2 py-1 rounded-full bg-[#0F1A1C] text-white font-bold">{filtered.length} matches</span>
            </div>

            <div className="rounded-[14px] bg-[#FFFBF5] border border-[#E8E0D0] p-3">
              <label className="block font-display font-bold text-[12px] text-[#0F1A1C] mb-1">Max Calories: <span className="text-[#C45A3C]">{maxCalories}</span> kcal</label>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={maxCalories}
                onChange={(e) => setMaxCalories(Number(e.target.value))}
                className="w-full accent-[#0F1A1C] h-1.5"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#9CA3AF] mt-1"><span>200</span><span>1000</span></div>
            </div>

            <div className="rounded-[14px] bg-[#FFFBF5] border border-[#E8E0D0] p-3">
              <label className="block font-display font-bold text-[12px] text-[#0F1A1C] mb-1">Min Protein: <span className="text-[#8A9A8B]">{minProtein}g</span></label>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={minProtein}
                onChange={(e) => setMinProtein(Number(e.target.value))}
                className="w-full accent-[#0F1A1C] h-1.5"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#9CA3AF] mt-1"><span>10g</span><span>80g</span></div>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.1em] font-semibold uppercase text-[#9CA3AF] mb-1.5">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full p-2.5 rounded-full border bg-white text-sm font-medium text-[#0F1A1C] focus:outline-none focus:border-[#0F1A1C] focus:ring-4 focus:ring-[#0F1A1C]/5 transition-all"
                style={{ borderColor: "#E8E0D0" }}
              >
                <option value="any">Any Meal</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.1em] font-semibold uppercase text-[#9CA3AF] mb-1.5">Cuisine</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full p-2.5 rounded-full border bg-white text-sm font-medium text-[#0F1A1C] focus:outline-none focus:border-[#0F1A1C] focus:ring-4 focus:ring-[#0F1A1C]/5 transition-all"
                style={{ borderColor: "#E8E0D0" }}
              >
                <option value="any">Any Cuisine</option>
                <option value="italian">Italian</option>
                <option value="egyptian">Egyptian</option>
                <option value="japanese">Japanese</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
                <option value="thai">Thai</option>
                <option value="korean">Korean</option>
                <option value="turkish">Turkish</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-[14px] bg-white border border-[#E8E0D0] cursor-pointer hover:border-[#0F1A1C]/20 transition-colors group">
            <input
              type="checkbox"
              id="pantryOnly"
              checked={usePantryOnly}
              onChange={(e) => setUsePantryOnly(e.target.checked)}
              className="w-4 h-4 rounded-full accent-[#0F1A1C] border-[#E8E0D0]"
            />
            <span className="text-xs font-semibold text-[#0F1A1C] group-hover:text-[#1D2A2E] transition-colors">Prefer recipes matching my Smart Pantry</span>
            <span className="ml-auto hidden sm:inline font-mono text-[10px] text-[#9CA3AF]">{pantryItems.filter(i=>!i.isUsed).length} items</span>
          </label>

          {/* Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[10px] tracking-[0.14em] font-semibold uppercase text-[#9CA3AF]">Recommendations • {filtered.length}</h4>
              <span className="font-mono text-[10px] tracking-wide text-[#C45A3C] font-semibold hidden sm:inline">Tap any plate to open dossier</span>
            </div>

            {loading ? (
              <div className="rounded-[16px] bg-white border border-[#E8E0D0] p-8 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#E8E0D0] border-t-[#0F1A1C] animate-spin mx-auto" />
                <div className="font-mono text-xs text-[#6B7280] mt-3">Curating from 1,400 plates…</div>
              </div>
            ) : error ? (
              <div className="rounded-[16px] bg-[#FEF2F2] border border-[#FCA5A5] p-4 text-center text-sm text-[#DC2626]">Failed to load: {error}</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[20px] bg-white border border-dashed border-[#E8E0D0] p-8 text-center">
                <VeyraCompanion mood="think" accent="sage" size={56} float={false} className="mx-auto" />
                <p className="font-serif italic text-[16px] text-[#0F1A1C] mt-3">No exact matches</p>
                <p className="font-mono text-xs text-[#6B7280] mt-1">Loosen your filters — the archive is wide.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[36vh] overflow-y-auto pr-1 [scrollbar-width:thin]">
                <AnimatePresence>
                  {filtered.slice(0, 20).map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                      transition={{ delay: shouldReduceMotion ? 0 : i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => handleSelect(item)}
                      className="group flex items-center gap-3 p-3 rounded-[16px] bg-white border border-[#E8E0D0] hover:border-[#0F1A1C]/15 hover:shadow-[0_8px_20px_rgba(15,26,28,0.06)] hover:-translate-y-0.5 cursor-pointer transition-all"
                    >
                      <img src={item.imageUrl || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&auto=format'} alt={item.name} className="w-14 h-14 rounded-[12px] object-cover shrink-0 bg-[#FFFBF5] border border-[#E8E0D0]/50 group-hover:scale-[1.02] transition-transform" />
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-[13px] leading-tight tracking-tight text-[#0F1A1C] truncate group-hover:text-[#1D2A2E] transition-colors">{item.name}</div>
                        <div className="font-mono text-[11px] tracking-wide text-[#6B7280] truncate">
                          {item.nutrition?.calories ?? 0} kcal • {item.nutrition?.protein ?? 0}g protein • {item.country.name}
                        </div>
                        <div className="flex gap-1.5 mt-1 hidden sm:flex">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] text-[#6B7280]">{item.difficulty}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[#0F1A1C] text-white">{item.country.code.toUpperCase()}</span>
                        </div>
                      </div>

                      <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0F1A1C] text-white text-xs font-bold group-hover:bg-[#1D2A2E] group-hover:gap-2 transition-all">
                        Open <span className="w-5 h-5 rounded-full bg-white text-[#0F1A1C] grid place-items-center text-[10px]">→</span>
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filtered.length > 20 && <p className="text-center font-mono text-[11px] text-[#9CA3AF] pt-1">Showing 20 of {filtered.length} • Refine to narrow</p>}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-3 sm:p-4 border-t border-[#E8E0D0]/60 bg-white flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] hidden sm:inline">Veyra Atelier • 1,400 plates • Companion is live</span>
          <button onClick={onClose} className="ml-auto sm:ml-0 px-5 py-2.5 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C] text-xs font-bold hover:border-[#0F1A1C] hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15">Close</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
