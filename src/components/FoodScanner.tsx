import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser"
import { BarcodeFormat, DecodeHintType } from "@zxing/library"
import {
  ScanIcon,
  SparklesIcon,
  PlusIcon,
  Barcode2Icon,
  StarIcon,
  SearchIcon,
  CheckIcon,
} from "@/components/icons"
import { VeyraCompanion, Obj3D } from "@/components/VeyraCompanion"
import { useApp } from "@/context/AppContext"
import { FoodItem, RobotoffInsight } from "@/types"
import { assessProductRisk } from "@/utils/healthAdvisor"
import { readJson, writeJson } from "@/services/storage/userStorage"
import { normalizeBarcode, isValidBarcodeFormat } from "@/utils/barcodeNormalizer"

type ScannerPhase =
  | "idle"
  | "permission_denied"
  | "unsupported"
  | "starting"
  | "scanning"
  | "detected"
  | "looking_up"
  | "found"
  | "not_found"
  | "verification_failed"
  | "invalid_barcode"
  | "error"

const easeVeyra: any = [0.16, 1, 0.3, 1]

// ── Badges — Veyra palette ──
function NutriScoreBadge({ score }: { score?: "A" | "B" | "C" | "D" | "E" }) {
  if (!score) return null
  const bg: Record<string, string> = { A: "#0F1A1C", B: "#1D2A2E", C: "#C45A3C", D: "#E07A5F", E: "#B96D62" }
  return (
    <span className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] shadow-sm">
      <span className="label-mono !text-[9px] !text-[#6B7280] !tracking-[0.12em]">NUTRI</span>
      <span className="font-display font-900 text-[11px] leading-none px-1.5 py-0.5 rounded-full text-white" style={{ background: bg[score] || "#0F1A1C" }}>
        {score}
      </span>
    </span>
  )
}
function NovaBadge({ group }: { group?: 1 | 2 | 3 | 4 }) {
  if (!group) return null
  const labels: Record<number, string> = { 1: "Minimal", 2: "Culinary", 3: "Processed", 4: "Ultra-Processed" }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E0D0] text-[#0F1A1C]">
      <span className="label-mono !text-[9px] !text-[#6B7280]">NOVA {group}</span>
      <span className="hidden sm:inline text-[10px] font-600 text-[#6B7280]">· {labels[group]}</span>
    </span>
  )
}

export default function FoodScanner() {
  const { user, addMeal, addToast, toggleFavorite, favorites, lookupBarcodeApi, searchProductsApi } = useApp()
  const prefersReduced = useReducedMotion()

  const [tab, setTab] = useState<"scan" | "search" | "barcode" | "history">("scan")
  const [phase, setPhase] = useState<ScannerPhase>("idle")

  const [activeProduct, setActiveProduct] = useState<FoodItem | null>(null)
  const [scannedCode, setScannedCode] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])

  const [scanHistory, setScanHistory] = useState<Array<{ code: string; product: FoodItem; timestamp: string }>>([])
  const [showAllNutrients, setShowAllNutrients] = useState(false)
  const [expandedSection, setExpandedSection] = useState<"ingredients" | "allergens" | "categories" | "robotoff" | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const isLookingUpRef = useRef<boolean>(false)
  const lastCodeRef = useRef<string>("")

  const historyKey = `veyra_scan_history_${user.email}`
  useEffect(() => {
    const loaded = readJson<Array<{ code: string; product: FoodItem; timestamp: string }>>(historyKey, [])
    setScanHistory(loaded)
  }, [user.email])

  const saveToHistory = (code: string, product: FoodItem) => {
    const entry = { code, product, timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }) }
    const updated = [entry, ...scanHistory.filter((h) => h.code !== code)].slice(0, 25)
    setScanHistory(updated)
    writeJson(historyKey, updated)
  }

  const stopCameraStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (controlsRef.current) {
      try { controlsRef.current.stop() } catch { }
      controlsRef.current = null
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => { return () => { stopCameraStream() } }, [])
  useEffect(() => {
    if (tab !== "scan") {
      stopCameraStream()
      setPhase("idle")
    }
  }, [tab])

  // Camera Scanner Loop
  const startCameraScanner = async () => {
    stopCameraStream()
    setPhase("starting")
    setErrorMessage(null)
    lastCodeRef.current = ""
    isLookingUpRef.current = false

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPhase("unsupported")
      setErrorMessage("Camera scanning is not supported on this browser/device.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setPhase("scanning")

      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "qr_code"],
        })
        const detectLoop = async () => {
          if (videoRef.current && !isLookingUpRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await detector.detect(videoRef.current)
              if (barcodes && barcodes.length > 0) {
                const raw = barcodes[0].rawValue || barcodes[0].rawValueText
                const code = normalizeBarcode(raw)
                if (code && code !== lastCodeRef.current) {
                  lastCodeRef.current = code
                  processBarcodeLookup(code)
                  return
                }
              }
            } catch {}
          }
          if (phase === "scanning" || videoRef.current?.srcObject) {
            animFrameRef.current = requestAnimationFrame(detectLoop)
          }
        }
        animFrameRef.current = requestAnimationFrame(detectLoop)
        return
      }

      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.ITF, BarcodeFormat.QR_CODE,
      ])
      const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 250 })
      const controls = await reader.decodeFromVideoElement(videoRef.current, (result) => {
        if (result && !isLookingUpRef.current) {
          const code = normalizeBarcode(result.getText())
          if (code && code !== lastCodeRef.current) {
            lastCodeRef.current = code
            processBarcodeLookup(code)
          }
        }
      })
      controlsRef.current = controls
    } catch (err: any) {
      console.warn("Camera start error:", err)
      stopCameraStream()
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setPhase("permission_denied")
        setErrorMessage("Camera access is required to scan a barcode. Please grant camera permission or enter barcode manually.")
      } else {
        setPhase("error")
        setErrorMessage("Unable to access rear camera. Try entering barcode manually.")
      }
    }
  }

  // Barcode Lookup & Verification
  const processBarcodeLookup = async (rawCode: string) => {
    const code = normalizeBarcode(rawCode)
    if (!code || !isValidBarcodeFormat(code)) {
      setPhase("invalid_barcode")
      setErrorMessage("Invalid barcode format. Please scan a valid numeric product barcode.")
      return
    }
    if (isLookingUpRef.current) return
    isLookingUpRef.current = true
    setScannedCode(code)
    setPhase("detected")

    setTimeout(async () => {
      setPhase("looking_up")
      try {
        const product = await lookupBarcodeApi(code)
        if (!product) {
          setPhase("not_found")
          stopCameraStream()
          isLookingUpRef.current = false
          return
        }
        const returnedCode = normalizeBarcode(String(product.barcode || product.id || ""))
        if (returnedCode && returnedCode !== code) {
          setPhase("verification_failed")
          stopCameraStream()
          isLookingUpRef.current = false
          return
        }
        setActiveProduct(product)
        saveToHistory(code, product)
        setPhase("found")
        stopCameraStream()
        addToast(`Verified product: ${product.name}`, "success")
      } catch {
        setPhase("not_found")
        stopCameraStream()
      } finally {
        isLookingUpRef.current = false
      }
    }, 400)
  }

  const handleManualBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = normalizeBarcode(barcodeInput)
    if (!code || !isValidBarcodeFormat(code)) {
      setErrorMessage("Please enter a valid numeric barcode.")
      return
    }
    setIsLoadingApi(true)
    setErrorMessage(null)
    try {
      const product = await lookupBarcodeApi(code)
      setIsLoadingApi(false)
      if (!product) {
        setPhase("not_found")
        setScannedCode(code)
        return
      }
      const returnedCode = normalizeBarcode(String(product.barcode || product.id || ""))
      if (returnedCode && returnedCode !== code) {
        setPhase("verification_failed")
        setScannedCode(code)
        return
      }
      setActiveProduct(product)
      saveToHistory(code, product)
      setTab("scan")
      setPhase("found")
      addToast(`Exact match found: ${product.name}`, "success")
    } catch {
      setIsLoadingApi(false)
      setPhase("not_found")
      setScannedCode(code)
    }
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsLoadingApi(true)
    setErrorMessage(null)
    try {
      const results = await searchProductsApi(searchQuery)
      setIsLoadingApi(false)
      if (results && results.length > 0) {
        setSearchResults(results)
        addToast(`Found ${results.length} search results`, "success")
      } else {
        setSearchResults([])
        setErrorMessage(`No products found for "${searchQuery}".`)
      }
    } catch {
      setIsLoadingApi(false)
      setErrorMessage("Search failed. Please check your network connection.")
    }
  }

  const handleLogActiveProduct = () => {
    if (!activeProduct) return
    addMeal({
      foodId: activeProduct.id,
      name: activeProduct.name,
      sectionId: "lunch",
      servings: 1,
      grams: activeProduct.portionGrams || 100,
      calories: activeProduct.calories || 0,
      protein: activeProduct.protein || 0,
      carbs: activeProduct.carbs || 0,
      fat: activeProduct.fat || 0,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      img: activeProduct.img,
    })
  }

  const risk = activeProduct ? assessProductRisk(activeProduct, user) : { level: "info" as const, label: "SAFE", reason: "Verified product nutrition." }
  const micro = activeProduct?.micronutrients || {}

  const container = { hidden: {}, visible: { transition: { staggerChildren: prefersReduced ? 0 : 0.06, delayChildren: 0.08 } } }
  const itemV = { hidden: { opacity: 0, y: prefersReduced ? 0 : 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeVeyra } } }

  return (
    <div className="screen-scroll">
      <div className="mx-auto max-w-[1120px] w-full min-w-0">
        {/* ── Masthead — Veyra editorial ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeVeyra }}
          className="hidden sm:flex items-center justify-between py-2.5 mb-5 border-y border-[var(--veyra-mist)]/70"
        >
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#9CA3AF] flex items-center gap-3">
            <span className="text-[var(--veyra-ink)] font-700 tracking-[0.12em]">VEYRA ° SCAN</span>
            <span className="w-px h-3 bg-[var(--veyra-mist)]" />
            Real global barcode intelligence • Open Food Facts • exact verification
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#9CA3AF] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-clay)] animate-pulse" />
            Verified • cinematic • tactile
          </span>
        </motion.div>

        {/* ── Hero — ink premium, cinematic sense ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeVeyra }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-[var(--veyra-ink)]/10 mb-5"
          style={{ background: "var(--veyra-ink)" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
            <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, var(--veyra-clay) 0%, transparent 68%)" }} />
            <div className="absolute -bottom-32 -left-24 w-[560px] h-[560px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, var(--veyra-sage) 0%, transparent 70%)" }} />
          </div>

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8 p-5 sm:p-8 lg:p-9 items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white/75">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-ochre)] animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-600">Real barcode • Nutri-Score • Veyra analysis</span>
              </div>
              <h1 className="mt-4 flex flex-wrap items-baseline gap-x-2">
                <span className="display-xl text-[30px] sm:text-[40px] font-light leading-[0.88] tracking-[-0.04em] text-white">Product</span>
                <span className="font-display font-800 text-[30px] sm:text-[40px] leading-[0.88] tracking-[-0.02em] text-white">Intelligence</span>
                <span className="label-serif text-[36px] sm:text-[42px] leading-none text-[var(--veyra-ochre)]">.</span>
              </h1>
              <p className="text-[13px] leading-[1.6] text-white/60 max-w-[38ch] mt-3" style={{ fontFamily: "Inter, sans-serif" }}>
                Scan real food barcodes worldwide. Exact verification — no guesses. Nutri-Score, NOVA &amp; Veyra goal analysis in one tactile card.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[var(--veyra-ink)] text-xs font-700">
                  <ScanIcon size={12} /> Cinematic 400px viewfinder
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white/70 text-xs font-600">
                  Verified • Open Food Facts
                </span>
              </div>
            </div>

            {/* Companion stage — editorial, paper-cut */}
            <div className="relative flex flex-col items-center lg:items-end gap-4 min-h-[180px] justify-center min-w-0">
              <div className="relative">
                <div className="absolute inset-0 blur-[32px] opacity-20 rounded-full" style={{ background: "radial-gradient(circle, var(--veyra-ochre) 0%, transparent 70%)" }} />
                <VeyraCompanion mood="focus" accent="sage" size={142} float={!prefersReduced} />
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute -top-1 -right-2 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[var(--veyra-ink)] border border-[var(--veyra-mist)] shadow-sm text-xs font-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-sage)] animate-pulse" />
                  Point & verify
                </motion.div>
                <div className="absolute -bottom-1 -left-5 hidden sm:block opacity-60">
                  <Obj3D kind="leaf" size={30} float={!prefersReduced} />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 label-mono !text-white/45 !tracking-[0.12em]">
                <span className="w-8 h-px bg-white/15" />
                Tap companion after scan — Veyra logs it
              </div>
            </div>
          </div>

          <div className="relative h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }} />
          <div className="relative flex items-center justify-between gap-3 px-6 sm:px-8 py-3">
            <span className="label-mono !text-white/45 hidden sm:inline-flex items-center gap-2 !tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-sage)] animate-pulse" />
              Live scan • {scanHistory.length} verified • exact barcode match
            </span>
            <span className="label-mono !text-white/45 sm:hidden">{scanHistory.length} verified • global</span>
            <span className="label-mono !text-white/35 hidden sm:inline">320–1440 • tactile</span>
          </div>
        </motion.section>

        {/* ── Tabs — tactile pills ── */}
        <motion.div variants={container} initial="hidden" animate="visible" className="flex gap-2 mb-6 overflow-x-auto pb-1 snap-x snap-mandatory min-w-0" style={{ scrollbarWidth: "none" }}>
          {[
            ["scan", "Camera", ScanIcon],
            ["barcode", "Barcode", Barcode2Icon],
            ["search", "Search", SearchIcon],
            ["history", "History", CheckIcon],
          ].map(([id, label, Icon]: any) => (
            <motion.button
              key={id}
              variants={itemV}
              onClick={() => {
                setTab(id)
                setErrorMessage(null)
                if (id === "scan" && phase === "found") setPhase("idle")
              }}
              className={`snap-start shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-700 border transition-all ${tab === id ? "bg-[var(--veyra-ink)] text-white border-[var(--veyra-ink)] shadow-[0_4px_14px_rgba(15,26,28,0.14)]" : "bg-white text-[#6B7280] border-[var(--veyra-mist)] hover:border-[var(--veyra-ink)] hover:text-[var(--veyra-ink)] hover:-translate-y-0.5"}`}
            >
              <Icon size={13} /> {label}
              {id === "history" && scanHistory.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-700 ${tab === id ? "bg-white/15 text-white" : "bg-[var(--veyra-paper)] text-[#6B7280] border border-[var(--veyra-mist)]"}`}>{scanHistory.length}</span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* ── CONTENT ── */}
        <div className="max-w-[720px] mx-auto min-w-0">
          {/* TAB: SCAN */}
          {tab === "scan" && (
            <AnimatePresence mode="wait">
              {phase === "found" && activeProduct ? (
                <motion.div
                  key="found"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: easeVeyra }}
                  className="space-y-4"
                >
                  {/* Verified product editorial card */}
                  <div className="rounded-[28px] overflow-hidden border bg-white shadow-[0_12px_40px_rgba(15,26,28,0.08)]" style={{ borderColor: "var(--veyra-mist)" }}>
                    {/* Ink top band */}
                    <div className="relative p-5 sm:p-6" style={{ background: "var(--veyra-ink)" }}>
                      <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, var(--veyra-clay) 0%, transparent 68%)" }} />
                      <div className="relative flex gap-4 sm:gap-5 min-w-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[18px] overflow-hidden bg-white border border-white/20 shrink-0 shadow-sm">
                          {activeProduct.img ? (
                            <img src={activeProduct.img} alt={activeProduct.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full grid place-items-center bg-[var(--veyra-paper)]">
                              <VeyraCompanion mood="celebrate" accent="sage" size={56} float={false} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 label-mono !text-white !text-[10px] px-2 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B]" />
                              Verified
                            </span>
                            <NutriScoreBadge score={activeProduct.nutriScore} />
                            <NovaBadge group={activeProduct.novaGroup} />
                          </div>
                          <h2 className="font-display font-800 text-[18px] sm:text-[22px] leading-tight tracking-tight text-white mt-2 text-balance">{activeProduct.name}</h2>
                          {activeProduct.brand && <p className="text-xs font-600 text-white/70 mt-1">{activeProduct.brand}</p>}
                          {activeProduct.genericName && <p className="text-xs italic text-white/50 mt-0.5 line-clamp-2">{activeProduct.genericName}</p>}
                          <div className="flex flex-wrap items-center gap-2 mt-2.5">
                            <span className="label-mono !text-[10px] !text-white/50 !tracking-[0.12em]">BARCODE</span>
                            <span className="font-mono text-xs font-700 text-white px-2 py-1 rounded-full bg-white/10 border border-white/10">{activeProduct.barcode || scannedCode}</span>
                            {activeProduct.servingSize && <span className="font-mono text-[10px] text-white/55">• {activeProduct.servingSize}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body — paper */}
                    <div className="p-4 sm:p-6 space-y-5 bg-[var(--veyra-paper)]/30">
                      {/* Veyra Goal Analysis */}
                      <div className="rounded-[18px] border p-4 flex gap-3 items-start" style={{ background: risk.level === "warning" ? "#FFF0E8" : "#F5F0E8", borderColor: risk.level === "warning" ? "rgba(196,90,60,0.18)" : "var(--veyra-mist)" }}>
                        <span className="w-8 h-8 rounded-full grid place-items-center shrink-0 border shadow-sm" style={{ background: risk.level === "warning" ? "var(--veyra-clay)" : "var(--veyra-ink)", borderColor: risk.level === "warning" ? "var(--veyra-clay)" : "var(--veyra-ink)", color: "white" }}>
                          <SparklesIcon size={13} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="label-mono !text-[var(--veyra-ink)]">VEYRA GOAL ANALYSIS</span>
                            <span className={`label-mono !text-[10px] px-2 py-1 rounded-full font-700 !tracking-wide ${risk.level === "warning" ? "bg-[var(--veyra-clay)] text-white" : "bg-[var(--veyra-ink)] text-white"}`}>{risk.label}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-[#6B7280] mt-1.5">{risk.reason}</p>
                        </div>
                      </div>

                      {/* 4 macros — tactile, one highlighted */}
                      <div>
                        <div className="label-mono !text-[#9CA3AF] mb-2">Verified macros — per 100g</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { label: "Calories", val: activeProduct.calories ? `${activeProduct.calories}` : "—", unit: "kcal", key: false },
                            { label: "Protein", val: activeProduct.protein !== undefined ? `${activeProduct.protein}` : "—", unit: "g", key: true },
                            { label: "Carbs", val: activeProduct.carbs !== undefined ? `${activeProduct.carbs}` : "—", unit: "g", key: false },
                            { label: "Fat", val: activeProduct.fat !== undefined ? `${activeProduct.fat}` : "—", unit: "g", key: false },
                          ].map((m) => (
                            <div key={m.label} className={`rounded-[16px] p-3.5 text-center border transition-all ${m.key ? "bg-[var(--veyra-ink)] text-white border-[var(--veyra-ink)] shadow-[0_8px_24px_rgba(15,26,28,0.12)]" : "bg-white border-[var(--veyra-mist)]"}`}>
                              <div className={`font-display font-800 text-[18px] leading-none ${m.key ? "text-white" : "text-[var(--veyra-ink)]"}`}>{m.val}<span className={`text-xs font-600 ml-0.5 ${m.key ? "text-white/70" : "text-[#9CA3AF]"}`}> {m.unit}</span></div>
                              <div className={`label-mono !text-[9px] mt-1 ${m.key ? "!text-white/60" : "!text-[#9CA3AF]"}`}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2.5">
                          {[
                            { label: "Sugars", val: activeProduct.sugar !== undefined ? `${activeProduct.sugar}g` : "—" },
                            { label: "Fiber", val: activeProduct.fiber !== undefined ? `${activeProduct.fiber}g` : "—" },
                            { label: "Salt", val: activeProduct.salt !== undefined ? `${activeProduct.salt}g` : activeProduct.sodium !== undefined ? `${activeProduct.sodium}g` : "—" },
                          ].map((n) => (
                            <div key={n.label} className="rounded-[14px] bg-white border border-[var(--veyra-mist)] p-2.5 text-center">
                              <div className="label-mono !text-[9px] !text-[#9CA3AF]">{n.label}</div>
                              <div className={`font-display font-700 text-sm mt-0.5 ${n.val === "—" ? "text-[#9CA3AF]" : "text-[var(--veyra-ink)]"}`}>{n.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Micronutrients — tactile */}
                      <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: "var(--veyra-mist)" }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="label-mono !text-[var(--veyra-ink)]">Micronutrients &amp; vitamins</span>
                          <button onClick={() => setShowAllNutrients(!showAllNutrients)} className="label-mono !text-[var(--veyra-clay)] hover:underline !tracking-[0.08em] !normal-case">
                            {showAllNutrients ? "Collapse" : "View all"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                          {[
                            { label: "Calcium", val: micro.calcium !== undefined ? `${micro.calcium}mg` : "—" },
                            { label: "Iron", val: micro.iron !== undefined ? `${micro.iron}mg` : "—" },
                            { label: "Magnesium", val: micro.magnesium !== undefined ? `${micro.magnesium}mg` : "—" },
                            { label: "Potassium", val: micro.potassium !== undefined ? `${micro.potassium}mg` : "—" },
                            { label: "Vitamin C", val: micro.vitaminC !== undefined ? `${micro.vitaminC}mg` : "—" },
                            { label: "Vitamin D", val: micro.vitaminD !== undefined ? `${micro.vitaminD}µg` : "—" },
                          ].map((n) => (
                            <div key={n.label} className="rounded-[12px] bg-[var(--veyra-paper)] border border-[var(--veyra-mist)]/60 p-2.5 flex items-center justify-between">
                              <span className="text-xs font-600 text-[#6B7280]">{n.label}</span>
                              <span className={`text-xs font-700 ${n.val === "—" ? "text-[#9CA3AF]" : "text-[var(--veyra-ink)]"}`}>{n.val}</span>
                            </div>
                          ))}
                        </div>
                        <AnimatePresence>
                          {showAllNutrients && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: easeVeyra }} className="overflow-hidden">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-[var(--veyra-mist)]/60">
                                {[
                                  { label: "Zinc", val: micro.zinc !== undefined ? `${micro.zinc}mg` : "—" },
                                  { label: "Vitamin A", val: micro.vitaminA !== undefined ? `${micro.vitaminA}µg` : "—" },
                                  { label: "B12", val: micro.vitaminB12 !== undefined ? `${micro.vitaminB12}µg` : "—" },
                                  { label: "Folate", val: micro.folate !== undefined ? `${micro.folate}µg` : "—" },
                                ].map((n) => (
                                  <div key={n.label} className="rounded-[12px] bg-[var(--veyra-paper)] border border-[var(--veyra-mist)]/60 p-2.5 flex items-center justify-between">
                                    <span className="text-xs font-600 text-[#6B7280]">{n.label}</span>
                                    <span className={`text-xs font-700 ${n.val === "—" ? "text-[#9CA3AF]" : "text-[var(--veyra-ink)]"}`}>{n.val}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Expandable sections */}
                      <div className="space-y-2">
                        {[
                          { id: "ingredients", label: `Ingredients (${activeProduct.ingredients?.length || 0})`, content: activeProduct.ingredients && activeProduct.ingredients.length ? activeProduct.ingredients.join(", ") : "Not available" },
                          { id: "allergens", label: "Allergens & dietary flags", content: null },
                          { id: "categories", label: "Categories & origins", content: null },
                        ].map((sec) => (
                          <div key={sec.id} className="rounded-[14px] border bg-white overflow-hidden" style={{ borderColor: "var(--veyra-mist)" }}>
                            <button onClick={() => setExpandedSection(expandedSection === sec.id as any ? null : (sec.id as any))} className="w-full px-4 py-3 flex items-center justify-between text-left group">
                              <span className="label-mono !text-[var(--veyra-ink)] !tracking-[0.08em]">{sec.label}</span>
                              <span className={`w-7 h-7 rounded-full border grid place-items-center text-xs font-700 transition-all ${expandedSection === sec.id ? "bg-[var(--veyra-ink)] text-white border-[var(--veyra-ink)]" : "bg-[var(--veyra-paper)] border-[var(--veyra-mist)] text-[#6B7280] group-hover:border-[var(--veyra-ink)] group-hover:text-[var(--veyra-ink)]"}`}>{expandedSection === sec.id ? "−" : "+"}</span>
                            </button>
                            <AnimatePresence>
                              {expandedSection === sec.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: easeVeyra }} className="overflow-hidden">
                                  <div className="px-4 pb-3 pt-2 border-t text-xs leading-relaxed" style={{ borderColor: "var(--veyra-mist)", background: "var(--veyra-paper)" }}>
                                    {sec.id === "ingredients" && <span className="text-[#28302E]">{sec.content as string}</span>}
                                    {sec.id === "allergens" && (
                                      activeProduct.allergens && activeProduct.allergens.length ? (
                                        <div className="flex flex-wrap gap-1.5">
                                          {activeProduct.allergens.map((a, i) => (
                                            <span key={i} className="px-2 py-1 rounded-full bg-[#B96D62]/10 text-[#B96D62] font-700 text-[11px] border border-[#B96D62]/15">{a}</span>
                                          ))}
                                        </div>
                                      ) : <span className="text-[#6B7280] italic">No specific allergens reported</span>
                                    )}
                                    {sec.id === "categories" && (
                                      <div className="space-y-2">
                                        {activeProduct.categories && activeProduct.categories.length > 0 && (
                                          <div>
                                            <span className="label-mono !text-[9px] !text-[#9CA3AF] block mb-1">Categories</span>
                                            <div className="flex flex-wrap gap-1">
                                              {activeProduct.categories.slice(0, 6).map((c, i) => (
                                                <span key={i} className="px-2 py-1 rounded-full bg-white border border-[var(--veyra-mist)] text-[#0F1A1C] text-[11px] font-600">{c}</span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {activeProduct.countries && activeProduct.countries.length > 0 && <p className="text-[#28302E]">Countries: {activeProduct.countries.join(", ")}</p>}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                        {activeProduct.robotoffInsights && activeProduct.robotoffInsights.length > 0 && (
                          <div className="rounded-[14px] border overflow-hidden" style={{ background: "rgba(196,90,60,0.06)", borderColor: "rgba(196,90,60,0.18)" }}>
                            <button onClick={() => setExpandedSection(expandedSection === "robotoff" ? null : "robotoff")} className="w-full px-4 py-3 flex items-center justify-between text-left">
                              <span className="label-mono !text-[var(--veyra-clay)]">Robotoff enrichment ({activeProduct.robotoffInsights.length})</span>
                              <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-700 border ${expandedSection === "robotoff" ? "bg-[var(--veyra-clay)] text-white border-[var(--veyra-clay)]" : "bg-white border-[var(--veyra-mist)] text-[var(--veyra-clay)]"}`}>{expandedSection === "robotoff" ? "−" : "+"}</span>
                            </button>
                            <AnimatePresence>
                              {expandedSection === "robotoff" && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: easeVeyra }} className="overflow-hidden">
                                  <div className="px-4 pb-3 pt-2 border-t space-y-1" style={{ borderColor: "rgba(196,90,60,0.18)" }}>
                                    {activeProduct.robotoffInsights.map((insight: RobotoffInsight, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between text-xs text-[#28302E]">
                                        <span>{insight.type}: <strong>{insight.value}</strong></span>
                                        {insight.confidence && <span className="font-mono text-[10px] text-[#6B7280]">{Math.round(insight.confidence * 100)}%</span>}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                      {/* Actions — tactile */}
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <button onClick={handleLogActiveProduct} className="flex-1 min-w-[160px] btn-primary py-3.5 flex items-center justify-center gap-2 text-sm font-700">
                          <PlusIcon size={14} /> Add to Food Log
                        </button>
                        <button onClick={() => toggleFavorite(activeProduct.id)} className="btn-ghost px-4 py-3.5 text-sm flex items-center gap-1.5 shrink-0">
                          <StarIcon size={14} filled={favorites.has(activeProduct.id)} /> {favorites.has(activeProduct.id) ? "Saved" : "Save"}
                        </button>
                        <button onClick={() => setPhase("idle")} className="btn-ghost px-4 py-3.5 text-sm shrink-0">Scan Another</button>
                      </div>

                      <p className="text-center label-mono !text-[#9CA3AF] !tracking-[0.10em]">Exact barcode match • No guessing • tactile save</p>
                    </div>
                  </div>
                </motion.div>
              ) : phase === "not_found" ? (
                <motion.div key="notfound" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[28px] border bg-[#FFFBF5] p-8 sm:p-10 text-center relative overflow-hidden" style={{ borderColor: "var(--veyra-mist)" }}>
                  <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                  <div className="relative">
                    <div className="mx-auto w-fit">
                      <VeyraCompanion mood="think" accent="clay" size={88} float={false} />
                    </div>
                    <div className="label-mono !text-[var(--veyra-clay)] mt-3">BARCODE: {scannedCode}</div>
                    <h2 className="font-display font-800 text-[22px] text-[var(--veyra-ink)] mt-2">Product not found</h2>
                    <p className="text-sm leading-relaxed text-[#6B7280] max-w-[36ch] mx-auto mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
                      No verified match for <span className="font-mono font-700 text-[var(--veyra-ink)]">{scannedCode}</span>. Veyra never guesses — try another code or search by name.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-6 max-w-md mx-auto">
                      <button onClick={() => { setPhase("idle"); startCameraScanner() }} className="btn-primary w-full sm:w-auto px-6 py-3 text-sm font-700">Try Again</button>
                      <button onClick={() => setTab("barcode")} className="btn-ghost w-full sm:w-auto px-5 py-3 text-sm font-600">Manual Entry</button>
                      <button onClick={() => setTab("search")} className="btn-ghost w-full sm:w-auto px-5 py-3 text-sm font-600">Search Name</button>
                    </div>
                  </div>
                </motion.div>
              ) : phase === "verification_failed" ? (
                <motion.div key="verifyfail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[28px] border p-8 sm:p-10 text-center bg-[#FFF0F0] relative overflow-hidden" style={{ borderColor: "rgba(196,90,60,0.18)" }}>
                  <div className="mx-auto w-fit"><VeyraCompanion mood="think" accent="clay" size={86} float={false} /></div>
                  <h2 className="font-display font-800 text-[18px] text-[#B96D62] mt-3">Verification failed</h2>
                  <p className="text-sm text-[#6B7280] max-w-sm mx-auto mt-2 leading-relaxed">Returned barcode did not match scanned <span className="font-mono font-700 text-[var(--veyra-ink)]">{scannedCode}</span>. Please rescan.</p>
                  <button onClick={() => { setPhase("idle"); startCameraScanner() }} className="btn-primary px-6 py-3 text-sm font-700 mt-5 mx-auto">Try Scanning Again</button>
                </motion.div>
              ) : (
                <motion.div key="camera" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Viewfinder — editorial atelier, not surveillance */}
                  <div className="relative rounded-[22px] overflow-hidden border bg-white shadow-[0_12px_32px_rgba(15,26,28,0.06)]" style={{ borderColor: "var(--veyra-mist)" }}>
                    {/* Paper header — tactile, warm */}
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b bg-[var(--veyra-paper)]/60" style={{ borderColor: "var(--veyra-mist)" }}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[var(--veyra-ink)] text-white grid place-items-center shrink-0">
                          <ScanIcon size={13} />
                        </span>
                        <div className="min-w-0">
                          <div className="label-mono !text-[var(--veyra-ink)] !text-[10px] leading-none">Camera Atelier</div>
                          <div className="font-mono text-[11px] text-[#6B7280] leading-none mt-0.5 hidden sm:block">Point barcode • Exact verification</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {phase === "scanning" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--veyra-ink)] text-white text-[11px] font-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8B] animate-pulse" /> Live
                          </span>
                        ) : (
                          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[var(--veyra-mist)] text-[11px] font-600 text-[#6B7280]">
                            <span className="w-1 h-1 rounded-full bg-[#8A9A8B]" /> Ready
                          </span>
                        )}
                        <span className="hidden sm:inline-flex label-mono !text-[#9CA3AF] !text-[9px] px-2 py-1 rounded-full bg-white border border-[var(--veyra-mist)]">{phase === "scanning" ? "320–1440" : "320–1440 • tactile"}</span>
                      </div>
                    </div>

                    {/* Viewfinder — 320px, warm paper, not dark */}
                    <div className="relative overflow-hidden select-none" style={{ height: 320, background: "#0F1A1C" }}>
                      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
                      {/* Subtle grain, not vignette */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(520px circle at 50% 52%, transparent 46%, rgba(15,26,28,0.42) 100%)" }} />

                      {/* Target — editorial, warm, not surveillance */}
                      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                        <div className="relative w-[260px] sm:w-[300px] h-[168px] sm:h-[176px] rounded-[16px] bg-white/6 backdrop-blur-[2px] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                          {/* Paper corner brackets — warm, not harsh white */}
                          <span className="absolute -top-1.5 -left-1.5 w-[22px] h-[22px] rounded-tl-[10px] border-t-[2.5px] border-l-[2.5px] border-[#FFFBF5] shadow-[0_1px_8px_rgba(0,0,0,0.18)]" />
                          <span className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-tr-[10px] border-t-[2.5px] border-r-[2.5px] border-[#FFFBF5] shadow-[0_1px_8px_rgba(0,0,0,0.18)]" />
                          <span className="absolute -bottom-1.5 -left-1.5 w-[22px] h-[22px] rounded-bl-[10px] border-b-[2.5px] border-l-[2.5px] border-[#FFFBF5] shadow-[0_1px_8px_rgba(0,0,0,0.18)]" />
                          <span className="absolute -bottom-1.5 -right-1.5 w-[22px] h-[22px] rounded-br-[10px] border-b-[2.5px] border-r-[2.5px] border-[#FFFBF5] shadow-[0_1px_8px_rgba(0,0,0,0.18)]" />
                          <span className="absolute inset-0 rounded-[16px] border border-white/10 pointer-events-none" />
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 label-mono !text-[9px] !text-[#0F1A1C] bg-[#FFFBF5] border border-[#E8E0D0] px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">ALIGN BARCODE</span>
                          {phase === "scanning" && !prefersReduced && (
                            <motion.span
                              className="absolute left-2 right-2 h-[1.5px] rounded-full"
                              style={{ background: "linear-gradient(90deg, transparent, var(--veyra-clay), transparent)", boxShadow: "0 0 10px rgba(196,90,60,0.85)" }}
                              initial={{ top: "12%" }}
                              animate={{ top: ["12%", "84%", "12%"] }}
                              transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          {phase === "scanning" && prefersReduced && <span className="absolute left-2 right-2 top-1/2 h-px bg-white/50" />}
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-60">
                            <span className="absolute left-1/2 top-0 bottom-0 w-px bg-white/25 -translate-x-1/2" />
                            <span className="absolute top-1/2 left-0 right-0 h-px bg-white/25 -translate-y-1/2" />
                          </span>
                        </div>
                      </div>

                      {/* Bottom status — paper, not dark */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="mx-auto max-w-[420px] rounded-[14px] px-3.5 py-2.5 text-center bg-white/92 backdrop-blur-xl border shadow-[0_6px_20px_rgba(15,26,28,0.08)]" style={{ borderColor: "rgba(232,224,208,0.9)" }}>
                          {phase === "idle" && <p className="text-xs font-600 text-[#0F1A1C]">Tap <span className="text-[var(--veyra-clay)] font-700">Start Camera</span> — point barcode inside frame</p>}
                          {phase === "starting" && <p className="text-xs font-700 text-[var(--veyra-clay)] animate-pulse">Initializing camera…</p>}
                          {phase === "scanning" && <p className="text-xs font-600 text-[#6B7280]">Hold steady • Keep barcode inside frame</p>}
                          {phase === "detected" && <p className="text-xs font-800 text-[var(--veyra-clay)]">Barcode detected — verifying…</p>}
                          {phase === "looking_up" && <p className="text-xs font-700 text-[#0F1A1C] animate-pulse">Querying Open Food Facts — {scannedCode}…</p>}
                          {(phase === "permission_denied" || phase === "unsupported" || phase === "error" || phase === "invalid_barcode") && (
                            <p className="text-xs font-600 text-[#B96D62]">{errorMessage}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls — integrated, editorial */}
                    <div className="p-3 sm:p-4 bg-[var(--veyra-paper)]/50 border-t flex gap-2.5" style={{ borderColor: "var(--veyra-mist)" }}>
                      {phase === "scanning" ? (
                        <button onClick={stopCameraStream} className="flex-1 bg-white border border-[var(--veyra-mist)] text-[#0F1A1C] py-3 rounded-[14px] text-sm font-700 hover:border-[#0F1A1C] hover:-translate-y-px transition-all">Stop Camera</button>
                      ) : (
                        <button onClick={startCameraScanner} className="flex-1 bg-[#0F1A1C] text-white py-3 rounded-[14px] inline-flex items-center justify-center gap-2 text-sm font-700 hover:bg-[#1D2A2E] hover:-translate-y-px transition-all shadow-[0_4px_14px_rgba(15,26,28,0.14)]">
                          <ScanIcon size={14} /> Start Camera Scanner
                        </button>
                      )}
                      <button onClick={() => setTab("barcode")} className="bg-white border border-[var(--veyra-mist)] px-5 py-3 rounded-[14px] text-sm font-600 text-[#6B7280] hover:text-[#0F1A1C] hover:border-[#0F1A1C] shrink-0 transition-all">Manual Entry</button>
                    </div>
                  </div>

                  {errorMessage && phase !== "permission_denied" && phase !== "unsupported" && phase !== "error" && phase !== "invalid_barcode" && (
                    <div className="rounded-[14px] bg-[#FDF2F2] border border-[#FECACA] text-[#B96D62] text-xs font-600 text-center p-3">{errorMessage}</div>
                  )}
                  {phase === "idle" && (
                    <div className="rounded-[16px] bg-white border border-[var(--veyra-mist)] p-4 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[var(--veyra-paper)] border border-[var(--veyra-mist)] grid place-items-center text-[var(--veyra-ink)] shrink-0"><Barcode2Icon size={14} /></span>
                      <div className="min-w-0">
                        <div className="label-mono !text-[var(--veyra-ink)]">Cinematic mode</div>
                        <p className="text-xs text-[#6B7280] leading-relaxed">400px viewfinder • Corner brackets • Scan-line • 320–1440 • Reduced-motion aware.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* TAB: MANUAL BARCODE */}
          {tab === "barcode" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeVeyra }} className="space-y-4">
              <div className="rounded-[28px] border bg-white p-6 sm:p-8 text-center relative overflow-hidden" style={{ borderColor: "var(--veyra-mist)", background: "var(--veyra-paper)" }}>
                <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-[16px] bg-[var(--veyra-ink)] text-white grid place-items-center mx-auto shadow-sm">
                    <Barcode2Icon size={22} />
                  </div>
                  <h3 className="font-display font-800 text-[18px] text-[var(--veyra-ink)] mt-4">Enter Barcode Manually</h3>
                  <p className="text-sm leading-relaxed text-[#6B7280] max-w-[36ch] mx-auto mt-2" style={{ fontFamily: "Inter, sans-serif" }}>Any numeric product barcode worldwide — EAN-13, EAN-8, UPC. Veyra verifies exact match.</p>
                  <form onSubmit={handleManualBarcodeSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mt-6">
                    <input
                      type="text"
                      className="input-field flex-1 py-3 px-4 text-sm font-mono"
                      placeholder="e.g. 3017620422003"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                    />
                    <button type="submit" disabled={isLoadingApi} className="btn-primary px-6 py-3 text-sm font-700 shrink-0 disabled:opacity-60">
                      {isLoadingApi ? "Searching…" : "Find Product"}
                    </button>
                  </form>
                  {errorMessage && (
                    <div className="mt-4 rounded-[12px] bg-[#FDF2F2] border border-[#FECACA] text-[#B96D62] text-xs font-600 p-3 max-w-md mx-auto">{errorMessage}</div>
                  )}
                  <div className="mt-4 label-mono !text-[#9CA3AF]">Exact verification • No guesses • {scanHistory.length} verified</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: SEARCH */}
          {tab === "search" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeVeyra }} className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  className="input-field w-full pl-11 pr-[88px] py-3.5 text-sm"
                  placeholder="Search product by name (e.g. Nutella, Oat Milk)…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <button type="submit" disabled={isLoadingApi} className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 text-xs font-700 disabled:opacity-60">
                  {isLoadingApi ? "Loading…" : "Search"}
                </button>
              </form>

              {isLoadingApi && (
                <div className="rounded-[20px] border bg-white p-8 text-center" style={{ borderColor: "var(--veyra-mist)" }}>
                  <span className="w-8 h-8 rounded-full bg-[var(--veyra-paper)] border border-[var(--veyra-mist)] grid place-items-center mx-auto text-[var(--veyra-clay)] animate-pulse">
                    <SparklesIcon size={16} />
                  </span>
                  <p className="text-sm font-700 text-[var(--veyra-ink)] mt-3">Querying global product database…</p>
                  <p className="label-mono !text-[#9CA3AF] mt-1">Open Food Facts • live</p>
                </div>
              )}

              {errorMessage && !isLoadingApi && (
                <div className="rounded-[16px] border bg-[#FFF7ED] p-4 text-center" style={{ borderColor: "rgba(196,90,60,0.18)" }}>
                  <p className="text-sm font-600 text-[var(--veyra-clay)]">{errorMessage}</p>
                </div>
              )}

              {!isLoadingApi && searchResults.length > 0 && (
                <div className="space-y-2.5">
                  {searchResults.map((prod) => (
                    <motion.button
                      key={prod.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => { setActiveProduct(prod); setScannedCode(String(prod.barcode || prod.id)); setTab("scan"); setPhase("found") }}
                      className="w-full text-left rounded-[18px] border bg-white p-3.5 flex items-center gap-3 hover:border-[var(--veyra-ink)] hover:shadow-[0_8px_24px_rgba(15,26,28,0.06)] hover:-translate-y-0.5 transition-all min-w-0"
                      style={{ borderColor: "var(--veyra-mist)" }}
                    >
                      {prod.img ? (
                        <img src={prod.img} alt={prod.name} className="w-12 h-12 rounded-[12px] object-cover border border-[var(--veyra-mist)] shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-[12px] bg-[var(--veyra-paper)] border border-[var(--veyra-mist)] grid place-items-center text-[10px] font-800 text-[var(--veyra-ink)] shrink-0">FOOD</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="label-mono !text-[9px] !text-[var(--veyra-clay)]">SEARCH RESULT</span>
                          <NutriScoreBadge score={prod.nutriScore} />
                        </div>
                        <div className="font-display font-700 text-sm leading-tight text-[var(--veyra-ink)] truncate mt-0.5">{prod.name}</div>
                        <div className="font-mono text-xs text-[#6B7280] truncate">{prod.brand || "Verified Brand"} • {prod.calories ? `${prod.calories} kcal` : "—"}</div>
                      </div>
                      <span className="hidden sm:inline-flex label-mono !text-[var(--veyra-ink)] !text-[10px] px-2.5 py-1 rounded-full bg-[var(--veyra-paper)] border border-[var(--veyra-mist)] shrink-0">Inspect →</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: HISTORY */}
          {tab === "history" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeVeyra }} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display font-800 text-[16px] text-[var(--veyra-ink)]">Verified Scan History</h3>
                <span className="label-mono !text-[#9CA3AF]">{scanHistory.length} recent</span>
              </div>

              {scanHistory.length === 0 ? (
                <div className="rounded-[28px] border bg-[#FFFBF5] p-10 text-center relative overflow-hidden" style={{ borderColor: "var(--veyra-mist)" }}>
                  <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                  <div className="relative">
                    <div className="mx-auto w-fit"><VeyraCompanion mood="warm" accent="sage" size={72} float={false} /></div>
                    <p className="font-display font-700 text-sm text-[var(--veyra-ink)] mt-3">No verified scans yet</p>
                    <p className="text-sm text-[#6B7280] mt-1 max-w-[32ch] mx-auto leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>Your verified products for <span className="font-600 text-[var(--veyra-ink)]">{user.name}</span> will appear here.</p>
                    <button onClick={() => setTab("scan")} className="btn-primary px-5 py-2.5 text-xs font-700 mt-4">Scan First Product</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {scanHistory.map((item, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.4, ease: easeVeyra }}
                      onClick={() => { setActiveProduct(item.product); setScannedCode(item.code); setTab("scan"); setPhase("found") }}
                      className="w-full text-left rounded-[18px] border bg-white p-3.5 flex items-center gap-3 hover:border-[var(--veyra-ink)] hover:shadow-[0_8px_24px_rgba(15,26,28,0.06)] hover:-translate-y-0.5 transition-all min-w-0"
                      style={{ borderColor: "var(--veyra-mist)" }}
                    >
                      {item.product.img ? (
                        <img src={item.product.img} alt={item.product.name} className="w-12 h-12 rounded-[12px] object-cover border border-[var(--veyra-mist)] shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-[12px] bg-[var(--veyra-paper)] grid place-items-center text-xs font-800 text-[var(--veyra-ink)] shrink-0">FOOD</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-700 text-[var(--veyra-clay)]">{item.code}</span>
                          <span className="font-mono text-[10px] text-[#9CA3AF]">{item.timestamp}</span>
                        </div>
                        <div className="font-display font-700 text-sm leading-tight text-[var(--veyra-ink)] truncate">{item.product.name}</div>
                        <div className="font-mono text-xs text-[#6B7280] truncate">{item.product.brand || "Verified"} • {item.product.calories ? `${item.product.calories} kcal` : "—"}</div>
                      </div>
                      <span className="hidden sm:inline-flex label-mono !text-[var(--veyra-ink)] !text-[10px] px-2.5 py-1 rounded-full bg-[var(--veyra-paper)] border border-[var(--veyra-mist)] shrink-0">View →</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <p className="mt-8 text-center label-mono !text-[#9CA3AF] !tracking-[0.12em]">Cinematic viewfinder • Editorial product card • Veyra tactile — 400px • 320–1440</p>
      </div>
    </div>
  )
}
