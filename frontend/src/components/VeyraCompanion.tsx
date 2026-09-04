import React from "react"
import { VeyraSticker } from "@/components/VeyraSticker"

type CompanionMood = "idle" | "happy" | "think" | "celebrate" | "focus" | "warm" | "listening" | "speaking"
type CompanionAccent = "ink" | "clay" | "sage" | "ochre" | "mist"

const MOOD_TO_STICKER: Record<CompanionMood, string> = {
  idle: "01_welcome",
  happy: "03_heart_love",
  warm: "10_affection",
  think: "05_thinking",
  celebrate: "09_celebration",
  focus: "04_cool",
  listening: "05_thinking",
  speaking: "06_idea",
}

// For hero/SOS location, use sos directly when explicitly requested via accent or size
const HERO_OVERRIDES: Record<string, string> = {
  // Allow explicit sos via accent="ink" + size>160 + celebrate -> sos handled in component via prop check
}

export function VeyraCompanion({
  mood = "idle",
  accent = "ink",
  size = 120,
  float = true,
  className = "",
  interactive = true,
}: {
  mood?: CompanionMood
  accent?: CompanionAccent
  size?: number
  float?: boolean
  className?: string
  interactive?: boolean
}) {
  // Map mood to sticker
  let sticker: string = MOOD_TO_STICKER[mood] ?? "01_welcome"

  // Special: for large hero celebrate/warm with ink, use sos for main hero
  // This handles the main Veyra AI hero replacement requirement
  // Check if caller is the main hero by size and mood
  // We keep this as optional - if size >= 120 and mood is celebrate/warm and accent is sage/ink, we could use sos
  // But to keep it simple, we map celebrate at large size to 09_celebration, and allow explicit sos via new prop if needed
  // For now, keep mapping as above; the main hero will be updated to explicitly use VeyraSticker with sos

  // Allow accent-based overrides for subtle variety
  if (accent === "clay" && mood === "happy") sticker = "03_heart_love"
  if (accent === "sage" && mood === "think") sticker = "05_thinking"
  if (accent === "ochre" && mood === "celebrate") sticker = "09_celebration"

  return <VeyraSticker name={sticker} size={size} alt={`Veyra ${mood}`} className={className} float={float} interactive={interactive} />
}

export function VeyraCharacter(props: any) {
  const accentMap: Record<string, CompanionAccent> = {
    aqua: "ink",
    mint: "sage",
    coral: "clay",
    violet: "ink",
    sage: "sage",
  }
  const moodMap: Record<string, CompanionMood> = {
    happy: "warm",
    warm: "warm",
    think: "think",
    celebrate: "celebrate",
    cheer: "celebrate",
    coaching: "focus",
    focused: "focus",
    hydrated: "warm",
    wink: "warm",
    zen: "think",
    concerned: "think",
    warn: "think",
    hungry: "warm",
    wave: "warm",
    idle: "idle",
    listening: "listening",
    speaking: "speaking",
  }
  return (
    <VeyraCompanion
      mood={moodMap[props.mood] ?? "idle"}
      accent={accentMap[props.accent] ?? "ink"}
      size={props.size ?? 120}
      float={props.float ?? true}
      className={props.className}
    />
  )
}

export function VeyraMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-[11px] ${className}`} style={{ width: size, height: size, background: "#0F1A1C" }}>
      <span className="font-display font-800 text-white" style={{ fontSize: size * 0.52, letterSpacing: "-0.04em" }}>
        V
      </span>
    </div>
  )
}

export function Obj3D({ kind, size = 72, float = true, className = "" }: { kind: "avocado" | "water" | "berry" | "dumbbell" | "leaf" | "flame"; size?: number; float?: boolean; className?: string }) {
  const id = React.useId().replace(/:/g, "")
  const palettes: Record<string, [string, string, string]> = {
    avocado: ["#FFFBF5", "#C45A3C", "#9E4128"],
    water: ["#F0F6F3", "#8A9A8B", "#1D2A2E"],
    berry: ["#FFF4F2", "#B85C4A", "#8B3A2E"],
    leaf: ["#F2F7F2", "#8A9A8B", "#5A7D5A"],
    flame: ["#FFF6E8", "#C9A86A", "#C45A3C"],
    dumbbell: ["#F5F0E8", "#E8E0D0", "#9CA3AF"],
  }
  const [light, mid, deep] = palettes[kind] || palettes.leaf
  return (
    <div className={`${float ? "animate-float" : ""} ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={`o-${id}-${kind}`} cx="32%" cy="28%" r="80%">
            <stop offset="0%" stopColor={light} />
            <stop offset="60%" stopColor={mid} />
            <stop offset="100%" stopColor={deep} />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="92" rx="22" ry="5" fill={deep} opacity="0.05" />
        {kind === "leaf" && <path d="M50 14 C76 22 78 62 50 88 C22 62 24 22 50 14 Z" fill={`url(#o-${id}-${kind})`} stroke="rgba(15,26,28,0.06)" strokeWidth="1" />}
        {kind === "water" && <path d="M50 14 C50 14 74 48 74 66 A24 24 0 1 1 26 66 C26 48 50 14 50 14 Z" fill={`url(#o-${id}-${kind})`} stroke="rgba(15,26,28,0.06)" strokeWidth="1" />}
        {kind === "berry" && <circle cx="50" cy="54" r="30" fill={`url(#o-${id}-${kind})`} stroke="rgba(15,26,28,0.06)" strokeWidth="1" />}
        {kind === "avocado" && <><path d="M50 14 C68 14 76 36 72 58 C68 78 60 88 50 88 C40 88 32 78 28 58 C24 36 32 14 50 14 Z" fill={`url(#o-${id}-${kind})`} stroke="rgba(15,26,28,0.06)" strokeWidth="1" /><ellipse cx="50" cy="60" rx="13" ry="15" fill="#7c4a1e" opacity="0.85" /><circle cx="50" cy="60" r="7" fill="#a16207" /></>}
        {kind === "flame" && <path d="M50 14 C58 32 70 38 66 58 A18 18 0 1 1 34 58 C32 46 40 38 42 30 C48 36 46 22 50 14 Z" fill={`url(#o-${id}-${kind})`} stroke="rgba(15,26,28,0.06)" strokeWidth="1" />}
        {kind === "dumbbell" && <g transform="rotate(-38 50 52)"><rect x="20" y="46" width="60" height="12" rx="6" fill={mid} stroke="rgba(15,26,28,0.08)" strokeWidth="1" /><rect x="12" y="36" width="16" height="32" rx="6" fill={mid} stroke="rgba(15,26,28,0.08)" strokeWidth="1" /><rect x="72" y="36" width="16" height="32" rx="6" fill={mid} stroke="rgba(15,26,28,0.08)" strokeWidth="1" /></g>}
      </svg>
    </div>
  )
}

export type { CompanionMood, CompanionAccent }
export default VeyraCompanion
