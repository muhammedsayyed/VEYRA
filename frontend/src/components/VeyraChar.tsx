import { VeyraCompanion, type CompanionMood, type CompanionAccent } from "@/components/VeyraCompanion"

type VeyMood = "idle" | "happy" | "think" | "celebrate" | "focus" | "warm" | "listening" | "speaking" | "hungry" | "zen" | "concerned" | "warn" | "hungry" | "wave" | "coaching" | "focused" | "hydrated" | "wink" | "cheer" | "concerned" | "warn"
type VeyAccent = "aqua" | "mint" | "coral" | "violet" | "sage" | "ink" | "clay" | "ochre" | "mist"

/**
 * Legacy alias — maps legacy VeyMood/VeyAccent to new VeyraCompanion system
 * @deprecated Use VeyraCompanion directly for new code
 */
export function VeyraCharacter(props: {
  mood?: string
  accent?: string
  size?: number
  float?: boolean
  className?: string
}) {
  const accentMap: Record<string, "ink" | "clay" | "sage" | "ochre" | "mist"> = {
    aqua: "ink",
    mint: "sage",
    coral: "clay",
    violet: "ink",
    sage: "sage",
    ink: "ink",
    clay: "clay",
    ochre: "ochre",
    mist: "mist",
  }
  const moodMap: Record<string, "idle" | "happy" | "think" | "celebrate" | "focus" | "warm" | "listening" | "speaking"> = {
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
      mood={moodMap[props.mood ?? "idle"] ?? "idle"}
      accent={accentMap[props.accent ?? "ink"] ?? "ink"}
      size={props.size ?? 120}
      float={props.float ?? true}
      className={props.className}
    />
  )
}

export { VeyraCompanion } from "@/components/VeyraCompanion"
