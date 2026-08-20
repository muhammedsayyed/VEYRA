import React, { useState } from "react"
import veyraLogo from "@/imports/image.png"
import VeyraCharacter, { Obj3D } from "@/components/VeyraChar"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{ background: "#F7F5EF" }}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: "#E6E0D5" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "#C18A5A" }}
      />

      <div className="w-full max-w-4xl relative z-10 grid md:grid-cols-12 gap-6 items-center">
        {/* LEFT COLUMN — Brand Visual (Desktop only) */}
        <div className="hidden md:flex md:col-span-5 flex-col items-center text-center justify-center p-6">
          <div className="relative mb-6">
            <VeyraCharacter mood={activeTab === "login" ? "happy" : "cheer"} size={160} float={true} />
            <div className="absolute -top-2 -right-4 pointer-events-none">
              <Obj3D kind="leaf" size={48} float={true} />
            </div>
          </div>

          <div
            className="p-5 rounded-2xl text-left border mb-4 relative"
            style={{ background: "#FFFFFF", borderColor: "#E6E0D5", boxShadow: "0 4px 20px rgba(23,42,53,0.04)" }}
          >
            <div className="text-xs font-bold text-[#C18A5A] uppercase tracking-wider mb-1 font-mono">
              Veyra Wellness Companion
            </div>
            <p className="text-sm text-[#28302E] leading-relaxed">
              "Every healthy habit starts with a single step. Let's build your optimal daily routine together."
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
            <span className="w-2 h-2 rounded-full bg-[#7C9B70]" />
            <span>AI Nutrition & Fitness Intelligence Active</span>
          </div>
        </div>

        {/* RIGHT COLUMN — Auth Card */}
        <div className="md:col-span-7 w-full">
          <div
            className="liquid-glass p-6 sm:p-8 rounded-[28px] shadow-xl w-full mx-auto"
            style={{ background: "#FFFFFF", border: "1px solid #E6E0D5" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: "#FFFFFF", border: "1px solid #E6E0D5" }}
              >
                <img src={veyraLogo} alt="Veyra" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-800 text-xl sm:text-2xl text-[#172A35] leading-tight">
                    Welcome to Veyra
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  Your personal wellness journey starts here.
                </p>
              </div>
            </div>

            {/* Tab Toggle */}
            <div
              className="flex p-1 rounded-2xl mb-6 border"
              style={{ background: "#F1EEE6", borderColor: "#E6E0D5" }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="flex-1 py-2.5 rounded-xl text-sm font-display font-700 transition-all"
                style={
                  activeTab === "login"
                    ? { background: "#172A35", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(23,42,53,0.15)" }
                    : { color: "#6B7280" }
                }
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className="flex-1 py-2.5 rounded-xl text-sm font-display font-700 transition-all"
                style={
                  activeTab === "signup"
                    ? { background: "#172A35", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(23,42,53,0.15)" }
                    : { color: "#6B7280" }
                }
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            {activeTab === "login" ? (
              <LoginForm onSwitchToSignup={() => setActiveTab("signup")} />
            ) : (
              <SignupForm onSwitchToLogin={() => setActiveTab("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
