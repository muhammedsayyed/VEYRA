import React, { useEffect } from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "md" }: ModalProps) {
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

  if (!isOpen) return null

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#172A35]/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${widthClasses} rounded-3xl p-6 shadow-xl z-10 border border-[#E6E0D5] my-auto animate-fade-in-up`}
        style={{ background: "#FFFFFF", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E0D5] shrink-0">
          <h3 className="font-display font-800 text-xl text-[#172A35]">{title || "Details"}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass flex items-center justify-center text-[#6B7280] hover:text-[#172A35] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-4 pr-1">{children}</div>
      </div>
    </div>
  )
}
