import React, { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { PantryItem, FoodItem } from "@/types"
import { PlusIcon, TrashIcon, CheckIcon, SparklesIcon, CalendarIcon, EditIcon, XIcon, SearchIcon, MinusIcon } from "@/components/icons"
import { VeyraCompanion } from "@/components/VeyraCompanion"
import RecipeDetailsModal from "@/components/RecipeDetailsModal"

const easeVeyra: any = [0.16, 1, 0.3, 1]

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "•"
}

function formatExpLabel(dateStr?: string) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return dateStr
  }
}

export default function Pantry() {
  const { pantryItems, addPantryItem, updatePantryItem, deletePantryItem, addToast, setScreen } = useApp()
  const prefersReduced = useReducedMotion()
  const [activeTab, setActiveTab] = useState<"all" | "expiring" | "expired" | "recent">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState("pcs")
  const [expirationDate, setExpirationDate] = useState("")
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<FoodItem | null>(null)
  const [showCookModal, setShowCookModal] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const openAddModal = () => {
    setEditingItem(null)
    setName("")
    setQuantity(1)
    setUnit("pcs")
    setExpirationDate("")
    setShowAddModal(true)
  }

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item)
    setName(item.name)
    setQuantity(item.quantity)
    setUnit(item.unit)
    setExpirationDate(item.expirationDate ? item.expirationDate.split("T")[0] : "")
    setShowAddModal(true)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      addToast("Please enter ingredient name", "warning")
      return
    }
    if (editingItem) {
      await updatePantryItem(editingItem.id, {
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unit: unit.trim(),
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
      })
      addToast(`Updated "${name}" in pantry`, "success")
    } else {
      await addPantryItem({
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unit: unit.trim(),
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
      })
      addToast(`Added "${name}" to pantry`, "success")
    }
    setShowAddModal(false)
  }

  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const isExpired = (item: PantryItem) => {
    if (!item.expirationDate) return false
    return new Date(item.expirationDate).getTime() < now.getTime()
  }

  const isExpiringSoon = (item: PantryItem) => {
    if (!item.expirationDate) return false
    const expTime = new Date(item.expirationDate).getTime()
    return expTime >= now.getTime() && expTime <= threeDaysFromNow.getTime()
  }

  // Filter items — preserved logic
  const filteredItems = pantryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (activeTab === "all") return !item.isUsed
    if (activeTab === "expiring") return !item.isUsed && isExpiringSoon(item)
    if (activeTab === "expired") return !item.isUsed && isExpired(item)
    if (activeTab === "recent") return !item.isUsed
    return true
  }).sort((a, b) => {
    if (activeTab === "recent") {
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
    }
    return 0
  })

  const activePantryNames = pantryItems.filter((i) => !i.isUsed).map((i) => i.name.toLowerCase())

  const totalActive = pantryItems.filter((i) => !i.isUsed).length
  const expiringCount = pantryItems.filter((i) => !i.isUsed && isExpiringSoon(i)).length
  const expiredCount = pantryItems.filter((i) => !i.isUsed && isExpired(i)).length
  const freshCount = Math.max(totalActive - expiringCount - expiredCount, 0)

  const tabs: { id: typeof activeTab; label: string; mono: string }[] = [
    { id: "all", label: "All Items", mono: String(totalActive) },
    { id: "expiring", label: "Expiring", mono: String(expiringCount) },
    { id: "expired", label: "Expired", mono: String(expiredCount) },
    { id: "recent", label: "Recent", mono: "—" },
  ]

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
            <span className="w-1 h-1 rounded-full bg-[#C45A3C]" /> VEYRA ° PANTRY — EDITION 2026
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase hidden lg:block">Live stock • Expiry intelligence • Cook from pantry</span>
          <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#0F1A1C] uppercase">{totalActive} ingredients • {freshCount} fresh</span>
        </motion.div>

        {/* ── Hero — ink editorial + paper atelier ── */}
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
            <div className="absolute -bottom-4 right-8 font-serif font-bold leading-none select-none pointer-events-none hidden lg:block" style={{ fontSize: 128, letterSpacing: "-0.06em", color: "rgba(255,251,245,0.03)" }}>pantry</div>
          </div>

          <div className="relative grid lg:grid-cols-[1.12fr_0.88fr] gap-0">
            {/* left editorial */}
            <div className="p-6 sm:p-8 lg:p-9 lg:pr-7 flex flex-col min-w-0">
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
                  <p className="font-mono text-[10px] tracking-[0.16em] font-semibold text-white/45 uppercase">Pantry • Live stock • Expiry intelligence</p>
                </div>

                <h1 className="mt-4 font-serif text-[34px] sm:text-[46px] lg:text-[52px] font-light leading-[0.88] tracking-[-0.04em] text-white text-balance">
                  <span className="font-serif font-light">Smart </span>
                  <span className="font-display font-extrabold tracking-[-0.04em]">Pantry</span>
                  <span className="font-serif italic font-normal text-[#E07A5F]">.</span>
                </h1>

                <p className="mt-4 text-[13.5px] sm:text-[14px] leading-[1.7] text-white/60 max-w-[44ch] font-normal" style={{ fontFamily: "Inter, sans-serif" }}>
                  A tactile living inventory — quantity hierarchy, expiry signals, and cookable suggestions from what you already own. Calm, clear, always current.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.02, y: -1 }}
                    whileTap={prefersReduced ? {} : { scale: 0.98 }}
                    onClick={() => setShowCookModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#0F1A1C] text-[13px] font-bold tracking-tight shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-shadow"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center">
                      <SparklesIcon size={12} />
                    </span>
                    Cook from pantry
                  </motion.button>

                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.02, y: -1 }}
                    whileTap={prefersReduced ? {} : { scale: 0.98 }}
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#C45A3C] text-white text-[13px] font-bold tracking-tight shadow-[0_8px_24px_rgba(196,90,60,0.22)] hover:brightness-[1.05] transition-all"
                  >
                    <PlusIcon size={14} />
                    Add ingredient
                  </motion.button>

                  <span className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/[0.08] backdrop-blur border border-white/10 text-white/70 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#8A9A8B] animate-pulse" />
                    {filteredItems.length} showing • {totalActive} live
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-2 font-mono tracking-[0.12em] uppercase text-white/45">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                  Intelligence
                </span>
                <span className="hidden sm:inline h-3 w-px bg-white/10" />
                <span className="font-mono text-white/55 truncate">
                  {freshCount} fresh • {expiringCount} expiring soon • {expiredCount} expired
                </span>
              </div>
            </div>

            {/* right atelier — metrics paper */}
            <div className="relative p-4 sm:p-5 lg:p-6 flex items-stretch lg:pl-2 min-w-0">
              <div
                className="relative w-full rounded-[24px] overflow-hidden border border-white/10 p-4 sm:p-5 flex flex-col justify-between bg-[#FFFBF5]"
                style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
              >
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="font-serif italic text-[80px] leading-none tracking-[-0.04em] text-[#0F1A1C]/[0.055] select-none">pantry</span>
                </div>
                <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

                <div className="relative flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase">Atelier — mise en place</span>
                  <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-[#0F1A1C] text-white font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" /> Live
                  </span>
                </div>

                <div className="relative grid grid-cols-3 gap-2.5">
                  {[
                    { k: "Live", v: String(totalActive), sub: "Ingredients", accent: "#0F1A1C" },
                    { k: "Expiring", v: String(expiringCount), sub: "Soon", accent: "#C45A3C" },
                    { k: "Expired", v: String(expiredCount), sub: "Action", accent: "#B85C4A" },
                  ].map((m, i) => (
                    <motion.div
                      key={m.k}
                      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: prefersReduced ? 0 : 0.15 + i * 0.06, duration: 0.5, ease: easeVeyra }}
                      className="rounded-[16px] bg-white border border-[#E8E0D0]/70 p-3 shadow-[0_4px_16px_rgba(15,26,28,0.06)]"
                    >
                      <div className="font-mono text-[9px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase">{m.k}</div>
                      <div className="font-display font-extrabold text-[20px] leading-none mt-1" style={{ color: m.accent }}>{m.v}</div>
                      <div className="font-mono text-[10px] text-[#6B7280] mt-0.5">{m.sub}</div>
                      <div className="mt-2 h-1 rounded-full bg-[#F5F0E8] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Number(m.v) * 12 + 18)}%` }}
                          transition={{ delay: prefersReduced ? 0 : 0.4 + i * 0.06, duration: 0.9, ease: easeVeyra }}
                          className="h-full rounded-full"
                          style={{ background: m.accent }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="relative mt-4 rounded-[14px] bg-white border border-[#E8E0D0]/60 p-3 flex items-center gap-3 shadow-[0_2px_10px_rgba(15,26,28,0.04)]">
                  <div className="w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0">
                    <CalendarIcon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-xs leading-none text-[#0F1A1C]">Expiry radar</div>
                    <div className="font-mono text-[10px] text-[#6B7280] truncate">{expiringCount === 0 ? "No urgency — beautifully stocked" : `${expiringCount} items need attention this week`}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#8A9A8B] animate-pulse shrink-0" />
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-px w-full opacity-[0.06] bg-white" />
        </motion.section>

        {/* ── Filter Atelier ── */}
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.12, duration: 0.55, ease: easeVeyra }}
          className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center mb-4"
        >
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-[#FFFBF5] border border-[#E8E0D0]/70 self-start lg:self-auto shrink-0">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-[13px] font-bold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A1C]/20 ${active ? "text-white" : "text-[#6B7280] hover:text-[#0F1A1C]"}`}
                >
                  {active && (
                    <motion.div
                      layoutId="pantry-tab-v2"
                      className="absolute inset-0 rounded-full bg-[#0F1A1C] shadow-[0_4px_14px_rgba(15,26,28,0.14)]"
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {tab.label}
                    <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${active ? "bg-white/15 text-white" : "bg-white text-[#9CA3AF] border border-[#E8E0D0]"}`}>{tab.mono}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className={`relative flex-1 min-w-0 rounded-full border p-1.5 flex items-center gap-2 transition-all ${searchFocused ? "bg-white border-[#0F1A1C] shadow-[0_8px_32px_rgba(15,26,28,0.08)]" : "bg-white/90 backdrop-blur border-[#E8E0D0] shadow-[0_4px_20px_rgba(15,26,28,0.04)]"}`}>
            <div className="relative flex-1 min-w-0">
              <SearchIcon size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? "text-[#0F1A1C]" : "text-[#9CA3AF]"}`} />
              <input
                type="text"
                placeholder="Search ingredients — tomatoes, chicken, milk…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full h-[38px] rounded-full bg-[#FFFBF5] border border-[#E8E0D0] pl-[38px] pr-3 text-[13px] font-medium text-[#0F1A1C] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F1A1C] focus:bg-white transition-all"
              />
            </div>
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  onClick={() => setSearchQuery("")}
                  className="hidden sm:grid w-8 h-8 rounded-full bg-[#0F1A1C] text-white place-items-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
                  aria-label="Clear search"
                >
                  <XIcon size={12} />
                </motion.button>
              )}
            </AnimatePresence>
            <span className="hidden sm:inline-flex font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase pr-3 shrink-0">
              {filteredItems.length} shown
            </span>
          </div>
        </motion.div>

        {/* ── Editorial rule ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-y border-[#E8E0D0]/60 mb-5">
          <div className="font-mono text-[11px] tracking-[0.06em] font-medium text-[#6B7280] uppercase truncate">
            <AnimatePresence mode="wait">
              <motion.span
                key={`${activeTab}-${filteredItems.length}-${searchQuery}`}
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.32, ease: easeVeyra }}
                className="inline-block"
              >
                {activeTab === "all" && `Live inventory • ${filteredItems.length} ingredients`}
                {activeTab === "expiring" && `Attention shelf • ${filteredItems.length} expiring soon`}
                {activeTab === "expired" && `Action needed • ${filteredItems.length} expired`}
                {activeTab === "recent" && `Fresh arrivals • ${filteredItems.length} recently added`}
                {searchQuery ? ` • “${searchQuery}”` : ""}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="font-mono text-[11px] tracking-wide text-[#9CA3AF] uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
            {totalActive} live • {expiringCount} soon • {expiredCount} expired
          </span>
        </div>

        {/* ── Grid ── */}
        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: easeVeyra }}
              className="rounded-[28px] border bg-[#FFFBF5] p-8 sm:p-10 text-center relative overflow-hidden"
              style={{ borderColor: "#E8E0D0" }}
            >
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
              <div className="relative max-w-[46ch] mx-auto flex flex-col items-center">
                <VeyraCompanion mood={activeTab === "expired" ? "think" : "warm"} accent={activeTab === "expired" ? "sage" : "clay"} size={88} float={!prefersReduced} />
                <h3 className="font-serif italic text-[26px] sm:text-[28px] leading-none tracking-[-0.02em] text-[#0F1A1C] mt-4">
                  No ingredients found <span className="font-display not-italic font-extrabold">— yet</span>
                </h3>
                <p className="text-[13px] leading-relaxed text-[#6B7280] mt-2 text-pretty" style={{ fontFamily: "Inter, sans-serif" }}>
                  {activeTab === "expiring"
                    ? "Great news — nothing is close to expiring. Your pantry is in beautiful shape."
                    : activeTab === "expired"
                    ? "No expired ingredients. Freshness is on your side."
                    : searchQuery
                    ? `No match for “${searchQuery}”. Try a broader term or clear the search.`
                    : "Your pantry is empty. Add fresh ingredients to unlock expiry tracking and cookable recipes."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F1A1C] text-white text-sm font-bold hover:bg-[#1D2A2E] hover:-translate-y-0.5 transition-all"
                  >
                    <PlusIcon size={14} />
                    Add first ingredient
                  </button>
                  {(searchQuery || activeTab !== "all") && (
                    <button
                      onClick={() => { setSearchQuery(""); setActiveTab("all") }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C] text-sm font-semibold hover:border-[#0F1A1C] transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] mt-6">Pantry • Living inventory • Veyra atelier</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {filteredItems.map((item, index) => {
                const expired = isExpired(item)
                const expiringSoon = isExpiringSoon(item)
                const tone = expired ? "#B85C4A" : expiringSoon ? "#C45A3C" : "#0F1A1C"
                const toneBg = expired ? "rgba(184,92,74,0.10)" : expiringSoon ? "rgba(196,90,60,0.08)" : "rgba(15,26,28,0.06)"
                const statusLabel = expired ? "Expired" : expiringSoon ? "Expiring Soon" : "Fresh"
                return (
                  <motion.div
                    key={item.id}
                    layout={!prefersReduced}
                    initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ delay: prefersReduced ? 0 : index * 0.03, duration: 0.5, ease: easeVeyra }}
                    whileHover={prefersReduced ? {} : { y: -4 }}
                    className="group relative rounded-[22px] overflow-hidden bg-white border flex flex-col hover:shadow-[0_16px_40px_rgba(15,26,28,0.08),0_4px_14px_rgba(15,26,28,0.06)] transition-shadow will-change-transform"
                    style={{ borderColor: expired ? "rgba(184,92,74,0.22)" : expiringSoon ? "rgba(196,90,60,0.18)" : "#E8E0D0", boxShadow: "0 8px 24px rgba(15,26,28,0.04)" }}
                  >
                    <div className="h-[3px] w-full" style={{ background: tone }} />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.86'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

                    <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0 relative">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border"
                          style={{ background: toneBg, color: tone, borderColor: `${tone}18` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tone }} />
                          {statusLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={prefersReduced ? {} : { scale: 1.06 }}
                            whileTap={prefersReduced ? {} : { scale: 0.96 }}
                            onClick={() => openEditModal(item)}
                            aria-label="Edit"
                            className="w-7 h-7 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:text-[#0F1A1C] hover:bg-white hover:border-[#0F1A1C]/10 transition-colors"
                          >
                            <EditIcon size={12} />
                          </motion.button>
                          <motion.button
                            whileHover={prefersReduced ? {} : { scale: 1.06 }}
                            whileTap={prefersReduced ? {} : { scale: 0.96 }}
                            onClick={() => deletePantryItem(item.id)}
                            aria-label="Delete"
                            className="w-7 h-7 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#9CA3AF] hover:text-[#B85C4A] hover:border-[#B85C4A]/20 hover:bg-[#FEF2F2] transition-colors"
                          >
                            <TrashIcon size={12} />
                          </motion.button>
                        </div>
                      </div>

                      {/* quantity hierarchy — tactile */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-[14px] bg-[#FFFBF5] border border-[#E8E0D0] grid place-items-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                          <span className="font-display font-extrabold text-[13px] tracking-tight text-[#0F1A1C] leading-none">{initialsFor(item.name)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-serif font-bold text-[26px] leading-none tracking-[-0.03em] text-[#0F1A1C]">{item.quantity}</span>
                            <span className="font-mono text-[10px] tracking-[0.12em] font-semibold uppercase px-2 py-1 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] text-[#6B7280]">{item.unit}</span>
                          </div>
                          <h4 className="font-display font-bold text-[15px] leading-[1.2] tracking-tight text-[#0F1A1C] capitalize truncate mt-1">{item.name}</h4>
                          {item.expirationDate ? (
                            <div className="inline-flex items-center gap-1.5 mt-2 font-mono text-[10px] font-medium text-[#6B7280] bg-[#FFFBF5] border border-[#E8E0D0]/70 px-2.5 py-1 rounded-full max-w-full truncate">
                              <CalendarIcon size={11} className="shrink-0" />
                              <span className="truncate">Exp {formatExpLabel(item.expirationDate)}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 mt-2 font-mono text-[10px] font-medium text-[#9CA3AF] bg-[#F5F0E8]/60 px-2.5 py-1 rounded-full">No expiry</div>
                          )}
                        </div>
                      </div>

                      <div className="h-px w-full bg-[#F5F0E8] my-3 hidden sm:block" />

                      {/* actions — quantity stepper + used */}
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#F5F0E8] border border-[#E8E0D0]/70">
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => updatePantryItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                            className="w-7 h-7 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] hover:border-[#0F1A1C]/15 shadow-sm transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon size={12} />
                          </motion.button>
                          <span className="min-w-[28px] text-center font-display font-extrabold text-sm text-[#0F1A1C] leading-none">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => updatePantryItem(item.id, { quantity: item.quantity + 1 })}
                            className="w-7 h-7 rounded-full bg-[#0F1A1C] text-white grid place-items-center hover:bg-[#1D2A2E] shadow-sm transition-colors"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon size={12} />
                          </motion.button>
                        </div>

                        <motion.button
                          whileHover={prefersReduced ? {} : { scale: 1.02 }}
                          whileTap={prefersReduced ? {} : { scale: 0.98 }}
                          onClick={async () => {
                            await updatePantryItem(item.id, { isUsed: true })
                            addToast(`Marked "${item.name}" as used`, "info")
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C] text-xs font-bold hover:border-[#0F1A1C] hover:bg-[#0F1A1C] hover:text-white transition-colors group/btn"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#F5F0E8] group-hover/btn:bg-white/15 grid place-items-center transition-colors">
                            <CheckIcon size={10} />
                          </span>
                          Used
                        </motion.button>
                      </div>

                      <div className="pointer-events-none absolute inset-0 rounded-[22px] border border-white/0 group-hover:border-white/40 transition-colors" />
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add / Edit Modal — editorial sheet ── */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1A1C]/40 backdrop-blur-[6px]"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={prefersReduced ? { opacity: 0, scale: 0.98 } : { opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.35, ease: easeVeyra }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FFFBF5] rounded-[28px] max-w-md w-full overflow-hidden border shadow-[0_24px_64px_rgba(15,26,28,0.18),0_8px_24px_rgba(15,26,28,0.08)]"
                style={{ borderColor: "#E8E0D0" }}
              >
                <div className="h-[3px] w-full" style={{ background: editingItem ? "#0F1A1C" : "#C45A3C" }} />
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: editingItem ? "#0F1A1C" : "#C45A3C" }} />
                        Pantry • {editingItem ? "Edit" : "New arrival"}
                      </div>
                      <h3 className="font-serif text-[22px] leading-none tracking-[-0.02em] text-[#0F1A1C] mt-2">
                        {editingItem ? (
                          <>
                            Edit <span className="font-display font-extrabold">ingredient</span>
                          </>
                        ) : (
                          <>
                            Add <span className="font-display font-extrabold">ingredient</span><span className="font-serif italic font-normal text-[#C45A3C]">.</span>
                          </>
                        )}
                      </h3>
                      <p className="text-xs leading-relaxed text-[#6B7280] mt-1.5 max-w-[30ch]" style={{ fontFamily: "Inter, sans-serif" }}>Tactile stock — quantity, unit, and optional expiry. Veyra tracks the rest.</p>
                    </div>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="w-8 h-8 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:text-[#0F1A1C] hover:border-[#0F1A1C]/15 transition-colors shrink-0"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveItem} className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] tracking-[0.12em] font-semibold text-[#6B7280] uppercase mb-1.5">Ingredient name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Chicken Breast, Tomatoes, Milk"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-[44px] px-4 rounded-full border bg-white text-sm font-medium text-[#0F1A1C] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F1A1C] focus:ring-4 focus:ring-[#0F1A1C]/5 transition-all"
                        style={{ borderColor: "#E8E0D0" }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] tracking-[0.12em] font-semibold text-[#6B7280] uppercase mb-1.5">Quantity</label>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full h-[44px] px-4 rounded-full border bg-white text-sm font-medium text-[#0F1A1C] focus:outline-none focus:border-[#0F1A1C] focus:ring-4 focus:ring-[#0F1A1C]/5 transition-all"
                          style={{ borderColor: "#E8E0D0" }}
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] tracking-[0.12em] font-semibold text-[#6B7280] uppercase mb-1.5">Unit</label>
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full h-[44px] px-4 rounded-full border bg-white text-sm font-medium text-[#0F1A1C] focus:outline-none focus:border-[#0F1A1C] transition-all"
                          style={{ borderColor: "#E8E0D0" }}
                        >
                          <option value="pcs">pcs</option>
                          <option value="kg">kg</option>
                          <option value="grams">grams</option>
                          <option value="liters">liters</option>
                          <option value="ml">ml</option>
                          <option value="packs">packs</option>
                          <option value="cans">cans</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] tracking-[0.12em] font-semibold text-[#6B7280] uppercase mb-1.5">Expiration date (optional)</label>
                      <div className="relative">
                        <CalendarIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                        <input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          className="w-full h-[44px] pl-10 pr-4 rounded-full border bg-white text-sm font-medium text-[#0F1A1C] focus:outline-none focus:border-[#0F1A1C] focus:ring-4 focus:ring-[#0F1A1C]/5 transition-all"
                          style={{ borderColor: "#E8E0D0" }}
                        />
                      </div>
                      <p className="font-mono text-[10px] text-[#9CA3AF] mt-1.5">Veyra will flag expiring soon (≤ 3 days) and expired items automatically.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-5 py-2.5 rounded-full text-xs font-bold bg-white border border-[#E8E0D0] text-[#6B7280] hover:border-[#0F1A1C] hover:text-[#0F1A1C] transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="submit"
                        whileHover={prefersReduced ? {} : { scale: 1.01 }}
                        whileTap={prefersReduced ? {} : { scale: 0.98 }}
                        className="px-6 py-2.5 rounded-full text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(196,90,60,0.22)]"
                        style={{ background: editingItem ? "#0F1A1C" : "#C45A3C" }}
                      >
                        {editingItem ? "Save changes" : "Add to pantry"}
                      </motion.button>
                    </div>
                  </form>
                </div>
                <div className="h-px w-full bg-[#E8E0D0]/60" />
                <div className="px-6 sm:px-7 py-3 flex items-center justify-between bg-white/60">
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">Veyra pantry • tactile</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cook with Pantry Modal — editorial ── */}
        <AnimatePresence>
          {showCookModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1A1C]/45 backdrop-blur-[6px]"
              onClick={() => setShowCookModal(false)}
            >
              <motion.div
                initial={prefersReduced ? { opacity: 0, scale: 0.98 } : { opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.35, ease: easeVeyra }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FFFBF5] rounded-[28px] max-w-2xl w-full overflow-hidden border shadow-[0_24px_64px_rgba(15,26,28,0.18)] max-h-[85vh] flex flex-col"
                style={{ borderColor: "#E8E0D0" }}
              >
                <div className="h-[3px] w-full bg-[#0F1A1C]" />
                <div className="p-6 sm:p-7 pb-4 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C] animate-pulse" />
                        Cook • From your pantry
                      </div>
                      <h3 className="font-serif text-[20px] sm:text-[22px] leading-none tracking-[-0.02em] text-[#0F1A1C] mt-2 flex items-center gap-2">
                        Recipes you can cook <span className="font-display font-extrabold">right now</span>
                        <span className="hidden sm:inline-flex w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center">
                          <SparklesIcon size={12} />
                        </span>
                      </h3>
                      <p className="text-xs leading-relaxed text-[#6B7280] mt-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Matched against your {activePantryNames.length} available ingredients — fresh, expiring aware.</p>
                    </div>
                    <button
                      onClick={() => setShowCookModal(false)}
                      className="w-8 h-8 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:text-[#0F1A1C] transition-colors shrink-0"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                </div>

                <div className="px-6 sm:px-7 pb-6 overflow-y-auto space-y-3 min-h-0">
                  {[
                    {
                      id: "pantry-rec-1",
                      name: "Mediterranean Chicken Bowl",
                      category: "Main Meals" as const,
                      calories: 480,
                      protein: 42,
                      carbs: 25,
                      fat: 16,
                      portionGrams: 350,
                      score: 9.5,
                      ingredients: ["Chicken", "Rice", "Tomato", "Olive Oil", "Garlic"],
                      timeToPrepareMin: 20,
                      homePrepCost: 4.5,
                      restaurantPrice: 14.0,
                      currency: "USD",
                      country: "Italy",
                      youtubeUrl: "https://www.youtube.com/watch?v=sH4aZfH2vP8",
                      img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&auto=format",
                    },
                    {
                      id: "pantry-rec-2",
                      name: "Egyptian Tomato Rice & Chicken",
                      category: "Main Meals" as const,
                      calories: 520,
                      protein: 38,
                      carbs: 60,
                      fat: 14,
                      portionGrams: 400,
                      score: 9.0,
                      ingredients: ["Chicken", "Rice", "Tomato", "Onion"],
                      timeToPrepareMin: 25,
                      homePrepCost: 120,
                      restaurantPrice: 350,
                      currency: "EGP",
                      country: "Egypt",
                      img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format",
                    },
                  ].map((recipe) => (
                    <div
                      key={recipe.id}
                      className="rounded-[20px] overflow-hidden border bg-white flex flex-col sm:flex-row gap-0 hover:shadow-[0_12px_32px_rgba(15,26,28,0.08)] hover:border-[#0F1A1C]/10 transition-all"
                      style={{ borderColor: "#E8E0D0" }}
                    >
                      <div className="w-full sm:w-[168px] h-[132px] sm:h-auto sm:min-h-[132px] relative overflow-hidden shrink-0 bg-[#F5F0E8]">
                        <img src={recipe.img} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:hidden" />
                        <span className="absolute top-2 left-2 font-mono text-[10px] font-bold px-2 py-1 rounded-full bg-white/95 backdrop-blur border border-white/60 text-[#0F1A1C]">⏱ {recipe.timeToPrepareMin}m</span>
                      </div>
                      <div className="flex-1 p-4 flex flex-col min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-display font-bold text-[15px] leading-[1.2] tracking-tight text-[#0F1A1C]">{recipe.name}</h4>
                          <span className="hidden sm:inline-flex font-mono text-[10px] px-2 py-1 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] text-[#6B7280] shrink-0">
                            {recipe.calories} kcal • {recipe.protein}P
                          </span>
                        </div>
                        <p className="font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-1 sm:hidden">{recipe.calories} kcal • {recipe.protein}g protein • {recipe.timeToPrepareMin} mins</p>
                        <p className="hidden sm:block font-mono text-[10px] text-[#9CA3AF] mt-1">{recipe.country} • {recipe.protein}g protein • {recipe.timeToPrepareMin} mins</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {recipe.ingredients.map((ing) => {
                            const hasIt = activePantryNames.some((p) => p.includes(ing.toLowerCase()))
                            return (
                              <span
                                key={ing}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${hasIt ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]" : "bg-[#F5F0E8] text-[#6B7280] border-[#E8E0D0]"}`}
                              >
                                {hasIt ? <CheckIcon size={10} /> : <span className="w-1 h-1 rounded-full bg-current opacity-40" />}
                                {ing}
                              </span>
                            )
                          })}
                        </div>
                        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] hidden sm:inline">Pantry match</span>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedRecipeForModal(recipe)
                              setShowCookModal(false)
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#0F1A1C] text-white text-xs font-bold hover:bg-[#1D2A2E] transition-colors"
                          >
                            View recipe <span className="w-5 h-5 rounded-full bg-white text-[#0F1A1C] grid place-items-center text-[11px]">→</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-[16px] bg-white border border-dashed border-[#E8E0D0] p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] shrink-0">
                      <SparklesIcon size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-xs text-[#0F1A1C] leading-none">Want more from your stock?</div>
                      <div className="font-mono text-[11px] text-[#6B7280] mt-1 leading-relaxed">Veyra matches pantry to 1,400 recipes — open Discover to search by what you own.</div>
                    </div>
                    <button
                      onClick={() => {
                        setShowCookModal(false)
                        setScreen("discover")
                      }}
                      className="hidden sm:inline-flex px-3.5 py-2 rounded-full bg-white border border-[#E8E0D0] text-xs font-bold text-[#0F1A1C] hover:border-[#0F1A1C] transition-colors shrink-0"
                    >
                      Discover
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-[#E8E0D0]/60 shrink-0" />
                <div className="px-6 sm:px-7 py-3 flex items-center justify-between bg-white/60 shrink-0">
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">Veyra • Pantry intelligence</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedRecipeForModal && (
            <RecipeDetailsModal recipe={selectedRecipeForModal} onClose={() => setSelectedRecipeForModal(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
