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
    <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden relative box-border">
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3.5 sm:px-5 py-3 sm:py-4 shrink-0 border-b relative z-10 w-full max-w-full min-w-0"
        style={{ borderColor: "#E6E0D5", background: "#F1EEE6" }}
      >
        <div className="relative shrink-0">
          <VeyraCharacter mood={mascotMood} accent="mint" size={40} float={false} />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: "#C18A5A", borderColor: "#FFFFFF" }} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-800 text-[#172A35] text-base sm:text-lg leading-tight tracking-tight truncate">
            Veyra AI Companion
          </h2>
          <p className="label-mono text-[9px] sm:text-[10px] truncate" style={{ color: "#172A35" }}>
            ONLINE · LOADED ({user.name.split(" ")[0]}, {calLeft} kcal left)
          </p>
        </div>
        <div className="ml-auto glass rounded-full px-2.5 sm:px-3 py-1 flex items-center gap-1.5 shrink-0" style={{ border: "1px solid #E6E0D5" }}>
          <span style={{ color: "#C18A5A" }}>
            <SparklesIcon size={12} />
          </span>
          <span className="label-mono text-[9px] sm:text-[10px] hidden xs:inline" style={{ color: "#C18A5A" }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-5 py-4 space-y-4 relative z-10 w-full max-w-full min-w-0">
        {chatMessages.map((msg) => {
          const isAI = msg.role === "ai"
          return (
            <div key={msg.id} className={`flex items-start gap-2.5 sm:gap-3 ${isAI ? "" : "flex-row-reverse"} animate-fade-in-up w-full max-w-full`}>
              {isAI ? (
                <div className="shrink-0 -mt-1">
                  <VeyraCharacter mood="happy" accent="mint" size={36} float={false} />
                </div>
              ) : (
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-800 text-[#FFFFFF] shrink-0"
                  style={{ background: "#172A35" }}
                >
                  {user.name.charAt(0)}
                </div>
              )}

              <div className="max-w-[85%] sm:max-w-[80%] min-w-0 flex flex-col">
                <div
                  className={`px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap w-fit ${
                    isAI ? "glass rounded-2xl rounded-tl-md" : "rounded-2xl rounded-tr-md ml-auto"
                  }`}
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
                  <div className="flex flex-col gap-2 mt-2.5 w-full max-w-full">
                    {msg.cards.map((card, i) => (
                      <div
                        key={i}
                        className="glass rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 card-hover border border-[#E6E0D5] w-full max-w-full min-w-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-700 text-xs sm:text-sm text-[#172A35] truncate">{card.title}</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">{card.subtitle}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E6E0D5]">
                          <span className="font-display font-800 text-xs sm:text-sm" style={{ color: "#C18A5A" }}>
                            {card.value}
                          </span>
                          <button
                            onClick={() => handleCardAction(card)}
                            className="btn-primary text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 font-700 flex items-center gap-1 shrink-0"
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
          <div className="p-3.5 glass rounded-2xl flex items-center justify-center gap-2 text-[#C18A5A] text-xs sm:text-sm font-semibold border border-[#E6E0D5]">
            🎙️ Listening to spoken question...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 sm:px-5 pb-2 shrink-0 relative z-10 w-full max-w-full overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none touch-pan-x">
          {suggestions.map((s) => (
            <button key={s} onClick={() => handleSend(s)} className="chip text-[11px] sm:text-xs whitespace-nowrap shrink-0 py-1.5 px-3">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="px-3 sm:px-5 pt-2 pb-3 shrink-0 relative z-10 w-full max-w-full box-border">
        <div className="liquid-glass rounded-2xl md:rounded-3xl p-1.5 sm:p-2 pl-3 sm:pl-4 flex gap-1.5 sm:gap-2 items-center w-full min-w-0">
          <input
            ref={inputRef}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs sm:text-sm text-[#28302E] placeholder:text-[#9CA3AF] py-1.5 sm:py-2"
            placeholder="Ask Vey anything about your food, macros..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
          />
          <button
            onClick={handleVoiceInput}
            title="Voice input simulation"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl glass flex items-center justify-center text-xs sm:text-sm text-[#6B7280] hover:text-[#172A35] shrink-0"
          >
            🎙️
          </button>
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-40 btn-primary"
          >
            <SendIcon size={16} />
          </button>
        </div>

        {/* Live Context Pills */}
        <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap items-center max-w-full overflow-hidden">
          <span className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full bg-[#F1EEE6] text-[#172A35] border border-[#E6E0D5] truncate">
            Goal: {user.goal}
          </span>
          <span className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full bg-[#F1EEE6] text-[#172A35] border border-[#E6E0D5] truncate">
            {proteinLeft}g protein left
          </span>
          <span className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full bg-[#F1EEE6] text-[#C18A5A] border border-[#E6E0D5] truncate">
            {calLeft} kcal left
          </span>
        </div>
      </div>
    </div>
  )
}
