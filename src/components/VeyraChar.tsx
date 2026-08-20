import React from "react"
import { VeyMood, VeyAccent } from "@/types"

/* ───────────────────────────────────────────────────────────
   Veyra character system — "Vey"
   A friendly abstract wellness droplet-creature rendered as a
   glossy gradient SVG. One coherent mascot with mood + accent
   variants, plus a family of 3D-style floating wellness objects.
   Pure SVG/CSS so it stays crisp, themeable, and dependency-free.
   ─────────────────────────────────────────────────────────── */

const ACCENTS: Record<VeyAccent, [string, string, string]> = {
  aqua: ["#67e8f9", "#22d3ee", "#0891b2"],
  mint: ["#86efac", "#34e0a1", "#10b981"],
  coral: ["#ffc4a3", "#ff7a5c", "#f0562e"],
  violet: ["#d8b4fe", "#a78bfa", "#7c3aed"],
}

export function VeyraCharacter({
  mood = "happy",
  accent = "aqua",
  size = 120,
  float = true,
  className = "",
}: {
  mood?: VeyMood
  accent?: VeyAccent
  size?: number
  float?: boolean
  className?: string
}) {
  const [light, base, deep] = ACCENTS[accent]
  const id = React.useId().replace(/:/g, "")

  // eye geometry per mood
  const eyes = (() => {
    switch (mood) {
      case "wink":
        return (
          <>
            <circle cx="42" cy="54" r="5.5" fill="#0a1526" />
            <path d="M58 54 q6 -5 12 0" stroke="#0a1526" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        )
      case "zen":
        return (
          <>
            <path d="M36 54 q6 5 12 0" stroke="#0a1526" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M64 54 q6 5 12 0" stroke="#0a1526" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        )
      case "concerned":
      case "warn":
        return (
          <>
            <path d="M36 50 q6 4 12 6" stroke="#0a1526" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M64 56 q6 -2 12 -6" stroke="#0a1526" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="43" cy="55" r="5" fill="#0a1526" />
            <circle cx="69" cy="55" r="5" fill="#0a1526" />
          </>
        )
      case "hungry":
        return (
          <>
            <circle cx="42" cy="52" r="7" fill="#0a1526" />
            <circle cx="70" cy="52" r="7" fill="#0a1526" />
            <path d="M38 46 q6 -4 12 0" stroke="#0a1526" strokeWidth="3" fill="none" />
            <path d="M64 46 q6 -4 12 0" stroke="#0a1526" strokeWidth="3" fill="none" />
          </>
        )
      case "celebrate":
      case "cheer":
        return (
          <>
            <path d="M34 56 q8 -10 16 0" stroke="#0a1526" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M62 56 q8 -10 16 0" stroke="#0a1526" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </>
        )
      case "coaching":
      case "focused":
        return (
          <>
            <circle cx="42" cy="53" r="6" fill="#0a1526" />
            <circle cx="70" cy="53" r="6" fill="#0a1526" />
            <path d="M34 44 l14 4" stroke="#0a1526" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M78 44 l-14 4" stroke="#0a1526" strokeWidth="3.5" strokeLinecap="round" />
          </>
        )
      case "hydrated":
        return (
          <>
            <circle cx="42" cy="53" r="6.5" fill="#0a1526" />
            <circle cx="70" cy="53" r="6.5" fill="#0a1526" />
            <circle cx="44" cy="50" r="2.5" fill="#fff" />
            <circle cx="72" cy="50" r="2.5" fill="#fff" />
          </>
        )
      default:
        return (
          <>
            <circle cx="42" cy="53" r="6" fill="#0a1526" />
            <circle cx="70" cy="53" r="6" fill="#0a1526" />
            <circle cx="44" cy="51" r="2" fill="#fff" />
            <circle cx="72" cy="51" r="2" fill="#fff" />
          </>
        )
    }
  })()

  const mouth = (() => {
    switch (mood) {
      case "celebrate":
      case "cheer":
        return <path d="M40 65 q16 24 32 0 q-16 8 -32 0Z" fill="#0a1526" />
      case "think":
        return <circle cx="56" cy="70" r="4" fill="#0a1526" />
      case "concerned":
      case "warn":
        return <path d="M46 72 q10 -7 20 0" stroke="#0a1526" strokeWidth="4" strokeLinecap="round" fill="none" />
      case "hungry":
        return <path d="M44 68 q12 14 24 0 Z" stroke="#0a1526" strokeWidth="4" fill="none" />
      case "coaching":
      case "focused":
        return <path d="M44 67 q12 12 24 0" stroke="#0a1526" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      case "hydrated":
        return <path d="M42 66 q14 16 28 0" stroke="#0a1526" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      default:
        return <path d="M44 68 q12 14 24 0" stroke="#0a1526" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    }
  })()

  // Head accessories per mood
  const accessory = (() => {
    if (mood === "hydrated") {
      return (
        <g transform="translate(48, -4)">
          <path d="M8 2 C8 2 16 12 16 17 A8 8 0 1 1 0 17 C0 12 8 2 8 2Z" fill="#38bdf8" />
        </g>
      )
    }
    if (mood === "celebrate") {
      return (
        <g transform="translate(38, -6)">
          <path d="M6 14 L12 2 L18 14 L24 4 L30 14 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        </g>
      )
    }
    if (mood === "coaching") {
      return (
        <path d="M16 40 Q56 32 96 40" stroke="#ff7a5c" strokeWidth="6" strokeLinecap="round" fill="none" />
      )
    }
    return null
  })()

  return (
    <div className={`${float ? "animate-float2" : ""} ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 112 128" width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={`body${id}`} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor={light} />
            <stop offset="55%" stopColor={base} />
            <stop offset="100%" stopColor={deep} />
          </radialGradient>
          <radialGradient id={`gloss${id}`} cx="35%" cy="25%" r="45%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`soft${id}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#172A35" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* ground shadow */}
        <ellipse cx="56" cy="118" rx="30" ry="6" fill="#172A35" opacity="0.08" />

        {/* body — soft rounded droplet */}
        <path
          d="M56 6 C86 6 100 34 100 62 C100 92 82 112 56 112 C30 112 12 92 12 62 C12 34 26 6 56 6 Z"
          fill={`url(#body${id})`}
          filter={`url(#soft${id})`}
        />
        {/* glossy highlight */}
        <ellipse cx="44" cy="34" rx="30" ry="22" fill={`url(#gloss${id})`} />

        {/* Head accessory */}
        {accessory}

        {/* face */}
        {eyes}
        {mouth}

        {/* blush */}
        <ellipse cx="30" cy="66" rx="6" ry="4" fill="#fff" opacity="0.22" />
        <ellipse cx="82" cy="66" rx="6" ry="4" fill="#fff" opacity="0.22" />

        {/* waving arm */}
        {(mood === "wave" || mood === "happy") && (
          <g style={{ transformOrigin: "96px 70px", animation: "float 1.6s ease-in-out infinite" }}>
            <path d="M96 74 q18 -6 20 -22" stroke={base} strokeWidth="9" strokeLinecap="round" fill="none" />
          </g>
        )}
        {/* cheer / celebrate arms up */}
        {(mood === "cheer" || mood === "celebrate") && (
          <>
            <path d="M18 60 q-14 -10 -12 -26" stroke={base} strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M94 60 q14 -10 12 -26" stroke={base} strokeWidth="9" strokeLinecap="round" fill="none" />
          </>
        )}
      </svg>
    </div>
  )
}

/* ── 3D-style floating wellness objects ───────────────────── */

type ObjProps = { size?: number; float?: boolean; className?: string }

function Obj({ size = 72, float = true, className = "", children }: ObjProps & { children: React.ReactNode }) {
  return (
    <div className={`${float ? "animate-float" : ""} ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
        {children}
      </svg>
    </div>
  )
}

export function Obj3D({ kind, size = 72, float = true, className = "" }: ObjProps & { kind: "avocado" | "water" | "berry" | "dumbbell" | "leaf" | "flame" }) {
  const id = React.useId().replace(/:/g, "")
  const shadow = <ellipse cx="50" cy="92" rx="24" ry="5" fill="#000" opacity="0.25" />

  const grads = (
    <defs>
      <radialGradient id={`a${id}`} cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#bef264" /><stop offset="60%" stopColor="#84cc16" /><stop offset="100%" stopColor="#4d7c0f" />
      </radialGradient>
      <radialGradient id={`w${id}`} cx="38%" cy="26%" r="80%">
        <stop offset="0%" stopColor="#a5f3fc" /><stop offset="55%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#0891b2" />
      </radialGradient>
      <radialGradient id={`b${id}`} cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#f9a8d4" /><stop offset="55%" stopColor="#e11d5c" /><stop offset="100%" stopColor="#9d174d" />
      </radialGradient>
      <linearGradient id={`d${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <radialGradient id={`l${id}`} cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#86efac" /><stop offset="60%" stopColor="#34e0a1" /><stop offset="100%" stopColor="#059669" />
      </radialGradient>
      <radialGradient id={`f${id}`} cx="40%" cy="70%" r="80%">
        <stop offset="0%" stopColor="#fde68a" /><stop offset="45%" stopColor="#ff7a5c" /><stop offset="100%" stopColor="#f0562e" />
      </radialGradient>
      <radialGradient id={`gl${id}`} cx="35%" cy="25%" r="50%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.8" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
  )

  const gloss = <ellipse cx="40" cy="34" rx="18" ry="13" fill={`url(#gl${id})`} />

  const body = (() => {
    switch (kind) {
      case "avocado":
        return <><path d="M50 14 C70 14 78 40 74 60 C70 82 60 90 50 90 C40 90 30 82 26 60 C22 40 30 14 50 14Z" fill={`url(#a${id})`} /><ellipse cx="50" cy="62" rx="15" ry="17" fill="#7c4a1e" opacity="0.85" /><circle cx="50" cy="62" r="8" fill="#a16207" /></>
      case "water":
        return <path d="M50 14 C50 14 78 52 78 68 A28 28 0 1 1 22 68 C22 52 50 14 50 14Z" fill={`url(#w${id})`} />
      case "berry":
        return <circle cx="50" cy="54" r="34" fill={`url(#b${id})`} />
      case "leaf":
        return <path d="M50 14 C82 22 84 66 50 90 C16 66 18 22 50 14Z" fill={`url(#l${id})`} />
      case "flame":
        return <path d="M50 14 C58 34 74 40 70 62 A20 20 0 1 1 30 62 C28 48 40 46 42 34 C50 40 46 24 50 14Z" fill={`url(#f${id})`} />
      case "dumbbell":
        return (
          <g transform="rotate(-38 50 52)">
            <rect x="20" y="46" width="60" height="12" rx="6" fill={`url(#d${id})`} />
            <rect x="12" y="36" width="16" height="32" rx="6" fill={`url(#d${id})`} />
            <rect x="72" y="36" width="16" height="32" rx="6" fill={`url(#d${id})`} />
            <rect x="4" y="42" width="10" height="20" rx="5" fill="#334155" />
            <rect x="86" y="42" width="10" height="20" rx="5" fill="#334155" />
          </g>
        )
    }
  })()

  return (
    <Obj size={size} float={float} className={className}>
      {grads}
      {shadow}
      {body}
      {kind !== "dumbbell" && gloss}
    </Obj>
  )
}

export default VeyraCharacter
