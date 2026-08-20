import React, { useEffect, useState } from "react"
import { useApp } from "@/context/AppContext"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  vx: number
  vy: number
  rot: number
  vrot: number
}

const COLORS = ["#22d3ee", "#34e0a1", "#ff7a5c", "#a78bfa", "#fbbf24", "#ffffff"]

export default function ConfettiOverlay() {
  const { showConfetti } = useApp()
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!showConfetti) {
      setParticles([])
      return
    }

    const items: Particle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      size: Math.random() * 10 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 5 + 3,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
    }))

    setParticles(items)

    let rafId = 0
    const tick = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          rot: p.rot + p.vrot,
        }))
      )
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [showConfetti])

  if (!showConfetti || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rot}deg)`,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
    </div>
  )
}
