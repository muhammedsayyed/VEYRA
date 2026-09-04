import React, { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { CheckIcon, SparklesIcon } from "@/components/icons"

const dietaryOptions = ["Mediterranean", "Low Carb", "High Protein", "Balanced", "Vegetarian", "Vegan", "Keto", "Gluten Free", "Halal"]
const allergenOptions = ["Gluten", "Peanuts", "Tree Nuts", "Dairy", "Eggs", "Soy", "Shellfish", "Sesame"]
const cuisineOptions = ["Egyptian", "Italian", "Japanese", "Mexican", "Indian", "Thai", "Greek", "French", "American", "Chinese", "Korean", "Turkish", "Moroccan", "Brazilian", "British", "German", "Spanish", "Nigerian", "Saudi", "Emirati"]

const easeVeyra = [0.16, 1, 0.3, 1] as const

export default function Preferences() {
  const { user, updateUser, addToast } = useApp()
  const [saving, setSaving] = useState(false)
  const prefersReduced = useReducedMotion()

  const toggleArray = (field: 'dietaryPreferences' | 'allergens' | 'favoriteCuisines', value: string) => {
    const current = (user as any)[field] as string[] || []
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    updateUser({ [field]: next } as any)
    addToast(`${value} ${current.includes(value) ? 'removed' : 'added'}`, "success")
  }

  const handleSave = async () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      addToast("Preferences saved", "success")
    }, 400)
  }

  const dietaryActive = (user.dietaryPreferences || []).length
  const allergenActive = (user.allergens || []).length
  const cuisineActive = (user.favoriteCuisines || []).length

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReduced ? 0 : 0.45, ease: easeVeyra }}
      className="screen-scroll bg-[#FFFBF5] relative"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-20 w-[520px] h-[520px] rounded-full opacity-[0.025]" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
        <div className="absolute top-[42%] -left-24 w-[560px] h-[560px] rounded-full opacity-[0.02]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 H40 M20 0 V40' stroke='%230F1A1C' stroke-opacity='0.04' stroke-width='0.5'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative max-w-[1160px] mx-auto">
        {/* Header — atelier control */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.5, ease: easeVeyra }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-[#E8E0D0] bg-white shadow-[0_12px_36px_rgba(15,26,28,0.06)] mb-6"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
            <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full opacity-[0.025]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
          </div>
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[10px] font-700 tracking-[0.14em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" /> Atelier Control
              </span>
              <span className="h-px w-6 bg-[#E8E0D0] hidden sm:block" />
              <span className="label-mono hidden sm:inline !text-[#8A9A8B]">Taste • Safety • Ritual • No. 041</span>
              <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E0D0] text-xs font-700 text-[#0F1A1C]">{dietaryActive + allergenActive + cuisineActive} selections active</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 label-mono !text-[#C45A3C]">
                  <span className="w-6 h-px bg-[#E8E0D0]" /> Veyra Control Centre • No. 041
                </div>
                <h1 className="font-display font-800 tracking-tight text-[#0F1A1C] text-[28px] sm:text-[34px] leading-none mt-2">
                  Your taste, <span className="font-serif italic font-400 text-[#8A9A8B]">refined.</span>
                </h1>
                <p className="text-[13px] leading-relaxed text-[#6B7280] mt-3 max-w-[58ch]">
                  Curate your palate and safety filters like an atelier samples board. Veyra uses this to shape{" "}
                  <span className="font-700 text-[#0F1A1C]">Discover</span>, <span className="font-700 text-[#0F1A1C]">Meal Planner</span>, and every <span className="font-700 text-[#0F1A1C]">AI suggestion</span> — instantly.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-xs font-700">{dietaryActive} diets</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-xs font-700 text-[#0F1A1C]"><span className="w-1.5 h-1.5 rounded-full bg-[#B85C4A]" /> {allergenActive} allergens</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-xs font-700 text-[#0F1A1C]">✦ {cuisineActive} cuisines</span>
                </div>
              </div>
              <div className="hidden lg:block text-right shrink-0">
                <div className="inline-flex flex-col items-start gap-2 p-4 rounded-2xl bg-white border border-[#E8E0D0] text-left shadow-sm">
                  <div className="label-mono">Profile Sync • Dossier</div>
                  <div className="text-xs font-700 text-[#0F1A1C] leading-relaxed">
                    dietaryPreferences<br />
                    allergens • favoriteCuisines
                  </div>
                  <div className="text-[11px] text-[#6B7280]">units • theme • ai frequency</div>
                  <div className="h-px w-full bg-[#E8E0D0] my-1" />
                  <span className="label-mono !text-[9px]">Encrypted • Everywhere</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-px bg-[#E8E0D0]/60" />
          <div className="px-6 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-white">
            <span className="label-mono !text-[9px]">Veyra Intelligence • Private by design • Paper & Ink</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-600 text-[#6B7280]">Saves are instant <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /></span>
          </div>
        </motion.div>

        {/* Bento — atelier board */}
        <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-4 sm:gap-5">
          {/* Left column — Diets + Cuisines */}
          <div className="space-y-4 sm:space-y-5">
            {/* Dietary — swatch library */}
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReduced ? 0 : 0.05, duration: 0.42, ease: easeVeyra }}
              className="rounded-[24px] sm:rounded-[28px] border border-[#E8E0D0] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,26,28,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="hidden sm:grid w-9 h-9 rounded-xl bg-[#0F1A1C] text-white place-items-center shrink-0">
                    <SparklesIcon size={14} />
                  </span>
                  <div>
                    <h3 className="font-display font-800 text-[16px] tracking-tight text-[#0F1A1C] flex items-center gap-2">
                      Dietary Preferences <span className="hidden sm:inline-flex label-mono px-2 py-1 rounded-full bg-white border border-[#E8E0D0]">{dietaryOptions.length} swatches</span>
                    </h3>
                    <p className="text-xs leading-relaxed text-[#6B7280] mt-1 max-w-[42ch]">Select the diets you follow. Personalizes Discover, Planner, and AI recipes — toggle like fabric swatches.</p>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-xs font-700">{dietaryActive} active</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
                {dietaryOptions.map((opt) => {
                  const active = (user.dietaryPreferences || []).includes(opt)
                  return (
                    <motion.button
                      key={opt}
                      onClick={() => toggleArray("dietaryPreferences", opt)}
                      layout
                      whileHover={prefersReduced ? {} : { y: -1 }}
                      whileTap={prefersReduced ? {} : { scale: 0.98 }}
                      className={`group relative text-left rounded-2xl border p-3.5 flex items-center justify-between gap-2 transition-all overflow-hidden ${active ? "bg-[#0F1A1C] border-[#0F1A1C] text-white shadow-[0_6px_16px_rgba(15,26,28,0.14)]" : "bg-white border-[#E8E0D0] text-[#0F1A1C] hover:border-[#0F1A1C] hover:shadow-sm"}`}
                    >
                      <span className={`relative text-[13px] font-700 leading-tight ${active ? "text-white" : "text-[#0F1A1C]"}`}>{opt}</span>
                      <span className={`relative w-6 h-6 rounded-full grid place-items-center border shrink-0 text-xs ${active ? "bg-white text-[#0F1A1C] border-white" : "bg-white border-[#E8E0D0] text-[#9CA3AF] group-hover:border-[#0F1A1C] group-hover:text-[#0F1A1C]"}`}>
                        {active ? <CheckIcon size={12} /> : "+"}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-5 flex items-center gap-2 label-mono">
                <span className="h-px flex-1 bg-[#E8E0D0]/60" />
                Swatch board • Tap to pin
                <span className="h-px flex-1 bg-[#E8E0D0]/60" />
              </div>
            </motion.div>

            {/* Cuisines — mosaic, ink selected not orange */}
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReduced ? 0 : 0.08, duration: 0.42, ease: easeVeyra }}
              className="rounded-[24px] sm:rounded-[28px] border border-[#E8E0D0] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,26,28,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-800 text-[16px] tracking-tight text-[#0F1A1C]">Favorite Cuisines</h3>
                  <p className="text-xs leading-relaxed text-[#6B7280] mt-1">Helps “What Should I Eat?” prioritize your favorites. Choose up to 20 — mosaic, not blocks.</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-[#E8E0D0] text-xs font-700 text-[#0F1A1C]">{cuisineActive} / {cuisineOptions.length}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {cuisineOptions.map((opt) => {
                  const active = (user.favoriteCuisines || []).includes(opt)
                  return (
                    <motion.button
                      key={opt}
                      onClick={() => toggleArray("favoriteCuisines", opt)}
                      layout
                      whileHover={prefersReduced ? {} : { y: -1 }}
                      whileTap={prefersReduced ? {} : { scale: 0.98 }}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-600 border transition-all ${active ? "bg-[#0F1A1C] border-[#0F1A1C] text-white shadow-sm" : "bg-white border-[#E8E0D0] text-[#6B7280] hover:border-[#0F1A1C] hover:text-[#0F1A1C] hover:bg-[#FFFBF5]"}`}
                    >
                      {opt} {active && "•"}
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-[#E8E0D0] bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
                <span className="w-7 h-7 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] text-xs">✦</span>
                <p className="text-xs leading-relaxed text-[#6B7280]">
                  Your AI and Discover feed now lean toward <span className="font-700 text-[#0F1A1C]">{cuisineActive ? (user.favoriteCuisines || []).slice(0, 3).join(", ") : "your chosen"}</span> cuisines first.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right column — Allergens + Settings */}
          <div className="space-y-4 sm:space-y-5">
            {/* Allergens — safety ledger, not orange blocks */}
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReduced ? 0 : 0.06, duration: 0.42, ease: easeVeyra }}
              className="rounded-[24px] sm:rounded-[28px] border border-[#E8E0D0] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,26,28,0.05)]"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-white border border-[#E8E0D0] text-[#0F1A1C] grid place-items-center text-xs">⚑</span>
                <h3 className="font-display font-800 text-[16px] tracking-tight text-[#0F1A1C]">Allergens & Safety</h3>
                {allergenActive > 0 ? (
                  <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-xs font-700"><span className="w-1.5 h-1.5 rounded-full bg-[#B85C4A]" /> {allergenActive} flagged</span>
                ) : (
                  <span className="ml-auto px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-700 text-[#6B7280]">None flagged</span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-[#6B7280] mt-2">We’ll warn you when a recipe or scan contains these. Ledger tickets, not loud banners.</p>

              <div className="grid grid-cols-2 gap-2.5 mt-5">
                {allergenOptions.map((opt) => {
                  const active = (user.allergens || []).includes(opt)
                  return (
                    <motion.button
                      key={opt}
                      onClick={() => toggleArray("allergens", opt)}
                      layout
                      whileHover={prefersReduced ? {} : { y: -1 }}
                      whileTap={prefersReduced ? {} : { scale: 0.98 }}
                      className={`relative overflow-hidden rounded-2xl border px-3.5 py-3 text-left flex items-center justify-between gap-2 transition-all ${active ? "bg-[#0F1A1C] border-[#0F1A1C] text-white shadow-[0_6px_16px_rgba(15,26,28,0.14)]" : "bg-white border-[#E8E0D0] text-[#0F1A1C] hover:border-[#0F1A1C] hover:shadow-sm"}`}
                    >
                      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${active ? "bg-[#B85C4A]" : "bg-transparent"}`} />
                      <span className={`text-[13px] font-700 pl-1 ${active ? "text-white" : "text-[#0F1A1C]"}`}>{opt}</span>
                      <span className={`w-6 h-6 rounded-full grid place-items-center border text-xs shrink-0 ${active ? "bg-white text-[#0F1A1C] border-white" : "bg-white border-[#E8E0D0] text-[#9CA3AF]"}`}>{active ? "✓" : "○"}</span>
                    </motion.button>
                  )
                })}
              </div>
              <div className="mt-4 h-px bg-[#E8E0D0]/60" />
              <p className="label-mono text-center mt-3">Ticket ledger • Toggle to protect</p>
            </motion.div>

            {/* App Settings — atelier switches */}
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReduced ? 0 : 0.1, duration: 0.42, ease: easeVeyra }}
              className="rounded-[24px] sm:rounded-[28px] border border-[#E8E0D0] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,26,28,0.05)]"
            >
              <h3 className="font-display font-800 text-[16px] tracking-tight text-[#0F1A1C]">Atelier Settings</h3>
              <p className="text-xs text-[#6B7280] mt-1">Units, theme, and Veyra’s nudge cadence — tactile switches.</p>

              <div className="mt-5 divide-y divide-[#E8E0D0]/60 rounded-2xl border border-[#E8E0D0] overflow-hidden">
                <div className="flex items-center justify-between gap-4 p-4 bg-white">
                  <div className="min-w-0">
                    <div className="text-sm font-700 text-[#0F1A1C]">Units</div>
                    <div className="text-xs text-[#6B7280]">Metric / Imperial</div>
                  </div>
                  <button
                    onClick={() => updateUser({ units: user.units === "metric" ? "imperial" : "metric" })}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F1A1C] text-white text-xs font-700 shadow-sm hover:bg-[#1D2A2E] transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${user.units === "metric" ? "bg-[#8A9A8B]" : "bg-white/40"}`} />
                    {user.units === "metric" ? "Metric" : "Imperial"}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 p-4 bg-[#FFFBF5]/30">
                  <div className="min-w-0">
                    <div className="text-sm font-700 text-[#0F1A1C]">Theme</div>
                    <div className="text-xs text-[#6B7280]">Light / Dark / System</div>
                  </div>
                  <span className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-[#E8E0D0] text-xs font-700 capitalize text-[#0F1A1C]">{user.theme}</span>
                </div>

                <div className="flex items-center justify-between gap-4 p-4 bg-white">
                  <div className="min-w-0">
                    <div className="text-sm font-700 text-[#0F1A1C]">AI Frequency</div>
                    <div className="text-xs text-[#6B7280]">How often Veyra speaks up</div>
                  </div>
                  <button
                    onClick={() => {
                      const next = user.aiProactiveFrequency === "high" ? "medium" : user.aiProactiveFrequency === "medium" ? "low" : "high"
                      updateUser({ aiProactiveFrequency: next })
                    }}
                    className="shrink-0 px-4 py-2 rounded-full bg-white border border-[#0F1A1C] text-[#0F1A1C] text-xs font-700 capitalize hover:bg-[#FFFBF5] inline-flex items-center gap-1.5"
                  >
                    {user.aiProactiveFrequency} <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-5 w-full py-3 rounded-full bg-[#0F1A1C] text-white text-sm font-700 shadow-[0_6px_16px_rgba(15,26,28,0.14)] hover:bg-[#1D2A2E] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Atelier Preferences"}
              </button>
              <p className="text-center label-mono mt-2">Stored in your Veyra dossier • Used everywhere</p>
            </motion.div>
          </div>
        </div>

        <p className="text-center text-xs leading-relaxed text-[#9CA3AF] mt-6 max-w-[64ch] mx-auto label-mono !normal-case !tracking-normal !text-[11px]">
          Preferences are stored in your existing Veyra profile (<span className="font-mono text-[#0F1A1C]">dietaryPreferences</span>, <span className="font-mono text-[#0F1A1C]">allergens</span>, <span className="font-mono text-[#0F1A1C]">favoriteCuisines</span>,{" "}
          <span className="font-mono text-[#0F1A1C]">units</span>, <span className="font-mono text-[#0F1A1C]">theme</span>) and reused by Discover, Meal Planner and AI.
        </p>
      </div>
    </motion.div>
  )
}
