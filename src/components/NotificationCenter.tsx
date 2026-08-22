import React, { useState, useEffect } from "react"
import { useApp } from "@/context/AppContext"
import { SmartNotification } from "@/types"
import { BellIcon, XIcon, CheckIcon, AlertTriangleIcon, SparklesIcon, CalendarIcon, ScaleIcon } from "@/components/icons"

interface NotificationCenterProps {
  onClose: () => void
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { user, meals, waterLiters, pantryItems, addToast } = useApp()
  const [notifications, setNotifications] = useState<SmartNotification[]>([])

  useEffect(() => {
    // Generate smart alerts based on actual user context
    const alerts: SmartNotification[] = []
    const now = new Date()

    // 1. Water alert
    if (user.notifications.hydrationReminders && waterLiters < user.dailyWater) {
      const remaining = (user.dailyWater - waterLiters).toFixed(1)
      alerts.push({
        id: "notif-water",
        title: "Hydration Goal Reminder",
        message: `You have ${remaining}L of water remaining to reach your daily ${user.dailyWater}L goal. Drink up! 💧`,
        category: "water",
        isRead: false,
        createdAt: now.toISOString(),
      })
    }

    // 2. Protein alert
    const proteinConsumed = meals.reduce((sum, m) => sum + m.protein, 0)
    if (user.notifications.aiInsights && proteinConsumed < user.dailyProtein) {
      const remainingP = user.dailyProtein - proteinConsumed
      alerts.push({
        id: "notif-protein",
        title: "Protein Target Progress",
        message: `You are ${remainingP}g away from hitting your daily protein target of ${user.dailyProtein}g today.`,
        category: "protein",
        isRead: false,
        createdAt: now.toISOString(),
      })
    }

    // 3. Pantry Expiring alert
    const expiring = pantryItems.filter((i) => !i.isUsed && i.expirationDate && new Date(i.expirationDate).getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000)
    if (expiring.length > 0) {
      alerts.push({
        id: "notif-pantry",
        title: "Pantry Items Expiring Soon",
        message: `${expiring.length} item(s) in your Smart Pantry (${expiring.map((e) => e.name).join(", ")}) are approaching expiration.`,
        category: "pantry_expiring",
        isRead: false,
        createdAt: now.toISOString(),
      })
    }

    // 4. Meal plan alert
    alerts.push({
      id: "notif-mealplan",
      title: "Weekly Meal Plan Ready",
      message: "Your personalized weekly meal plan for this week is active. View your menu under Meal Planner.",
      category: "meal_plan",
      isRead: false,
      createdAt: now.toISOString(),
    })

    setNotifications(alerts)
  }, [user, meals, waterLiters, pantryItems])

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    addToast("Marked as read", "info")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] w-full max-w-sm h-full p-5 space-y-4 border-l flex flex-col justify-between shadow-2xl" style={{ borderColor: "#E6E0D5" }}>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#F1EEE6" }}>
            <div className="flex items-center gap-2">
              <BellIcon size={18} className="text-[#C18A5A]" />
              <h3 className="font-bold text-base text-[#172A35] font-display">Notifications</h3>
            </div>
            <button onClick={onClose} className="p-1 text-[#6B7280] hover:text-[#172A35]">
              <XIcon size={18} />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[75vh]">
            {notifications.length === 0 ? (
              <p className="text-xs text-[#6B7280] italic py-8 text-center">No new notifications.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border space-y-1 transition-all ${
                    n.isRead ? "bg-[#F7F5EF] opacity-70" : "bg-[#FFFFFF] border-[#C18A5A]/40 shadow-xs"
                  }`}
                  style={{ borderColor: n.isRead ? "#E6E0D5" : undefined }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#172A35] font-display">{n.title}</span>
                    {!n.isRead && (
                      <button onClick={() => markRead(n.id)} className="p-1 text-[#C18A5A] hover:text-[#172A35]">
                        <CheckIcon size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280]">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl text-xs font-bold text-[#FFFFFF] shadow-sm"
          style={{ background: "#172A35" }}
        >
          Close Center
        </button>
      </div>
    </div>
  )
}
