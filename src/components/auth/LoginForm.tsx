import React, { useState } from "react"
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
    <form onSubmit={handleSubmit} className="space-y-4 w-full animate-fade-in">
      {error && (
        <div
          className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
          style={{ background: "#FDF2F2", color: "#B96D62", border: "1px solid #F87171" }}
        >
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="label-mono text-[10px] text-[#6B7280] block mb-1.5 font-bold">
          EMAIL ADDRESS
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
          className="input-field w-full py-3 px-3.5 text-sm"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label-mono text-[10px] text-[#6B7280] block font-bold">
            PASSWORD
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs text-[#C18A5A] hover:underline font-semibold"
          >
            Forgot password?
          </button>
        </div>

        <div className="relative">
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
            className="input-field w-full py-3 pl-3.5 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#172A35] p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between py-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-[#172A35] accent-[#172A35] border-[#E6E0D5]"
          />
          <span className="text-xs text-[#28302E] font-medium">Remember me</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3.5 text-sm font-bold tracking-wide shadow-md flex items-center justify-center gap-2 mt-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <span>Log In</span>
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-xs text-[#6B7280]">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-[#172A35] hover:text-[#C18A5A] hover:underline transition-colors"
          >
            Create an account
          </button>
        </p>
      </div>
    </form>
  )
}
