import React, { useState, useEffect } from "react"
import { useApp } from "@/context/AppContext"
import { WeightRecord } from "@/types"
import { ScaleIcon, PlusIcon, TrendingDownIcon, TrendingUpIcon, CalendarIcon } from "@/components/icons"

export default function WeightHistory() {
  const { user, weightHistory, addWeightEntry, addToast } = useApp()
  const [newWeight, setNewWeight] = useState<string>("")
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = Number(newWeight)
    if (!val || isNaN(val) || val <= 0) {
      addToast("Please enter a valid weight number", "warning")
      return
    }

    await addWeightEntry(val)
    addToast(`Recorded new weight: ${val} kg`, "success")
    setNewWeight("")
    setShowAddForm(false)
  }

  const currentWeight = user.weightKg || (weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 80)
  const targetWeight = user.targetWeightKg || 75
  const diff = currentWeight - targetWeight
  const isLoss = user.goal === "Lose Weight"

  // Build SVG Path for chart
  const sortedRecords = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  const minW = Math.min(...sortedRecords.map((r) => r.weight), targetWeight) - 2
  const maxW = Math.max(...sortedRecords.map((r) => r.weight), targetWeight) + 2

  const svgWidth = 500
  const svgHeight = 160

  const points = sortedRecords.map((r, i) => {
    const x = sortedRecords.length > 1 ? (i / (sortedRecords.length - 1)) * (svgWidth - 40) + 20 : svgWidth / 2
    const y = svgHeight - 20 - ((r.weight - minW) / (maxW - minW || 1)) * (svgHeight - 40)
    return { x, y, weight: r.weight, date: r.date }
  })

  const pathString = points.length > 0
    ? points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "")
    : ""

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border p-5 space-y-4 shadow-xs" style={{ borderColor: "#E6E0D5" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C18A5A]/15 text-[#C18A5A] flex items-center justify-center">
            <ScaleIcon size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#172A35] font-display">Weight & Body Progress</h3>
            <p className="text-xs text-[#6B7280]">Historical record & goal tracking</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-[#FFFFFF]"
          style={{ background: "#C18A5A" }}
        >
          <PlusIcon size={14} />
          <span>Log Weight</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddWeight} className="bg-[#F7F5EF] p-3 rounded-xl border flex items-center gap-3" style={{ borderColor: "#E6E0D5" }}>
          <input
            type="number"
            step="0.1"
            required
            placeholder="Enter weight in kg (e.g. 78.5)"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border text-xs text-[#172A35] focus:outline-none bg-[#FFFFFF]"
            style={{ borderColor: "#E6E0D5" }}
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#FFFFFF]"
            style={{ background: "#315A63" }}
          >
            Save Record
          </button>
        </form>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-[#F7F5EF] p-3 rounded-xl border" style={{ borderColor: "#E6E0D5" }}>
          <div className="text-xs text-[#6B7280]">Current Weight</div>
          <div className="text-lg font-extrabold text-[#172A35] font-display mt-0.5">{currentWeight} kg</div>
        </div>

        <div className="bg-[#F7F5EF] p-3 rounded-xl border" style={{ borderColor: "#E6E0D5" }}>
          <div className="text-xs text-[#6B7280]">Target Weight</div>
          <div className="text-lg font-extrabold text-[#315A63] font-display mt-0.5">{targetWeight} kg</div>
        </div>

        <div className="bg-[#F7F5EF] p-3 rounded-xl border" style={{ borderColor: "#E6E0D5" }}>
          <div className="text-xs text-[#6B7280]">Difference</div>
          <div className="text-lg font-extrabold text-[#C18A5A] font-display mt-0.5 flex items-center justify-center gap-1">
            {diff > 0 ? <TrendingDownIcon size={16} /> : <TrendingUpIcon size={16} />}
            <span>{Math.abs(diff).toFixed(1)} kg</span>
          </div>
        </div>
      </div>

      {/* Interactive Chart */}
      {sortedRecords.length > 0 && (
        <div className="bg-[#F7F5EF] p-4 rounded-xl border overflow-x-auto" style={{ borderColor: "#E6E0D5" }}>
          <div className="text-xs font-bold text-[#172A35] mb-2 font-display">Historical Weight Trend</div>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-36 overflow-visible">
            {/* Target line */}
            <line
              x1="0"
              y1={svgHeight - 20 - ((targetWeight - minW) / (maxW - minW || 1)) * (svgHeight - 40)}
              x2={svgWidth}
              y2={svgHeight - 20 - ((targetWeight - minW) / (maxW - minW || 1)) * (svgHeight - 40)}
              stroke="#315A63"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            {/* Progress line */}
            {pathString && (
              <path d={pathString} fill="none" stroke="#C18A5A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {/* Data points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="#C18A5A" stroke="#FFFFFF" strokeWidth="2" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#172A35">
                  {p.weight}kg
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* History List */}
      <div className="space-y-1.5 pt-1">
        <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Past Measurements</h4>
        {sortedRecords.slice(-5).reverse().map((rec) => (
          <div key={rec.id} className="flex items-center justify-between text-xs py-1.5 border-b text-[#172A35]" style={{ borderColor: "#F1EEE6" }}>
            <div className="flex items-center gap-1.5 text-[#6B7280]">
              <CalendarIcon size={12} />
              <span>{rec.date}</span>
            </div>
            <span className="font-bold font-display">{rec.weight} kg</span>
          </div>
        ))}
      </div>
    </div>
  )
}
