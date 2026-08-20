import React, { useState } from "react"
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 w-full animate-fade-in">
      {error && (
        <div
          className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
          style={{ background: "#FDF2F2", color: "#B96D62", border: "1px solid #F87171" }}
        >
          <span>{error}</span>
        </div>
      )}

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-mono text-[10px] text-[#6B7280] block mb-1 font-bold">
            FIRST NAME
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
            className="input-field w-full py-2.5 px-3 text-sm"
          />
        </div>
        <div>
          <label className="label-mono text-[10px] text-[#6B7280] block mb-1 font-bold">
            LAST NAME
          </label>
          <input
            type="text"
            placeholder="Morgan"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input-field w-full py-2.5 px-3 text-sm"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="label-mono text-[10px] text-[#6B7280] block mb-1 font-bold">
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
          className="input-field w-full py-2.5 px-3 text-sm"
        />
      </div>

      {/* Goal Selector */}
      <div>
        <label className="label-mono text-[10px] text-[#6B7280] block mb-1 font-bold">
          PRIMARY WELLNESS GOAL
        </label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="input-field w-full py-2.5 px-3 text-sm font-medium"
        >
          <option value="Lose Weight">Lose Weight</option>
          <option value="Maintain Weight">Maintain Weight</option>
          <option value="Build Muscle">Build Muscle</option>
          <option value="Improve Overall Wellness">Improve Overall Wellness</option>
        </select>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label-mono text-[10px] text-[#6B7280] block mb-1 font-bold">
            PASSWORD
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
              className="input-field w-full py-2.5 pl-3 pr-8 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#172A35]"
            >
              {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label-mono text-[10px] text-[#6B7280] block mb-1 font-bold">
            CONFIRM PASSWORD
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (error) setError(null)
            }}
            className="input-field w-full py-2.5 px-3 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3.5 text-sm font-bold tracking-wide shadow-md flex items-center justify-center gap-2 mt-3"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-xs text-[#6B7280]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#172A35] hover:text-[#C18A5A] hover:underline transition-colors"
          >
            Log in
          </button>
        </p>
      </div>
    </form>
  )
}
