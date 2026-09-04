import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { SparklesIcon, ChevronRightIcon, SendIcon } from "@/components/icons"
import { VeyraCompanion } from "@/components/VeyraCompanion"
import { VeyraSticker } from "@/components/VeyraSticker"
import { VeyraCharacter } from "@/components/VeyraChar"
import { useApp } from "@/context/AppContext"
import { ChatMessageCard } from "@/types"

const easeVeyra = [0.16, 1, 0.3, 1] as const

export default function AIAssistant() {
  const { user, meals, addWater, addMeal, setScreen, chatMessages, sendMessage, mascotMood, isAiTyping } = useApp()
  // extended context for ledger (non-breaking additive)
  const { pantryItems, waterLiters } = useApp() as any

  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (chatMessages.length > 1 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: prefersReduced ? "auto" : "smooth",
      })
    }
  }, [chatMessages, prefersReduced])

  const quickActions = [
    { label: "What should I eat for dinner?", icon: "◐", action: "dinner" },
    { label: "Am I hitting my protein goal?", icon: "◎", action: "protein" },
    { label: "Give me a high-protein breakfast", icon: "✦", action: "breakfast" },
    { label: "What workout should I do today?", icon: "⬢", action: "workout" },
    { label: "What can I cook with my pantry?", icon: "⬔", action: "pantry" },
    { label: "Help me meal prep for the week", icon: "▭", action: "mealprep" },
    { label: "How much water should I drink?", icon: "⬥", action: "water" },
    { label: "Analyze my nutrition this week", icon: "⬚", action: "analyze" },
  ]

  const handleSend = (text: string) => {
    if (!text.trim()) return
    sendMessage(text)
    setInput("")
    setShowQuickActions(false)
  }

  const handleVoiceInput = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      handleSend("Give me a high-protein breakfast idea")
    }, 2400)
  }

  const handleCardAction = (card: ChatMessageCard) => {
    if (card.actionType === "add_food" && card.payload) {
      addMeal({
        foodId: card.payload.id || "prod-3",
        name: card.payload.name || card.title,
        sectionId: "snack",
        servings: 1,
        grams: card.payload.portionGrams || 150,
        calories: card.payload.calories || 150,
        protein: card.payload.protein || 20,
        carbs: card.payload.carbs || 10,
        fat: card.payload.fat || 5,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        img: card.payload.img || "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=80&h=80&fit=crop&auto=format",
      })
    } else if (card.actionType === "start_workout") {
      setScreen("fitness")
    } else if (card.actionType === "log_water") {
      addWater(0.25)
    } else {
      setScreen("discover")
    }
  }

  const totalCal = meals.reduce((s, m) => s + m.calories, 0)
  const calLeft = Math.max(user.dailyCalories - totalCal, 0)
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0)
  const proteinLeft = Math.max(user.dailyProtein - totalProtein, 0)
  const firstName = user.name?.split(" ")[0] ?? "there"
  const proteinPct = Math.min(100, Math.round((totalProtein / user.dailyProtein) * 100))
  const calPct = Math.min(100, Math.round((totalCal / user.dailyCalories) * 100))

  const todayMeals = meals.slice(-4).reverse()
  const pantryCount = Array.isArray(pantryItems) ? pantryItems.length : 0

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReduced ? 0 : 0.45, ease: easeVeyra }}
      className="flex flex-col h-full w-full max-w-full overflow-hidden relative bg-[#FFFBF5]"
      style={{ fontVariantLigatures: "common-ligatures" }}
    >
      {/* ambient — drafting grain, very subtle */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 w-[520px] h-[520px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 72%)" }} />
        <div className="absolute top-[58%] -left-20 w-[480px] h-[480px] rounded-full opacity-[0.025]" style={{ background: "radial-gradient(circle, #8A9A8B 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E")` }} />
      </div>

      {/* ── Letterhead — minimal, editorial ── */}
      <div className="shrink-0 relative z-20 border-b border-[#E8E0D0] bg-white/90 backdrop-blur-xl">
        <div className="relative flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-white border border-[#E8E0D0] grid place-items-center overflow-hidden p-1">
              <VeyraSticker name="doc" size={32} alt="Veyra doc" />
            </div>
            <div className="hidden sm:block h-8 w-px bg-[#E8E0D0]" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-display font-800 tracking-tight text-[13px] text-[#0F1A1C]">VEYRA</span>
                <span className="font-serif italic text-[13px] text-[#8A9A8B]">Intelligence</span>
                <span className="w-1 h-1 rounded-full bg-[#C45A3C]" />
                <span className="label-mono text-[#C45A3C] !text-[9px]">No. 041</span>
              </div>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#6B7280] leading-none mt-0.5">Companion • Context-aware • Private</div>
            </div>
            <div className="sm:hidden">
              <div className="font-display font-800 text-[13px] leading-none text-[#0F1A1C]">Veyra <span className="font-serif italic font-400 text-[#8A9A8B]">AI</span></div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#6B7280]">Live • {calLeft} kcal</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 ml-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[11px] font-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" /> {user.goal}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-700 text-[#0F1A1C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B]" /> {proteinLeft}g protein
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[11px] font-700 text-[#0F1A1C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]" /> {calLeft.toLocaleString()} kcal
            </span>
          </div>

          <div className="ml-auto lg:ml-2 flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F0E8]/0 border border-[#E8E0D0] text-[11px] font-mono font-600 text-[#6B7280]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> {chatMessages.length} turns
            </span>
            <span className="inline-flex lg:hidden px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[10px] font-700 tracking-wide">LIVE</span>
            <button
              onClick={() => { setShowQuickActions(v=>!v); inputRef.current?.focus() }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#0F1A1C] text-[#0F1A1C] text-xs font-700 hover:bg-[#0F1A1C] hover:text-white transition-colors"
            >
              <SparklesIcon size={12} /> Prompts
            </button>
          </div>
        </div>
        {/* hairline with motion shimmer */}
        <div className="relative h-px bg-[#E8E0D0]/60 overflow-hidden">
          {!prefersReduced && (
            <motion.div
              animate={{ x: ["-110%", "210%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-y-0 w-1/4"
              style={{ background: "linear-gradient(90deg, transparent, rgba(196,90,60,0.35), transparent)" }}
            />
          )}
        </div>
      </div>

      {/* ── Main atelier — dock / canvas / ledger — balanced viewport ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative z-10 py-4 sm:py-5 gap-3 lg:gap-4 items-stretch">
        {/* Left dock — 340px atelier companion */}
        <div className="hidden lg:flex w-[340px] shrink-0 flex-col border-r border-[#E8E0D0] bg-white/60 backdrop-blur-xl overflow-hidden">
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 flex flex-col gap-4">
            {/* Companion stage — paper-cut, focal */}
            <div className="rounded-[22px] border border-[#E8E0D0] bg-white shadow-[0_8px_24px_rgba(15,26,28,0.06)] overflow-hidden">
              <div className="px-4 pt-4 flex items-center justify-between">
                <span className="label-mono text-[#8A9A8B]">Companion Atelier</span>
                <span className="w-6 h-6 rounded-full border border-dashed border-[#E8E0D0] grid place-items-center text-[9px] text-[#9CA3AF]">◎</span>
              </div>
              <div className="px-4 pb-5 flex flex-col items-center text-center flex-1 justify-center min-h-[280px] sm:min-h-[320px]">
                <div className="relative flex-1 flex items-center justify-center w-full min-h-[190px] sm:min-h-[220px] py-2 px-1">
                  <div className="absolute inset-0 blur-2xl opacity-[0.08] rounded-full" style={{ background: "#8A9A8B" }} />
                  <VeyraSticker name="doc" size={260} alt="Veyra doc companion" className="w-[200px] sm:w-[240px] lg:w-[270px] h-auto" float={true} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[11px] font-700 shadow-sm shrink-0">
                  <span className="w-1 h-1 rounded-full bg-[#E07A5F] animate-pulse" /> Synced to your day
                </div>
                <p className="text-[12.5px] leading-relaxed text-[#6B7280] mt-2.5 max-w-[28ch]">
                  I hold your <span className="font-700 text-[#0F1A1C]">{meals.length} meals</span>, pantry, and <span className="font-700 text-[#0F1A1C]">{user.goal.toLowerCase()}</span> plan — every answer is tuned.
                </p>
                {/* bento stats — not beige heavy: white with hairline + accent */}
                <div className="mt-3.5 grid grid-cols-3 gap-2 w-full">
                  <div className="rounded-2xl bg-white border border-[#E8E0D0] p-2.5 text-center">
                    <div className="h-1 w-full rounded-full bg-[#E8E0D0] overflow-hidden mb-2">
                      <div className="h-full bg-[#0F1A1C]" style={{ width: `${calPct}%` }} />
                    </div>
                    <div className="label-mono !text-[8px] text-[#9CA3AF]">Kcal left</div>
                    <div className="font-display font-800 text-[13px] text-[#0F1A1C]">{calLeft}</div>
                  </div>
                  <div className="rounded-2xl bg-white border border-[#E8E0D0] p-2.5 text-center">
                    <div className="h-1 w-full rounded-full bg-[#E8E0D0] overflow-hidden mb-2">
                      <div className="h-full bg-[#8A9A8B]" style={{ width: `${proteinPct}%` }} />
                    </div>
                    <div className="label-mono !text-[8px] text-[#9CA3AF]">Protein</div>
                    <div className="font-display font-800 text-[13px] text-[#1D2A2E]">{proteinLeft}g</div>
                  </div>
                  <div className="rounded-2xl bg-white border border-[#E8E0D0] p-2.5 text-center">
                    <div className="label-mono !text-[8px] text-[#9CA3AF]">Pantry</div>
                    <div className="font-display font-800 text-[13px] text-[#C45A3C]">{pantryCount}</div>
                    <div className="font-mono text-[9px] text-[#9CA3AF]">{waterLiters?.toFixed ? `${waterLiters.toFixed(1)}L water` : `${meals.length} meals`}</div>
                  </div>
                </div>
              </div>
              <div className="h-px bg-[#E8E0D0]/70" />
              <div className="px-4 py-2.5 flex items-center justify-between bg-[#FFFBF5]/50">
                <span className="label-mono !text-[9px] text-[#9CA3AF]">Paper • Ink • Sage • No. 041</span>
                <span className="font-mono text-[10px] text-[#C45A3C] font-700">{proteinPct}% protein</span>
              </div>
            </div>

            {/* Today's plate — ledger */}
            <div className="rounded-[18px] border border-[#E8E0D0] bg-white overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-[#E8E0D0]/60 flex items-center justify-between bg-white">
                <span className="label-mono text-[#6B7280]">Today’s plate</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#0F1A1C] text-white font-700">{meals.length} meals</span>
              </div>
              <div className="divide-y divide-[#F5F0E8]">
                {todayMeals.length === 0 ? (
                  <div className="px-3.5 py-4 text-[12px] leading-relaxed text-[#6B7280]">No meals yet — log breakfast or ask Veyra for a gentle start.</div>
                ) : todayMeals.map((m, idx) => (
                  <div key={m.id} className="flex items-center gap-2.5 px-3.5 py-2.5">
                    <span className="w-8 h-8 rounded-xl overflow-hidden border border-[#E8E0D0] shrink-0 bg-white">
                      <img src={m.img} alt="" className="w-full h-full object-cover" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-600 leading-tight text-[#0F1A1C] truncate">{m.name}</div>
                      <div className="font-mono text-[10px] text-[#9CA3AF]">{m.time} • {m.calories} kcal • {m.protein}g P</div>
                    </div>
                    <span className={`w-1 self-stretch rounded-full ${idx % 3 === 0 ? "bg-[#0F1A1C]" : idx % 3 === 1 ? "bg-[#8A9A8B]" : "bg-[#C45A3C]"} opacity-60`} />
                  </div>
                ))}
              </div>
              {todayMeals.length > 0 && (
                <div className="px-3.5 py-2 bg-[#FFFBF5]/40 border-t border-[#E8E0D0]/60 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#6B7280]">{totalCal} kcal • {totalProtein}g protein today</span>
                  <button onClick={()=> setScreen("log")} className="text-[11px] font-700 text-[#0F1A1C] hover:text-[#C45A3C]">Open log →</button>
                </div>
              )}
            </div>

            {/* Quick ledger — numbered, not beige circles */}
            <div className="rounded-[18px] border border-[#E8E0D0] bg-white overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-[#E8E0D0]/60 flex items-center justify-between">
                <span className="label-mono text-[#6B7280]">Suggested • Tap to send</span>
                <button onClick={() => setShowQuickActions(v=>!v)} className="w-6 h-6 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:text-[#0F1A1C] hover:border-[#0F1A1C] text-xs transition-colors">
                  {showQuickActions ? "−" : "+"}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {showQuickActions && (
                  <motion.div
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: prefersReduced ? 0 : 0.35, ease: easeVeyra }}
                    className="divide-y divide-[#F5F0E8]"
                  >
                    {quickActions.map((a, i) => (
                      <motion.button
                        key={a.label}
                        initial={prefersReduced ? {} : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: prefersReduced ? 0 : 0.02 * i, duration: 0.32, ease: easeVeyra }}
                        onClick={() => handleSend(a.label)}
                        className="group w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FFFBF5] transition-colors"
                      >
                        <span className="font-mono text-[10px] tracking-[0.14em] text-[#9CA3AF] w-7 shrink-0">0{i+1}</span>
                        <span className="w-px h-6 bg-[#E8E0D0] shrink-0" />
                        <span className="text-[12.5px] font-600 leading-tight text-[#0F1A1C] flex-1 group-hover:text-[#0F1A1C]">{a.label}</span>
                        <span className="w-6 h-6 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[10px] text-[#9CA3AF] group-hover:bg-[#0F1A1C] group-hover:text-white group-hover:border-[#0F1A1C] transition-colors shrink-0"><ChevronRightIcon size={12} /></span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="label-mono !text-[9px] text-center text-[#9CA3AF] px-2">Paper grain • Ink ledger • Every prompt uses your live macros</p>
          </div>
        </div>

        {/* Center canvas — conversation — flex-1 with centered welcome */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#FFFBF5]">
          <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [&::-webkit-scrollbar]:hidden flex flex-col">
            <div className={`flex-1 min-h-0 flex flex-col px-3 sm:px-5 lg:px-6 pt-3 sm:pt-5 lg:pt-6 pb-4 sm:pb-5 max-w-[720px] mx-auto w-full gap-4 sm:gap-5 ${chatMessages.length <= 1 ? "justify-center" : "justify-start"}`}>
              {/* Welcome — editorial letter — centered when empty */}
              {chatMessages.length <= 1 && (
                <motion.div
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReduced ? 0 : 0.5, ease: easeVeyra }}
                  className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] border border-[#E8E0D0] bg-white shadow-[0_8px_28px_rgba(15,26,28,0.06)]"
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-16 -right-12 w-48 h-48 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #0F1A1C 0%, transparent 70%)" }} />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8E0D0] to-transparent" />
                  </div>
                  <div className="relative p-4 sm:p-5">
                    <div className="flex gap-3 sm:gap-4 items-start">
                      <div className="hidden sm:grid w-11 h-11 rounded-2xl bg-white border border-[#E8E0D0] place-items-center shrink-0 overflow-hidden p-1">
                        <VeyraSticker name="doc" size={36} alt="Veyra doc companion" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0F1A1C] text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
                          <span className="font-mono text-[9px] tracking-[0.14em] uppercase font-700">Veyra Companion • Live context</span>
                        </div>
                        <h3 className="font-serif text-[17px] sm:text-[19px] leading-snug tracking-tight text-[#0F1A1C] mt-2">
                          Hi {firstName} — I know your <span className="font-display font-800 tracking-tight text-[#C45A3C]">{user.goal.toLowerCase()}</span> plan and today’s plate.
                        </h3>
                        <p className="text-[12.5px] leading-relaxed text-[#6B7280] mt-1.5 max-w-[50ch]">
                          Ask for pantry cooking, protein ideas, or a gentle nudge. I’ll shape every suggestion around your <span className="font-700 text-[#0F1A1C]">{calLeft.toLocaleString()} kcal</span> and <span className="font-700 text-[#0F1A1C]">{proteinLeft}g protein</span> left.
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                          {['“What can I cook with my pantry?”', '“Am I hitting my protein?”', '“Dinner under 500 kcal”'].map((q) => (
                            <button
                              key={q}
                              onClick={() => handleSend(q.replace(/[""]/g, ""))}
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-[#E8E0D0] text-[11.5px] sm:text-[12px] font-600 text-[#0F1A1C] hover:bg-[#0F1A1C] hover:text-white hover:border-[#0F1A1C] hover:-translate-y-px transition-all"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-[#E8E0D0]/70" />
                  <div className="px-4 sm:px-5 py-2 flex items-center justify-between bg-[#FFFBF5]/30">
                    <span className="label-mono !text-[9px] text-[#9CA3AF]">Private • On-device context • Encrypted</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-600 text-[#C45A3C]">Try a prompt <ChevronRightIcon size={12} /></span>
                  </div>
                </motion.div>
              )}

              {/* Timeline ribbon */}
              <div className="flex items-center gap-2.5 py-1">
                <div className="h-px flex-1 bg-[#E8E0D0]/60" />
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#6B7280]">Today • {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })} • {chatMessages.length} turns</span>
                <div className="h-px flex-1 bg-[#E8E0D0]/60" />
              </div>

              {/* Messages — correspondence timeline */}
              <div className="flex flex-col gap-5 sm:gap-6">
                <AnimatePresence initial={false}>
                  {chatMessages.map((msg, idx) => {
                    const isAI = msg.role === "ai"
                    return (
                      <motion.div
                        key={msg.id}
                        layout={prefersReduced ? false : true}
                        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                        transition={{ duration: prefersReduced ? 0 : 0.38, ease: easeVeyra }}
                        className={`flex gap-2.5 sm:gap-3 w-full ${isAI ? "" : "flex-row-reverse"}`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isAI ? (
                            <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E8E0D0] shadow-sm grid place-items-center overflow-hidden p-0.5">
                              <VeyraSticker name="doc" size={26} alt="Veyra doc" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-[#0F1A1C] grid place-items-center text-white text-[12px] font-800 shadow-sm">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className={`flex flex-col min-w-0 flex-1 max-w-[86%] sm:max-w-[72%] ${isAI ? "items-start" : "items-end"}`}>
                          <div className={`flex items-center gap-1.5 mb-1 ${isAI ? "" : "flex-row-reverse"}`}>
                            <span className={`text-[11px] font-700 ${isAI ? "text-[#0F1A1C]" : "text-[#6B7280]"}`}>{isAI ? "Veyra" : "You"}</span>
                            <span className="font-mono text-[10px] text-[#9CA3AF]">{msg.timestamp || "now"}</span>
                            {isAI && <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#E8E0D0]" />}
                            {isAI && <span className="hidden sm:inline label-mono !text-[9px] text-[#C45A3C]">Intelligence</span>}
                            <span className="hidden sm:inline font-mono text-[9px] text-[#9CA3AF]">#{String(idx+1).padStart(2,"0")}</span>
                          </div>

                          <motion.div
                            initial={prefersReduced ? {} : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: prefersReduced ? 0 : 0.03 }}
                            className={`relative px-3.5 sm:px-4 py-2.5 sm:py-3 text-[13.5px] leading-[1.6] break-words whitespace-pre-wrap w-fit max-w-full shadow-sm ${
                              isAI
                                ? "bg-white border border-[#E8E0D0] rounded-[16px] rounded-tl-[6px] text-[#1D2A2E]"
                                : "bg-[#0F1A1C] text-[#FFFBF5] rounded-[16px] rounded-tr-[6px] font-[450] shadow-[0_6px_16px_rgba(15,26,28,0.14)]"
                            }`}
                          >
                            {isAI && <span className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#E8E0D0]/50 to-transparent pointer-events-none" />}
                            {msg.text}
                          </motion.div>

                          {msg.cards && msg.cards.length > 0 && (
                            <motion.div
                              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: prefersReduced ? 0 : 0.06 }}
                              className="flex flex-col gap-2 mt-2.5 w-full"
                            >
                              {msg.cards.map((card, i) => (
                                <motion.div
                                  key={i}
                                  initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: prefersReduced ? 0 : 0.04 * i, duration: 0.38, ease: easeVeyra }}
                                  className="group relative overflow-hidden rounded-[16px] border bg-white flex gap-3 p-3 sm:p-3.5 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,26,28,0.07)] transition-all"
                                  style={{ borderColor: "#E8E0D0" }}
                                >
                                  <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: card.color || "#0F1A1C" }} />
                                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E0D0] grid place-items-center text-[#0F1A1C] shrink-0 mt-0.5">
                                    <span className="text-xs">{card.type === "nutrition" ? "◐" : card.type === "food" ? "⬔" : "✦"}</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="font-display font-700 text-[13px] leading-tight text-[#0F1A1C]">{card.title}</p>
                                      <span className="shrink-0 text-[11px] font-mono font-700 tracking-wide px-2 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C]">{card.value}</span>
                                    </div>
                                    <p className="text-[11.5px] leading-snug text-[#6B7280] mt-0.5">{card.subtitle}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                      <motion.button
                                        whileHover={prefersReduced ? {} : { scale: 1.01 }}
                                        whileTap={prefersReduced ? {} : { scale: 0.99 }}
                                        onClick={() => handleCardAction(card)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0F1A1C] text-white text-[11px] font-700 hover:bg-[#1D2A2E] transition-colors"
                                      >
                                        {card.actionLabel || "Action"} <ChevronRightIcon size={12} />
                                      </motion.button>
                                      <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#9CA3AF]">Tactile slip • Atelier</span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                <AnimatePresence>
                  {isAiTyping && (
                    <motion.div
                      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                      transition={{ duration: prefersReduced ? 0 : 0.28 }}
                      className="flex gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-[#E8E0D0] shadow-sm grid place-items-center overflow-hidden shrink-0 p-0.5">
                        <VeyraSticker name="doc" size={26} alt="Veyra thinking" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[11px] font-700 text-[#0F1A1C]">Veyra</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-[#E8E0D0]">
                            <span className="w-1 h-1 rounded-full bg-[#C45A3C] animate-pulse" />
                            <span className="label-mono !text-[9px] text-[#6B7280]">Composing</span>
                          </span>
                        </div>
                        <div className="px-3.5 py-3 rounded-[16px] rounded-tl-[6px] bg-white border border-[#E8E0D0] shadow-sm inline-flex items-center gap-2.5">
                          <span className="inline-flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                animate={prefersReduced ? {} : { y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.13, ease: "easeInOut" }}
                                className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]"
                              />
                            ))}
                          </span>
                          <span className="text-[11px] font-600 tracking-wide text-[#6B7280]">Understanding your context…</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Mobile quick sheet — horizontal, not stacked */}
              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    className="lg:hidden rounded-[18px] border border-[#E8E0D0] bg-white p-3 shadow-[0_8px_24px_rgba(15,26,28,0.06)]"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="label-mono text-[#6B7280]">Suggested prompts</span>
                      <button onClick={() => setShowQuickActions(false)} className="w-6 h-6 rounded-full bg-white border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:text-[#0F1A1C] text-xs">✕</button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x snap-x">
                      {quickActions.slice(0, 6).map((a, idx) => (
                        <motion.button
                          key={a.label}
                          initial={prefersReduced ? {} : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: prefersReduced ? 0 : 0.03 * idx, duration: 0.32, ease: easeVeyra }}
                          whileTap={prefersReduced ? {} : { scale: 0.98 }}
                          onClick={() => { handleSend(a.label); setShowQuickActions(false) }}
                          className="snap-start shrink-0 inline-flex items-center gap-2 pl-2 pr-3 py-2 rounded-full bg-white border border-[#E8E0D0] hover:border-[#0F1A1C] hover:shadow-sm text-left"
                        >
                          <span className="font-mono text-[10px] w-6 h-6 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0">0{idx+1}</span>
                          <span className="text-[12px] font-600 leading-none text-[#0F1A1C] whitespace-nowrap">{a.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
                    className="rounded-[16px] border border-[#E8E0D0] bg-white p-3.5 flex items-center gap-3 shadow-[0_10px_24px_rgba(15,26,28,0.08)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "linear-gradient(90deg, transparent, rgba(196,90,60,0.05), transparent)" }} />
                    <div className="w-9 h-9 rounded-full bg-[#0F1A1C] grid place-items-center text-white relative shrink-0">
                      {!prefersReduced && <span className="absolute inset-0 rounded-full bg-[#C45A3C] animate-ping opacity-20" />}
                      <span className="relative text-xs">◉</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-700 text-[#0F1A1C] leading-none">Listening…</p>
                      <p className="text-[11.5px] text-[#6B7280] mt-0.5 truncate">Speak naturally — I’ll transcribe</p>
                    </div>
                    <div className="flex items-end gap-1 h-7 shrink-0">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.span
                          key={i}
                          animate={prefersReduced ? {} : { height: ["8px", "22px", "10px"] }}
                          transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
                          className="w-1 rounded-full bg-[#C45A3C]"
                          style={{ height: 14 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Premium Composer — drafting desk, integrated */}
          <div className="shrink-0 relative z-20 px-3 sm:px-5 lg:px-6 pb-3 sm:pb-4 pt-2 bg-gradient-to-t from-[#FFFBF5] via-[#FFFBF5] to-transparent">
            <div className="max-w-[720px] mx-auto w-full">
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[20px] sm:rounded-[22px] bg-white border border-[#E8E0D0] shadow-[0_10px_32px_rgba(15,26,28,0.08),0_1px_6px_rgba(15,26,28,0.04)] p-1.5 flex items-center gap-1.5"
              >
                <div className="absolute inset-0 rounded-[20px] sm:rounded-[22px] pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }} />
                <div className="w-8 h-8 rounded-full bg-white border border-[#E8E0D0] hidden sm:grid place-items-center text-[#9CA3AF] shrink-0">
                  <SparklesIcon size={12} />
                </div>
                <input
                  ref={inputRef}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13.5px] sm:text-[14px] text-[#0F1A1C] placeholder:text-[#9CA3AF] py-2.5 px-1 font-[450]"
                  placeholder="Ask Vey anything — meals, macros, pantry, cravings…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
                />
                <motion.button
                  whileHover={prefersReduced ? {} : { scale: 1.03 }}
                  whileTap={prefersReduced ? {} : { scale: 0.96 }}
                  onClick={handleVoiceInput}
                  title="Voice input"
                  className={`w-9 h-9 sm:w-9 sm:h-9 rounded-full border grid place-items-center shrink-0 transition-colors ${isRecording ? "bg-[#0F1A1C] text-white border-[#0F1A1C] shadow-md" : "bg-white border-[#E8E0D0] text-[#6B7280] hover:text-[#0F1A1C] hover:border-[#0F1A1C]"}`}
                >
                  <MicIcon size={14} />
                </motion.button>
                <motion.button
                  whileHover={prefersReduced ? {} : { scale: input.trim() && !isAiTyping ? 1.02 : 1 }}
                  whileTap={prefersReduced ? {} : { scale: input.trim() && !isAiTyping ? 0.97 : 1 }}
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isAiTyping}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0F1A1C] text-white grid place-items-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_6px_16px_rgba(15,26,28,0.18)] hover:bg-[#1D2A2E] transition-colors"
                >
                  <SendIcon size={14} />
                </motion.button>
              </motion.div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0F1A1C] text-white text-[11px] font-700">
                  <span className="w-1 h-1 rounded-full bg-[#E07A5F]" /> Goal: {user.goal}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C] text-[11px] font-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B]" /> {proteinLeft}g protein
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E8E0D0] text-[#0F1A1C] text-[11px] font-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F1A1C]" /> {calLeft.toLocaleString()} kcal
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-dashed border-[#E8E0D0] text-[#9CA3AF] text-[11px] font-600">
                  {meals.length} meals • {isAiTyping ? "Veyra typing…" : "Live context"}
                </span>
              </div>
              <p className="hidden sm:block text-center font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] mt-1.5">Veyra can make mistakes — verify important nutrition advice.</p>
            </div>
          </div>
        </div>

        {/* Right ledger — contextual, 300px xl */}
        <div className="hidden xl:flex w-[300px] shrink-0 flex-col border-l border-[#E8E0D0] bg-white/50 backdrop-blur-xl overflow-hidden">
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 flex flex-col gap-4">
            <div className="rounded-[18px] border border-[#E8E0D0] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="label-mono text-[#6B7280]">Live ledger</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" />
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">Calories</span>
                    <span className="font-mono text-[10px] font-700 text-[#0F1A1C]">{totalCal} / {user.dailyCalories}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F5F0E8] overflow-hidden">
                    <div className="h-full bg-[#0F1A1C] rounded-full" style={{ width: `${calPct}%` }} />
                  </div>
                  <div className="font-mono text-[10px] text-[#C45A3C] mt-1">{calLeft.toLocaleString()} kcal left</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF]">Protein</span>
                    <span className="font-mono text-[10px] font-700 text-[#1D2A2E]">{totalProtein}g / {user.dailyProtein}g</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F5F0E8] overflow-hidden">
                    <div className="h-full bg-[#8A9A8B] rounded-full" style={{ width: `${proteinPct}%` }} />
                  </div>
                  <div className="font-mono text-[10px] text-[#8A9A8B] mt-1">{proteinLeft}g to goal</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-xl border border-[#E8E0D0] bg-white px-2.5 py-2 text-center">
                    <div className="label-mono !text-[8px]">Meals</div>
                    <div className="font-display font-800 text-sm text-[#0F1A1C]">{meals.length}</div>
                  </div>
                  <div className="rounded-xl border border-[#E8E0D0] bg-white px-2.5 py-2 text-center">
                    <div className="label-mono !text-[8px]">Water</div>
                    <div className="font-display font-800 text-sm text-[#8A9A8B]">{waterLiters?.toFixed ? waterLiters.toFixed(1) : "1.8"}L</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#E8E0D0] bg-white p-4">
              <div className="label-mono text-[#6B7280]">Pantry snapshot</div>
              <p className="text-[12px] leading-relaxed text-[#6B7280] mt-2">
                {pantryCount > 0 ? `${pantryCount} items stored — ask “what can I cook with my pantry?” for instant ideas.` : "No pantry items yet — Veyra can still suggest pantry-friendly meals."}
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                <button onClick={()=> handleSend("What can I cook with my pantry?")} className="w-full py-2 rounded-full bg-white border border-[#0F1A1C] text-[#0F1A1C] text-xs font-700 hover:bg-[#0F1A1C] hover:text-white transition-colors">Cook with pantry →</button>
                <button onClick={()=> setScreen("discover")} className="w-full py-2 rounded-full bg-[#0F1A1C] text-white text-xs font-700 hover:bg-[#1D2A2E] transition-colors">Browse Discover</button>
              </div>
            </div>

            <div className="rounded-[18px] border border-dashed border-[#E8E0D0] bg-[#FFFBF5]/60 p-4">
              <div className="label-mono text-[#9CA3AF]">Atelier note</div>
              <p className="text-[11.5px] leading-relaxed text-[#6B7280] mt-2">Every reply is shaped by your logs, pantry, and <span className="font-700 text-[#0F1A1C]">{user.goal.toLowerCase()}</span> target. No generic chat — contextual synthesis.</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[10px] text-[#8A9A8B]"><span className="w-1 h-1 rounded-full bg-[#8A9A8B]" /> Veyra • Paper • No. 041</div>
            </div>

            <div className="mt-auto pt-2 border-t border-[#E8E0D0]/60">
              <div className="flex items-center gap-2 text-[11px] font-600 text-[#6B7280]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C45A3C] animate-pulse" /> Intelligence active • Encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MicIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}
