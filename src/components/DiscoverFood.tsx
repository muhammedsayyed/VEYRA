import React, { useState, useEffect } from "react"
import { SearchIcon, SparklesIcon, PlusIcon, HeartIcon } from "@/components/icons"
import { Obj3D } from "@/components/VeyraChar"
import { useApp } from "@/context/AppContext"
import Modal from "@/components/Modal"
import { getMealCategories, getMealAreas, filterMeals, searchMeals, getMealById, ApiMeal, CategoryItem, AreaItem } from "@/services/api/mealService"

export default function DiscoverFood() {
  const { addMeal, addToast, toggleFavorite, favorites } = useApp()

  const [activeCategory, setActiveCategory] = useState("All")
  const [activeArea, setActiveArea] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const [apiCategories, setApiCategories] = useState<CategoryItem[]>([])
  const [apiAreas, setApiAreas] = useState<AreaItem[]>([])
  const [apiMealsList, setApiMealsList] = useState<ApiMeal[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [inspectMeal, setInspectMeal] = useState<ApiMeal | null>(null)
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false)

  // Fetch initial API categories & cuisines
  useEffect(() => {
    getMealCategories().then((cats) => {
      if (cats && cats.length > 0) setApiCategories(cats)
    })
    getMealAreas().then((areas) => {
      if (areas && areas.length > 0) setApiAreas(areas)
    })
    loadMeals("", "")
  }, [])

  const loadMeals = async (cat: string, area: string) => {
    setIsLoading(true)
    setApiError(null)
    const categoryParam = cat === "All" ? "" : cat
    const areaParam = area === "All" ? "" : area

    try {
      const results = await filterMeals(categoryParam, areaParam, 20)
      setIsLoading(false)
      if (results && results.length > 0) {
        setApiMealsList(results)
      } else {
        setApiMealsList([])
      }
    } catch (err: any) {
      setIsLoading(false)
      const errorMsg = err?.isNetworkError
        ? "Network error. Please check your internet connection and try again."
        : "Unable to load recipes. Please try again."
      setApiError(errorMsg)
    }
  }

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName)
    loadMeals(catName, activeArea)
  }

  const handleAreaClick = (areaName: string) => {
    setActiveArea(areaName)
    loadMeals(activeCategory, areaName)
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadMeals(activeCategory, activeArea)
      return
    }
    setIsLoading(true)
    setApiError(null)

    try {
      const results = await searchMeals(searchQuery)
      setIsLoading(false)
      if (results && results.length > 0) {
        setApiMealsList(results)
        addToast(`Found ${results.length} recipe(s)`, "success")
      } else {
        setApiMealsList([])
      }
    } catch (err: any) {
      setIsLoading(false)
      const errorMsg = err?.isNetworkError
        ? "Network error. Please check your connection."
        : "Search request failed. Please check your query and try again."
      setApiError(errorMsg)
    }
  }

  const openInspectMeal = async (mealId: string) => {
    try {
      const fullMeal = await getMealById(mealId)
      setInspectMeal(fullMeal)
      setInspectModalOpen(true)
    } catch {
      const found = apiMealsList.find((m) => m.id === mealId)
      if (found) {
        setInspectMeal(found)
        setInspectModalOpen(true)
      }
    }
  }

  const handleAddApiMealToLog = (meal: ApiMeal) => {
    addMeal({
      foodId: meal.id,
      name: meal.name,
      sectionId: "lunch",
      servings: 1,
      grams: 350,
      calories: 450,
      protein: 34,
      carbs: 48,
      fat: 14,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      img: meal.thumbnail,
    })
    setInspectModalOpen(false)
  }

  return (
    <div className="screen-scroll">
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl gradient-hero p-6 sm:p-7">
        <div className="absolute right-4 top-2 opacity-80 pointer-events-none animate-float">
          <Obj3D kind="berry" size={60} />
        </div>
        <p className="label-mono text-[11px] mb-2" style={{ color: "#C18A5A" }}>
          RECIPES &amp; NUTRITION DISCOVERY
        </p>
        <h1 className="display-xl text-[#172A35]">Discover &amp; Cook</h1>
        <p className="text-sm mt-2 max-w-sm" style={{ color: "#6B7280" }}>
          Browse global cuisines, categories, and ingredients for your daily meals.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="mb-6 max-w-xl">
        <div className="relative">
          <input
            className="input-field w-full pl-11 pr-24 py-3.5 text-sm"
            placeholder="Search recipes (e.g. Chicken, Pasta, Salad)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <button type="submit" disabled={isLoading} className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-700">
            {isLoading ? "Loading..." : "Search"}
          </button>
        </div>
      </form>

      {/* Categories chips */}
      <div className="mb-4">
        <div className="label-mono text-[10px] text-[#6B7280] mb-2">CATEGORIES</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", ...apiCategories.map((c) => c.name)].slice(0, 10).map((cat) => (
            <button key={cat} onClick={() => handleCategoryClick(cat)} className={`chip whitespace-nowrap ${activeCategory === cat ? "active" : ""}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Area / Cuisine chips */}
      {apiAreas.length > 0 && (
        <div className="mb-6">
          <div className="label-mono text-[10px] text-[#6B7280] mb-2">CUISINES &amp; REGIONS</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All", ...apiAreas.map((a) => a.name)].slice(0, 10).map((area) => (
              <button key={area} onClick={() => handleAreaClick(area)} className={`chip whitespace-nowrap ${activeArea === area ? "active" : ""}`}>
                {area}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center glass rounded-3xl">
          <SparklesIcon size={32} className="mx-auto text-[#C18A5A] animate-spin-slow mb-3" />
          <p className="font-display font-700 text-[#172A35] text-base">Loading recipes...</p>
        </div>
      )}

      {/* Error / Retry State */}
      {apiError && !isLoading && (
        <div className="p-8 text-center glass rounded-3xl border border-[#C18A5A]/30">
          <p className="text-sm text-[#C18A5A] font-semibold mb-4">{apiError}</p>
          <button onClick={() => loadMeals(activeCategory, activeArea)} className="btn-ghost text-xs px-5 py-2.5 font-bold">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !apiError && apiMealsList.length === 0 && (
        <div className="p-12 text-center glass rounded-3xl">
          <p className="text-[#6B7280] text-sm">No recipes found matching current category or filter.</p>
        </div>
      )}

      {/* Recipe Grid */}
      {!isLoading && !apiError && apiMealsList.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiMealsList.map((meal) => (
            <div key={meal.id} className="glass rounded-3xl overflow-hidden card-hover flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img src={meal.thumbnail} alt={meal.name} className="w-full h-full object-cover" />
                <button onClick={() => toggleFavorite(meal.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#172A35]">
                  <HeartIcon size={16} className={favorites.has(meal.id) ? "text-[#B96D62] fill-[#B96D62]" : "text-[#172A35]"} />
                </button>
                <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#172A35] border border-[#E6E0D5]">
                  {meal.category || "Main"} · {meal.area || "Global"}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-800 text-[#172A35] text-base leading-tight mb-1">{meal.name}</h3>
                  <p className="text-xs text-[#6B7280] line-clamp-2">{meal.ingredients ? meal.ingredients.map((i) => i.ingredient).join(", ") : "Fresh ingredients"}</p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#E6E0D5]">
                  <span className="text-xs text-[#C18A5A] font-bold">~450 kcal</span>
                  <button onClick={() => openInspectMeal(meal.id)} className="btn-ghost text-xs px-3 py-1.5 font-bold">
                    View Recipe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECIPE INSPECTOR MODAL */}
      <Modal isOpen={inspectModalOpen} onClose={() => setInspectModalOpen(false)} title={inspectMeal?.name || "Recipe Details"} maxWidth="xl">
        {inspectMeal && (
          <div className="space-y-5">
            <img src={inspectMeal.thumbnail} alt={inspectMeal.name} className="w-full h-48 rounded-2xl object-cover" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="chip active">{inspectMeal.category}</span>
                <span className="chip">{inspectMeal.area}</span>
              </div>
              <h3 className="font-display font-800 text-[#172A35] text-xl">{inspectMeal.name}</h3>
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="font-display font-700 text-[#172A35] text-sm mb-2">Ingredients</h4>
              <ul className="grid grid-cols-2 gap-2 text-xs text-[#6B7280]">
                {inspectMeal.ingredients?.map((ing, idx) => (
                  <li key={idx} className="glass p-2 rounded-xl flex items-center justify-between">
                    <span>{ing.ingredient}</span>
                    <span className="text-[#C18A5A] font-bold">{ing.measure}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            {inspectMeal.instructions && inspectMeal.instructions.length > 0 && (
              <div>
                <h4 className="font-display font-700 text-[#172A35] text-sm mb-2">Cooking Instructions</h4>
                <ol className="space-y-2 text-xs text-[#6B7280] list-decimal list-inside">
                  {inspectMeal.instructions.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <button onClick={() => handleAddApiMealToLog(inspectMeal)} className="btn-primary w-full py-3 text-sm font-700">
              <PlusIcon size={16} /> Add Recipe to Food Log
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
