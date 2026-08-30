import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { EyeIcon, EyeOffIcon } from "@/components/icons"

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { login, addToast } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!password) {
      setError("Please enter your password.")
      return
    }

    setIsLoading(true)
    try {
      const res = await login(email, password)
      if (!res.success) {
        setError(res.error || "Login failed. Please try again.")
      }
    } catch (err: any) {
      setError("An unexpected error occurred during login.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    addToast(
      "Password reset info: Use your registered credentials or sign up for a new account.",
      "info"
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
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

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
        className="space-y-1.5"
      >
        <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] font-700 uppercase">
          <span className={focusedField === "email" ? "text-[var(--veyra-ink)]" : "text-[#6B7280]"}>Email address</span>
          {focusedField === "email" && <span className="w-1 h-1 rounded-full bg-[var(--veyra-clay)] animate-pulse" aria-hidden />}
        </label>
        <div className="relative group">
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
            className="w-full py-3.5 px-4 pr-3 text-[14px] placeholder:text-[#9CA3AF] outline-none transition-all"
            style={{
              background: focusedField === "email" ? "#FFFFFF" : "rgba(255,255,255,0.96)",
              border: `1.5px solid ${focusedField === "email" ? "var(--veyra-ink)" : "#E8E0D0"}`,
              borderRadius: 16,
              color: "var(--veyra-ink)",
              boxShadow:
                focusedField === "email"
                  ? "0 0 0 4px rgba(15,26,28,0.06), 0 6px 16px rgba(15,26,28,0.05), inset 0 1px 0 rgba(255,255,255,0.9)"
                  : "0 2px 10px rgba(15,26,28,0.03), inset 0 1px 0 rgba(255,255,255,0.8)",
              fontFamily: "Inter, sans-serif",
            }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[16px]"
            animate={{ opacity: focusedField === "email" ? 1 : 0 }}
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}
          />
        </div>
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="space-y-1.5"
      >
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] font-700 uppercase">
            <span className={focusedField === "password" ? "text-[var(--veyra-ink)]" : "text-[#6B7280]"}>Password</span>
            {focusedField === "password" && <span className="w-1 h-1 rounded-full bg-[var(--veyra-clay)] animate-pulse" aria-hidden />}
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[12px] font-600 tracking-[-0.01em] text-[var(--veyra-clay)] hover:text-[#9E6430] hover:underline underline-offset-4 decoration-[var(--veyra-clay)]/30 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError(null)
            }}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            className="w-full py-3.5 pl-4 pr-11 text-[14px] placeholder:text-[#9CA3AF] outline-none transition-all"
            style={{
              background: focusedField === "password" ? "#FFFFFF" : "rgba(255,255,255,0.96)",
              border: `1.5px solid ${focusedField === "password" ? "var(--veyra-ink)" : "#E8E0D0"}`,
              borderRadius: 16,
              color: "var(--veyra-ink)",
              boxShadow:
                focusedField === "password"
                  ? "0 0 0 4px rgba(15,26,28,0.06), 0 6px 16px rgba(15,26,28,0.05)"
                  : "0 2px 10px rgba(15,26,28,0.03)",
              fontFamily: "Inter, sans-serif",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[11px] flex items-center justify-center border transition-all"
            style={{
              color: showPassword ? "var(--veyra-ink)" : "#9CA3AF",
              background: showPassword ? "#F5F0E8" : "transparent",
              borderColor: showPassword ? "#E8E0D0" : "transparent",
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>
      </motion.div>

      {/* Remember + secure */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.14 }}
        className="flex items-center justify-between py-1"
      >
        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
          <span className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer sr-only"
            />
            <span
              className="w-[19px] h-[19px] rounded-[6px] border-[1.5px] flex items-center justify-center transition-all peer-checked:bg-[var(--veyra-ink)] peer-checked:border-[var(--veyra-ink)] peer-checked:text-white bg-white border-[#E8E0D0] group-hover:border-[var(--veyra-ink)]/20"
              aria-hidden
            >
              {rememberMe && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </span>
          <span className="text-[13px] font-600 tracking-[-0.01em] text-[var(--veyra-ink)]">Remember me</span>
        </label>
        <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.10em] text-[#9CA3AF] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-sage)] animate-pulse" aria-hidden />
          Secure session
        </span>
      </motion.div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={!isLoading ? { y: -1 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className="relative w-full py-3.5 rounded-[16px] text-[14px] font-800 tracking-[-0.01em] text-white overflow-hidden flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
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
            <span className="relative">Logging in…</span>
          </>
        ) : (
          <>
            <span className="relative">Log In</span>
            <motion.span
              aria-hidden
              className="relative w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[12px] backdrop-blur"
              whileHover={{ x: 2 }}
            >
              →
            </motion.span>
          </>
        )}
      </motion.button>

      <div className="text-center pt-1">
        <p className="text-[13px] leading-[1.5] text-[#6B7280]">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-700 tracking-[-0.01em] text-[var(--veyra-ink)] hover:text-[var(--veyra-clay)] underline underline-offset-4 decoration-[#E8E0D0] hover:decoration-[var(--veyra-clay)]/30 transition-colors"
          >
            Create an account
          </button>
        </p>
      </div>
    </form>
  )
}
