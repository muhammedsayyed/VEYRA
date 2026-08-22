import React, { useState } from "react"
import { CheckIcon } from "@/components/icons"
import { VeyraCharacter, Obj3D } from "@/components/VeyraChar"
import { useApp } from "@/context/AppContext"
import Modal from "@/components/Modal"
import { UserProfile } from "@/types"

import WeightHistory from "@/components/WeightHistory"

const tabs = ["Overview", "Goals", "Nutrition", "Settings"]


function Ring({ value, max, color, label, center, sub }: { value: number; max: number; color: string; label: string; center: string; sub?: string }) {
  const pct = Math.min(1, value / max)
  const r = 30
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 84, height: 84 }}>
        <svg width="84" height="84" className="-rotate-90">
          <circle cx="42" cy="42" r={r} fill="none" stroke="#E6E0D5" strokeWidth="7" />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-800 text-[#172A35] text-base leading-none">{center}</span>
        </div>
      </div>
      <div className="text-center">
        <span className="label-mono block">{label}</span>
        {sub && <span className="text-xs" style={{ color: "#6B7280" }}>{sub}</span>}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, updateUser, logout } = useApp()

  const [activeTab, setActiveTab] = useState("Overview")
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({
    name: user.name,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    targetWeightKg: user.targetWeightKg,
    goal: user.goal,
    activityLevel: user.activityLevel,
    dailyCalories: user.dailyCalories,
    dailyProtein: user.dailyProtein,
  })

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser(editForm)
    setEditModalOpen(false)
  }

  const dietPrefs = ["Mediterranean", "Low Carb", "High Protein", "Balanced", "Vegetarian", "Vegan", "Keto"]

  return (
    <div className="screen-scroll">
      {/* Identity hero */}
      <div className="relative liquid-glass rounded-[28px] overflow-hidden mb-6 animate-fade-in-up">
        <div className="absolute top-6 right-8 opacity-90 hidden sm:block">
          <Obj3D kind="leaf" size={64} />
        </div>

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 rounded-[26px] flex items-center justify-center text-4xl font-display font-800 shadow-md"
              style={{ background: "#172A35", color: "#FFFFFF" }}
            >
              {user.name.charAt(0)}
            </div>
            <div
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center"
              style={{ background: "#C18A5A", borderColor: "#FFFFFF" }}
            >
              <CheckIcon size={13} className="text-[#FFFFFF]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="label-mono mb-2" style={{ color: "#C18A5A" }}>
              Member since 2024 · 12-day streak
            </div>
            <h2 className="display-xl text-3xl sm:text-4xl text-[#172A35]">{user.name}</h2>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
              {user.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[user.goal, `${user.weightKg} kg → ${user.targetWeightKg} kg`, user.activityLevel].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: "rgba(23,42,53,0.08)", color: "#172A35", border: "1px solid rgba(23,42,53,0.18)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 self-center">
            <button
              onClick={() => {
                setEditForm({
                  name: user.name,
                  age: user.age,
                  heightCm: user.heightCm,
                  weightKg: user.weightKg,
                  targetWeightKg: user.targetWeightKg,
                  goal: user.goal,
                  activityLevel: user.activityLevel,
                  dailyCalories: user.dailyCalories,
                  dailyProtein: user.dailyProtein,
                })
                setEditModalOpen(true)
              }}
              className="btn-primary text-xs px-4 py-2.5 font-700"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto glass">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-xl text-sm font-display font-700 transition-all shrink-0"
            style={
              activeTab === tab
                ? { background: "#172A35", color: "#FFFFFF" }
                : { color: "#6B7280" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <div className="label-mono mb-4 text-[#6B7280]">Body Metrics</div>
              <div className="flex flex-wrap items-center justify-between gap-6">
                <Ring value={user.weightKg} max={120} color="#172A35" label="Current kg" center={`${user.weightKg}`} />
                <Ring value={user.targetWeightKg} max={120} color="#315A63" label="Target kg" center={`${user.targetWeightKg}`} />
                <Ring value={user.heightCm} max={220} color="#C18A5A" label="Height cm" center={`${user.heightCm}`} />
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="label-mono text-[10px] text-[#6B7280]">AGE</div>
                    <div className="font-display font-800 text-[#172A35] text-xl">{user.age} yrs</div>
                  </div>
                  <div>
                    <div className="label-mono text-[10px] text-[#6B7280]">GOAL</div>
                    <div className="font-display font-800 text-[#C18A5A] text-sm">{user.goal}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -bottom-6 -right-4 opacity-90">
                <VeyraCharacter mood="think" accent="mint" size={92} />
              </div>
              <div className="label-mono mb-3 text-[#C18A5A]">Veyra AI Profile</div>
              <p className="text-sm leading-relaxed text-[#28302E]">
                Your profile is configured for <span className="font-bold text-[#172A35]">{user.goal}</span>. We've set your daily targets to {user.dailyCalories} kcal and {user.dailyProtein}g protein.
              </p>
            </div>
          </div>

          {/* Interactive Weight & Body Progress Tracker */}
          <WeightHistory />
        </div>
      )}


      {/* Goals Tab */}
      {activeTab === "Goals" && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-display font-700 text-[#172A35] text-base">Daily Nutrition Goals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass p-3 rounded-xl">
              <span className="label-mono text-[10px] text-[#6B7280]">CALORIES</span>
              <div className="font-display font-800 text-lg text-[#172A35]">{user.dailyCalories} kcal</div>
            </div>
            <div className="glass p-3 rounded-xl">
              <span className="label-mono text-[10px] text-[#6B7280]">PROTEIN</span>
              <div className="font-display font-800 text-lg text-[#315A63]">{user.dailyProtein} g</div>
            </div>
            <div className="glass p-3 rounded-xl">
              <span className="label-mono text-[10px] text-[#6B7280]">CARBS</span>
              <div className="font-display font-800 text-lg text-[#28302E]">{user.dailyCarbs} g</div>
            </div>
            <div className="glass p-3 rounded-xl">
              <span className="label-mono text-[10px] text-[#6B7280]">FAT</span>
              <div className="font-display font-800 text-lg text-[#C18A5A]">{user.dailyFat} g</div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Tab */}
      {activeTab === "Nutrition" && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-700 text-[#172A35] text-base mb-3">Dietary Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {dietPrefs.map((d) => (
                <span key={d} className="chip active">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "Settings" && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-700 text-[#172A35] text-base">App Settings</h3>
            <div className="flex items-center justify-between py-2 border-b border-[#E6E0D5]">
              <div>
                <span className="text-sm font-semibold text-[#172A35]">Units</span>
                <p className="text-xs text-[#6B7280]">Choose preferred measurement system</p>
              </div>
              <button
                onClick={() => updateUser({ units: user.units === "metric" ? "imperial" : "metric" })}
                className="btn-ghost px-4 py-1.5 text-xs font-bold capitalize"
              >
                {user.units}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E6E0D5]">
              <div>
                <span className="text-sm font-semibold text-[#172A35]">Theme Mode</span>
                <p className="text-xs text-[#6B7280]">Light / Dark / System</p>
              </div>
              <span className="text-xs text-[#172A35] font-bold capitalize">{user.theme}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E6E0D5]">
              <div>
                <span className="text-sm font-semibold text-[#172A35]">AI Proactive Frequency</span>
                <p className="text-xs text-[#6B7280]">How often Veyra gives proactive tips</p>
              </div>
              <button
                onClick={() => updateUser({ aiProactiveFrequency: user.aiProactiveFrequency === "high" ? "medium" : "high" })}
                className="btn-ghost px-3 py-1 text-xs capitalize"
              >
                {user.aiProactiveFrequency}
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-sm font-semibold text-[#B96D62]">Account Session</span>
                <p className="text-xs text-[#6B7280]">Sign out of your active Veyra session</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#FFFFFF] shadow-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#B96D62" }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Personal Information">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Full Name</label>
            <input
              className="input-field w-full py-2.5 px-3 text-sm"
              value={editForm.name || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Age (yrs)</label>
              <input
                type="number"
                className="input-field w-full py-2.5 px-3 text-sm"
                value={editForm.age || 28}
                onChange={(e) => setEditForm((f) => ({ ...f, age: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Height (cm)</label>
              <input
                type="number"
                className="input-field w-full py-2.5 px-3 text-sm"
                value={editForm.heightCm || 178}
                onChange={(e) => setEditForm((f) => ({ ...f, heightCm: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Current Weight (kg)</label>
              <input
                type="number"
                className="input-field w-full py-2.5 px-3 text-sm"
                value={editForm.weightKg || 82}
                onChange={(e) => setEditForm((f) => ({ ...f, weightKg: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Target Weight (kg)</label>
              <input
                type="number"
                className="input-field w-full py-2.5 px-3 text-sm"
                value={editForm.targetWeightKg || 75}
                onChange={(e) => setEditForm((f) => ({ ...f, targetWeightKg: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Primary Goal</label>
            <select
              value={editForm.goal || "Lose Weight"}
              onChange={(e: any) => setEditForm((f) => ({ ...f, goal: e.target.value }))}
              className="input-field w-full py-2.5 px-3 text-sm"
            >
              <option value="Lose Weight">Lose Weight</option>
              <option value="Build Muscle">Build Muscle</option>
              <option value="Maintain Weight">Maintain Weight</option>
              <option value="Improve Fitness">Improve Fitness</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Daily Calories</label>
              <input
                type="number"
                className="input-field w-full py-2.5 px-3 text-sm"
                value={editForm.dailyCalories || 2100}
                onChange={(e) => setEditForm((f) => ({ ...f, dailyCalories: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="label-mono text-[10px] text-[#6B7280] block mb-1">Daily Protein (g)</label>
              <input
                type="number"
                className="input-field w-full py-2.5 px-3 text-sm"
                value={editForm.dailyProtein || 130}
                onChange={(e) => setEditForm((f) => ({ ...f, dailyProtein: Number(e.target.value) }))}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-sm font-700 mt-2">
            Save Profile Changes
          </button>
        </form>
      </Modal>
    </div>
  )
}
