import React, { useState, useEffect } from "react"
import { SearchIcon, SparklesIcon, PlusIcon, HeartIcon, CompassIcon } from "@/components/icons"
import { Obj3D } from "@/components/VeyraChar"
import { useApp } from "@/context/AppContext"
import { FoodItem } from "@/types"
import RecipeDetailsModal from "@/components/RecipeDetailsModal"
import WhatShouldIEatModal from "@/components/WhatShouldIEatModal"
import { getMealCategories, getMealAreas, filterMeals, searchMeals, ApiMeal } from "@/services/api/mealService"

const COUNTRIES = [
  "Egypt", "Italy", "Japan", "Mexico", "India", "Turkey", "France", "USA",
  "South Korea", "Thailand", "Greece", "Spain", "China", "Brazil", "Morocco"
]

const CATEGORIES = [
  "All", "Popular", "Traditional", "Street Food", "Healthy", "High Protein", "Budget Friendly", "Easy Recipes"
]

// Rich authentic recipes dataset across 15 target countries
const AUTHENTIC_RECIPES: FoodItem[] = [
  {
    id: "rec-egypt-1",
    name: "Egyptian Koshari",
    category: "Traditional",
    cuisine: "Egyptian",
    calories: 540,
    protein: 22,
    carbs: 88,
    fat: 10,
    portionGrams: 400,
    score: 9.2,
    ingredients: ["Rice", "Lentils", "Macaroni", "Chickpeas", "Crispy Onions", "Garlic Tomato Sauce"],
    homePrepCost: 45,
    restaurantPrice: 130,
    currency: "EGP",
    country: "Egypt",
    timeToPrepareMin: 35,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "rec-egypt-2",
    name: "Alexandrian Liver Sandwich",
    category: "Street Food",
    cuisine: "Egyptian",
    calories: 420,
    protein: 38,
    carbs: 28,
    fat: 16,
    portionGrams: 250,
    score: 8.8,
    ingredients: ["Beef Liver", "Green Chili", "Garlic", "Cumin", "Baladi Bread"],
    homePrepCost: 65,
    restaurantPrice: 180,
    currency: "EGP",
    country: "Egypt",
    timeToPrepareMin: 15,
    img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "rec-italy-1",
    name: "Classic Chicken Caprese Salad",
    category: "Healthy",
    cuisine: "Italian",
    calories: 460,
    protein: 44,
    carbs: 14,
    fat: 22,
    portionGrams: 320,
    score: 9.6,
    ingredients: ["Grilled Chicken", "Cherry Tomatoes", "Fresh Mozzarella", "Basil", "Balsamic Dressing"],
    homePrepCost: 6.5,
    restaurantPrice: 18.0,
    currency: "EUR",
    country: "Italy",
    timeToPrepareMin: 18,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "rec-japan-1",
    name: "Teriyaki Chicken & Steamed Edamame Bowl",
    category: "High Protein",
    cuisine: "Japanese",
    calories: 560,
    protein: 48,
    carbs: 52,
    fat: 14,
    portionGrams: 380,
    score: 9.4,
    ingredients: ["Chicken Thighs", "Jasmine Rice", "Edamame", "Soy Teriyaki Glaze", "Sesame Seeds"],
    homePrepCost: 850,
    restaurantPrice: 2200,
    currency: "JPY",
    country: "Japan",
    timeToPrepareMin: 22,
    img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "rec-mexico-1",
    name: "Chicken Fajita Power Bowl",
    category: "Popular",
    cuisine: "Mexican",
    calories: 510,
    protein: 42,
    carbs: 45,
    fat: 18,
    portionGrams: 360,
    score: 9.1,
    ingredients: ["Chicken Breast", "Bell Peppers", "Black Beans", "Avocado", "Lime Rice"],
    homePrepCost: 7.0,
    restaurantPrice: 16.5,
    currency: "USD",
    country: "Mexico",
    timeToPrepareMin: 20,
    img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "rec-india-1",
    name: "Butter Chicken with Garlic Naan",
    category: "Traditional",
    cuisine: "Indian",
    calories: 640,
    protein: 46,
    carbs: 42,
    fat: 28,
    portionGrams: 420,
    score: 8.5,
    ingredients: ["Chicken", "Tomato Cream Sauce", "Garam Masala", "Garlic Naan"],
    homePrepCost: 350,
    restaurantPrice: 850,
    currency: "INR",
    country: "India",
    timeToPrepareMin: 35,
    img: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "rec-greece-1",
    name: "Greek Souvlaki Skewers with Tzatziki",
    category: "High Protein",
    cuisine: "Greek",
    calories: 440,
    protein: 42,
    carbs: 18,
    fat: 16,
    portionGrams: 300,
    score: 9.5,
    ingredients: ["Marinated Pork", "Cucumber Tzatziki", "Pita Bread", "Oregano"],
    homePrepCost: 6.0,
    restaurantPrice: 15.0,
    currency: "EUR",
    country: "Greece",
    timeToPrepareMin: 20,
    img: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop&auto=format",
  },
]

export default function DiscoverFood() {
  const { addToast, toggleFavorite, favorites } = useApp()

  const [activeCategory, setActiveCategory] = useState("All")
  const [activeCountry, setActiveCountry] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const [selectedRecipe, setSelectedRecipe] = useState<FoodItem | null>(null)
  const [showWhatShouldIEat, setShowWhatShouldIEat] = useState(false)

  // Filter recipes
  const displayRecipes = AUTHENTIC_RECIPES.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || (r.country || "").toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (activeCountry !== "All" && r.country?.toLowerCase() !== activeCountry.toLowerCase()) return false
    if (activeCategory !== "All" && r.category?.toLowerCase() !== activeCategory.toLowerCase()) return false

    return true
  })

  return (
    <div className="screen-scroll p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 sm:p-8">
        <div className="absolute right-4 top-2 opacity-80 pointer-events-none animate-float">
          <Obj3D kind="berry" size={70} />
        </div>
        <p className="label-mono text-[11px] mb-2" style={{ color: "#C18A5A" }}>
          GLOBAL RECIPES &amp; NUTRITION DISCOVERY
        </p>
        <h1 className="display-xl text-[#172A35]">Discover World Cuisines</h1>
        <p className="text-sm mt-2 max-w-md text-[#6B7280]">
          Explore authentic recipes across 15 countries, inspect preparation costs, and get instant recommendations.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setShowWhatShouldIEat(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#FFFFFF] shadow-sm"
            style={{ background: "#C18A5A" }}
          >
            <SparklesIcon size={16} />
            <span>What Should I Eat?</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <input
          className="input-field w-full pl-11 pr-4 py-3 text-sm"
          placeholder="Search 15 countries & recipes (e.g. Koshari, Chicken, Italy, Egypt)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
      </div>

      {/* Country Filters */}
      <div className="space-y-1.5">
        <div className="label-mono text-[10px] text-[#6B7280]">TARGET COUNTRIES &amp; REGIONS (15)</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", ...COUNTRIES].map((country) => (
            <button
              key={country}
              onClick={() => setActiveCountry(country)}
              className={`chip whitespace-nowrap ${activeCountry === country ? "active" : ""}`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Filters */}
      <div className="space-y-1.5">
        <div className="label-mono text-[10px] text-[#6B7280]">RECIPE CATEGORIES</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`chip whitespace-nowrap ${activeCategory === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRecipes.map((meal) => {
          const isFav = favorites.has(meal.id)
          return (
            <div key={meal.id} className="glass rounded-3xl overflow-hidden card-hover flex flex-col justify-between border" style={{ borderColor: "#E6E0D5" }}>
              <div className="relative h-48 overflow-hidden">
                <img src={meal.img} alt={meal.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => toggleFavorite(meal.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#172A35]"
                >
                  <HeartIcon size={16} className={isFav ? "text-[#EF4444] fill-[#EF4444]" : "text-[#172A35]"} />
                </button>
                <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#172A35] border border-[#E6E0D5]">
                  {meal.country} · {meal.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-800 text-[#172A35] text-base leading-tight mb-1">{meal.name}</h3>
                  <p className="text-xs text-[#6B7280] line-clamp-2">
                    {meal.ingredients ? meal.ingredients.join(", ") : "Authentic regional ingredients"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#E6E0D5]">
                  <div>
                    <div className="text-xs text-[#C18A5A] font-bold">{meal.calories} kcal</div>
                    <div className="text-[10px] text-[#6B7280]">
                      Prep: {meal.homePrepCost ? `${meal.homePrepCost} ${meal.currency}` : "N/A"}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecipe(meal)}
                    className="btn-ghost text-xs px-3.5 py-1.5 font-bold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeDetailsModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}

      {/* What Should I Eat Modal */}
      {showWhatShouldIEat && (
        <WhatShouldIEatModal
          onClose={() => setShowWhatShouldIEat(false)}
          onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
        />
      )}
    </div>
  )
}

