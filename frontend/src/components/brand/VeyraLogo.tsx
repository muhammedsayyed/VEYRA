import React from "react"

interface VeyraLogoProps {
  variant?: "full" | "compact" | "icon"
  size?: "sm" | "md" | "lg" | "xl" | number
  className?: string
  alt?: string
}

// Official VEYRA brand logo - DO NOT MODIFY
// Source: Attached official VEYRA brand logo (mascot with leaves, Veyra wordmark, AI • WELLNESS • YOU)
// This is the CORE BRAND ASSET for the entire application
// Master: public/assets/brand/veyra-logo-master.png
// Optimized: public/assets/brand/veyra-logo.png

const sizeMap = {
  sm: { width: 120, height: 48 },
  md: { width: 160, height: 64 },
  lg: { width: 200, height: 80 },
  xl: { width: 280, height: 112 },
}

export function VeyraLogo({ variant = "full", size = "md", className = "", alt = "Veyra — AI • Wellness • You" }: VeyraLogoProps) {
  const isNumber = typeof size === "number"
  const dimensions = isNumber ? { width: size, height: size * 0.4 } : sizeMap[size as keyof typeof sizeMap] || sizeMap.md
  const logoSrc = "/assets/brand/veyra-logo.png"
  const masterSrc = "/assets/brand/veyra-logo-master.png"
  return (
    <img
      src={logoSrc}
      srcSet={`${logoSrc} 1x, ${masterSrc} 2x`}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={`object-contain ${className}`}
      style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}`, objectFit: "contain" } as React.CSSProperties}
      loading="eager"
      decoding="async"
    />
  )
}

export function VeyraIcon({ size = 32, className = "", alt = "Veyra" }: { size?: number; className?: string; alt?: string }) {
  return (
    <img
      src="/assets/brand/veyra-icon.png"
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ aspectRatio: "1 / 1", objectFit: "contain" }}
      loading="eager"
    />
  )
}

export default VeyraLogo
