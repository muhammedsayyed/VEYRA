import React, { useState, useEffect } from "react"
import { useApp } from "@/context/AppContext"
import { PantryItem, FoodItem } from "@/types"
import { PlusIcon, TrashIcon, CheckIcon, AlertTriangleIcon, SparklesIcon, CalendarIcon, EditIcon, XIcon, SearchIcon } from "@/components/icons"
import RecipeDetailsModal from "@/components/RecipeDetailsModal"

export default function Pantry() {
  const { pantryItems, addPantryItem, updatePantryItem, deletePantryItem, addToast, setScreen } = useApp()
  const [activeTab, setActiveTab] = useState<"all" | "expiring" | "expired" | "recent">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Form Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState("pcs")
  const [expirationDate, setExpirationDate] = useState("")

  // Recipe Cook Modal State
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<FoodItem | null>(null)
  const [showCookModal, setShowCookModal] = useState(false)

  const openAddModal = () => {
    setEditingItem(null)
    setName("")
    setQuantity(1)
    setUnit("pcs")
    setExpirationDate("")
    setShowAddModal(true)
  }

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item)
    setName(item.name)
    setQuantity(item.quantity)
    setUnit(item.unit)
    setExpirationDate(item.expirationDate ? item.expirationDate.split("T")[0] : "")
    setShowAddModal(true)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      addToast("Please enter ingredient name", "warning")
      return
    }

    if (editingItem) {
      await updatePantryItem(editingItem.id, {
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unit: unit.trim(),
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
      })
      addToast(`Updated "${name}" in pantry`, "success")
    } else {
      await addPantryItem({
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unit: unit.trim(),
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
      })
      addToast(`Added "${name}" to pantry`, "success")
    }

    setShowAddModal(false)
  }

  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const isExpired = (item: PantryItem) => {
    if (!item.expirationDate) return false
    return new Date(item.expirationDate).getTime() < now.getTime()
  }

  const isExpiringSoon = (item: PantryItem) => {
    if (!item.expirationDate) return false
    const expTime = new Date(item.expirationDate).getTime()
    return expTime >= now.getTime() && expTime <= threeDaysFromNow.getTime()
  }

  // Filter items
  const filteredItems = pantryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (activeTab === "all") return !item.isUsed
    if (activeTab === "expiring") return !item.isUsed && isExpiringSoon(item)
    if (activeTab === "expired") return !item.isUsed && isExpired(item)
    if (activeTab === "recent") return !item.isUsed
    return true
  }).sort((a, b) => {
    if (activeTab === "recent") {
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
    }
    return 0
  })

  // Pantry recipe recommendations
  const activePantryNames = pantryItems.filter((i) => !i.isUsed).map((i) => i.name.toLowerCase())

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-display font-800 text-[#172A35]">Smart Pantry</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#C18A5A]/15 text-[#C18A5A]">
              {pantryItems.filter((i) => !i.isUsed).length} Ingredients
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Track your refrigerator & pantry items, monitor expiration dates, and cook smart recipes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCookModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
            style={{ background: "#315A63", color: "#FFFFFF" }}
          >
            <SparklesIcon size={16} />
            <span>Cook with Pantry</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
            style={{ background: "#C18A5A", color: "#FFFFFF" }}
          >
            <PlusIcon size={16} />
            <span>Add Ingredient</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-2xl border" style={{ borderColor: "#E6E0D5" }}>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Items" },
            { id: "expiring", label: "Expiring Soon" },
            { id: "expired", label: "Expired" },
            { id: "recent", label: "Recently Added" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#172A35] text-[#FFFFFF]"
                  : "text-[#6B7280] hover:bg-[#F1EEE6]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 sm:w-64">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search pantry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs text-[#172A35] focus:outline-none"
            style={{ borderColor: "#E6E0D5", background: "#F7F5EF" }}
          />
        </div>
      </div>

      {/* Ingredients Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border p-8" style={{ borderColor: "#E6E0D5" }}>
          <div className="w-12 h-12 rounded-full bg-[#C18A5A]/15 text-[#C18A5A] flex items-center justify-center mx-auto mb-3">
            <SparklesIcon size={24} />
          </div>
          <h3 className="text-base font-bold text-[#172A35] font-display">No ingredients found</h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
            {activeTab === "expiring"
              ? "Great news! No ingredients are close to expiring right now."
              : activeTab === "expired"
              ? "No expired ingredients in your pantry."
              : "Add your fresh food, groceries, and ingredients to track them easily."}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-[#FFFFFF]"
            style={{ background: "#C18A5A" }}
          >
            Add First Ingredient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const expired = isExpired(item)
            const expiringSoon = isExpiringSoon(item)

            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] rounded-2xl border p-4 flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden"
                style={{ borderColor: expired ? "#EF4444" : expiringSoon ? "#F59E0B" : "#E6E0D5" }}
              >
                {/* Expiration Status Pill */}
                {expired && (
                  <div className="mb-2 flex items-center gap-1 text-[11px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-md w-fit">
                    <AlertTriangleIcon size={12} />
                    <span>Expired</span>
                  </div>
                )}
                {!expired && expiringSoon && (
                  <div className="mb-2 flex items-center gap-1 text-[11px] font-bold text-[#D97706] bg-[#F59E0B]/15 px-2 py-0.5 rounded-md w-fit">
                    <AlertTriangleIcon size={12} />
                    <span>Expiring Soon</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-[#172A35] font-display capitalize truncate">{item.name}</h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEditModal(item)} className="p-1 text-[#6B7280] hover:text-[#172A35]">
                        <EditIcon size={14} />
                      </button>
                      <button onClick={() => deletePantryItem(item.id)} className="p-1 text-[#6B7280] hover:text-[#EF4444]">
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-[#315A63]">
                    Quantity: {item.quantity} {item.unit}
                  </div>

                  {item.expirationDate && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[#6B7280]">
                      <CalendarIcon size={12} />
                      <span>Exp: {new Date(item.expirationDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: "#F1EEE6" }}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updatePantryItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                      className="w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-[#F1EEE6]"
                      style={{ borderColor: "#E6E0D5" }}
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updatePantryItem(item.id, { quantity: item.quantity + 1 })}
                      className="w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-[#F1EEE6]"
                      style={{ borderColor: "#E6E0D5" }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={async () => {
                      await updatePantryItem(item.id, { isUsed: true })
                      addToast(`Marked "${item.name}" as used`, "info")
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#C18A5A] hover:bg-[#C18A5A]/10"
                  >
                    <CheckIcon size={12} />
                    <span>Used</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full p-6 space-y-4 border shadow-xl" style={{ borderColor: "#E6E0D5" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-[#172A35]">
                {editingItem ? "Edit Ingredient" : "Add Pantry Ingredient"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-[#6B7280] hover:text-[#172A35]">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172A35] mb-1">Ingredient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chicken Breast, Tomatoes, Milk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm text-[#172A35] focus:outline-none"
                  style={{ borderColor: "#E6E0D5", background: "#F7F5EF" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172A35] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border text-sm text-[#172A35] focus:outline-none"
                    style={{ borderColor: "#E6E0D5", background: "#F7F5EF" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172A35] mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm text-[#172A35] focus:outline-none bg-[#F7F5EF]"
                    style={{ borderColor: "#E6E0D5" }}
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="grams">grams</option>
                    <option value="liters">liters</option>
                    <option value="ml">ml</option>
                    <option value="packs">packs</option>
                    <option value="cans">cans</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172A35] mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm text-[#172A35] focus:outline-none"
                  style={{ borderColor: "#E6E0D5", background: "#F7F5EF" }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#F1EEE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#FFFFFF] shadow-sm"
                  style={{ background: "#C18A5A" }}
                >
                  {editingItem ? "Save Changes" : "Add to Pantry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cook with Pantry Modal */}
      {showCookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-6 space-y-4 border shadow-xl max-h-[85vh] overflow-y-auto" style={{ borderColor: "#E6E0D5" }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-display text-[#172A35] flex items-center gap-2">
                  <SparklesIcon size={18} className="text-[#C18A5A]" />
                  <span>Recipes You Can Cook Right Now</span>
                </h3>
                <p className="text-xs text-[#6B7280]">Matched against your {activePantryNames.length} available pantry ingredients.</p>
              </div>
              <button onClick={() => setShowCookModal(false)} className="p-1 text-[#6B7280] hover:text-[#172A35]">
                <XIcon size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "pantry-rec-1",
                  name: "Mediterranean Chicken Bowl",
                  category: "Main Meals" as const,
                  calories: 480,
                  protein: 42,
                  carbs: 25,
                  fat: 16,
                  portionGrams: 350,
                  score: 9.5,
                  ingredients: ["Chicken", "Rice", "Tomato", "Olive Oil", "Garlic"],
                  timeToPrepareMin: 20,
                  homePrepCost: 4.5,
                  restaurantPrice: 14.0,
                  currency: "USD",
                  country: "Italy",
                  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&auto=format",
                },
                {
                  id: "pantry-rec-2",
                  name: "Egyptian Tomato Rice & Chicken",
                  category: "Main Meals" as const,
                  calories: 520,
                  protein: 38,
                  carbs: 60,
                  fat: 14,
                  portionGrams: 400,
                  score: 9.0,
                  ingredients: ["Chicken", "Rice", "Tomato", "Onion"],
                  timeToPrepareMin: 25,
                  homePrepCost: 120,
                  restaurantPrice: 350,
                  currency: "EGP",
                  country: "Egypt",
                  img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format",
                },
              ].map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-[#F7F5EF] p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{ borderColor: "#E6E0D5" }}
                >
                  <div className="flex items-center gap-3">
                    <img src={recipe.img} alt={recipe.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-[#172A35] font-display">{recipe.name}</h4>
                      <p className="text-xs text-[#6B7280]">
                        {recipe.calories} kcal • {recipe.protein}g protein • {recipe.timeToPrepareMin} mins
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {recipe.ingredients.map((ing) => {
                          const hasIt = activePantryNames.some((p) => p.includes(ing.toLowerCase()))
                          return (
                            <span
                              key={ing}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                                hasIt ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#6B7280]/15 text-[#6B7280]"
                              }`}
                            >
                              {hasIt ? "✓ " : ""}{ing}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRecipeForModal(recipe)
                      setShowCookModal(false)
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#FFFFFF] shrink-0 w-full sm:w-auto"
                    style={{ background: "#C18A5A" }}
                  >
                    View Recipe
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {selectedRecipeForModal && (
        <RecipeDetailsModal
          recipe={selectedRecipeForModal}
          onClose={() => setSelectedRecipeForModal(null)}
        />
      )}
    </div>
  )
}
