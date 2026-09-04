import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { FoodItem, RecipeReview } from "@/types"
import { XIcon, HeartIcon, ShoppingCartIcon, StarIcon, PlayIcon, TrashIcon, ClockIcon, CompassIcon } from "@/components/icons"
import { VeyraCompanion } from "@/components/VeyraCompanion"
import { apiFetch } from "@/services/api/backendClient"

interface RecipeDetailsModalProps {
  recipe: FoodItem
  onClose: () => void
}

export default function RecipeDetailsModal({ recipe, onClose }: RecipeDetailsModalProps) {
  const { pantryItems, addBatchShoppingList, favorites, toggleFavorite, addToast } = useApp()
  const [reviews, setReviews] = useState<RecipeReview[]>([])
  const [ratingInput, setRatingInput] = useState<number>(5)
  const [reviewText, setReviewText] = useState("")
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const isFav = favorites.has(recipe.id)

  const scrollRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress: _heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroParallax = useTransform(_heroProgress, [0, 1], ["0%", shouldReduceMotion ? "0%" : "14%"])
  const heroScale = useTransform(_heroProgress, [0, 1], [1, shouldReduceMotion ? 1 : 1.06])

  const [activeSection, setActiveSection] = useState<string>("overview")
  const ingredientsRef = useRef<HTMLDivElement>(null)
  const methodRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)
  const reviewsRef = useRef<HTMLDivElement>(null)

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const map: Record<string, React.RefObject<HTMLDivElement | null>> = {
      ingredients: ingredientsRef as any,
      method: methodRef as any,
      video: videoRef as any,
      reviews: reviewsRef as any,
    }
    const target = map[id]
    if (target?.current && scrollRef.current) {
      const top = target.current.offsetTop - 12
      scrollRef.current.scrollTo({ top, behavior: "smooth" })
    }
  }

  useEffect(() => {
    let isMounted = true
    apiFetch(`/reviews?recipeId=${recipe.id}`).then(r => r.json()).then(data => {
      if (isMounted && data.success && Array.isArray(data.data)) setReviews(data.data)
    }).catch(() => {})
    return () => { isMounted = false }
  }, [recipe.id])

  const handleAddMissingIngredients = async () => {
    const pantryNames = pantryItems.filter(i => !i.isUsed).map(i => i.name.toLowerCase())
    const recipeIngs = (recipe as any).ingredientsDetailed || recipe.ingredients || [recipe.name]
    const missing = (recipeIngs as any[]).filter((ing: any) => {
      const name = typeof ing === 'string' ? ing : ing.name || ""
      return !pantryNames.some(p => p.includes(name.toLowerCase()) || name.toLowerCase().includes(p))
    })
    if (missing.length === 0) { addToast("You already have all ingredients! 🎉", "success"); return }
    const itemsToAdd = missing.map((ing: any) => {
      const name = typeof ing === 'string' ? ing : ing.name
      return { name, quantity: 1, unit: "pcs", recipeId: String(recipe.id) }
    })
    await addBatchShoppingList(itemsToAdd)
    addToast(`Added ${missing.length} missing ingredients to Shopping List!`, "success")
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    setIsSubmittingReview(true)
    try {
      if (editingReviewId) {
        const res = await apiFetch(`/reviews/${editingReviewId}`, { method: "PUT", body: JSON.stringify({ rating: ratingInput, text: reviewText.trim() }) })
        const data = await res.json()
        if (data.success) { setReviews(prev => prev.map(r => r.id === editingReviewId ? data.data : r)); addToast("Review updated!", "success") }
      } else {
        const res = await apiFetch("/reviews", { method: "POST", body: JSON.stringify({ recipeId: String(recipe.id), rating: ratingInput, text: reviewText.trim() }) })
        const data = await res.json()
        if (data.success) { setReviews(prev => [data.data, ...prev]); addToast("Review submitted!", "success") }
      }
      setReviewText(""); setEditingReviewId(null)
    } catch { addToast("Failed to submit review", "warning") } finally { setIsSubmittingReview(false) }
  }

  const handleDeleteReview = async (revId: string) => {
    try {
      const res = await apiFetch(`/reviews/${revId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) { setReviews(prev => prev.filter(r => r.id !== revId)); addToast("Review deleted", "info") }
    } catch {}
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null

  const getEmbedYoutubeUrl = (url?: string) => {
    if (!url || typeof url !== "string") return null
    const clean = url.trim(); if (!clean) return null
    if (clean.includes("dQw4w9WgXcQ")) return null
    if (clean.includes("embed/")) {
      const id = clean.split("embed/")[1]?.substring(0, 11)
      return id && id.length === 11 && id !== "dQw4w9WgXcQ" ? `https://www.youtube.com/embed/${id}` : null
    }
    const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|v\/|embed\/))([a-zA-Z0-9_-]{11})/)
    const videoId = match ? match[1] : null
    if (!videoId || videoId.length !== 11 || videoId === "dQw4w9WgXcQ") return null
    return `https://www.youtube.com/embed/${videoId}`
  }

  const primaryVideo = (recipe as any).videos?.[0] || null
  const rawVideoUrl = primaryVideo?.youtubeUrl || (recipe as any).youtubeUrl || null
  const videoTitle = primaryVideo?.videoTitle || null
  const channelName = primaryVideo?.channelName || null
  const embedUrl = getEmbedYoutubeUrl(rawVideoUrl)
  const allVideos: any[] = (recipe as any).videos || (rawVideoUrl && getEmbedYoutubeUrl(rawVideoUrl) ? [{ youtubeUrl: rawVideoUrl, videoTitle, channelName }] : [])

  const protein = (recipe as any).protein ?? (recipe as any).nutrition?.protein ?? recipe.protein ?? 0
  const carbs = (recipe as any).carbs ?? (recipe as any).nutrition?.carbohydrates ?? 0
  const fat = (recipe as any).fat ?? (recipe as any).nutrition?.fat ?? 0
  const calories = (recipe as any).calories ?? (recipe as any).nutrition?.calories ?? 0
  const fiber = (recipe as any).fiber ?? (recipe as any).nutrition?.fiber ?? null
  const sugar = (recipe as any).sugar ?? (recipe as any).nutrition?.sugar ?? null
  const saturatedFat = (recipe as any).saturatedFat ?? (recipe as any).nutrition?.saturatedFat ?? null
  const sodium = (recipe as any).sodium ?? (recipe as any).nutrition?.sodium ?? null

  const ingredients: any[] = (recipe as any).ingredientsDetailed || (recipe as any).ingredients || []
  const steps: any[] = (recipe as any).recipeSteps || (recipe as any).steps || []
  const description: string | null = (recipe as any).description || (recipe as any).genericName || null
  const countryName: string = (recipe as any).country || (recipe as any).cuisine || recipe.category || "Global"
  const countryCode: string | undefined = (recipe as any).countryCode
  const difficulty: string = (recipe as any).difficulty || "MEDIUM"
  const totalTime: number = (recipe as any).timeToPrepareMin || (recipe as any).totalTimeMin || (recipe as any).prepTimeMin || 30
  const servings: number = (recipe as any).servings || 4
  const homeCost = (recipe as any).homePrepCost
  const restaurantCost = (recipe as any).restaurantPrice
  const currency: string = (recipe as any).currency || "USD"

  const pCal = protein * 4
  const cCal = carbs * 4
  const fCal = fat * 9
  const macroTotal = pCal + cCal + fCal || 1
  const pPct = (pCal / macroTotal) * 100
  const cPct = (cCal / macroTotal) * 100
  const fPct = (fCal / macroTotal) * 100
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const pLen = (pPct / 100) * circumference
  const cLen = (cPct / 100) * circumference
  const fLen = (fPct / 100) * circumference

  const words = recipe.name.split(" ")
  const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(" ")
  const secondLine = words.slice(Math.ceil(words.length / 2)).join(" ")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-[#0F1A1C]/70 backdrop-blur-[14px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.985 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
        transition={{ duration: shouldReduceMotion ? 0.12 : 0.55, ease: [0.16, 1, 0.3, 1] as any }}
        className="relative w-full max-w-[1080px] max-h-[96vh] sm:max-h-[92vh] bg-[#FFFBF5] rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 28px 80px rgba(15,26,28,0.22), 0 8px 24px rgba(15,26,28,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", border: "1px solid rgba(232,224,208,0.9)" }}
      >
        {/* ── Hero — NEW cinematic immersive (not split) ── */}
        <div ref={heroRef} className="relative shrink-0 h-[420px] sm:h-[460px] lg:h-[500px] overflow-hidden bg-[#0F1A1C]">
          <motion.div style={{ y: heroParallax, scale: heroScale }} className="absolute inset-0 will-change-transform">
            <img src={recipe.img} alt={recipe.name} className="w-full h-[108%] -mt-[4%] object-cover" loading="eager" />
          </motion.div>

          {/* editorial gradients — cinematic vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A1C] via-[#0F1A1C]/55 to-transparent sm:from-[#0F1A1C]/90 sm:via-[#0F1A1C]/30 sm:to-transparent" />
          <div className="absolute inset-0 hidden sm:block" style={{ background: "radial-gradient(620px circle at 18% 22%, rgba(224,122,95,0.12), transparent 62%), radial-gradient(560px circle at 88% 80%, rgba(138,154,139,0.09), transparent 60%)" }} />
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
          <div className="absolute inset-0 opacity-[0.035] hidden lg:block" style={{ background: "linear-gradient(180deg, rgba(255,251,245,0.06), transparent 22%)" }} />

          {/* top chrome */}
          <div className="absolute top-0 inset-x-0 p-3 sm:p-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap max-w-[72%]">
              <span className="inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-white/96 backdrop-blur border border-white/60 shadow-sm">
                <span className="w-7 h-7 rounded-full bg-[#0F1A1C] text-white grid place-items-center text-[11px]">◍</span>
                <span className="font-mono text-[11px] font-bold tracking-tight text-[#0F1A1C] leading-none truncate">
                  {countryName}
                  {countryCode ? ` • ${countryCode.toUpperCase()}` : ""} • {recipe.category}
                </span>
              </span>
              {videoTitle && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C45A3C] text-white text-[11px] font-bold shadow-sm border border-white/15">
                  <span className="w-4 h-4 rounded-full bg-white text-[#C45A3C] grid place-items-center"><PlayIcon size={8} /></span> Film
                </span>
              )}
              {allVideos.length > 1 && (
                <span className="hidden lg:inline-flex px-2 py-1 rounded-full bg-[#0F1A1C]/80 backdrop-blur border border-white/15 text-white text-[10px] font-bold tracking-wide">+{allVideos.length} films</span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleFavorite(recipe.id)}
                aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
                className={`w-9 h-9 rounded-full backdrop-blur border grid place-items-center transition-all active:scale-95 ${isFav ? "bg-[#C45A3C] border-[#C45A3C] text-white shadow-[0_4px_14px_rgba(196,90,60,0.35)]" : "bg-white/92 border-white/70 text-[#0F1A1C] hover:bg-white hover:scale-[1.04]"}`}
              >
                <HeartIcon size={15} className={isFav ? "fill-white text-white" : ""} />
              </button>
              <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-white/60 grid place-items-center text-[#0F1A1C] hover:bg-white hover:scale-[1.04] active:scale-95 transition-all">
                <XIcon size={14} />
              </button>
            </div>
          </div>

          {/* mobile actions */}
          <div className="sm:hidden absolute top-3 right-3 flex items-center gap-2">
            <button onClick={() => toggleFavorite(recipe.id)} className={`w-9 h-9 rounded-full backdrop-blur border grid place-items-center shadow-lg active:scale-95 transition-all ${isFav ? "bg-[#C45A3C] border-[#C45A3C] text-white" : "bg-white/95 border-white/60 text-[#0F1A1C]"}`}>
              <HeartIcon size={15} className={isFav ? "fill-white" : ""} />
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#0F1A1C] text-white grid place-items-center shadow-lg active:scale-95">
              <XIcon size={14} />
            </button>
          </div>

          {/* bottom editorial — NEW: floats over image like magazine cover */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8">
            <div className="max-w-[960px] mx-auto">
              {/* kicker */}
              <div className="flex items-center gap-2.5 mb-3">
                <span className="hidden sm:inline-flex h-px w-8 bg-white/20" />
                <span className="font-mono text-[10px] tracking-[0.16em] font-semibold text-white/60 uppercase">Veyra Atelier • Edition 2026</span>
                <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-white/45 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Verified • 20 kitchens
                </span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
                {/* title block */}
                <div className="flex-1 min-w-0">
                  <motion.h2
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif leading-[0.88] tracking-[-0.03em] text-white text-balance min-w-0"
                  >
                    <span className="block font-light text-[30px] sm:text-[36px] lg:text-[42px] leading-[0.9] italic">
                      {firstLine}
                    </span>
                    {secondLine ? (
                      <span className="block font-display font-extrabold not-italic text-[30px] sm:text-[36px] lg:text-[42px] leading-[0.9] tracking-[-0.04em] mt-0.5">
                        {secondLine}
                      </span>
                    ) : null}
                  </motion.h2>

                  {description && (
                    <p className="mt-3 text-[13px] sm:text-[14px] leading-[1.65] text-white/70 line-clamp-2 sm:line-clamp-2 max-w-[56ch] text-pretty" style={{ fontFamily: "Inter, sans-serif" }}>
                      {description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#0F1A1C] text-xs font-bold shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#0F1A1C]" /> {difficulty.toLowerCase()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white text-xs font-semibold">
                      <ClockIcon size={12} className="text-white/70" /> {totalTime}m • {servings} servings
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C45A3C] text-white text-xs font-bold shadow-[0_4px_14px_rgba(196,90,60,0.28)]">
                      {calories} kcal <span className="opacity-70 font-medium hidden sm:inline">• per serving</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white/70 text-xs font-semibold">
                      {(recipe as any).proteinType || (recipe as any).dietType || recipe.category}
                    </span>
                  </div>
                </div>

                {/* pricing + CTAs — glass atelier */}
                <div className="lg:w-[340px] shrink-0 rounded-[20px] overflow-hidden border border-white/15 bg-white/96 backdrop-blur-xl p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-[14px] p-3 border bg-[#FFFBF5] border-[#E8E0D0] relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-[#0F1A1C]/[0.04] pointer-events-none" />
                      <div className="font-mono text-[10px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase">Home Prep</div>
                      <div className="font-display font-extrabold text-[16px] leading-none tracking-tight text-[#0F1A1C] mt-1">
                        {homeCost !== undefined && homeCost !== null ? `${homeCost} ${currency}` : "—"}
                      </div>
                      <div className="font-mono text-[10px] text-[#6B7280] mt-1">Craft at home</div>
                    </div>
                    <div className="rounded-[14px] p-3 border bg-[#0F1A1C] border-[#0F1A1C] text-white relative overflow-hidden" style={{ boxShadow: "0 6px 16px rgba(15,26,28,0.14)" }}>
                      <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-white/[0.06] pointer-events-none" />
                      <div className="font-mono text-[10px] tracking-[0.12em] font-semibold text-white/60 uppercase">Restaurant</div>
                      <div className="font-display font-extrabold text-[16px] leading-none tracking-tight text-white mt-1">
                        {restaurantCost !== undefined && restaurantCost !== null ? `${restaurantCost} ${currency}` : "—"}
                      </div>
                      <div className="font-mono text-[10px] text-white/60 mt-1">Dining out</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-stretch gap-2">
                    <motion.button
                      whileHover={shouldReduceMotion ? {} : { y: -1, scale: 1.01 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
                      onClick={handleAddMissingIngredients}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-3 rounded-full bg-[#C45A3C] text-white text-[13px] font-extrabold tracking-tight shadow-[0_8px_20px_rgba(196,90,60,0.28)] hover:bg-[#B94E2E] hover:shadow-[0_12px_28px_rgba(196,90,60,0.32)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C45A3C]/30"
                    >
                      <span className="w-6 h-6 rounded-full bg-white text-[#C45A3C] grid place-items-center shrink-0">
                        <ShoppingCartIcon size={12} />
                      </span>
                      Add missing
                    </motion.button>
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className={`px-4 rounded-full border text-[13px] font-bold whitespace-nowrap active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${isFav ? "bg-[#C45A3C] border-[#C45A3C] text-white" : "bg-white border-[#E8E0D0] text-[#0F1A1C] hover:border-[#0F1A1C]"}`}
                    >
                      <span className="flex items-center gap-1.5"><HeartIcon size={13} className={isFav ? "fill-white" : ""} /> {isFav ? "Saved" : "Save"}</span>
                    </button>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2 pt-2.5 border-t border-[#E8E0D0]/60">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.10em] uppercase text-[#9CA3AF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C]" /> {countryName} • {totalTime} min
                    </span>
                    {avgRating ? <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6B7280] font-semibold"><StarIcon size={11} className="text-[#E07A5F] fill-[#E07A5F]" /> {avgRating} ({reviews.length})</span> : <span className="font-mono text-[10px] text-[#9CA3AF]">No reviews yet</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky section nav — editorial ── */}
        <div className="hidden sm:flex items-center gap-1 px-4 lg:px-6 py-2.5 bg-white/90 backdrop-blur-xl border-y border-[#E8E0D0]/70 sticky top-0 z-10">
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0]/60">
            {[
              { id: "overview", label: "Atelier" },
              { id: "ingredients", label: `Ingredients • ${ingredients.length || 0}` },
              { id: "method", label: `Method • ${steps.length || 0}` },
              { id: "video", label: "Film" },
              { id: "reviews", label: `Reviews • ${reviews.length}` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "overview") {
                    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
                    setActiveSection("overview")
                  } else scrollTo(tab.id)
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15 ${activeSection === tab.id ? "bg-[#0F1A1C] text-white shadow-[0_3px_10px_rgba(15,26,28,0.12)]" : "text-[#6B7280] hover:text-[#0F1A1C] hover:bg-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="ml-auto hidden lg:inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">
            <CompassIcon size={12} /> Veyra Archive
          </span>
          <button onClick={onClose} className="ml-2 w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center hover:scale-105 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20">
            <XIcon size={12} />
          </button>
        </div>

        {/* ── Scroll body ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain scroll-smooth bg-[#FFFBF5] [scrollbar-width:thin]">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
            <div className="grid lg:grid-cols-[1.58fr_0.96fr] gap-6 lg:gap-7 items-start max-w-[1120px] mx-auto">
              {/* ── Main column ── */}
              <div className="min-w-0 space-y-6 sm:space-y-7">

                {/* Ingredients — tactile atelier */}
                <motion.section
                  ref={ingredientsRef}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[24px] bg-white border border-[#E8E0D0] p-5 sm:p-6 relative overflow-hidden"
                  style={{ boxShadow: "0 4px 20px rgba(15,26,28,0.04), 0 1px 3px rgba(15,26,28,0.03)" }}
                >
                  <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-[#F5F0E8]/60 blur-[1px] pointer-events-none" />
                  <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] tracking-[0.14em] font-semibold uppercase text-[#C45A3C]">Mise en place</span>
                        <span className="hidden sm:inline-flex h-px w-8 bg-[#E8E0D0]" />
                        <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-[#0F1A1C] text-white font-bold">{ingredients.length} items</span>
                      </div>
                      <h3 className="mt-2 font-serif text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] leading-none text-[#0F1A1C]">
                        Ingredients <span className="font-display italic font-normal text-[#6B7280] text-[16px]">— tactile & precise</span>
                      </h3>
                      <p className="mt-1.5 font-mono text-[11px] tracking-wide text-[#6B7280]" style={{ fontFamily: "JetBrains Mono, monospace" }}>Measured for {servings} servings • Pantry-aware</p>
                    </div>
                    <span className="hidden sm:inline-flex w-9 h-9 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] text-[#0F1A1C] grid place-items-center shrink-0">
                      <ShoppingCartIcon size={14} />
                    </span>
                  </div>

                  {ingredients.length > 0 ? (
                    <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ingredients.map((ing: any, i: number) => {
                        const name = typeof ing === 'string' ? ing : ing.name || "Ingredient"
                        const qtyRaw = typeof ing === 'string' ? "" : `${ing.quantity ?? ""} ${ing.unit ?? ""}`.trim()
                        const qty = qtyRaw || (typeof ing === 'string' ? "" : ing.note || "")
                        const note: string | null = typeof ing === 'string' ? null : ing.note || null
                        return (
                          <motion.div
                            key={i}
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: shouldReduceMotion ? 0 : (i % 6) * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={shouldReduceMotion ? {} : { y: -2 }}
                            className="group relative flex items-center gap-3 p-3 rounded-[16px] bg-white border border-[#F5F0E8] hover:border-[#E8E0D0] hover:shadow-[0_8px_20px_rgba(15,26,28,0.06)] transition-all min-w-0"
                          >
                            <span className="w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center text-[11px] font-extrabold tracking-tight shrink-0 shadow-[0_3px_10px_rgba(15,26,28,0.12)]">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-[13.5px] font-semibold leading-[1.25] tracking-tight text-[#0F1A1C] truncate pr-1 group-hover:text-[#1D2A2E] transition-colors">{name}</span>
                              {note && <span className="block font-mono text-[10px] text-[#9CA3AF] truncate">{note}</span>}
                            </span>
                            {qty ? (
                              <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0]/60 text-[#0F1A1C] text-[11px] font-mono font-bold tracking-tight">
                                {qty}
                              </span>
                            ) : (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-[#E8E0D0] group-hover:bg-[#C45A3C] transition-colors" />
                            )}
                            <span className="pointer-events-none absolute inset-0 rounded-[16px] border border-transparent group-hover:border-[#0F1A1C]/5 transition-colors" />
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#6B7280] italic">Ingredients will appear here — curated from the archive.</p>
                  )}

                  <div className="relative mt-4 flex items-center gap-2 text-[11px] font-mono tracking-wide text-[#9CA3AF] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B]" /> Pantry-aware — we only add what you’re missing
                  </div>
                </motion.section>

                {/* Method — progressive timeline */}
                <motion.section
                  ref={methodRef}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
                  className="rounded-[24px] bg-white border border-[#E8E0D0] p-5 sm:p-6 relative overflow-hidden"
                  style={{ boxShadow: "0 4px 20px rgba(15,26,28,0.04), 0 1px 3px rgba(15,26,28,0.03)" }}
                >
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#0F1A1C]/[0.02] pointer-events-none" />
                  <div className="relative flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] tracking-[0.14em] font-semibold uppercase text-[#0F1A1C]">Method</span>
                      <h3 className="mt-1 font-serif text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] leading-none text-[#0F1A1C]">
                        Cook <span className="font-display italic font-normal text-[#6B7280] text-[16px]">— step by step</span>
                      </h3>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F1A1C] text-white text-xs font-bold">
                      <ClockIcon size={12} /> {steps.length} steps • ~{totalTime}m
                    </span>
                  </div>

                  {steps.length > 0 ? (
                    <div className="relative mt-6">
                      <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-[#0F1A1C]/15 via-[#E8E0D0] to-transparent hidden sm:block" />
                      <div className="space-y-3 sm:space-y-3.5">
                        {steps.map((s: any, i: number) => {
                          const text = typeof s === 'string' ? s : s.instruction || ""
                          const isLast = i === steps.length - 1
                          return (
                            <motion.div
                              key={i}
                              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -6 }}
                              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: shouldReduceMotion ? 0 : i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                              className="relative flex gap-3 sm:gap-4 group"
                            >
                              <div className="relative shrink-0 flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-[#C45A3C] text-white grid place-items-center text-xs font-extrabold shadow-[0_4px_12px_rgba(196,90,60,0.22)] group-hover:scale-105 group-hover:shadow-[0_6px_16px_rgba(196,90,60,0.28)] transition-all">
                                  {String(i + 1).padStart(2, "0")}
                                </div>
                                {!isLast && <div className="w-px flex-1 mt-2 bg-[#F5F0E8] hidden sm:block" />}
                              </div>
                              <div className="flex-1 min-w-0 pb-1">
                                <div className="relative rounded-[16px] bg-white border border-[#F5F0E8] p-3.5 sm:p-4 hover:border-[#E8E0D0] hover:shadow-[0_8px_20px_rgba(15,26,28,0.05)] hover:-translate-y-0.5 transition-all">
                                  <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[#C45A3C]/0 group-hover:bg-[#C45A3C] transition-colors hidden sm:block" />
                                  <p className="text-[13.5px] sm:text-[14px] leading-[1.65] text-[#1A1F1E] font-[450] text-pretty" style={{ fontFamily: "Inter, sans-serif" }}>
                                    {text}
                                  </p>
                                  <div className="mt-2.5 flex items-center gap-2">
                                    <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#9CA3AF]">Step {i + 1} • Method</span>
                                    <span className="h-px flex-1 bg-[#F5F0E8] hidden sm:block" />
                                    <span className="hidden sm:inline-flex w-6 h-6 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#9CA3AF]">→</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#6B7280] italic">Method steps are curated for this recipe — check back for the full walkthrough.</p>
                  )}
                </motion.section>

                {/* Video — cinematic film */}
                <motion.section
                  ref={videoRef}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                  className="overflow-hidden rounded-[24px] border border-[#E8E0D0] bg-[#0F1A1C] relative"
                  style={{ boxShadow: "0 12px 32px rgba(15,26,28,0.10)" }}
                >
                  <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                  <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #E07A5F 0%, transparent 70%)" }} />

                  <div className="relative p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-full bg-[#C45A3C] text-white grid place-items-center shadow-[0_4px_14px_rgba(196,90,60,0.35)] shrink-0">
                        <PlayIcon size={14} className="ml-0.5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display font-extrabold text-[14px] leading-none tracking-tight text-white">Film — Cooking Guide</h3>
                        <p className="font-mono text-[11px] tracking-wide text-white/60 truncate">Curated video • 274 in archive • Lazy loaded • Responsive</p>
                      </div>
                    </div>
                    {allVideos.length > 0 && (
                      <span className="hidden sm:inline-flex shrink-0 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white text-[11px] font-bold">
                        {allVideos.length} film{allVideos.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {allVideos.length > 0 ? (
                    <div className="relative px-3 sm:px-4 pb-4 space-y-4">
                      {allVideos.slice(0, 3).map((vid: any, idx: number) => {
                        const url = getEmbedYoutubeUrl(vid.youtubeUrl)
                        if (!url) return null
                        const title = vid.videoTitle || videoTitle || recipe.name
                        const channel = vid.channelName || channelName || "Veyra Curated"
                        return (
                          <motion.div
                            key={idx}
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative"
                          >
                            {(title || channel) && (
                              <div className="flex items-start justify-between gap-3 mb-2.5">
                                <div className="min-w-0 flex-1">
                                  <div className="font-display font-bold text-[13px] leading-[1.25] tracking-tight text-white line-clamp-2">{title}</div>
                                  <div className="font-mono text-[11px] tracking-wide text-white/60 truncate">↳ {channel} • {countryName} • {difficulty.toLowerCase()}</div>
                                </div>
                                <span className="hidden sm:inline-flex shrink-0 px-2 py-1 rounded-full bg-white text-[#0F1A1C] text-[10px] font-extrabold tracking-wide">HD • 16:9</span>
                              </div>
                            )}
                            <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-black border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.28)] group">
                              <iframe
                                src={url}
                                title={title || `Cooking video ${idx + 1}`}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                              />
                            </div>
                          </motion.div>
                        )
                      })}
                      {allVideos.length > 3 && (
                        <p className="text-center font-mono text-[11px] tracking-wide text-white/55">+{allVideos.length - 3} more films in archive for this recipe</p>
                      )}
                    </div>
                  ) : (
                    <div className="mx-3 sm:mx-4 mb-4 rounded-[16px] bg-white/[0.06] backdrop-blur border border-white/10 p-5 flex flex-col items-center justify-center gap-3 text-center">
                      <VeyraCompanion mood="think" accent="sage" size={56} float={false} />
                      <div>
                        <div className="font-display font-bold text-sm text-white">Film coming soon</div>
                        <div className="font-mono text-[11px] tracking-wide text-white/60 mt-1 max-w-[32ch]">This recipe is verified — a guided film is being curated for its kitchen.</div>
                      </div>
                    </div>
                  )}
                  <div className="relative h-px w-full bg-white/10" />
                  <div className="relative px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] tracking-[0.10em] uppercase text-white/50">Veyra Films • 16:9 • Lazy</span>
                    <span className="font-mono text-[10px] tracking-wide text-white/40 hidden sm:inline">youtube-nocookie ready</span>
                  </div>
                </motion.section>
              </div>

              {/* ── Sidebar — sticky atelier ── */}
              <div className="min-w-0 space-y-6 lg:sticky lg:top-6">
                {/* Nutrition */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[24px] bg-white border border-[#E8E0D0] p-5 sm:p-6 relative overflow-hidden"
                  style={{ boxShadow: "0 4px 20px rgba(15,26,28,0.04), 0 1px 3px rgba(15,26,28,0.03)" }}
                >
                  <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#8A9A8B]/[0.06] pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[10px] tracking-[0.14em] font-semibold uppercase text-[#9CA3AF]">Nutrition</span>
                        <h3 className="mt-1 font-display font-extrabold text-[15px] tracking-tight leading-none text-[#0F1A1C]">Per serving — crafted</h3>
                        <p className="font-mono text-[11px] tracking-wide text-[#6B7280] mt-1">Calibrated for {servings} servings • {totalTime}m total</p>
                      </div>
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center">
                        <span className="font-mono text-[10px] font-bold tracking-wide">kcal</span>
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col min-[380px]:grid min-[380px]:grid-cols-[auto_1fr] gap-4 items-center min-[380px]:items-center">
                      <div className="relative w-[132px] h-[132px] shrink-0 mx-auto min-[380px]:mx-0">
                        <svg width={132} height={132} viewBox="0 0 132 132" className="block -rotate-90">
                          <circle cx={66} cy={66} r={radius} fill="none" stroke="#F5F0E8" strokeWidth={14} />
                          <motion.circle
                            cx={66} cy={66} r={radius} fill="none" stroke="#0F1A1C" strokeWidth={14} strokeLinecap="round"
                            strokeDasharray={`${pLen} ${circumference - pLen}`}
                            strokeDashoffset={0}
                            initial={shouldReduceMotion ? { strokeDasharray: `${pLen} ${circumference - pLen}` } : { strokeDasharray: `0 ${circumference}` }}
                            whileInView={{ strokeDasharray: `${pLen} ${circumference - pLen}` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                          />
                          <motion.circle
                            cx={66} cy={66} r={radius} fill="none" stroke="#8A9A8B" strokeWidth={14} strokeLinecap="round"
                            strokeDasharray={`${cLen} ${circumference - cLen}`}
                            strokeDashoffset={-pLen}
                            initial={shouldReduceMotion ? { strokeDasharray: `${cLen} ${circumference - cLen}` } : { strokeDasharray: `0 ${circumference}` }}
                            whileInView={{ strokeDasharray: `${cLen} ${circumference - cLen}` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
                          />
                          <motion.circle
                            cx={66} cy={66} r={radius} fill="none" stroke="#C45A3C" strokeWidth={14} strokeLinecap="round"
                            strokeDasharray={`${fLen} ${circumference - fLen}`}
                            strokeDashoffset={-(pLen + cLen)}
                            initial={shouldReduceMotion ? { strokeDasharray: `${fLen} ${circumference - fLen}` } : { strokeDasharray: `0 ${circumference}` }}
                            whileInView={{ strokeDasharray: `${fLen} ${circumference - fLen}` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}
                          />
                        </svg>
                        <div className="absolute inset-0 grid place-items-center pointer-events-none">
                          <div className="text-center">
                            <div className="font-display font-extrabold text-[22px] leading-none tracking-tight text-[#0F1A1C]">{calories}</div>
                            <div className="font-mono text-[10px] tracking-[0.12em] font-bold text-[#9CA3AF] uppercase">kcal</div>
                            <div className="mt-1 inline-flex px-2 py-0.5 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] font-mono text-[10px] font-semibold text-[#6B7280]">{protein}P • {carbs}C • {fat}F</div>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0 space-y-3 w-full min-[380px]:w-auto">
                        {[
                          { label: "Protein", value: protein, cal: pCal, pct: pPct, color: "#0F1A1C", unit: "g" },
                          { label: "Carbs", value: carbs, cal: cCal, pct: cPct, color: "#8A9A8B", unit: "g" },
                          { label: "Fat", value: fat, cal: fCal, pct: fPct, color: "#C45A3C", unit: "g" },
                        ].map((m) => (
                          <div key={m.label} className="min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-mono text-[10px] tracking-[0.10em] font-semibold uppercase flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} /> {m.label}
                              </span>
                              <span className="font-display font-extrabold text-sm leading-none text-[#0F1A1C]">{m.value}<span className="text-xs font-semibold ml-0.5 text-[#6B7280]">{m.unit}</span> <span className="font-mono text-[10px] font-semibold text-[#9CA3AF]">• {m.cal} kcal</span></span>
                            </div>
                            <div className="mt-1.5 h-2 rounded-full bg-[#F5F0E8] overflow-hidden p-0.5">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: m.color }}
                                initial={shouldReduceMotion ? { width: `${m.pct}%` } : { width: 0 }}
                                whileInView={{ width: `${m.pct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-1 font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]" /> Macro split • {Math.round(pPct)}% • {Math.round(cPct)}% • {Math.round(fPct)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {[
                        { label: "Protein", value: protein, unit: "g" },
                        { label: "Carbs", value: carbs, unit: "g" },
                        { label: "Fat", value: fat, unit: "g" },
                        { label: "Cal", value: calories, unit: "" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-[14px] bg-[#FFFBF5] border border-[#F5F0E8] p-2.5 text-center hover:-translate-y-0.5 transition-transform">
                          <div className="font-mono text-[9px] tracking-[0.10em] font-semibold text-[#9CA3AF] uppercase">{s.label}</div>
                          <div className="font-display font-extrabold text-[13px] leading-none text-[#0F1A1C] mt-1">{s.value}<span className="text-[10px] font-semibold ml-0.5 text-[#6B7280]">{s.unit}</span></div>
                        </div>
                      ))}
                    </div>

                    {(fiber !== null || sugar !== null || saturatedFat !== null || sodium !== null) && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {fiber !== null && <span className="px-2.5 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0]/60 text-[#6B7280] text-xs font-semibold">Fiber {fiber}g</span>}
                        {sugar !== null && <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#6B7280] text-xs font-semibold">Sugar {sugar}g</span>}
                        {saturatedFat !== null && <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#6B7280] text-xs font-semibold">Sat Fat {saturatedFat}g</span>}
                        {sodium !== null && <span className="px-2.5 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0]/60 text-[#6B7280] text-xs font-semibold">Sodium {sodium}g</span>}
                      </div>
                    )}

                    <div className="mt-4 h-2.5 rounded-full overflow-hidden flex bg-[#F5F0E8] p-0.5 gap-0.5">
                      <motion.div className="h-full rounded-full" style={{ background: "#0F1A1C" }} initial={shouldReduceMotion ? { width: `${pPct}%` } : { width: 0 }} whileInView={{ width: `${pPct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
                      <motion.div className="h-full rounded-full" style={{ background: "#8A9A8B" }} initial={shouldReduceMotion ? { width: `${cPct}%` } : { width: 0 }} whileInView={{ width: `${cPct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} />
                      <motion.div className="h-full rounded-full" style={{ background: "#C45A3C" }} initial={shouldReduceMotion ? { width: `${fPct}%` } : { width: 0 }} whileInView={{ width: `${fPct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }} />
                    </div>
                    <div className="mt-1.5 flex gap-3 font-mono text-[10px] tracking-wide uppercase text-[#9CA3AF]">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0F1A1C]" /> Protein</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8A9A8B]" /> Carbs</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C45A3C]" /> Fat</span>
                    </div>
                  </div>
                </motion.div>

                {/* Quick facts */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "Difficulty", v: difficulty, sub: totalTime + " min" },
                    { k: "Servings", v: String(servings), sub: "crafted" },
                    { k: "Archive", v: "Veyra", sub: "verified" },
                  ].map((f) => (
                    <div key={f.k} className="rounded-[16px] bg-white border border-[#E8E0D0] p-3 text-center hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,26,28,0.06)] transition-all">
                      <div className="font-mono text-[9px] tracking-[0.10em] font-semibold text-[#9CA3AF] uppercase">{f.k}</div>
                      <div className="font-display font-extrabold text-sm leading-none text-[#0F1A1C] mt-1 truncate">{f.v}</div>
                      <div className="font-mono text-[10px] text-[#6B7280]">{f.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Provenance */}
                <div className="rounded-[20px] border border-[#E8E0D0] bg-white p-4" style={{ boxShadow: "0 4px 20px rgba(15,26,28,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#0F1A1C] text-white grid place-items-center"><CompassIcon size={12} /></span>
                    <span className="font-display font-bold text-sm tracking-tight text-[#0F1A1C]">Provenance</span>
                    <span className="ml-auto font-mono text-[10px] px-2 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] text-[#6B7280] font-bold">{countryName}</span>
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-[1.6] text-[#6B7280] text-pretty" style={{ fontFamily: "Inter, sans-serif" }}>
                    From the {countryName} kitchen — <span className="text-[#0F1A1C] font-semibold">{recipe.category}</span> discipline. Rated <span className="font-bold text-[#0F1A1C]">{(recipe as any).score || avgRating || "—"}/10</span> in the Veyra archive. {description ? description.slice(0, 96) + (description.length > 96 ? "…" : "") : "A carefully preserved recipe, balanced for modern tables."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[11px] font-bold">{recipe.category}</span>
                    {(recipe as any).proteinType && <span className="px-2.5 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] text-[#6B7280] text-[11px] font-semibold">{(recipe as any).proteinType}</span>}
                    {difficulty && <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#6B7280] text-[11px] font-semibold">{difficulty.toLowerCase()}</span>}
                    {(recipe as any).tags?.slice(0, 3).map((t: string) => (
                      <span key={t} className="px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#6B7280] text-[11px] font-medium">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Reviews — editorial atelier ── */}
            <motion.div
              ref={reviewsRef}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 lg:mt-10 max-w-[1120px] mx-auto"
            >
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.14em] font-semibold uppercase text-[#0F1A1C]">Community</span>
                  <h3 className="mt-1 font-serif text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] leading-none text-[#0F1A1C]">
                    Reviews <span className="font-display not-italic font-extrabold">— lived tastes</span>
                  </h3>
                  <p className="mt-1 font-mono text-[11px] tracking-wide text-[#6B7280]">Honest notes from the Veyra table • {reviews.length} {reviews.length === 1 ? "review" : "reviews"} • {avgRating ? `${avgRating} avg` : "be the first"}</p>
                </div>
                {avgRating && (
                  <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-[#E8E0D0] px-3 py-2 shadow-sm">
                    <span className="w-7 h-7 rounded-full bg-[#0F1A1C] text-white grid place-items-center font-display font-extrabold text-xs">{avgRating}</span>
                    <span className="flex">{[...Array(5)].map((_, i) => <StarIcon key={i} size={12} fill={i < Math.round(Number(avgRating)) ? "#E07A5F" : "none"} className={i < Math.round(Number(avgRating)) ? "text-[#E07A5F]" : "text-[#E8E0D0]"} />)}</span>
                    <span className="font-mono text-[11px] font-semibold text-[#6B7280]">• {reviews.length}</span>
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-4 sm:gap-6 items-start">
                {/* composer */}
                <form onSubmit={handleSubmitReview} className="rounded-[20px] p-4 sm:p-5 border bg-[#F5F0E8] border-[#E8E0D0] relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/50 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display font-extrabold text-sm tracking-tight text-[#0F1A1C]">{editingReviewId ? "Edit your note" : "Leave a note"}</span>
                      <span className="font-mono text-[10px] tracking-wide px-2 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#6B7280]">Veyra Member</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold tracking-wide text-[#0F1A1C] uppercase">Your rating</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => setRatingInput(star)} aria-label={`Rate ${star}`} className="w-8 h-8 rounded-full bg-white border border-[#E8E0D0] grid place-items-center hover:border-[#0F1A1C] hover:-translate-y-0.5 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15">
                            <StarIcon size={14} fill={ratingInput >= star ? "#E07A5F" : "none"} className={ratingInput >= star ? "text-[#E07A5F]" : "text-[#E8E0D0]"} />
                          </button>
                        ))}
                      </div>
                      <span className="ml-auto font-display font-extrabold text-sm text-[#0F1A1C]">{ratingInput}.0</span>
                    </div>

                    <textarea
                      required
                      rows={3}
                      placeholder="Share your honest review — texture, balance, what you’d tweak…"
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      className="mt-3 w-full p-3.5 rounded-[14px] border bg-white text-[13.5px] leading-[1.6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F1A1C] focus:shadow-[0_0_0_4px_rgba(15,26,28,0.06)] transition-all resize-none"
                      style={{ borderColor: "#E8E0D0", fontFamily: "Inter, sans-serif" }}
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      {editingReviewId ? (
                        <button type="button" onClick={() => { setEditingReviewId(null); setReviewText(""); setRatingInput(5) }} className="px-4 py-2 rounded-full bg-white border border-[#E8E0D0] text-[#6B7280] text-xs font-bold hover:border-[#0F1A1C] hover:text-[#0F1A1C] transition-colors">Cancel</button>
                      ) : <span className="font-mono text-[11px] tracking-wide text-[#9CA3AF]">{reviewText.length}/280</span>}
                      <button type="submit" disabled={isSubmittingReview || !reviewText.trim()} className="ml-auto px-5 py-2.5 rounded-full bg-[#0F1A1C] text-white text-xs font-extrabold tracking-tight shadow-[0_6px_16px_rgba(15,26,28,0.14)] hover:bg-[#1D2A2E] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20">
                        {isSubmittingReview ? "Saving…" : editingReviewId ? "Update review" : "Publish review"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* list */}
                <div className="min-w-0 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {reviews.length === 0 ? (
                      <motion.div initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }} className="rounded-[20px] border border-dashed border-[#E8E0D0] bg-white p-8 text-center">
                        <div className="flex justify-center mb-3">
                          <VeyraCompanion mood="warm" accent="sage" size={64} float={false} />
                        </div>
                        <div className="font-serif italic text-[18px] leading-none text-[#0F1A1C]">No reviews yet</div>
                        <p className="font-mono text-[11px] tracking-wide text-[#6B7280] mt-2">Be the first to leave a note — the archive listens.</p>
                      </motion.div>
                    ) : reviews.map((rev, idx) => (
                      <motion.div
                        key={rev.id}
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        transition={{ delay: shouldReduceMotion ? 0 : idx * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="group relative rounded-[16px] bg-white border border-[#F5F0E8] p-4 hover:border-[#E8E0D0] hover:shadow-[0_8px_20px_rgba(15,26,28,0.06)] hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="w-7 h-7 rounded-full bg-[#0F1A1C] text-white grid place-items-center text-[11px] font-bold shrink-0">{(rev.userName || "V")[0].toUpperCase()}</span>
                              <span className="font-display font-bold text-[13px] leading-none tracking-tight text-[#0F1A1C] truncate">{rev.userName || "Veyra Member"}</span>
                              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] font-mono text-[10px] font-semibold text-[#6B7280]">{new Date(rev.createdAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-0.5 ml-1">
                                {[...Array(5)].map((_, si) => (
                                  <StarIcon key={si} size={11} fill={si < rev.rating ? "#E07A5F" : "none"} className={si < rev.rating ? "text-[#E07A5F]" : "text-[#E8E0D0]"} />
                                ))}
                              </span>
                            </div>
                            <p className="mt-2 text-[13.5px] leading-[1.6] text-[#1D2A2E] text-pretty" style={{ fontFamily: "Inter, sans-serif" }}>{rev.text}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => { setEditingReviewId(rev.id); setReviewText(rev.text); setRatingInput(rev.rating); reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) }}
                              className="w-7 h-7 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:border-[#0F1A1C] hover:text-[#0F1A1C] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/15"
                              aria-label="Edit review"
                            >
                              <span className="text-[11px]">✎</span>
                            </button>
                            <button onClick={() => handleDeleteReview(rev.id)} aria-label="Delete review" className="w-7 h-7 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#9CA3AF] hover:border-[#C45A3C] hover:text-[#C45A3C] hover:bg-[#FEF2F2] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C45A3C]/20">
                              <TrashIcon size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* footer rule */}
            <div className="mt-8 pt-6 border-t border-[#E8E0D0]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">Veyra Atelier • Curated archive • 20 kitchens • 1,400 verified recipes</span>
              <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C] text-xs font-bold hover:border-[#0F1A1C] hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20">Close dossier</button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
