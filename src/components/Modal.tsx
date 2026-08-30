import React, { useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { XIcon } from "@/components/icons"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
}

const easeVeyra: any = [0.16, 1, 0.3, 1]

export default function Modal({ isOpen, onClose, title, children, maxWidth = "md" }: ModalProps) {
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop — ink + blur, tactile, warm */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.32, ease: easeVeyra }}
            className="fixed inset-0 bg-[var(--veyra-ink)]/45 backdrop-blur-[12px]"
            style={{ backgroundColor: "rgba(15,26,28,0.46)" }}
            onClick={onClose}
            aria-hidden
          />

          {/* Card — paper on ink, editorial, Veyra universe */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: prefersReduced ? 0.16 : 0.46, ease: easeVeyra }}
            className={`relative w-full ${widthClasses} rounded-[28px] overflow-hidden z-10 border shadow-[0_24px_64px_rgba(15,26,28,0.16),0_8px_20px_rgba(15,26,28,0.08)] my-auto flex flex-col`}
            style={{
              background: "#FFFFFF",
              borderColor: "var(--veyra-mist)",
              maxHeight: "90vh",
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* subtle paper grain */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
            />
            {/* warm glow — clay */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, var(--veyra-clay) 0%, transparent 68%)" }} />
            <div className="pointer-events-none absolute -bottom-12 -left-12 w-56 h-56 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, var(--veyra-sage) 0%, transparent 70%)" }} />

            {/* Header — editorial */}
            <div className="relative flex items-center justify-between gap-4 px-6 sm:px-7 pt-6 pb-4 border-b border-[var(--veyra-mist)]/70 shrink-0" style={{ borderColor: "#E8E0D0" }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-clay)]" style={{ background: "#C45A3C" }} />
                  <span className="label-mono !text-[#9CA3AF] !tracking-[0.14em]">Veyra · atelier</span>
                </div>
                <h3 className="font-display font-800 text-[18px] sm:text-[19px] leading-tight tracking-tight text-[var(--veyra-ink)] mt-1.5 text-balance" style={{ color: "#0F1A1C" }}>
                  {title || "Details"}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] grid place-items-center text-[#6B7280] hover:bg-[var(--veyra-ink)] hover:text-white hover:border-[var(--veyra-ink)] transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--veyra-ink)]/20"
                style={{ background: "#F5F0E8", borderColor: "#E8E0D0" }}
              >
                <XIcon size={14} />
              </button>
            </div>

            {/* Content — scroll */}
            <div className="relative flex-1 overflow-y-auto px-6 sm:px-7 py-5 sm:py-6 [scrollbar-width:thin]">{children}</div>

            {/* bottom hairline */}
            <div className="h-px w-full bg-[#F5F0E8] shrink-0" style={{ background: "#F5F0E8" }} />
            <div className="px-6 sm:px-7 py-2.5 flex items-center justify-between bg-[var(--veyra-paper)] shrink-0" style={{ background: "#FFFBF5" }}>
              <span className="label-mono !text-[#9CA3AF] flex items-center gap-1.5 !tracking-[0.12em]">
                <span className="w-1 h-1 rounded-full bg-[#8A9A8B]" /> Tactile • spring [0.16,1,0.3,1]
              </span>
              <span className="font-mono text-[10px] text-[#9CA3AF] hidden sm:inline">ESC to close • 320–1440</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
