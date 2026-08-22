import React, { useState } from "react"
import { useApp } from "@/context/AppContext"
import { ShoppingListItem } from "@/types"
import { PlusIcon, TrashIcon, CheckIcon, XIcon, ShoppingCartIcon } from "@/components/icons"

export default function ShoppingList() {
  const { shoppingList, addShoppingListItem, updateShoppingListItem, deleteShoppingListItem, clearPurchasedShoppingList, clearEntireShoppingList, addToast } = useApp()

  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState("pcs")

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      addToast("Please enter item name", "warning")
      return
    }

    await addShoppingListItem({
      name: name.trim(),
      quantity: Number(quantity) || 1,
      unit: unit.trim(),
    })
    addToast(`Added "${name}" to shopping list`, "success")
    setName("")
    setQuantity(1)
    setUnit("pcs")
    setShowAddModal(false)
  }

  const purchasedCount = shoppingList.filter((i) => i.isPurchased).length
  const pendingCount = shoppingList.filter((i) => !i.isPurchased).length

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-display font-800 text-[#172A35]">Smart Shopping List</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#315A63]/15 text-[#315A63]">
              {pendingCount} To Buy
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Organize your grocery list and auto-add missing ingredients directly from recipes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {purchasedCount > 0 && (
            <button
              onClick={clearPurchasedShoppingList}
              className="px-3 py-2 rounded-xl font-semibold text-xs transition-all border text-[#6B7280] hover:text-[#EF4444]"
              style={{ borderColor: "#E6E0D5" }}
            >
              Clear Purchased ({purchasedCount})
            </button>
          )}
          {shoppingList.length > 0 && (
            <button
              onClick={clearEntireShoppingList}
              className="px-3 py-2 rounded-xl font-semibold text-xs transition-all border text-[#EF4444] hover:bg-[#EF4444]/10"
              style={{ borderColor: "#EF4444" }}
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-[#FFFFFF] shadow-sm"
            style={{ background: "#C18A5A" }}
          >
            <PlusIcon size={14} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* List items */}
      {shoppingList.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border p-8" style={{ borderColor: "#E6E0D5" }}>
          <div className="w-12 h-12 rounded-full bg-[#315A63]/15 text-[#315A63] flex items-center justify-center mx-auto mb-3">
            <ShoppingCartIcon size={24} />
          </div>
          <h3 className="text-base font-bold text-[#172A35] font-display">Your Shopping List is Empty</h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
            Add items manually or use "Add Missing Ingredients" on any recipe card to automatically check your pantry.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-[#FFFFFF]"
            style={{ background: "#C18A5A" }}
          >
            Add Manual Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pending Items */}
          <div className="bg-[#FFFFFF] rounded-2xl border p-4 space-y-2" style={{ borderColor: "#E6E0D5" }}>
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Items to Buy</h3>
            {shoppingList.filter((i) => !i.isPurchased).length === 0 ? (
              <p className="text-xs text-[#6B7280] py-2 italic">All items purchased! 🎉</p>
            ) : (
              shoppingList.filter((i) => !i.isPurchased).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-[#F7F5EF] transition-all hover:bg-[#F1EEE6]"
                  style={{ borderColor: "#E6E0D5" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => updateShoppingListItem(item.id, { isPurchased: true })}
                      className="w-5 h-5 rounded-md border flex items-center justify-center bg-[#FFFFFF] hover:border-[#315A63] transition-all shrink-0"
                      style={{ borderColor: "#C18A5A" }}
                    >
                      {/* Empty checkbox */}
                    </button>
                    <div>
                      <div className="text-sm font-bold text-[#172A35] font-display capitalize truncate">{item.name}</div>
                      <div className="text-xs text-[#6B7280]">
                        Qty: {item.quantity} {item.unit}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteShoppingListItem(item.id)}
                    className="p-1.5 text-[#6B7280] hover:text-[#EF4444] transition-all"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Purchased Items */}
          {purchasedCount > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border p-4 space-y-2 opacity-80" style={{ borderColor: "#E6E0D5" }}>
              <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Purchased Items</h3>
              {shoppingList.filter((i) => i.isPurchased).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-[#F1EEE6] line-through text-[#6B7280]"
                  style={{ borderColor: "#E6E0D5" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => updateShoppingListItem(item.id, { isPurchased: false })}
                      className="w-5 h-5 rounded-md border flex items-center justify-center text-[#FFFFFF] shrink-0"
                      style={{ background: "#315A63", borderColor: "#315A63" }}
                    >
                      <CheckIcon size={12} />
                    </button>
                    <div>
                      <div className="text-sm font-bold capitalize truncate">{item.name}</div>
                      <div className="text-xs">
                        Qty: {item.quantity} {item.unit}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteShoppingListItem(item.id)}
                    className="p-1.5 text-[#6B7280] hover:text-[#EF4444] transition-all"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full p-6 space-y-4 border shadow-xl" style={{ borderColor: "#E6E0D5" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-[#172A35]">Add Shopping Item</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-[#6B7280] hover:text-[#172A35]">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172A35] mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Olive Oil, Garlic, Eggs"
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
                  Add to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
