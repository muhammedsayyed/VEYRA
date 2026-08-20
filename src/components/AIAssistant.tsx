import React, { useState, useRef, useEffect } from "react"
import { SparklesIcon, SendIcon, ChevronRightIcon } from "@/components/icons"
import { VeyraCharacter } from "@/components/VeyraChar"
import { useApp } from "@/context/AppContext"
import { ChatMessageCard } from "@/types"

export default function AIAssistant() {
  const { user, meals, addWater, addMeal, setScreen, chatMessages, sendMessage, mascotMood } = useApp()

  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const suggestions = [
    "What should I eat for dinner?",
    "Am I hitting my protein goal?",
    "Give me a high-protein breakfast",
    "What workout should I do today?",
    "Is Nutella good for my goal?",
    "Why am I not losing weight?",
    "What can I eat with the calories I have left?",
  ]

  const handleSend = (text: string) => {
    if (!text.trim()) return
    sendMessage(text)
    setInput("")
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

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 shrink-0 border-b relative z-10"
        style={{ borderColor: "#E6E0D5", background: "#F1EEE6" }}
      >
        <div className="relative">
          <VeyraCharacter mood={mascotMood} accent="mint" size={44} float={false} />
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: "#C18A5A", borderColor: "#FFFFFF" }} />
        </div>
        <div>
          <h2 className="font-display font-800 text-[#172A35] text-lg leading-tight tracking-tight">Veyra AI Companion</h2>
          <p className="label-mono text-[10px]" style={{ color: "#172A35" }}>
            ONLINE · CONTEXT LOADED ({user.name.split(" ")[0]}, {calLeft} kcal left)
          </p>
        </div>
        <div className="ml-auto glass rounded-full px-3 py-1.5 flex items-center gap-1.5" style={{ border: "1px solid #E6E0D5" }}>
          <span style={{ color: "#C18A5A" }}>
            <SparklesIcon size={12} />
          </span>
          <span className="label-mono text-[10px]" style={{ color: "#C18A5A" }}>
            LIVE CONTEXT
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4 relative z-10">
        {chatMessages.map((msg) => {
          const isAI = msg.role === "ai"
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isAI ? "" : "flex-row-reverse"} animate-fade-in-up`}>
              {isAI ? (
                <div className="shrink-0 -mt-1">
                  <VeyraCharacter mood="happy" accent="mint" size={40} float={false} />
                </div>
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-800 text-[#FFFFFF] shrink-0"
                  style={{ background: "#172A35" }}
                >
                  {user.name.charAt(0)}
                </div>
              )}

              <div style={{ maxWidth: "84%" }}>
                <div
                  className={`px-4 py-3 text-sm leading-relaxed ${isAI ? "glass rounded-2xl rounded-tl-md" : "rounded-2xl rounded-tr-md"}`}
                  style={
                    isAI
                      ? { color: "#28302E", background: "#F1EEE6", border: "1px solid #E6E0D5" }
                      : { background: "#172A35", color: "#FFFFFF", fontWeight: 600 }
                  }
                >
                  {msg.text}
                </div>

                {/* Cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2.5">
                    {msg.cards.map((card, i) => (
                      <div
                        key={i}
                        className="glass rounded-2xl p-3.5 flex items-center justify-between gap-3 card-hover border border-[#E6E0D5]"
                      >
                        <div>
                          <p className="font-display font-700 text-sm text-[#172A35]">{card.title}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">{card.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display font-800 text-sm" style={{ color: "#C18A5A" }}>
                            {card.value}
                          </span>
                          <button
                            onClick={() => handleCardAction(card)}
                            className="btn-primary text-xs px-3 py-1.5 font-700 flex items-center gap-1"
                          >
                            {card.actionLabel || "Action"} <ChevronRightIcon size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Voice recording animation simulation */}
        {isRecording && (
          <div className="p-4 glass rounded-2xl flex items-center justify-center gap-2 text-[#C18A5A] text-sm font-semibold border border-[#E6E0D5]">
            🎙️ Listening to spoken question...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 md:px-6 pb-2 shrink-0 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((s) => (
            <button key={s} onClick={() => handleSend(s)} className="chip text-xs whitespace-nowrap shrink-0">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="px-3 md:px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0 relative z-10" style={{ marginBottom: "72px" }}>
        <div className="liquid-glass rounded-3xl p-2 pl-4 flex gap-2 items-center">
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#28302E] placeholder:text-[#9CA3AF] py-2"
            placeholder="Ask Vey anything about your food, macros, or workouts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
          />
          <button
            onClick={handleVoiceInput}
            title="Voice input simulation"
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-[#6B7280] hover:text-[#172A35]"
          >
            🎙️
          </button>
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-40 btn-primary"
          >
            <SendIcon size={18} />
          </button>
        </div>

        {/* Live Context Pills */}
        <div className="flex gap-2 mt-2.5 flex-wrap items-center">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F1EEE6] text-[#172A35] border border-[#E6E0D5]">
            Goal: {user.goal}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F1EEE6] text-[#172A35] border border-[#E6E0D5]">
            {proteinLeft}g protein left
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F1EEE6] text-[#C18A5A] border border-[#E6E0D5]">
            {calLeft} kcal left
          </span>
        </div>
      </div>
    </div>
  )
}
