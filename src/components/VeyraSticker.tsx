import React, { useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion"

export type StickerName =
  | "01_welcome"
  | "02_wink"
  | "03_heart_love"
  | "04_cool"
  | "05_thinking"
  | "06_idea"
  | "07_coding"
  | "08_sleepy"
  | "09_celebration"
  | "10_affection"
  | "11_laughing"
  | "12_angry"
  | "doc"
  | "013"
  | "014"
  | "015"
  | "016"
  | "017"
  | "018"
  | "019"
  | "020"
  | "021"
  | "022"
  | "sos"
  | "002"
  | "003"
  | "004"
  | "005"
  | "006"
  | "007"
  | "008"
  | "009"
  | "010"
  | "011"
  | "012"
  | "01_angry_shouting"
  | "02_crying"
  | "03_clinging_to_pole"
  | "04_happy_laughing"
  | "05_heart_eyes"
  | "06_weightlifting"
  | "07_burger_chubby"

const STICKER_MAP: Record<string, string> = {
  "01_welcome": "/veyra-stickers/01_welcome.png",
  "02_wink": "/veyra-stickers/02_wink.png",
  "03_heart_love": "/veyra-stickers/03_heart_love.png",
  "04_cool": "/veyra-stickers/04_cool.png",
  "05_thinking": "/veyra-stickers/05_thinking.png",
  "06_idea": "/veyra-stickers/06_idea.png",
  "07_coding": "/veyra-stickers/07_coding.png",
  "08_sleepy": "/veyra-stickers/08_sleepy.png",
  "09_celebration": "/veyra-stickers/09_celebration.png",
  "10_affection": "/veyra-stickers/10_affection.png",
  "11_laughing": "/veyra-stickers/11_laughing.png",
  "12_angry": "/veyra-stickers/12_angry.png",
  "013": "/veyra-stickers/013.png",
  "014": "/veyra-stickers/014.png",
  "015": "/veyra-stickers/015.png",
  "016": "/veyra-stickers/016.png",
  "017": "/veyra-stickers/017.png",
  "018": "/veyra-stickers/018.png",
  "019": "/veyra-stickers/019.png",
  "020": "/veyra-stickers/020.png",
  "021": "/veyra-stickers/021.png",
  "022": "/veyra-stickers/022.png",
  "sos": "/veyra-stickers/sos.png",
  "002": "/veyra-stickers/002.png",
  "003": "/veyra-stickers/003.png",
  "004": "/veyra-stickers/004.png",
  "005": "/veyra-stickers/005.png",
  "006": "/veyra-stickers/006.png",
  "007": "/veyra-stickers/007.png",
  "008": "/veyra-stickers/008.png",
  "009": "/veyra-stickers/009.png",
  "010": "/veyra-stickers/010.png",
  "011": "/veyra-stickers/011.png",
  "012": "/veyra-stickers/012.png",
  "01_angry_shouting": "/veyra-stickers/01_angry_shouting.png",
  "02_crying": "/veyra-stickers/02_crying.png",
  "03_clinging_to_pole": "/veyra-stickers/03_clinging_to_pole.png",
  "04_happy_laughing": "/veyra-stickers/04_happy_laughing.png",
  "05_heart_eyes": "/veyra-stickers/05_heart_eyes.png",
  "06_weightlifting": "/veyra-stickers/06_weightlifting.png",
  "07_burger_chubby": "/veyra-stickers/07_burger_chubby.png",
  "doc": "/veyra-stickers/doc.png",
}

export function VeyraSticker({
  name,
  size = 120,
  alt,
  className = "",
  float = true,
  interactive = true,
}: {
  name: StickerName | string
  size?: number
  alt?: string
  className?: string
  float?: boolean
  interactive?: boolean
}) {
  const src = STICKER_MAP[name] ?? `/veyra-stickers/${name}.png`
  const prefersReduced = useReducedMotion()
  const shouldAnimate = !prefersReduced && float
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const mxSpring = useSpring(mx, { stiffness: 80, damping: 14, mass: 0.5 })
  const mySpring = useSpring(my, { stiffness: 80, damping: 14, mass: 0.5 })
  const tiltX = useSpring(0, { stiffness: 60, damping: 14 })
  const tiltY = useSpring(0, { stiffness: 60, damping: 14 })

  useEffect(() => {
    if (!interactive || prefersReduced || size < 48) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width * 0.9)))
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height * 0.9)))
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        mx.set(nx * 4)
        my.set(ny * 2.5)
      })
    }
    const onScroll = () => {
      // subtle lean on scroll
      const v = window.scrollY * 0.0008
      tiltX.set(Math.sin(v) * 1.2)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    const unsubX = mxSpring.on("change", (v) => tiltX.set(v * 0.8))
    const unsubY = mySpring.on("change", (v) => tiltY.set(v * 0.5))
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
      unsubX()
      unsubY()
    }
  }, [interactive, prefersReduced, size, mx, my, mxSpring, mySpring, tiltX, tiltY])

  const hasCustomSize = className.includes("w-") || className.includes("h-")

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: hasCustomSize ? undefined : size, height: hasCustomSize ? undefined : size, display: "inline-block", lineHeight: 0 }}
      aria-hidden={alt ? undefined : true}
    >
      <motion.div
        style={{ width: "100%", height: "100%", x: shouldAnimate ? mxSpring : 0, y: shouldAnimate ? mySpring : 0, rotate: shouldAnimate ? tiltX : 0 }}
        animate={shouldAnimate ? { y: [0, -3, 0] } : { y: 0 }}
        transition={shouldAnimate ? { duration: 4.8, repeat: Infinity, ease: "easeInOut" } : undefined}
        whileHover={interactive && !prefersReduced ? { scale: 1.025, y: -2 } : undefined}
        whileTap={interactive && !prefersReduced ? { scale: 0.98 } : undefined}
      >
        <img
          src={src}
          alt={alt ?? `Veyra sticker ${name}`}
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", filter: "drop-shadow(0 8px 24px rgba(15,26,28,0.10))" }}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </motion.div>
    </div>
  )
}

export default VeyraSticker
