import React, { useState, useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { ShoppingListItem } from "@/types"
import { PlusIcon, TrashIcon, CheckIcon, XIcon, ShoppingCartIcon, SparklesIcon, SearchIcon } from "@/components/icons"
import { VeyraCompanion } from "@/components/VeyraCompanion"

const easeVeyra: any = [0.16, 1, 0.3, 1]

function qtyBadge(q: number) {
  return q % 1 === 0 ? String(q) : q.toFixed(1).replace(/\.0$/, "")
}

export default function ShoppingList() {
  const { shoppingList, addShoppingListItem, updateShoppingListItem, deleteShoppingListItem, clearPurchasedShoppingList, clearEntireShoppingList, addToast } = useApp()
  const prefersReduced = useReducedMotion()

  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState("pcs")
  const [filter, setFilter] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      addToast("Please enter item name", "warning")
      return
    }
    await addShoppingListItem({
      name: name.trim(),
      quantity: Number(quantity) || 1,
      unit: unit.trim(),
    })
    addToast(`Added "${name}" to shopping list`, "success")
    setName("")
    setQuantity(1)
    setUnit("pcs")
    setShowAddModal(false)
  }

  const purchasedCount = shoppingList.filter((i) => i.isPurchased).length
  const pendingCount = shoppingList.filter((i) => !i.isPurchased).length
  const total = shoppingList.length
  const progress = total === 0 ? 0 : Math.round((purchasedCount / total) * 100)

  const filteredPending = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return shoppingList.filter((i) => !i.isPurchased && (q === "" || i.name.toLowerCase().includes(q)))
  }, [shoppingList, filter])

  const filteredPurchased = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return shoppingList.filter((i) => i.isPurchased && (q === "" || i.name.toLowerCase().includes(q)))
  }, [shoppingList, filter])

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
            <span className="w-1 h-1 rounded-full bg-[#C45A3C]" /> VEYRA ° SHOPPING — EDITION 2026
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase hidden lg:block">Interactive checklist • Grouping • Completion</span>
          <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#0F1A1C] uppercase">{pendingCount} to buy • {purchasedCount} done • {progress}%</span>
        </motion.div>

        {/* ── Hero — ink + paper atelier ── */}
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
            <div className="hidden lg:block absolute -bottom-2 right-8 font-serif font-bold leading-none select-none pointer-events-none" style={{ fontSize: 124, letterSpacing: "-0.06em", color: "rgba(255,251,245,0.03)" }}>shop</div>
          </div>

          <div className="relative grid lg:grid-cols-[1.12fr_0.88fr] gap-0">
            {/* left editorial */}
            <div className="p-6 sm:p-8 lg:p-9 lg:pr-7 flex flex-col min-w-0">
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
                  <p className="font-mono text-[10px] tracking-[0.16em] font-semibold text-white/45 uppercase">Shop • Curated list • Auto-filled from recipes</p>
                </div>

                <h1 className="mt-4 font-serif text-[34px] sm:text-[46px] lg:text-[52px] font-light leading-[0.88] tracking-[-0.04em] text-white text-balance">
                  <span className="font-serif font-light">Shopping </span>
                  <span className="font-display font-extrabold tracking-[-0.04em]">List</span>
                  <span className="font-serif italic font-normal text-[#E07A5F]">.</span>
                </h1>

                <p className="mt-4 text-[13.5px] sm:text-[14px] leading-[1.7] text-white/60 max-w-[44ch] font-normal" style={{ fontFamily: "Inter, sans-serif" }}>
                  Premium checklist with satisfying checks, grouping, and quiet completion. Your recipes auto-fill what your pantry is missing — you just shop.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.02, y: -1 }}
                    whileTap={prefersReduced ? {} : { scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#0F1A1C] text-[13px] font-bold tracking-tight shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center">
                      <PlusIcon size={12} />
                    </span>
                    Add item
                  </motion.button>

                  <AnimatePresence>
                    {purchasedCount > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={prefersReduced ? {} : { scale: 1.02 }}
                        whileTap={prefersReduced ? {} : { scale: 0.98 }}
                        onClick={clearPurchasedShoppingList}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white text-xs font-semibold hover:bg-white hover:text-[#0F1A1C] transition-colors"
                      >
                        Clear purchased <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-white/15">{purchasedCount}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {total > 0 && (
                    <motion.button
                      whileHover={prefersReduced ? {} : { scale: 1.02 }}
                      whileTap={prefersReduced ? {} : { scale: 0.98 }}
                      onClick={clearEntireShoppingList}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#B85C4A] text-white text-xs font-bold hover:bg-[#A34E3F] transition-colors"
                    >
                      Clear all
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-2 font-mono tracking-[0.12em] uppercase text-white/45">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                  Checklist
                </span>
                <span className="hidden sm:inline h-3 w-px bg-white/10" />
                <span className="font-mono text-white/55 truncate">
                  {pendingCount} to buy • {purchasedCount} purchased • {progress}% complete
                </span>
              </div>
            </div>

            {/* right atelier — progress */}
            <div className="relative p-4 sm:p-5 lg:p-6 flex items-stretch lg:pl-2 min-w-0">
              <div
                className="relative w-full rounded-[24px] overflow-hidden border border-white/10 p-4 sm:p-5 flex flex-col bg-[#FFFBF5]"
                style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
              >
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="font-serif italic text-[74px] leading-none tracking-[-0.04em] text-[#0F1A1C]/[0.055] select-none">shop</span>
                </div>
                <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

                <div className="relative flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase">Atelier — progress</span>
                  <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-[#0F1A1C] text-white font-bold">{progress}%</span>
                </div>

                <div className="relative flex items-center gap-4">
                  <div className="w-[84px] h-[84px] rounded-[20px] bg-white border border-[#E8E0D0] grid place-items-center shrink-0 shadow-[0_4px_16px_rgba(15,26,28,0.06)] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04]" style={{ background: `conic-gradient(#0F1A1C ${progress * 3.6}deg, transparent 0deg)` }} />
                    <div className="text-center relative">
                      <div className="font-display font-extrabold text-[22px] leading-none tracking-tight text-[#0F1A1C]">{pendingCount}</div>
                      <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#6B7280] mt-1">To buy</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-[#0F1A1C]">{purchasedCount} purchased</span>
                      <span className="font-mono text-[10px] text-[#9CA3AF] uppercase">{total} total</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-white border border-[#E8E0D0] overflow-hidden p-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: easeVeyra }}
                        className="h-full rounded-full"
                        style={{ background: progress === 100 ? "#8A9A8B" : "#0F1A1C" }}
                      />
                    </div>
                    <p className="font-mono text-[10px] text-[#6B7280] mt-2 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                      {progress === 100 && total > 0 ? "Beautifully complete — clear to start fresh." : progress === 0 && total > 0 ? "Tap the circles to check as you shop." : `${pendingCount} items waiting • smooth grouping`}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 grid grid-cols-3 gap-2.5">
                  {[
                    { k: "Pending", v: String(pendingCount), sub: "To buy", accent: "#0F1A1C" },
                    { k: "Done", v: String(purchasedCount), sub: "Purchased", accent: "#1D2A2E" },
                    { k: "Total", v: String(total), sub: "Items", accent: "#C45A3C" },
                  ].map((m) => (
                    <div key={m.k} className="rounded-[14px] bg-white border border-[#E8E0D0]/70 p-3 shadow-[0_2px_10px_rgba(15,26,28,0.04)]">
                      <div className="font-mono text-[9px] tracking-[0.12em] font-semibold text-[#9CA3AF] uppercase">{m.k}</div>
                      <div className="font-display font-extrabold text-[16px] leading-none mt-1" style={{ color: m.accent }}>{m.v}</div>
                      <div className="font-mono text-[10px] text-[#6B7280] mt-0.5">{m.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-px w-full opacity-[0.06] bg-white" />
        </motion.section>

        {/* ── Toolbar: filter + meta ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
          <div className={`relative flex-1 min-w-0 rounded-full border p-1.5 flex items-center gap-2 transition-all ${searchFocused ? "bg-white border-[#0F1A1C] shadow-[0_8px_32px_rgba(15,26,28,0.08)]" : "bg-white/90 backdrop-blur border-[#E8E0D0] shadow-[0_4px_20px_rgba(15,26,28,0.04)]"}`}>
            <div className="relative flex-1 min-w-0">
              <SearchIcon size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? "text-[#0F1A1C]" : "text-[#9CA3AF]"}`} />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Filter list — search items…"
                className="w-full h-[38px] rounded-full bg-[#FFFBF5] border border-[#E8E0D0] pl-[38px] pr-3 text-[13px] font-medium text-[#0F1A1C] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F1A1C] focus:bg-white transition-all"
              />
            </div>
            {filter && (
              <button
                onClick={() => setFilter("")}
                className="w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
                aria-label="Clear filter"
              >
                <XIcon size={12} />
              </button>
            )}
            <span className="hidden sm:inline-flex font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase pr-3 shrink-0">{filteredPending.length} to buy</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold ${progress === 100 && total > 0 ? "bg-[#8A9A8B] border-[#8A9A8B] text-white" : "bg-white border-[#E8E0D0] text-[#6B7280]"}`}>
              <span className={`w-2 h-2 rounded-full ${progress === 100 && total > 0 ? "bg-white" : "bg-[#0F1A1C]"}`} />
              {progress}% complete
            </span>
            <span className="font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase">{filteredPending.length} pending • {filteredPurchased.length} done</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-y border-[#E8E0D0]/60 mb-5">
          <div className="font-mono text-[11px] tracking-[0.06em] font-medium text-[#6B7280] uppercase truncate">
            {total === 0 ? "No items — add your first" : filter ? `Filter “${filter}” • ${filteredPending.length + filteredPurchased.length} matches` : `${total} items • ${pendingCount} to buy • ${purchasedCount} purchased`}
          </div>
          <span className="hidden sm:inline-flex font-mono text-[11px] tracking-wide text-[#9CA3AF] uppercase items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
            Interactive checklist
          </span>
        </div>

        {/* ── List ── */}
        <AnimatePresence mode="wait">
          {total === 0 ? (
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
                <VeyraCompanion mood="idle" accent="sage" size={88} float={!prefersReduced} />
                <h3 className="font-serif italic text-[26px] sm:text-[28px] leading-none tracking-[-0.02em] text-[#0F1A1C] mt-3">
                  Your list is <span className="font-display not-italic font-extrabold">empty</span>
                </h3>
                <p className="text-[13px] leading-relaxed text-[#6B7280] mt-2 text-pretty" style={{ fontFamily: "Inter, sans-serif" }}>
                  Add items manually or use “Add Missing Ingredients” on any recipe — Veyra checks your pantry first and fills the gaps.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F1A1C] text-white text-sm font-bold hover:bg-[#1D2A2E] hover:-translate-y-0.5 transition-all"
                  >
                    <PlusIcon size={14} />
                    Add manual item
                  </button>
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#E8E0D0] text-xs font-semibold text-[#6B7280]">
                    <SparklesIcon size={12} /> Auto-fill from pantry
                  </span>
                </div>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] mt-6">Check • Group • Complete • Veyra</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* ── Pending ── */}
              <motion.section
                layout={!prefersReduced}
                className="rounded-[24px] overflow-hidden border bg-white shadow-[0_8px_24px_rgba(15,26,28,0.04)]"
                style={{ borderColor: "#E8E0D0" }}
              >
                <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b bg-[#FFFBF5]/70" style={{ borderColor: "#F5F0E8" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0">
                      <ShoppingCartIcon size={14} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display font-extrabold text-sm tracking-tight text-[#0F1A1C] leading-none">To buy</h3>
                      <p className="font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-1">
                        {filteredPending.length === 0 ? (filter ? `No match for “${filter}”` : "All caught up — beautifully clear") : `${filteredPending.length} items • tap circles to complete`}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white shrink-0">
                    {pendingCount} pending
                  </span>
                </div>

                <div className="p-3 sm:p-4">
                  {filteredPending.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center mx-auto text-[#0F1A1C]">
                        <CheckIcon size={16} />
                      </div>
                      <p className="font-display font-bold text-sm text-[#0F1A1C] mt-3">{filter ? `No results for “${filter}”` : "All items purchased 🎉"}</p>
                      <p className="text-xs text-[#6B7280] mt-1 max-w-[32ch] mx-auto leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                        {filter ? "Try a different term or clear the filter above." : "Everything is checked — enjoy the shop or clear purchased to reset."}
                      </p>
                      {filter && (
                        <button onClick={() => setFilter("")} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#E8E0D0] text-xs font-bold text-[#0F1A1C] hover:border-[#0F1A1C] transition-colors">
                          Clear filter
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <AnimatePresence initial={false}>
                        {filteredPending.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            layout={!prefersReduced}
                            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.22 } }}
                            transition={{ delay: prefersReduced ? 0 : idx * 0.02, duration: 0.42, ease: easeVeyra }}
                            className="group relative flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-[18px] bg-[#FFFBF5] border border-[#E8E0D0]/60 hover:bg-white hover:border-[#0F1A1C]/10 hover:shadow-[0_8px_24px_rgba(15,26,28,0.07)] transition-all"
                          >
                            <div className="hidden sm:grid w-12 h-12 rounded-[14px] bg-white border border-[#E8E0D0] place-items-center shrink-0 shadow-[0_2px_10px_rgba(15,26,28,0.04)]">
                              <div className="text-center leading-none">
                                <div className="font-display font-extrabold text-[13px] tracking-tight text-[#0F1A1C]">{qtyBadge(item.quantity)}</div>
                                <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mt-0.5">{item.unit}</div>
                              </div>
                            </div>

                            {/* checkbox — premium interactive */}
                            <motion.button
                              whileHover={prefersReduced ? {} : { scale: 1.06 }}
                              whileTap={prefersReduced ? {} : { scale: 0.92 }}
                              onClick={() => updateShoppingListItem(item.id, { isPurchased: true })}
                              aria-label={`Mark ${item.name} purchased`}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-[1.7px] bg-white grid place-items-center shrink-0 shadow-sm hover:shadow transition-all"
                              style={{ borderColor: "#0F1A1C" }}
                            >
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1, opacity: 1 }}
                                className="w-2 h-2 rounded-full bg-[#0F1A1C]"
                              />
                            </motion.button>

                            <div className="flex-1 min-w-0">
                              <div className="font-display font-bold text-[14px] leading-tight tracking-tight text-[#0F1A1C] capitalize truncate pr-2">{item.name}</div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C] shadow-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C]" />
                                  {qtyBadge(item.quantity)} {item.unit}
                                </span>
                                <span className="font-mono text-[10px] tracking-wide text-[#9CA3AF] uppercase hidden sm:inline">• to buy</span>
                              </div>
                            </div>

                            <motion.button
                              whileHover={prefersReduced ? {} : { scale: 1.06 }}
                              whileTap={prefersReduced ? {} : { scale: 0.95 }}
                              onClick={() => deleteShoppingListItem(item.id)}
                              aria-label={`Delete ${item.name}`}
                              className="w-8 h-8 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#9CA3AF] hover:text-[#B85C4A] hover:border-[#B85C4A]/20 hover:bg-[#FEF2F2] transition-colors shrink-0"
                            >
                              <TrashIcon size={13} />
                            </motion.button>

                            <div className="pointer-events-none absolute inset-0 rounded-[18px] border border-transparent group-hover:border-white/60 transition-colors" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {filteredPending.length > 0 && (
                  <div className="px-4 sm:px-6 py-3 border-t bg-[#F5F0E8]/40 flex items-center justify-between" style={{ borderColor: "#F5F0E8" }}>
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">{filteredPending.length} pending • elegant grouping</span>
                    <span className="hidden sm:inline-flex w-1.5 h-1.5 rounded-full bg-[#0F1A1C] animate-pulse" />
                  </div>
                )}
              </motion.section>

              {/* ── Purchased ── */}
              <AnimatePresence>
                {(filter ? filteredPurchased.length > 0 : purchasedCount > 0) && (
                  <motion.section
                    initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: easeVeyra }}
                    className="rounded-[24px] overflow-hidden border bg-[#F5F0E8]/40 shadow-[0_4px_20px_rgba(15,26,28,0.03)]"
                    style={{ borderColor: "#E8E0D0" }}
                  >
                    <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b" style={{ borderColor: "#E8E0D0" }}>
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#8A9A8B] text-white grid place-items-center shrink-0">
                          <CheckIcon size={14} />
                        </span>
                        <div>
                          <h3 className="font-display font-extrabold text-sm tracking-tight text-[#0F1A1C] leading-none">Purchased</h3>
                          <p className="font-mono text-[10px] tracking-wide text-[#6B7280] mt-1">
                            {filteredPurchased.length} completed • tap to undo
                          </p>
                        </div>
                      </div>
                      {!filter && purchasedCount > 0 && (
                        <button
                          onClick={clearPurchasedShoppingList}
                          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E8E0D0] text-xs font-bold text-[#6B7280] hover:text-[#0F1A1C] hover:border-[#0F1A1C] transition-colors"
                        >
                          Clear purchased
                        </button>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="space-y-2.5">
                        <AnimatePresence initial={false}>
                          {filteredPurchased.map((item) => (
                            <motion.div
                              key={item.id}
                              layout={!prefersReduced}
                              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: 0.35, ease: easeVeyra }}
                              className="group flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-[18px] bg-white border border-[#E8E0D0]/60 opacity-[0.92] hover:opacity-100 transition-opacity"
                            >
                              <motion.button
                                whileHover={prefersReduced ? {} : { scale: 1.06 }}
                                whileTap={prefersReduced ? {} : { scale: 0.92 }}
                                onClick={() => updateShoppingListItem(item.id, { isPurchased: false })}
                                aria-label={`Undo purchased ${item.name}`}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D2A2E] border border-[#1D2A2E] grid place-items-center text-white shrink-0 shadow-sm hover:bg-[#0F1A1C] transition-colors"
                              >
                                <CheckIcon size={13} />
                              </motion.button>

                              <div className="flex-1 min-w-0 flex items-center gap-3">
                                <div className="hidden sm:grid w-12 h-12 rounded-[14px] bg-[#F5F0E8] border border-[#E8E0D0] place-items-center shrink-0">
                                  <div className="text-center leading-none opacity-60">
                                    <div className="font-display font-extrabold text-[13px] tracking-tight text-[#0F1A1C] line-through">{qtyBadge(item.quantity)}</div>
                                    <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF]">{item.unit}</div>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-display font-bold text-[14px] leading-tight tracking-tight text-[#6B7280] capitalize truncate line-through">{item.name}</div>
                                  <div className="font-mono text-[11px] text-[#9CA3AF] mt-1">
                                    {qtyBadge(item.quantity)} {item.unit} • purchased
                                  </div>
                                </div>
                              </div>

                              <motion.button
                                whileHover={prefersReduced ? {} : { scale: 1.06 }}
                                whileTap={prefersReduced ? {} : { scale: 0.95 }}
                                onClick={() => deleteShoppingListItem(item.id)}
                                className="w-8 h-8 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#9CA3AF] hover:text-[#B85C4A] hover:border-[#B85C4A]/20 transition-colors shrink-0"
                              >
                                <TrashIcon size={13} />
                              </motion.button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">Completion • smooth movement</span>
                      {!filter && (
                        <button
                          onClick={clearPurchasedShoppingList}
                          className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-bold text-[#6B7280] hover:border-[#0F1A1C] hover:text-[#0F1A1C] transition-colors"
                        >
                          Clear purchased
                        </button>
                      )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add Modal — editorial sheet ── */}
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
                <div className="h-[3px] w-full bg-[#0F1A1C]" />
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.14em] font-semibold text-[#9CA3AF] uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C] animate-pulse" />
                        Shopping • New item
                      </div>
                      <h3 className="font-serif text-[22px] leading-none tracking-[-0.02em] text-[#0F1A1C] mt-2">
                        Add <span className="font-display font-extrabold">shopping item</span><span className="font-serif italic font-normal text-[#C45A3C]">.</span>
                      </h3>
                      <p className="text-xs leading-relaxed text-[#6B7280] mt-1.5 max-w-[30ch]" style={{ fontFamily: "Inter, sans-serif" }}>Quantity hierarchy, tactile check — built for the aisle.</p>
                    </div>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="w-8 h-8 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:text-[#0F1A1C] hover:border-[#0F1A1C]/15 transition-colors shrink-0"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>

                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] tracking-[0.12em] font-semibold text-[#6B7280] uppercase mb-1.5">Item name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Olive Oil, Garlic, Eggs"
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

                    <div className="rounded-[16px] bg-white border border-dashed border-[#E8E0D0] p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] shrink-0">
                        <ShoppingCartIcon size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs text-[#0F1A1C] leading-none">Preview</div>
                        <div className="font-mono text-[11px] text-[#6B7280] mt-1 truncate">
                          {name.trim() ? `${name.trim()} — ${qtyBadge(Number(quantity) || 1)} ${unit}` : "Your item will appear like this in the list"}
                        </div>
                      </div>
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
                        className="px-6 py-2.5 rounded-full text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(15,26,28,0.14)]"
                        style={{ background: "#0F1A1C" }}
                      >
                        Add to list
                      </motion.button>
                    </div>
                  </form>
                </div>
                <div className="h-px w-full bg-[#E8E0D0]/60" />
                <div className="px-6 sm:px-7 py-3 flex items-center justify-between bg-white/60">
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">Veyra • Checklist</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
