import React, { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { SearchIcon, SparklesIcon, HeartIcon, CompassIcon, XIcon } from "@/components/icons"
import { useApp } from "@/context/AppContext"
import { FoodItem } from "@/types"
import RecipeDetailsModal from "@/components/RecipeDetailsModal"
import WhatShouldIEatModal from "@/components/WhatShouldIEatModal"
import { VeyraCompanion } from "@/components/VeyraCompanion"
import { fetchCountries, fetchRecipes, searchRecipes, fetchRecipeDetail, mapDetailToFoodItem, mapSummaryToFoodItem, CountryDto, RecipeSummaryDto } from "@/services/api/foodApi"

const FOOD_TYPES = ["All", "Beef", "Chicken", "Vegetarian", "Desserts"] as const
type FoodType = typeof FOOD_TYPES[number]
function foodTypeToCategoryParam(foodType: FoodType): string | undefined {
  if (foodType === "All") return undefined
  return foodType.toLowerCase()
}

// New Veyra palette — paper/ink/clay/sage/ochre/mist
const countryAccent: Record<string, string> = {
  Egypt: "#C45A3C",
  Italy: "#8A9A8B",
  Japan: "#0F1A1C",
  Mexico: "#E07A5F",
  India: "#C45A3C",
  Turkey: "#1D2A2E",
  France: "#0F1A1C",
  USA: "#1D2A2E",
  "South Korea": "#C45A3C",
  Thailand: "#8A9A8B",
  Greece: "#1D2A2E",
  Spain: "#E07A5F",
  China: "#C45A3C",
  Brazil: "#8A9A8B",
  Morocco: "#E07A5F",
  Germany: "#0F1A1C",
  "United Kingdom": "#1D2A2E",
  "United Arab Emirates": "#C45A3C",
  "Saudi Arabia": "#0F1A1C",
  Nigeria: "#8A9A8B",
}

function codeToFlag(code: string) {
  if (!code || code.length !== 2) return "◍"
  const points = code.toUpperCase().split("").map(c => 127397 + c.charCodeAt(0))
  try { return String.fromCodePoint(...points) } catch { return code.toUpperCase() }
}

const easeVeyra: any = [0.16, 1, 0.3, 1]

export default function DiscoverFood() {
  const { toggleFavorite, favorites } = useApp()
  const [countries, setCountries] = useState<CountryDto[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [activeFoodType, setActiveFoodType] = useState<FoodType>("All")
  const [activeCountry, setActiveCountry] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState<RecipeSummaryDto[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<FoodItem | null>(null)
  const [showWhatShouldIEat, setShowWhatShouldIEat] = useState(false)
  const limit = 12
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const activeCountryCode = useMemo(() => {
    if (activeCountry === "All") return undefined
    return countries.find(c => c.name.toLowerCase() === activeCountry.toLowerCase())?.code
  }, [activeCountry, countries])

  const activeCountryObj = useMemo(() => countries.find(c => c.name === activeCountry), [activeCountry, countries])

  useEffect(() => {
    let cancelled = false
    fetchCountries().then(data => {
      if (!cancelled) setCountries([...data].sort((a, b) => a.name.localeCompare(b.name)))
    }).catch(() => {}).finally(() => { if (!cancelled) setCountriesLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        setLoading(true); setError(null)
        const category = foodTypeToCategoryParam(activeFoodType)
        const q = searchQuery.trim()
        const res = q ? await searchRecipes(q, { country: activeCountryCode, category, page: currentPage, limit }) : await fetchRecipes({ country: activeCountryCode, category, page: currentPage, limit, sort: 'popular' })
        if (!cancelled) { setRecipes(res.items); setTotal(res.total); setTotalPages(res.totalPages) }
      } catch (e: any) {
        if (!cancelled) { setError(e.message || "Failed"); setRecipes([]); setTotal(0) }
      } finally { if (!cancelled) setLoading(false) }
    }, searchQuery.trim() ? 350 : 0)
    return () => { cancelled = true; clearTimeout(t) }
  }, [activeFoodType, activeCountryCode, searchQuery, currentPage])

  const handleSelectRecipe = async (summary: RecipeSummaryDto) => {
    try {
      const detail = await fetchRecipeDetail(summary.slug || summary.id)
      setSelectedRecipe(detail ? mapDetailToFoodItem(detail) : mapSummaryToFoodItem(summary) as any)
    } catch { setSelectedRecipe(mapSummaryToFoodItem(summary) as any) }
  }

  const clearFilters = () => { setActiveCountry("All"); setActiveFoodType("All"); setSearchQuery(""); setCurrentPage(1) }
  const hasFilters = activeCountry !== "All" || activeFoodType !== "All" || searchQuery.trim() !== ""

  return (
    <div className="screen-scroll max-w-[1280px] mx-auto">
      {/* ── Masthead ── */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeVeyra }}
        className="hidden sm:flex items-center justify-between py-3 mb-4 border-y border-[#E8E0D0]/70"
      >
        <span className="font-mono text-[10px] tracking-[0.16em] font-semibold text-[#9CA3AF] uppercase flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#C45A3C]" /> VEYRA ° EDITION 2026
        </span>
        <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase hidden lg:block">Archive • 20 Kitchens • 1,400 Recipes • 274 Films</span>
        <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#8A9A8B] uppercase">Curated Daily — Cairo • Milan • Tokyo</span>
      </motion.div>

      {/* ── Hero — NEW editorial cinematic ── */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeVeyra }}
        className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] mb-6 border border-[rgba(15,26,28,0.08)]"
        style={{ background: "#0F1A1C" }}
      >
        {/* ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle at 30% 30%, #C45A3C 0%, transparent 68%)" }} />
          <div className="absolute -bottom-32 -left-24 w-[540px] h-[540px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle at 60% 60%, #8A9A8B 0%, transparent 72%)" }} />
          <div className="absolute inset-0 opacity-[0.035]" style={{ background: "radial-gradient(900px circle at 100% 0%, #E07A5F 0%, transparent 55%)" }} />
          {/* watermark */}
          <div className="hidden lg:block absolute -bottom-6 right-6 font-serif font-bold leading-none select-none pointer-events-none" style={{ fontSize: 132, letterSpacing: "-0.06em", color: "rgba(255,251,245,0.028)" }}>
            20
          </div>
        </div>

        <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-0 items-stretch">
          {/* left editorial */}
          <div className="p-6 sm:p-8 lg:p-9 lg:pr-6 flex flex-col min-w-0">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
                <p className="font-mono text-[10px] tracking-[0.16em] font-semibold text-white/45 uppercase">Veyra Collection • 20 Cuisines • 1,400 Verified Recipes</p>
              </div>

              <h1 className="mt-4 font-serif text-[32px] min-[375px]:text-[36px] sm:text-[48px] lg:text-[54px] font-light leading-[0.88] tracking-[-0.035em] text-white text-balance">
                <span className="font-serif font-light">Taste the </span>
                <span className="font-display font-extrabold tracking-[-0.04em]">world</span>
                <span className="font-serif italic font-normal text-[#E07A5F]">, beautifully</span>
                <br />
                <span className="font-serif font-light text-white/90">archived.</span>
              </h1>

              <p className="mt-4 text-[13.5px] sm:text-[14px] leading-[1.7] text-white/60 max-w-[44ch] font-normal" style={{ fontFamily: "Inter, sans-serif" }}>
                Twenty kitchens, four disciplines, one seamless table. Every recipe is real, priced by locale and — when verified — guided by a true{" "}
                <span className="text-white/85 underline decoration-white/15 underline-offset-4">cooking film</span>. Search, filter, and open any plate — the detail is editorial.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -1 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  onClick={() => setShowWhatShouldIEat(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#0F1A1C] text-[13px] font-bold tracking-tight shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span className="w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center">
                    <SparklesIcon size={12} />
                  </span>
                  What Should I Eat?
                </motion.button>

                <span className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/[0.08] backdrop-blur border border-white/10 text-white/70 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#8A9A8B] animate-pulse" />
                  {loading ? "Curating…" : `${total.toLocaleString()} recipes`} • {countries.length || 20} kitchens
                </span>

                {hasFilters && (
                  <button onClick={clearFilters} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white text-[#0F1A1C] text-xs font-bold hover:bg-[#FFFBF5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                    Clear <XIcon size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-2 font-mono tracking-[0.12em] uppercase text-white/45">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                Live catalog
              </span>
              <span className="hidden sm:inline h-3 w-px bg-white/10" />
              <span className="font-mono text-white/55 truncate max-w-[52ch]">
                {activeCountryObj ? `${activeCountryObj.cuisineLabel} • ${activeCountryObj.region || "Global kitchen"} • ${activeCountryObj.code.toUpperCase()}` : "All kitchens • Global pantry"}
                {searchQuery ? ` • “${searchQuery}”` : ""}
                {activeFoodType !== "All" ? ` • ${activeFoodType}` : ""}
              </span>
            </div>
          </div>

          {/* right atelier — NEW: paper card with companion */}
          <div className="relative p-4 sm:p-5 lg:p-6 flex items-stretch lg:pl-2 min-w-0">
            <div className="relative w-full rounded-[24px] overflow-hidden border border-white/10 p-4 sm:p-5 flex flex-col bg-[#FFFBF5]" style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}>
              {/* watermark */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="font-serif italic text-[84px] leading-none tracking-[-0.04em] text-[#0F1A1C]/[0.06] select-none">Veyra</span>
              </div>
              <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

              <div className="relative flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase">Atelier — mise en place</span>
                <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-[#0F1A1C] text-white font-bold">274 films</span>
              </div>

              <div className="relative grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { k: "Beef", v: "400", sub: "Hearty", accent: "#0F1A1C" },
                  { k: "Chicken", v: "400", sub: "Lean", accent: "#1D2A2E" },
                  { k: "Vegetarian", v: "400", sub: "Garden", accent: "#8A9A8B" },
                  { k: "Desserts", v: "200", sub: "Sweet", accent: "#C45A3C" },
                  { k: "Videos", v: "274", sub: "Guided", accent: "#E07A5F" },
                  { k: "Countries", v: "20", sub: "Kitchens", accent: "#0F1A1C" },
                ].map((m, i) => (
                  <motion.div
                    key={m.k}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{ delay: shouldReduceMotion ? 0 : 0.14 + i * 0.05, duration: 0.5, ease: easeVeyra }}
                    className="rounded-[16px] bg-white border border-[#E8E0D0]/70 p-3 shadow-[0_4px_16px_rgba(15,26,28,0.06)] hover:shadow-[0_8px_24px_rgba(15,26,28,0.08)] hover:-translate-y-0.5 transition-all"
                  >
                    <div className="font-mono text-[9px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase">{m.k}</div>
                    <div className="font-display font-extrabold text-[18px] leading-none mt-1" style={{ color: m.accent }}>{m.v}</div>
                    <div className="font-mono text-[10px] text-[#6B7280] mt-0.5">{m.sub}</div>
                  </motion.div>
                ))}
              </div>

              <div className="relative mt-3 rounded-[14px] bg-white border border-[#E8E0D0]/60 p-3 flex items-center gap-3 shadow-[0_2px_10px_rgba(15,26,28,0.04)]">
                <div className="w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0">
                  <CompassIcon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-xs leading-none text-[#0F1A1C]">Editorial curation</div>
                  <div className="font-mono text-[10px] text-[#6B7280] truncate">Real pricing • Real nutrition • Real video</div>
                </div>
                <div className="hidden sm:block shrink-0">
                  <VeyraCompanion mood="happy" accent="clay" size={36} float={false} />
                </div>
                <span className="w-2 h-2 rounded-full bg-[#8A9A8B] animate-pulse shrink-0 hidden sm:block" />
              </div>

              <div className="relative mt-3 flex items-center gap-2 text-[11px] font-mono tracking-wide text-[#9CA3AF] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C]" /> Ask Veyra to choose • Companion is live
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-px w-full opacity-[0.06] bg-white" />
      </motion.div>

      {/* ── Search Atelier ── */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.12, duration: 0.55, ease: easeVeyra }}
        className={`relative rounded-[20px] border p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center transition-all ${searchFocused ? "bg-white border-[#0F1A1C] shadow-[0_8px_32px_rgba(15,26,28,0.08)]" : "bg-white/90 backdrop-blur border-[#E8E0D0] shadow-[0_4px_20px_rgba(15,26,28,0.04)]"}`}
      >
        <div className="relative flex-1 min-w-0 group">
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search Koshari, Kabsa, Tiramisu, Bulgogi, Jollof…"
            className="w-full h-[46px] rounded-full bg-[#FFFBF5] border border-[#E8E0D0] pl-[44px] pr-[44px] text-[14px] font-medium text-[#0F1A1C] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F1A1C] focus:bg-white transition-all"
          />
          <SearchIcon size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? "text-[#0F1A1C]" : "text-[#9CA3AF]"}`} />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
                onClick={() => { setSearchQuery(""); setCurrentPage(1) }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center hover:scale-105 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20"
                aria-label="Clear search"
              >
                <XIcon size={12} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden sm:flex items-center gap-2 pl-1 pr-1 shrink-0">
          <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-colors ${loading ? "bg-[#FFFBF5] border-[#E8E0D0] text-[#6B7280]" : "bg-[#0F1A1C] border-[#0F1A1C] text-white"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-[#C45A3C] animate-pulse" : "bg-[#8A9A8B]"}`} />
            {loading ? "Searching…" : `${total.toLocaleString()} found`}
          </span>
          <span className="hidden lg:inline-flex font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase pl-2">page {currentPage} / {totalPages}</span>
        </div>

        <div className="sm:hidden flex items-center justify-between px-1 pb-1">
          <span className="font-mono text-[11px] text-[#6B7280]">{loading ? "Searching…" : `${total} recipes`}</span>
          <span className="font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase">page {currentPage} / {totalPages}</span>
        </div>
      </motion.div>

      {/* ── Kitchens — passport shelf ── */}
      <div className="mt-6">
        <div className="flex items-end justify-between gap-4 mb-3">
          <div className="flex items-baseline gap-3 min-w-0">
            <h2 className="font-serif italic text-[19px] sm:text-[21px] tracking-[-0.02em] text-[#0F1A1C] leading-none">Kitchens <span className="font-display not-italic font-extrabold">— atelier</span></h2>
            <span className="hidden sm:inline font-mono text-[10px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase">20 passports • tactile scroll</span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase hidden sm:inline-flex items-center gap-1.5">drag <span className="hidden md:inline">→</span> <span className="w-6 h-px bg-[#E8E0D0] hidden md:block" /></span>
        </div>

        {countriesLoading ? (
          <div className="flex gap-3 overflow-hidden pb-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shrink-0 w-[176px] h-[108px] rounded-[20px] bg-white border border-[#E8E0D0] p-4 animate-pulse">
                <div className="h-3 w-20 bg-[#FFFBF5] rounded-full" />
                <div className="h-4 w-28 bg-[#FFFBF5] rounded-full mt-3" />
                <div className="h-3 w-16 bg-[#FFFBF5] rounded-full mt-3" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollerRef}
            className="flex gap-3 sm:gap-3.5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-px-2 -mx-1 px-1"
            style={{ scrollbarWidth: "none" }}
          >
            {/* All — ink */}
            <motion.button
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              onClick={() => { setActiveCountry("All"); setCurrentPage(1) }}
              className={`snap-start shrink-0 w-[148px] sm:w-[160px] h-[112px] rounded-[20px] p-4 text-left relative overflow-hidden border flex flex-col justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${activeCountry === "All" ? "text-white border-[#0F1A1C] shadow-[0_10px_30px_rgba(15,26,28,0.16)]" : "bg-white border-[#E8E0D0] text-[#0F1A1C] hover:border-[#0F1A1C]/15 hover:shadow-[0_8px_24px_rgba(15,26,28,0.08)] hover:-translate-y-0.5 transition-all"}`}
              style={activeCountry === "All" ? { background: "#0F1A1C" } : {}}
            >
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute inset-0 rounded-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: activeCountry === "All" ? "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 55%)" : "linear-gradient(180deg, rgba(255,255,255,0.6), transparent 60%)" }} />
              <div>
                <div className="font-mono text-[10px] tracking-[0.1em] font-semibold opacity-60 uppercase flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeCountry === "All" ? "bg-[#E07A5F]" : "bg-[#C45A3C]"}`} />
                  Global
                </div>
                <div className="font-display font-extrabold text-[16px] leading-none mt-1">All</div>
                <div className="font-mono text-[10px] tracking-wide opacity-60 mt-1">Every kitchen • 1,400</div>
              </div>
              <div className="flex items-center justify-between relative">
                <span className={`font-mono text-[11px] px-2 py-1 rounded-full font-semibold ${activeCountry === "All" ? "bg-white/15 text-white" : "bg-[#FFFBF5] text-[#6B7280] border border-[#E8E0D0]"}`}>1,400</span>
                <CompassIcon size={18} className={`transition-transform ${shouldReduceMotion ? "" : "group-hover:rotate-12"} ${activeCountry === "All" ? "text-white/70" : "text-[#9CA3AF]"}`} />
              </div>
              {activeCountry === "All" && <motion.div layoutId="country-active-v2" className="absolute inset-0 rounded-[20px] border-2 border-white/10 pointer-events-none" transition={{ type: "spring", stiffness: 420, damping: 28 }} />}
            </motion.button>

            {countries.map((c, idx) => {
              const active = activeCountry === c.name
              const accent = countryAccent[c.name] || "#0F1A1C"
              return (
                <motion.button
                  key={c.code}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ delay: shouldReduceMotion ? 0 : idx * 0.02, duration: 0.45, ease: easeVeyra }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  whileHover={shouldReduceMotion || active ? {} : { y: -2 }}
                  onClick={() => { setActiveCountry(c.name); setCurrentPage(1) }}
                  className={`snap-start shrink-0 w-[176px] h-[112px] rounded-[20px] p-4 text-left relative overflow-hidden border flex flex-col justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${active ? "text-white shadow-[0_10px_28px_rgba(15,26,28,0.14)] border-transparent" : "bg-white text-[#0F1A1C] border-[#E8E0D0] hover:border-[#0F1A1C]/12 hover:shadow-[0_8px_24px_rgba(15,26,28,0.07)]"}`}
                  style={active ? { background: accent } : {}}
                >
                  <div className="absolute inset-0 rounded-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: active ? "linear-gradient(180deg, rgba(255,255,255,0.10), transparent 55%)" : "linear-gradient(180deg, rgba(255,255,255,0.7), transparent 60%)" }} />
                  <div className="absolute -right-5 -bottom-5 w-24 h-24 rounded-full opacity-[0.10] pointer-events-none" style={{ background: active ? "white" : accent }} />

                  <div className="relative">
                    <div className={`font-mono text-[10px] tracking-[0.1em] font-semibold uppercase truncate flex items-center gap-1 ${active ? "text-white/70" : "text-[#9CA3AF]"}`}>
                      <span className="truncate">{c.cuisineLabel}</span>
                      <span className="opacity-40">•</span>
                      <span className="shrink-0">{c.code.toUpperCase()}</span>
                      <span className={`ml-auto text-[11px] leading-none ${active ? "opacity-90" : "opacity-60"}`}>{codeToFlag(c.code)}</span>
                    </div>
                    <div className="font-display font-extrabold text-[15px] leading-[1.05] tracking-tight truncate pr-1 mt-1.5">{c.name}</div>
                    <div className={`font-mono text-[10px] truncate ${active ? "text-white/60" : "text-[#9CA3AF]"}`}>{c.region || "Veyra kitchen"}</div>
                  </div>

                  <div className="relative flex items-center justify-between">
                    <span className={`font-mono text-[10px] font-semibold px-2 py-1 rounded-full ${active ? "bg-white/15 text-white" : "bg-[#FFFBF5] text-[#6B7280] border border-[#E8E0D0] group-hover:bg-[#0F1A1C] group-hover:text-white group-hover:border-[#0F1A1C] transition-colors"}`}>70 recipes</span>
                    <span className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold border transition-colors ${active ? "bg-white text-[#0F1A1C] border-white" : "bg-white border-[#E8E0D0] text-[#9CA3AF] group-hover:border-[#0F1A1C] group-hover:text-[#0F1A1C]"}`}>↗</span>
                  </div>

                  {active && (
                    <motion.div layoutId="country-active-v2" className="absolute inset-0 rounded-[20px] border-2 border-white/15 pointer-events-none" transition={{ type: "spring", stiffness: 420, damping: 28 }} />
                  )}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Food types — segmented ── */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.18, duration: 0.5, ease: easeVeyra }}
        className="mt-2 flex flex-wrap items-center gap-2"
      >
        <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-[22px] sm:rounded-full bg-[#FFFBF5] border border-[#E8E0D0]/70">
          {FOOD_TYPES.map((cat) => {
            const active = activeFoodType === cat
            return (
              <button
                key={cat}
                onClick={() => { setActiveFoodType(cat); setCurrentPage(1) }}
                className={`relative px-5 py-2 rounded-full text-[13px] font-bold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${active ? "text-white" : "text-[#6B7280] hover:text-[#0F1A1C]"}`}
              >
                {active && (
                  <motion.div
                    layoutId="foodtype-pill-v2"
                    className="absolute inset-0 rounded-full bg-[#0F1A1C] shadow-[0_4px_14px_rgba(15,26,28,0.14)]"
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {cat}
                  {active && <span className="font-mono text-[10px] font-semibold opacity-60 hidden sm:inline">{cat === "All" ? total : cat === "Desserts" ? "200" : "400"}</span>}
                </span>
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {hasFilters && (
            <motion.button
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 4 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 4 }}
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#E8E0D0] text-[#6B7280] text-xs font-bold hover:border-[#0F1A1C] hover:text-[#0F1A1C] hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20"
            >
              Clear filters <XIcon size={12} />
            </motion.button>
          )}
        </AnimatePresence>

        <span className="hidden sm:inline-flex items-center gap-1.5 ml-auto font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
          {activeCountryObj ? activeCountryObj.cuisineLabel : "All kitchens"} • {activeFoodType}
        </span>
      </motion.div>

      {/* ── Status bar ── */}
      <div className="mt-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-y border-[#E8E0D0]/60">
        <div className="font-mono text-[11px] tracking-[0.06em] font-medium text-[#6B7280] uppercase truncate">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${activeCountry}-${activeFoodType}-${searchQuery}-${total}`}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: easeVeyra }}
              className="inline-block"
            >
              {loading ? "Curating selection…" : `${total.toLocaleString()} recipes • ${activeCountry} • ${activeFoodType}${searchQuery ? ` • “${searchQuery}”` : ""}`}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-[#9CA3AF] uppercase">
          <span className="hidden sm:inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Live • page {currentPage} of {totalPages}</span>
          <span className="sm:hidden text-[#9CA3AF]">{currentPage} / {totalPages} • {total}</span>
          {hasFilters && <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#E8E0D0]" />}
          {hasFilters && <span className="hidden sm:inline text-[#C45A3C] font-semibold">filtered</span>}
        </div>
      </div>

      {/* ── Grid / states ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : i * 0.04, duration: 0.5, ease: easeVeyra }}
              className="rounded-[26px] overflow-hidden border border-[#E8E0D0] bg-white p-3"
            >
              <div className="h-[212px] rounded-[18px] bg-[#FFFBF5] animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_1.4s_infinite]" />
              </div>
              <div className="p-2.5 space-y-3 pt-4">
                <div className="h-4 w-3/4 bg-[#FFFBF5] rounded-full animate-pulse" />
                <div className="h-3 w-1/2 bg-[#FFFBF5] rounded-full animate-pulse" />
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-16 bg-[#FFFBF5] rounded-full animate-pulse" />
                  <div className="h-6 w-12 bg-[#FFFBF5] rounded-full animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && error && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          className="rounded-[20px] p-6 text-center text-sm border"
          style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#DC2626" }}
        >
          {error}
        </motion.div>
      )}

      {!loading && !error && recipes.length === 0 && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeVeyra }}
          className="rounded-[28px] p-10 sm:p-12 text-center border bg-[#FFFBF5] relative overflow-hidden"
          style={{ borderColor: "#E8E0D0" }}
        >
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
          <div className="relative flex flex-col items-center">
            <VeyraCompanion mood="think" accent="sage" size={96} float={!shouldReduceMotion} />
            <div className="font-serif italic text-[28px] sm:text-[32px] leading-none tracking-[-0.02em] text-[#0F1A1C] mt-4">No recipes found</div>
            <p className="text-sm text-[#6B7280] mt-2 max-w-[36ch] mx-auto leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>Try another kitchen, discipline, or search term. The archive holds 1,400 stories — one will match.</p>
            <button onClick={clearFilters} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F1A1C] text-white text-sm font-bold hover:bg-[#1D2A2E] hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20">Clear filters →</button>
          </div>
        </motion.div>
      )}

      {!loading && !error && recipes.length > 0 && (
        <>
          <motion.div
            layout={shouldReduceMotion ? false : true}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            initial="hidden"
            animate="visible"
            variants={shouldReduceMotion ? {} : {
              hidden: {},
              visible: { transition: { staggerChildren: 0.035, delayChildren: 0.06 } }
            }}
          >
            <AnimatePresence mode="popLayout">
              {recipes.map((meal: RecipeSummaryDto, idx: number) => {
                const isFav = favorites.has(meal.id)
                const primaryCategory = meal.categories.find((c) => ["beef", "chicken", "vegetarian", "desserts"].includes(c.slug))?.name || meal.categories[0]?.name || "Recipe"
                const accent = countryAccent[meal.country.name] || "#0F1A1C"
                return (
                  <motion.article
                    key={meal.id}
                    layout={shouldReduceMotion ? false : true}
                    variants={shouldReduceMotion ? {} : {
                      hidden: { opacity: 0, y: 16, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: easeVeyra, delay: idx * 0.02 } }
                    }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.28 } }}
                    whileHover={shouldReduceMotion ? {} : { y: -5 }}
                    transition={shouldReduceMotion ? {} : { type: "spring", stiffness: 360, damping: 28 }}
                    className="group relative rounded-[26px] overflow-hidden border border-[#E8E0D0] bg-white flex flex-col hover:border-[#0F1A1C]/10 hover:shadow-[0_20px_40px_rgba(15,26,28,0.09),0_4px_14px_rgba(15,26,28,0.06)] will-change-transform focus-within:border-[#0F1A1C]/20"
                    style={{ boxShadow: "0 8px 24px rgba(15,26,28,0.04)" }}
                  >
                    {/* image — cinematic 4:3 → 3:2, food-forward */}
                    <div className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-[#FFFBF5]">
                      <motion.img
                        src={meal.imageUrl || "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop&auto=format"}
                        alt={meal.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={shouldReduceMotion ? {} : { scale: 1.07 }}
                        transition={{ duration: 0.8, ease: easeVeyra }}
                        style={{ transformOrigin: "50% 50%" }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/8 to-transparent" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "radial-gradient(600px circle at 30% 20%, rgba(255,255,255,0.08), transparent 60%)" }} />

                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center font-mono text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full bg-white/96 backdrop-blur border border-white/60 text-[#0F1A1C] shadow-sm">{meal.difficulty}</span>
                          {meal.nutrition && (
                            <span className="hidden sm:inline-flex font-mono text-[10px] font-bold px-2 py-1 rounded-full bg-[#0F1A1C] text-white shadow-sm">{meal.nutrition.calories} kcal</span>
                          )}
                          {meal.isPopular && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-1 rounded-full bg-[#C45A3C] text-white shadow-sm">
                              <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> Popular
                            </span>
                          )}
                        </div>

                        <motion.button
                          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                          whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
                          onClick={() => toggleFavorite(meal.id)}
                          aria-label={isFav ? "Remove favorite" : "Add favorite"}
                          className={`w-9 h-9 rounded-full backdrop-blur border grid place-items-center shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${isFav ? "bg-[#C45A3C] border-[#C45A3C] text-white" : "bg-white/92 border-white/70 text-[#0F1A1C] hover:bg-white"}`}
                        >
                          <HeartIcon size={14} className={isFav ? "fill-white text-white" : "text-[#0F1A1C]"} />
                        </motion.button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white/96 backdrop-blur border border-white/60 text-[#0F1A1C] text-[11px] font-bold shadow-sm max-w-[70%]">
                          <span className="w-5 h-5 rounded-full grid place-items-center text-[11px] bg-[#FFFBF5] border border-[#E8E0D0] shrink-0">{codeToFlag(meal.country.code)}</span>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                          <span className="truncate">{meal.country.name} • {primaryCategory}</span>
                        </span>
                        {meal.totalTimeMin ? (
                          <span className="hidden sm:inline-flex font-mono text-[10px] font-semibold px-2 py-1 rounded-full bg-[#0F1A1C]/88 backdrop-blur text-white border border-white/10">{meal.totalTimeMin}m • {meal.servings} servings</span>
                        ) : null}
                      </div>
                    </div>

                    {/* content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0">
                      <h3 className="font-serif text-[18px] font-semibold leading-[1.18] tracking-[-0.015em] text-[#0F1A1C] line-clamp-2 group-hover:text-[#1D2A2E] transition-colors min-h-[42px]">
                        {meal.name}
                      </h3>
                      <p className="font-mono text-[11px] tracking-wide text-[#9CA3AF] mt-1 line-clamp-1">
                        {meal.categories.map((c) => c.name).join(" • ")}
                        {meal.tags?.length ? ` • ${meal.tags.slice(0, 2).join(" • ")}` : ""}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-semibold px-2 py-1 rounded-full bg-[#FFFBF5] text-[#6B7280] border border-[#E8E0D0]/60">{meal.difficulty}</span>
                        <span className="font-mono text-[10px] text-[#9CA3AF]">{meal.totalTimeMin ? `${meal.totalTimeMin}m` : "—"}</span>
                        <span className="w-1 h-1 rounded-full bg-[#E8E0D0]" />
                        <span className="font-mono text-[10px] font-bold px-2 py-1 rounded-full bg-[#0F1A1C] text-white">{meal.proteinType || primaryCategory}</span>
                        {meal.isFeatured && <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-[#8A9A8B] text-white">Featured</span>}
                      </div>

                      <div className="mt-auto pt-4">
                        <div className="h-px w-full bg-[#FFFBF5] mb-3" style={{ background: "#E8E0D0" }} />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono flex-wrap">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ background: "#1D2A2E" }} />
                              <span className="font-bold text-[#0F1A1C]">{meal.nutrition?.protein ?? 0}P</span>
                            </span>
                            <span className="text-[#D4C4B0]">•</span>
                            <span className="text-[#6B7280]">{meal.nutrition?.carbohydrates ?? 0}C</span>
                            <span className="text-[#D4C4B0]">•</span>
                            <span className="text-[#6B7280]">{meal.nutrition?.fat ?? 0}F</span>
                            {meal.nutrition?.calories ? <span className="hidden min-[380px]:inline text-[#9CA3AF]">• {meal.nutrition.calories} kcal</span> : null}
                          </div>

                          <motion.button
                            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                            onClick={() => handleSelectRecipe(meal)}
                            className="inline-flex items-center gap-1 pl-3 pr-2.5 py-1.5 rounded-full bg-[#0F1A1C] text-white text-xs font-bold hover:bg-[#1D2A2E] hover:gap-1.5 transition-all shrink-0 shadow-[0_4px_14px_rgba(15,26,28,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20"
                          >
                            View
                            <span className="w-5 h-5 rounded-full bg-white text-[#0F1A1C] grid place-items-center text-[11px] leading-none">→</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/0 group-hover:border-white/40 transition-colors" />
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </motion.div>

          {/* pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.2, duration: 0.5, ease: easeVeyra }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 rounded-[22px] sm:rounded-full border border-[#E8E0D0] bg-white p-2 sm:py-2 sm:px-2 shadow-[0_4px_20px_rgba(15,26,28,0.04)]"
            >
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-10 h-10 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] hover:bg-white hover:border-[#0F1A1C] hover:-translate-y-0.5 disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:bg-[#FFFBF5] disabled:hover:border-[#E8E0D0] transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20"
                  aria-label="Previous page"
                >
                  ‹
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-sm px-3 py-1.5 rounded-full bg-[#0F1A1C] text-white">
                    {currentPage} <span className="opacity-60 font-medium">/</span> {totalPages}
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] tracking-wide text-[#6B7280] uppercase">
                    {total.toLocaleString()} recipes • {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)}
                  </span>
                </div>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-10 h-10 rounded-full bg-[#0F1A1C] text-white grid place-items-center hover:bg-[#1D2A2E] hover:-translate-y-0.5 disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:bg-[#0F1A1C] transition-all shrink-0 sm:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1 pr-2">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const n = currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i
                    if (n < 1 || n > totalPages) return null
                    const active = n === currentPage
                    return (
                      <button
                        key={n}
                        onClick={() => setCurrentPage(n)}
                        className={`w-8 h-8 rounded-full text-xs font-bold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${active ? "bg-[#0F1A1C] border-[#0F1A1C] text-white shadow-md" : "bg-white border-[#E8E0D0] text-[#6B7280] hover:border-[#0F1A1C] hover:text-[#0F1A1C]"}`}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>

                <div className="h-8 w-px bg-[#E8E0D0] hidden sm:block" />

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-10 h-10 rounded-full bg-[#0F1A1C] text-white grid place-items-center hover:bg-[#1D2A2E] hover:-translate-y-0.5 disabled:opacity-35 disabled:hover:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>

              <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-0 w-[42%] h-[2px] overflow-hidden rounded-full pointer-events-none sm:static sm:w-24 sm:translate-x-0">
                <div className="h-full bg-[#FFFBF5] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#0F1A1C] rounded-full"
                    initial={shouldReduceMotion ? { width: `${(currentPage / totalPages) * 100}%` } : { width: 0 }}
                    animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: easeVeyra }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <p className="mt-4 text-center font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">
            Curated from 1,400 verified recipes • 20 kitchens • Editorial archive — Veyra
          </p>
        </>
      )}

      {selectedRecipe && <RecipeDetailsModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
      {showWhatShouldIEat && <WhatShouldIEatModal onClose={() => setShowWhatShouldIEat(false)} onSelectRecipe={(r) => setSelectedRecipe(r)} />}
    </div>
  )
}
