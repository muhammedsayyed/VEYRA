import React, { useState } from "react"
import { useApp } from "@/context/AppContext"
import { FoodItem } from "@/types"
import { SparklesIcon, XIcon, SearchIcon, CheckIcon } from "@/components/icons"

interface WhatShouldIEatModalProps {
  onClose: () => void
  onSelectRecipe: (recipe: FoodItem) => void
}

export default function WhatShouldIEatModal({ onClose, onSelectRecipe }: WhatShouldIEatModalProps) {
  const { pantryItems } = useApp()

  const [budget, setBudget] = useState<string>("any")
  const [maxCalories, setMaxCalories] = useState<number>(600)
  const [minProtein, setMinProtein] = useState<number>(20)
  const [mealType, setMealType] = useState<string>("any")
  const [cuisine, setCuisine] = useState<string>("any")
  const [usePantryOnly, setUsePantryOnly] = useState<boolean>(false)

  const activePantryNames = pantryItems.filter((i) => !i.isUsed).map((i) => i.name.toLowerCase())

  // Sample catalog of authentic recipes
  const catalog: FoodItem[] = [
    {
      id: "wsie-1",
      name: "Italian Grilled Chicken Caprese",
      category: "Lunch",
      cuisine: "Italian",
      calories: 450,
      protein: 44,
      carbs: 12,
      fat: 22,
      portionGrams: 320,
      score: 9.6,
      ingredients: ["Chicken", "Tomato", "Mozzarella", "Basil", "Olive Oil"],
      homePrepCost: 5.5,
      restaurantPrice: 16.0,
      currency: "USD",
      country: "Italy",
      timeToPrepareMin: 20,
      youtubeUrl: "https://www.youtube.com/watch?v=sH4aZfH2vP8",
      img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "wsie-2",
      name: "Authentic Egyptian Koshari",
      category: "Main Meals",
      cuisine: "Egyptian",
      calories: 520,
      protein: 20,
      carbs: 88,
      fat: 10,
      portionGrams: 400,
      score: 9.0,
      ingredients: ["Rice", "Lentils", "Pasta", "Tomato", "Garlic", "Onion"],
      homePrepCost: 40,
      restaurantPrice: 120,
      currency: "EGP",
      country: "Egypt",
      timeToPrepareMin: 35,
      img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "wsie-3",
      name: "Japanese Salmon Teriyaki",
      category: "Dinner",
      cuisine: "Japanese",
      calories: 580,
      protein: 46,
      carbs: 45,
      fat: 18,
      portionGrams: 380,
      score: 9.4,
      ingredients: ["Salmon", "Rice", "Soy Sauce", "Ginger"],
      homePrepCost: 8.0,
      restaurantPrice: 22.0,
      currency: "USD",
      country: "Japan",
      timeToPrepareMin: 25,
      img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format",
    },
  ]

  const filtered = catalog.filter((recipe) => {
    if (recipe.calories > maxCalories) return false
    if (recipe.protein < minProtein) return false
    if (mealType !== "any" && recipe.category.toLowerCase() !== mealType.toLowerCase()) return false
    if (cuisine !== "any" && recipe.cuisine?.toLowerCase() !== cuisine.toLowerCase()) return false
    if (usePantryOnly) {
      const hasSome = (recipe.ingredients || []).some((ing) => activePantryNames.some((p) => p.includes(ing.toLowerCase())))
      if (!hasSome) return false
    }
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-xl w-full p-6 space-y-4 border shadow-xl max-h-[85vh] overflow-y-auto" style={{ borderColor: "#E6E0D5" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon size={20} className="text-[#C18A5A]" />
            <h3 className="text-lg font-bold font-display text-[#172A35]">What Should I Eat?</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#6B7280] hover:text-[#172A35]">
            <XIcon size={18} />
          </button>
        </div>

        <p className="text-xs text-[#6B7280]">
          Tell Veyra your preference and budget to get immediate tailored recommendations.
        </p>

        {/* Filter controls */}
        <div className="grid grid-cols-2 gap-3 bg-[#F7F5EF] p-4 rounded-xl border text-xs" style={{ borderColor: "#E6E0D5" }}>
          <div>
            <label className="block font-semibold text-[#172A35] mb-1">Max Calories: {maxCalories} kcal</label>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={maxCalories}
              onChange={(e) => setMaxCalories(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#172A35] mb-1">Min Protein: {minProtein} g</label>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={minProtein}
              onChange={(e) => setMinProtein(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#172A35] mb-1">Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full p-1.5 rounded-lg border bg-[#FFFFFF] focus:outline-none"
              style={{ borderColor: "#E6E0D5" }}
            >
              <option value="any">Any Meal</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#172A35] mb-1">Cuisine</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full p-1.5 rounded-lg border bg-[#FFFFFF] focus:outline-none"
              style={{ borderColor: "#E6E0D5" }}
            >
              <option value="any">Any Cuisine</option>
              <option value="italian">Italian</option>
              <option value="egyptian">Egyptian</option>
              <option value="japanese">Japanese</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pantryOnly"
            checked={usePantryOnly}
            onChange={(e) => setUsePantryOnly(e.target.checked)}
            className="rounded text-[#C18A5A]"
          />
          <label htmlFor="pantryOnly" className="text-xs font-semibold text-[#172A35] cursor-pointer">
            Prefer recipes matching my Smart Pantry items
          </label>
        </div>

        {/* Results */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Recommendations ({filtered.length})</h4>
          {filtered.length === 0 ? (
            <p className="text-xs text-[#6B7280] italic py-4 text-center">No recipes matched your exact filters. Adjust sliders to see options.</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectRecipe(item)
                  onClose()
                }}
                className="bg-[#F7F5EF] p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F1EEE6] transition-all"
                style={{ borderColor: "#E6E0D5" }}
              >
                <div className="flex items-center gap-3">
                  <img src={item.img} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-sm text-[#172A35] font-display">{item.name}</div>
                    <div className="text-xs text-[#6B7280]">
                      {item.calories} kcal • {item.protein}g protein • {item.country || item.cuisine}
                    </div>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#FFFFFF]" style={{ background: "#C18A5A" }}>
                  Select
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
