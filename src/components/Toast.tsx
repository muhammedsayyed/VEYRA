import React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { CheckIcon, SparklesIcon, XIcon } from "@/components/icons"

const easeVeyra: any = [0.16, 1, 0.3, 1]

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()
  const prefersReduced = useReducedMotion()

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none max-w-[360px] w-[calc(100%-16px)] sm:w-full px-0">
      <AnimatePresence>
        {toasts.map((t) => {
          const isSuccess = t.type === "success"
          const isWarning = t.type === "warning"
          return (
            <motion.div
              key={t.id}
              layout
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
              animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: prefersReduced ? 0.15 : 0.42, ease: easeVeyra }}
              onClick={() => removeToast(t.id)}
              className="pointer-events-auto relative overflow-hidden rounded-[16px] border bg-white flex items-center gap-3 px-3.5 py-3 shadow-[0_12px_32px_rgba(15,26,28,0.10),0_4px_12px_rgba(15,26,28,0.06)] cursor-pointer hover:shadow-[0_16px_40px_rgba(15,26,28,0.14)] hover:-translate-y-0.5 transition-all group"
              style={{
                borderColor: isSuccess ? "rgba(138,154,139,0.35)" : isWarning ? "rgba(196,90,60,0.28)" : "rgba(232,224,208,0.9)",
              }}
            >
              {/* accent line */}
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: isSuccess ? "#8A9A8B" : isWarning ? "#C45A3C" : "#0F1A1C" }}
              />
              {/* icon — paper-cut, not green ball */}
              <span
                className="w-8 h-8 rounded-full grid place-items-center shrink-0 border shadow-sm"
                style={{
                  background: isSuccess ? "#8A9A8B" : isWarning ? "#C45A3C" : "#0F1A1C",
                  borderColor: isSuccess ? "#8A9A8B" : isWarning ? "#C45A3C" : "#0F1A1C",
                  color: "#FFFFFF",
                }}
              >
                {isSuccess ? <CheckIcon size={13} /> : <SparklesIcon size={13} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-display font-700 text-[13px] leading-tight text-[var(--veyra-ink)] line-clamp-2" style={{ color: "#0F1A1C" }}>{t.message}</span>
                <span className="block font-mono text-[10px] tracking-wide text-[#9CA3AF] mt-0.5 capitalize">{t.type} • tap to dismiss</span>
              </span>
              <span className="w-7 h-7 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#9CA3AF] group-hover:text-[#0F1A1C] group-hover:border-[#0F1A1C] transition-colors shrink-0">
                <XIcon size={10} />
              </span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
