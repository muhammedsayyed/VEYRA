import React from "react"
import { useApp } from "@/context/AppContext"
import { CheckIcon, SparklesIcon } from "@/components/icons"

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className="pointer-events-auto liquid-glass rounded-2xl p-3.5 flex items-center gap-3 shadow-2xl animate-fade-in-up transition-all cursor-pointer hover:scale-[1.02]"
          style={{
            border: t.type === "success"
              ? "1px solid rgba(52,224,161,0.35)"
              : t.type === "warning"
                ? "1px solid rgba(255,122,92,0.35)"
                : "1px solid rgba(34,211,238,0.35)",
            background: "rgba(10,21,38,0.92)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: t.type === "success"
                ? "rgba(52,224,161,0.2)"
                : t.type === "warning"
                  ? "rgba(255,122,92,0.2)"
                  : "rgba(34,211,238,0.2)",
              color: t.type === "success" ? "#34e0a1" : t.type === "warning" ? "#ff7a5c" : "#22d3ee",
            }}
          >
            {t.type === "success" ? <CheckIcon size={16} /> : <SparklesIcon size={16} />}
          </div>
          <p className="text-sm font-display font-600 text-white flex-1">{t.message}</p>
          <span className="text-xs text-slate-400 opacity-60 hover:opacity-100">✕</span>
        </div>
      ))}
    </div>
  )
}
