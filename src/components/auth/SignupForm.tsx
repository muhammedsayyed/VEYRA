import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { EyeIcon, EyeOffIcon } from "@/components/icons"

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signup } = useApp()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [goal, setGoal] = useState("Lose Weight")

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim()) {
      setError("Please enter your first name.")
      return
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.")
      return
    }

    setIsLoading(true)
    try {
      const res = await signup({
        firstName,
        lastName,
        email,
        password,
        goal,
      })

      if (!res.success) {
        setError(res.error || "Sign up failed. Please try again.")
      }
    } catch (err: any) {
      setError("An unexpected error occurred during registration.")
    } finally {
      setIsLoading(false)
    }
  }

  const fieldStyle = (name: string): React.CSSProperties => ({
    background: focusedField === name ? "#FFFFFF" : "rgba(255,255,255,0.96)",
    border: `1.5px solid ${focusedField === name ? "var(--veyra-ink)" : "#E8E0D0"}`,
    borderRadius: 16,
    color: "var(--veyra-ink)",
    boxShadow:
      focusedField === name
        ? "0 0 0 4px rgba(15,26,28,0.06), 0 6px 16px rgba(15,26,28,0.05)"
        : "0 2px 10px rgba(15,26,28,0.03)",
    fontFamily: "Inter, sans-serif",
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 w-full">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[16px] flex items-start gap-3 px-4 py-3.5"
            style={{
              background: "rgba(253,242,242,0.92)",
              border: "1px solid #FECACA",
              boxShadow: "0 4px 14px rgba(185,92,74,0.07)",
              backdropFilter: "blur(8px)",
            }}
            role="alert"
          >
            <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B85C4A]" />
            <span className="w-6 h-6 rounded-full bg-[#B85C4A] text-white flex items-center justify-center text-[12px] font-800 shrink-0 mt-0.5">
              !
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[9px] tracking-[0.12em] font-700 text-[#B85C4A] uppercase">Check details</div>
              <p className="text-[13px] font-600 leading-[1.5] text-[#9B4A3F]">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name row — responsive, no overflow at 320 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
        className="grid grid-cols-2 gap-2.5 sm:gap-3"
      >
        <div className="min-w-0 space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] font-700 uppercase">
            <span className={focusedField === "firstName" ? "text-[var(--veyra-ink)]" : "text-[#6B7280]"}>First name</span>
            {focusedField === "firstName" && <span className="w-1 h-1 rounded-full bg-[var(--veyra-clay)] animate-pulse" aria-hidden />}
          </label>
          <input
            type="text"
            required
            placeholder="Alex"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value)
              if (error) setError(null)
            }}
            onFocus={() => setFocusedField("firstName")}
            onBlur={() => setFocusedField(null)}
            className="w-full py-3 px-3.5 text-[14px] placeholder:text-[#9CA3AF] outline-none transition-all min-w-0"
            style={fieldStyle("firstName")}
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <label className="font-mono text-[10px] tracking-[0.14em] font-700 text-[#6B7280] uppercase block">
            Last name
          </label>
          <input
            type="text"
            placeholder="Morgan"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full py-3 px-3.5 text-[14px] placeholder:text-[#9CA3AF] outline-none transition-all min-w-0"
            style={{
              background: "rgba(255,255,255,0.96)",
              border: "1.5px solid #E8E0D0",
              borderRadius: 16,
              color: "var(--veyra-ink)",
              boxShadow: "0 2px 10px rgba(15,26,28,0.03)",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="space-y-1.5"
      >
        <label className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] font-700 uppercase">
          <span className={focusedField === "email" ? "text-[var(--veyra-ink)]" : "text-[#6B7280]"}>Email address</span>
          {focusedField === "email" && <span className="w-1 h-1 rounded-full bg-[var(--veyra-clay)] animate-pulse" aria-hidden />}
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
          className="w-full py-3 px-4 text-[14px] placeholder:text-[#9CA3AF] outline-none transition-all"
          style={fieldStyle("email")}
        />
      </motion.div>

      {/* Goal — warm tactile select */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="space-y-1.5"
      >
        <label className="font-mono text-[10px] tracking-[0.14em] font-700 text-[#6B7280] uppercase block">
          Primary wellness goal
        </label>
        <div className="relative">
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onFocus={() => setFocusedField("goal")}
            onBlur={() => setFocusedField(null)}
            className="w-full py-3 px-4 pr-10 text-[13.5px] font-600 tracking-[-0.01em] appearance-none cursor-pointer outline-none transition-all bg-white"
            style={{
              border: `1.5px solid ${focusedField === "goal" ? "var(--veyra-ink)" : "#E8E0D0"}`,
              borderRadius: 16,
              color: "var(--veyra-ink)",
              boxShadow:
                focusedField === "goal"
                  ? "0 0 0 4px rgba(15,26,28,0.06), 0 6px 16px rgba(15,26,28,0.05)"
                  : "0 2px 10px rgba(15,26,28,0.03)",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            <option value="Lose Weight">Lose Weight</option>
            <option value="Maintain Weight">Maintain Weight</option>
            <option value="Build Muscle">Build Muscle</option>
            <option value="Improve Overall Wellness">Improve Overall Wellness</option>
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[11px] flex items-center justify-center"
            style={{
              background: focusedField === "goal" ? "var(--veyra-ink)" : "#F5F0E8",
              border: "1px solid #E8E0D0",
              color: focusedField === "goal" ? "white" : "#6B7280",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <p className="font-mono text-[10px] tracking-[0.10em] text-[#9CA3AF]">Tailors calories, protein & guidance — change anytime</p>
      </motion.div>

      {/* Passwords */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
        className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 sm:gap-3"
      >
        <div className="min-w-0 space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] font-700 uppercase">
            <span className={focusedField === "password" ? "text-[var(--veyra-ink)]" : "text-[#6B7280]"}>Password</span>
            {focusedField === "password" && <span className="w-1 h-1 rounded-full bg-[var(--veyra-clay)] animate-pulse" aria-hidden />}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError(null)
              }}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className="w-full py-3 pl-3.5 pr-9 text-[14px] placeholder:text-[#9CA3AF] outline-none transition-all min-w-0"
              style={fieldStyle("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-[10px] flex items-center justify-center border transition-colors"
              style={{
                color: showPassword ? "var(--veyra-ink)" : "#9CA3AF",
                background: showPassword ? "#F5F0E8" : "transparent",
                borderColor: showPassword ? "#E8E0D0" : "transparent",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
            </button>
          </div>
        </div>

        <div className="min-w-0 space-y-1.5">
          <label className="font-mono text-[10px] tracking-[0.14em] font-700 text-[#6B7280] uppercase block">
            Confirm password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Re-enter"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (error) setError(null)
            }}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
            className="w-full py-3 px-3.5 text-[14px] placeholder:text-[#9CA3AF] outline-none transition-all min-w-0"
            style={fieldStyle("confirmPassword")}
          />
        </div>
      </motion.div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={!isLoading ? { y: -1 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className="relative w-full py-3.5 rounded-[16px] text-[14px] font-800 tracking-[-0.01em] text-white overflow-hidden flex items-center justify-center gap-2.5 mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          background: "var(--veyra-ink)",
          boxShadow: "0 10px 28px rgba(15,26,28,0.14), 0 3px 10px rgba(15,26,28,0.06)",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <span aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 58%)" }} />
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
            <span className="relative">Creating account…</span>
          </>
        ) : (
          <>
            <span className="relative">Create account</span>
            <span aria-hidden className="relative w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[12px] backdrop-blur">
              →
            </span>
          </>
        )}
      </motion.button>

      <div className="text-center pt-1">
        <p className="text-[13px] leading-[1.5] text-[#6B7280]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-700 tracking-[-0.01em] text-[var(--veyra-ink)] hover:text-[var(--veyra-clay)] underline underline-offset-4 decoration-[#E8E0D0] hover:decoration-[var(--veyra-clay)]/30 transition-colors"
          >
            Log in
          </button>
        </p>
      </div>
    </form>
  )
}
