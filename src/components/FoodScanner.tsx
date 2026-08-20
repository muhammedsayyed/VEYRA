import React, { useState, useEffect, useRef } from "react"
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
import { VeyraCharacter, Obj3D } from "@/components/VeyraChar"
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

function NutriScoreBadge({ score }: { score?: "A" | "B" | "C" | "D" | "E" }) {
  if (!score) return null
  const colors: Record<string, string> = {
    A: "#172A35",
    B: "#315A63",
    C: "#C18A5A",
    D: "#D9A06F",
    E: "#B96D62",
  }
  const displayScore = score.toUpperCase()
  return (
    <div className="flex items-center gap-1 bg-[#F1EEE6] px-2.5 py-1 rounded-xl border border-[#E6E0D5]">
      <span className="label-mono text-[10px] text-[#6B7280]">NUTRI-SCORE</span>
      <span
        className="font-display font-900 text-xs px-2 py-0.5 rounded-md text-[#FFFFFF] shadow-sm"
        style={{ background: colors[displayScore] || "#172A35" }}
      >
        {displayScore}
      </span>
    </div>
  )
}

function NovaBadge({ group }: { group?: 1 | 2 | 3 | 4 }) {
  if (!group) return null
  const labels: Record<number, string> = {
    1: "Unprocessed / Minimal",
    2: "Processed Culinary",
    3: "Processed Food",
    4: "Ultra-Processed",
  }
  return (
    <div className="flex items-center gap-1 bg-[#F1EEE6] px-2.5 py-1 rounded-xl border border-[#E6E0D5]">
      <span className="label-mono text-[10px] text-[#6B7280]">NOVA {group}</span>
      <span className="text-[10px] font-semibold text-[#172A35] hidden sm:inline">
        · {labels[group]}
      </span>
    </div>
  )
}

export default function FoodScanner() {
  const { user, addMeal, addToast, toggleFavorite, favorites, lookupBarcodeApi, searchProductsApi } = useApp()

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

  // User-isolated scan history
  const historyKey = `veyra_scan_history_${user.email}`
  useEffect(() => {
    const loaded = readJson<Array<{ code: string; product: FoodItem; timestamp: string }>>(historyKey, [])
    setScanHistory(loaded)
  }, [user.email])

  const saveToHistory = (code: string, product: FoodItem) => {
    const entry = {
      code,
      product,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
    }
    const updated = [entry, ...scanHistory.filter((h) => h.code !== code)].slice(0, 25)
    setScanHistory(updated)
    writeJson(historyKey, updated)
  }

  // Camera Teardown & Resource Cleanup
  const stopCameraStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    if (controlsRef.current) {
      try {
        controlsRef.current.stop()
      } catch (err) {
        // ignore
      }
      controlsRef.current = null
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Complete cleanup on unmount or tab change
  useEffect(() => {
    return () => {
      stopCameraStream()
    }
  }, [])

  useEffect(() => {
    if (tab !== "scan") {
      stopCameraStream()
      setPhase("idle")
    }
  }, [tab])

  // Camera Scanner Loop (BarcodeDetector Primary + ZXing Fallback)
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
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setPhase("scanning")

      // 1. Primary: Native Browser BarcodeDetector API if available
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
            } catch (err) {
              // ignore frame errors
            }
          }
          if (phase === "scanning" || videoRef.current?.srcObject) {
            animFrameRef.current = requestAnimationFrame(detectLoop)
          }
        }
        animFrameRef.current = requestAnimationFrame(detectLoop)
        return
      }

      // 2. Fallback: @zxing/browser Engine
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.ITF,
        BarcodeFormat.QR_CODE,
      ])

      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 250,
      })

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

  // Barcode Lookup & Exact Verification Pipeline
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

    console.log(`[Veyra Scanner] Detected barcode: ${code}`)

    setTimeout(async () => {
      setPhase("looking_up")
      console.log(`[Veyra Scanner] Querying Open Food Facts API for barcode: ${code}`)

      try {
        const product = await lookupBarcodeApi(code)

        if (!product) {
          console.log(`[Veyra Scanner] Product not found for code: ${code}`)
          setPhase("not_found")
          stopCameraStream()
          isLookingUpRef.current = false
          return
        }

        const returnedCode = normalizeBarcode(String(product.barcode || product.id || ""))

        // Exact Barcode Verification
        if (returnedCode && returnedCode !== code) {
          console.warn(`[Veyra Scanner] Barcode mismatch! Scanned: ${code}, Returned: ${returnedCode}`)
          setPhase("verification_failed")
          stopCameraStream()
          isLookingUpRef.current = false
          return
        }

        // Verified Match
        console.log(`[Veyra Scanner] Exact match verified: ${product.name}`)
        setActiveProduct(product)
        saveToHistory(code, product)
        setPhase("found")
        stopCameraStream()
        addToast(`Verified product: ${product.name}`, "success")
      } catch (err: any) {
        console.warn(`[Veyra Scanner] Lookup failed for code ${code}:`, err)
        setPhase("not_found")
        stopCameraStream()
      } finally {
        isLookingUpRef.current = false
      }
    }, 400)
  }

  // Manual Barcode Submit Handler
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
    } catch (err: any) {
      setIsLoadingApi(false)
      setPhase("not_found")
      setScannedCode(code)
    }
  }

  // Product Name Search Handler
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
    } catch (err) {
      setIsLoadingApi(false)
      setErrorMessage("Search failed. Please check your network connection.")
    }
  }

  // Add Verified Product to Food Log
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

  const risk = activeProduct ? assessProductRisk(activeProduct, user) : { level: "info", label: "SAFE", reason: "Verified product nutrition." }
  const micro = activeProduct?.micronutrients || {}

  return (
    <div className="screen-scroll">
      {/* Hero Header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl gradient-hero p-6 sm:p-7">
        <div className="absolute right-3 top-2 opacity-80 pointer-events-none animate-float">
          <Obj3D kind="avocado" size={64} />
        </div>
        <div className="absolute right-20 bottom-1 opacity-70 pointer-events-none animate-float2">
          <Obj3D kind="berry" size={40} />
        </div>
        <p className="label-mono text-[11px] mb-2" style={{ color: "#C18A5A" }}>
          REAL GLOBAL BARCODE INTELLIGENCE
        </p>
        <h1 className="display-xl text-[#172A35]">Product Intelligence</h1>
        <p className="text-sm mt-2 max-w-sm" style={{ color: "#6B7280" }}>
          Scan real food barcodes globally for Open Food Facts product data, Nutri-Score &amp; Veyra goal analysis.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          ["scan", "Camera Scanner", ScanIcon],
          ["barcode", "Manual Barcode", Barcode2Icon],
          ["search", "Search Product Name", SearchIcon],
          ["history", "Verified Scan History", CheckIcon],
        ].map(([id, label, Icon]: any) => (
          <button
            key={id}
            onClick={() => {
              setTab(id)
              setErrorMessage(null)
              if (id === "scan" && phase === "found") setPhase("idle")
            }}
            className={`chip flex items-center gap-2 whitespace-nowrap ${tab === id ? "active" : ""}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* TAB 1: CAMERA SCANNER */}
      {tab === "scan" && (
        <div className="max-w-xl">
          {phase === "found" && activeProduct ? (
            /* VERIFIED PRODUCT RESULT SCREEN */
            <div className="animate-fade-in-up space-y-4">
              <div className="glass rounded-3xl p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none">
                  <Obj3D kind="leaf" size={80} />
                </div>

                {/* Identity Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4">
                    {activeProduct.img ? (
                      <img src={activeProduct.img} alt={activeProduct.name} className="w-24 h-24 rounded-2xl object-cover border border-[#E6E0D5] shrink-0 bg-[#F1EEE6]" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-[#F1EEE6] border border-[#E6E0D5] flex items-center justify-center shrink-0">
                        <VeyraCharacter mood="cheer" accent="mint" size={60} />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <NutriScoreBadge score={activeProduct.nutriScore} />
                        <NovaBadge group={activeProduct.novaGroup} />
                      </div>
                      <h2 className="font-display font-800 text-[#172A35] text-xl sm:text-2xl leading-tight mb-1">{activeProduct.name}</h2>
                      {activeProduct.brand && (
                        <p className="text-xs font-semibold text-[#315A63]">{activeProduct.brand}</p>
                      )}
                      {activeProduct.genericName && (
                        <p className="text-xs text-[#6B7280] italic mt-0.5">{activeProduct.genericName}</p>
                      )}
                      <p className="label-mono text-[10px] text-[#C18A5A] mt-2">
                        BARCODE: {activeProduct.barcode || scannedCode}
                      </p>
                      {activeProduct.servingSize && (
                        <p className="text-[11px] text-[#6B7280] mt-0.5">Serving Size: {activeProduct.servingSize}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Veyra Health Advisor Risk Assessment */}
                <div className="flex flex-col gap-2 mb-5 p-4 rounded-2xl bg-[#F1EEE6] border border-[#E6E0D5]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="label-mono text-[#172A35] font-bold">VEYRA GOAL ANALYSIS</span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-md ${risk.level === "warning" ? "bg-[#C18A5A]/20 text-[#C18A5A]" : "bg-[#172A35]/20 text-[#172A35]"}`}>
                      {risk.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{risk.reason}</p>
                </div>

                {/* Verified Macros Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: "Calories", val: activeProduct.calories ? `${activeProduct.calories} kcal` : "Not available", key: false },
                    { label: "Protein", val: activeProduct.protein !== undefined ? `${activeProduct.protein}g` : "Not available", key: true },
                    { label: "Carbs", val: activeProduct.carbs !== undefined ? `${activeProduct.carbs}g` : "Not available", key: false },
                    { label: "Fat", val: activeProduct.fat !== undefined ? `${activeProduct.fat}g` : "Not available", key: false },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-2xl p-3 text-center"
                      style={{
                        background: m.key ? "rgba(23,42,53,0.08)" : "#F1EEE6",
                        border: m.key ? "1px solid rgba(23,42,53,0.2)" : "1px solid #E6E0D5",
                      }}
                    >
                      <div className="font-display font-800 text-sm sm:text-base" style={{ color: m.key ? "#172A35" : "#28302E" }}>
                        {m.val}
                      </div>
                      <div className="label-mono text-[9px] mt-1" style={{ color: m.key ? "#172A35" : "#6B7280" }}>
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Detailed Nutrients */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
                  <div className="glass p-2.5 rounded-xl">
                    <span className="label-mono text-[9px] text-[#6B7280] block">SUGARS</span>
                    <span className="font-semibold text-[#172A35]">{activeProduct.sugar !== undefined ? `${activeProduct.sugar}g` : "Not available"}</span>
                  </div>
                  <div className="glass p-2.5 rounded-xl">
                    <span className="label-mono text-[9px] text-[#6B7280] block">FIBER</span>
                    <span className="font-semibold text-[#172A35]">{activeProduct.fiber !== undefined ? `${activeProduct.fiber}g` : "Not available"}</span>
                  </div>
                  <div className="glass p-2.5 rounded-xl">
                    <span className="label-mono text-[9px] text-[#6B7280] block">SALT / SODIUM</span>
                    <span className="font-semibold text-[#172A35]">
                      {activeProduct.salt !== undefined ? `${activeProduct.salt}g` : activeProduct.sodium !== undefined ? `${activeProduct.sodium}g Na` : "Not available"}
                    </span>
                  </div>
                </div>

                {/* Micronutrients Section */}
                <div className="mb-5 p-4 rounded-2xl glass border border-[#E6E0D5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-mono text-xs text-[#172A35]">MICRONUTRIENTS &amp; VITAMINS</span>
                    <button
                      onClick={() => setShowAllNutrients(!showAllNutrients)}
                      className="text-xs text-[#C18A5A] font-semibold hover:underline"
                    >
                      {showAllNutrients ? "Collapse" : "View All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { label: "Calcium", val: micro.calcium !== undefined ? `${micro.calcium}mg` : "Not available" },
                      { label: "Iron", val: micro.iron !== undefined ? `${micro.iron}mg` : "Not available" },
                      { label: "Magnesium", val: micro.magnesium !== undefined ? `${micro.magnesium}mg` : "Not available" },
                      { label: "Potassium", val: micro.potassium !== undefined ? `${micro.potassium}mg` : "Not available" },
                      { label: "Vitamin C", val: micro.vitaminC !== undefined ? `${micro.vitaminC}mg` : "Not available" },
                      { label: "Vitamin D", val: micro.vitaminD !== undefined ? `${micro.vitaminD}µg` : "Not available" },
                    ].map((n) => (
                      <div key={n.label} className="p-2 rounded-xl bg-[#F1EEE6] flex items-center justify-between">
                        <span className="text-[#6B7280] font-medium">{n.label}</span>
                        <span className={`font-semibold ${n.val === "Not available" ? "text-[#9CA3AF]" : "text-[#172A35]"}`}>{n.val}</span>
                      </div>
                    ))}
                  </div>

                  {showAllNutrients && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t border-[#E6E0D5]">
                      {[
                        { label: "Zinc", val: micro.zinc !== undefined ? `${micro.zinc}mg` : "Not available" },
                        { label: "Vitamin A", val: micro.vitaminA !== undefined ? `${micro.vitaminA}µg` : "Not available" },
                        { label: "Vitamin B12", val: micro.vitaminB12 !== undefined ? `${micro.vitaminB12}µg` : "Not available" },
                        { label: "Folate / B9", val: micro.folate !== undefined ? `${micro.folate}µg` : "Not available" },
                      ].map((n) => (
                        <div key={n.label} className="p-2 rounded-xl bg-[#F1EEE6] flex items-center justify-between">
                          <span className="text-[#6B7280] font-medium">{n.label}</span>
                          <span className={`font-semibold ${n.val === "Not available" ? "text-[#9CA3AF]" : "text-[#172A35]"}`}>{n.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expandable Sections (Ingredients, Allergens, Categories, Robotoff) */}
                <div className="space-y-2 mb-5">
                  {/* Ingredients */}
                  <div className="rounded-xl border border-[#E6E0D5] bg-[#F1EEE6]/60 overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedSection(expandedSection === "ingredients" ? null : "ingredients")}
                      className="w-full px-4 py-3 flex items-center justify-between font-semibold text-[#172A35]"
                    >
                      <span>INGREDIENTS ({activeProduct.ingredients?.length || 0})</span>
                      <span>{expandedSection === "ingredients" ? "−" : "+"}</span>
                    </button>
                    {expandedSection === "ingredients" && (
                      <div className="px-4 pb-3 text-[#28302E] leading-relaxed border-t border-[#E6E0D5] pt-2">
                        {activeProduct.ingredients && activeProduct.ingredients.length > 0 ? (
                          activeProduct.ingredients.join(", ")
                        ) : (
                          <span className="text-[#6B7280] italic">Not available</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Allergens */}
                  <div className="rounded-xl border border-[#E6E0D5] bg-[#F1EEE6]/60 overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedSection(expandedSection === "allergens" ? null : "allergens")}
                      className="w-full px-4 py-3 flex items-center justify-between font-semibold text-[#172A35]"
                    >
                      <span>ALLERGENS &amp; DIETARY FLAGS</span>
                      <span>{expandedSection === "allergens" ? "−" : "+"}</span>
                    </button>
                    {expandedSection === "allergens" && (
                      <div className="px-4 pb-3 border-t border-[#E6E0D5] pt-2">
                        {activeProduct.allergens && activeProduct.allergens.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {activeProduct.allergens.map((a, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-[#B96D62]/15 text-[#B96D62] font-semibold text-[11px]">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#6B7280] italic">No specific allergens reported in database</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Categories & Countries */}
                  <div className="rounded-xl border border-[#E6E0D5] bg-[#F1EEE6]/60 overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedSection(expandedSection === "categories" ? null : "categories")}
                      className="w-full px-4 py-3 flex items-center justify-between font-semibold text-[#172A35]"
                    >
                      <span>CATEGORIES &amp; ORIGINS</span>
                      <span>{expandedSection === "categories" ? "−" : "+"}</span>
                    </button>
                    {expandedSection === "categories" && (
                      <div className="px-4 pb-3 border-t border-[#E6E0D5] pt-2 space-y-2">
                        {activeProduct.categories && activeProduct.categories.length > 0 && (
                          <div>
                            <span className="label-mono text-[9px] text-[#6B7280] block mb-1">CATEGORIES</span>
                            <div className="flex flex-wrap gap-1">
                              {activeProduct.categories.slice(0, 6).map((c, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-[#172A35]/10 text-[#172A35] text-[10px]">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {activeProduct.countries && activeProduct.countries.length > 0 && (
                          <div>
                            <span className="label-mono text-[9px] text-[#6B7280] block mb-1">COUNTRIES</span>
                            <p className="text-[#28302E]">{activeProduct.countries.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Optional Layer 2 Robotoff Insights */}
                  {activeProduct.robotoffInsights && activeProduct.robotoffInsights.length > 0 && (
                    <div className="rounded-xl border border-[#C18A5A]/40 bg-[#C18A5A]/5 overflow-hidden text-xs">
                      <button
                        onClick={() => setExpandedSection(expandedSection === "robotoff" ? null : "robotoff")}
                        className="w-full px-4 py-3 flex items-center justify-between font-semibold text-[#C18A5A]"
                      >
                        <span>ROBOTOFF PRODUCT ENRICHMENT ({activeProduct.robotoffInsights.length})</span>
                        <span>{expandedSection === "robotoff" ? "−" : "+"}</span>
                      </button>
                      {expandedSection === "robotoff" && (
                        <div className="px-4 pb-3 border-t border-[#C18A5A]/30 pt-2 space-y-1">
                          {activeProduct.robotoffInsights.map((insight: RobotoffInsight, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-[#28302E]">
                              <span>{insight.type}: <strong>{insight.value}</strong></span>
                              {insight.confidence && (
                                <span className="text-[#6B7280] text-[10px]">{Math.round(insight.confidence * 100)}% conf</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleLogActiveProduct} className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 text-sm font-700">
                    <PlusIcon size={16} /> Add to Food Log
                  </button>
                  <button onClick={() => toggleFavorite(activeProduct.id)} className="btn-ghost px-4 py-3.5 text-sm flex items-center gap-1.5">
                    <StarIcon size={16} filled={favorites.has(activeProduct.id)} /> {favorites.has(activeProduct.id) ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setTab("scan")
                      setPhase("idle")
                    }}
                    className="btn-ghost px-4 py-3.5 text-sm"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            </div>
          ) : phase === "not_found" ? (
            /* PRODUCT NOT FOUND STATE */
            <div className="glass rounded-3xl p-6 sm:p-8 text-center animate-fade-in-up">
              <VeyraCharacter mood="concerned" accent="coral" size={100} />
              <div className="label-mono text-[10px] text-[#C18A5A] mt-3">
                BARCODE: {scannedCode}
              </div>
              <h2 className="font-display font-800 text-2xl text-[#172A35] mt-1 mb-2">Product Not Found</h2>
              <p className="text-sm text-[#6B7280] max-w-sm mx-auto mb-6">
                Veyra couldn't find barcode <code className="text-[#172A35] font-mono font-bold">{scannedCode}</code> in the global database. We do not display guessed or random fallback products.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  onClick={() => {
                    setPhase("idle")
                    startCameraScanner()
                  }}
                  className="btn-primary w-full sm:w-auto px-6 py-3 text-sm font-bold"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setTab("barcode")}
                  className="btn-ghost w-full sm:w-auto px-5 py-3 text-sm font-semibold"
                >
                  Enter Barcode Manually
                </button>
                <button
                  onClick={() => setTab("search")}
                  className="btn-ghost w-full sm:w-auto px-5 py-3 text-sm font-semibold"
                >
                  Search Product Name
                </button>
              </div>
            </div>
          ) : phase === "verification_failed" ? (
            /* VERIFICATION FAILED STATE */
            <div className="glass rounded-3xl p-6 sm:p-8 text-center animate-fade-in-up border border-[#B96D62]/40">
              <VeyraCharacter mood="warn" accent="coral" size={90} />
              <h2 className="font-display font-800 text-xl text-[#B96D62] mt-3 mb-2">Product Verification Failed</h2>
              <p className="text-sm text-[#6B7280] max-w-sm mx-auto mb-6">
                The returned product barcode did not match the scanned barcode <code className="font-mono text-[#172A35]">{scannedCode}</code>.
              </p>
              <button
                onClick={() => {
                  setPhase("idle")
                  startCameraScanner()
                }}
                className="btn-primary px-6 py-3 text-sm font-bold mx-auto"
              >
                Try Scanning Again
              </button>
            </div>
          ) : (
            /* LIVE CAMERA PREVIEW FEED */
            <div className="space-y-4">
              <div
                className="relative rounded-3xl overflow-hidden select-none border shadow-md"
                style={{
                  height: 380,
                  background: "#172A35",
                  borderColor: "#E6E0D5",
                }}
              >
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Target Bounding Frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-48 border-2 border-[#C18A5A] rounded-2xl relative shadow-2xl">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#172A35] text-[#C18A5A] label-mono text-[9px] px-3 py-0.5 rounded-full border border-[#C18A5A]">
                      ALIGN BARCODE
                    </div>
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#C18A5A] -mt-1 -ml-1 rounded-tl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#C18A5A] -mt-1 -mr-1 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#C18A5A] -mb-1 -ml-1 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#C18A5A] -mb-1 -mr-1 rounded-br" />
                  </div>
                </div>

                {/* Status Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#172A35]/90 backdrop-blur-md rounded-2xl p-3 text-center text-white z-20 border border-[#E6E0D5]/20">
                  {phase === "idle" && (
                    <p className="text-xs font-semibold">Tap "Start Camera Scanner" to scan live product barcodes</p>
                  )}
                  {phase === "starting" && (
                    <p className="text-xs font-semibold text-[#C18A5A] animate-pulse">Initializing camera stream...</p>
                  )}
                  {phase === "scanning" && (
                    <p className="text-xs font-semibold text-[#7C9B70]">Position barcode inside the target box</p>
                  )}
                  {phase === "detected" && (
                    <p className="text-xs font-bold text-[#C18A5A]">Barcode detected! Verifying...</p>
                  )}
                  {phase === "looking_up" && (
                    <p className="text-xs font-bold text-[#FFFFFF] animate-pulse">Querying Open Food Facts for {scannedCode}...</p>
                  )}
                  {(phase === "permission_denied" || phase === "unsupported" || phase === "error") && (
                    <p className="text-xs font-semibold text-[#B96D62]">{errorMessage}</p>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex gap-3">
                {phase === "scanning" ? (
                  <button
                    onClick={stopCameraStream}
                    className="flex-1 btn-ghost py-3.5 text-sm font-bold"
                  >
                    Stop Camera
                  </button>
                ) : (
                  <button
                    onClick={startCameraScanner}
                    className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <ScanIcon size={18} /> Start Camera Scanner
                  </button>
                )}
                <button onClick={() => setTab("barcode")} className="btn-ghost px-5 py-3.5 text-sm font-semibold">
                  Manual Entry
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-[#FDF2F2] border border-[#F87171] text-[#B96D62] text-xs font-semibold text-center">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL BARCODE LOOKUP */}
      {tab === "barcode" && (
        <div className="max-w-xl">
          <div className="glass rounded-3xl p-6 sm:p-8 text-center mb-6">
            <Barcode2Icon size={48} className="mx-auto text-[#172A35] mb-3" />
            <h3 className="font-display font-800 text-[#172A35] text-xl mb-1">Enter Barcode Manually</h3>
            <p className="text-sm text-[#6B7280] mb-6 max-w-xs mx-auto">
              Enter any real numeric product barcode worldwide (EAN-13, EAN-8, UPC).
            </p>

            <form onSubmit={handleManualBarcodeSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                className="input-field flex-1 py-3 px-4 text-sm font-mono"
                placeholder="e.g. 3017620422003"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />
              <button type="submit" disabled={isLoadingApi} className="btn-primary px-6 py-3 text-sm font-700">
                {isLoadingApi ? "Searching..." : "Find Product"}
              </button>
            </form>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-[#FDF2F2] text-[#B96D62] text-xs font-semibold border border-[#F87171]">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SEARCH PRODUCT BY NAME */}
      {tab === "search" && (
        <div className="max-w-xl">
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <input
                className="input-field w-full pl-11 pr-24 py-3.5 text-sm"
                placeholder="Search product by name (e.g. Nutella, Oat Milk)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <button type="submit" disabled={isLoadingApi} className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-700">
                {isLoadingApi ? "Loading..." : "Search"}
              </button>
            </div>
          </form>

          {isLoadingApi && (
            <div className="p-8 text-center glass rounded-2xl">
              <SparklesIcon size={28} className="mx-auto text-[#C18A5A] animate-spin-slow mb-2" />
              <p className="text-sm font-bold text-[#172A35]">Querying global product database...</p>
            </div>
          )}

          {errorMessage && !isLoadingApi && (
            <div className="p-6 text-center glass rounded-2xl border border-[#C18A5A]/30 mb-4">
              <p className="text-sm text-[#C18A5A] font-semibold mb-3">{errorMessage}</p>
            </div>
          )}

          {!isLoadingApi && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setActiveProduct(prod)
                    setScannedCode(String(prod.barcode || prod.id))
                    setTab("scan")
                    setPhase("found")
                  }}
                  className="glass rounded-2xl p-4 flex items-center gap-4 card-hover cursor-pointer"
                >
                  {prod.img ? (
                    <img src={prod.img} alt={prod.name} className="w-14 h-14 rounded-xl object-cover border border-[#E6E0D5] shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#F1EEE6] border border-[#E6E0D5] flex items-center justify-center text-xs font-bold text-[#172A35] shrink-0">
                      FOOD
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="label-mono text-[9px] text-[#C18A5A]">SEARCH RESULT</span>
                      <NutriScoreBadge score={prod.nutriScore} />
                    </div>
                    <h4 className="font-display font-700 text-sm text-[#172A35] truncate">{prod.name}</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {prod.brand || "Verified Brand"} · {prod.calories ? `${prod.calories} kcal` : "Not available"}
                    </p>
                  </div>
                  <button className="btn-ghost text-xs px-3 py-1.5 font-bold shrink-0">Inspect</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VERIFIED SCAN HISTORY */}
      {tab === "history" && (
        <div className="max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-700 text-lg text-[#172A35]">Verified Scan History</h3>
            <span className="label-mono text-[10px] text-[#6B7280]">
              {scanHistory.length} RECENT SCANS
            </span>
          </div>

          {scanHistory.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center">
              <p className="text-sm text-[#6B7280]">No verified product scans yet for {user.name}.</p>
              <button
                onClick={() => setTab("scan")}
                className="btn-primary px-5 py-2.5 text-xs font-bold mt-4"
              >
                Scan First Product
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scanHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveProduct(item.product)
                    setScannedCode(item.code)
                    setTab("scan")
                    setPhase("found")
                  }}
                  className="glass rounded-2xl p-4 flex items-center justify-between gap-4 card-hover cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.product.img ? (
                      <img src={item.product.img} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover border border-[#E6E0D5] shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#F1EEE6] flex items-center justify-center text-xs font-bold text-[#172A35] shrink-0">
                        FOOD
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="label-mono text-[9px] text-[#C18A5A]">{item.code}</span>
                        <span className="text-[10px] text-[#6B7280]">{item.timestamp}</span>
                      </div>
                      <h4 className="font-display font-700 text-sm text-[#172A35] truncate">{item.product.name}</h4>
                      <p className="text-xs text-[#6B7280]">
                        {item.product.brand || "Verified Brand"} · {item.product.calories ? `${item.product.calories} kcal` : "Not available"}
                      </p>
                    </div>
                  </div>
                  <button className="btn-ghost text-xs px-3 py-1.5 font-bold shrink-0">View</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
