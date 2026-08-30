import { Variants } from "motion"

// ── Easing ──────────────────────────────────
export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  spring: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 },
  softSpring: { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 },
  bouncy: { type: "spring" as const, stiffness: 500, damping: 25, mass: 0.6 },
}

// ── Page / Section ──────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.outExpo, staggerChildren: 0.06, delayChildren: 0.08 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
}

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.outExpo } },
}

// ── Stagger ─────────────────────────────────
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.outExpo } },
}

// ── Card ────────────────────────────────────
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: ease.outExpo } },
  hover: { y: -4, scale: 1.01, transition: ease.softSpring },
}

export const cardHover = {
  y: -4,
  scale: 1.01,
  transition: { type: "spring", stiffness: 400, damping: 28 },
}

// ── Modal ───────────────────────────────────
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
}

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: ease.outExpo } },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.25 } },
}

// ── Filter / List ───────────────────────────
export const filterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: ease.outExpo } },
}

export const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

// ── Hover / Press ───────────────────────────
export const hoverLift = { y: -2, transition: ease.softSpring }
export const pressScale = { scale: 0.98, transition: { duration: 0.1 } }

// ── Image ───────────────────────────────────
export const imageReveal: Variants = {
  hidden: { scale: 1.08, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.7, ease: ease.outExpo } },
}

// ── Number ──────────────────────────────────
export const numberVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.outExpo } },
}
