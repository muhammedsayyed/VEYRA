import React, { useState, useEffect } from "react"
import { useApp } from "@/context/AppContext"
import { FoodItem, RecipeReview } from "@/types"
import { XIcon, HeartIcon, ShoppingCartIcon, StarIcon, PlayIcon, TrashIcon, EditIcon, CheckIcon } from "@/components/icons"

interface RecipeDetailsModalProps {
  recipe: FoodItem
  onClose: () => void
}

export default function RecipeDetailsModal({ recipe, onClose }: RecipeDetailsModalProps) {
  const { pantryItems, addBatchShoppingList, favorites, toggleFavorite, addToast } = useApp()

  const [reviews, setReviews] = useState<RecipeReview[]>([])
  const [ratingInput, setRatingInput] = useState<number>(5)
  const [reviewText, setReviewText] = useState("")
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const isFav = favorites.has(recipe.id)

  // Fetch reviews on mount
  useEffect(() => {
    let isMounted = true
    if (typeof window !== "undefined") {
      fetch(`/api/reviews?recipeId=${recipe.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.success && Array.isArray(data.data)) {
            setReviews(data.data)
          }
        })
        .catch(() => {})
    }
    return () => { isMounted = false }
  }, [recipe.id])

  const handleAddMissingIngredients = async () => {
    const pantryNames = pantryItems.filter((i) => !i.isUsed).map((i) => i.name.toLowerCase())
    const recipeIngs = recipe.ingredients || [recipe.name]

    const missing = recipeIngs.filter((ing) => !pantryNames.some((p) => p.includes(ing.toLowerCase())))

    if (missing.length === 0) {
      addToast("You already have all ingredients in your Smart Pantry! 🎉", "success")
      return
    }

    const itemsToAdd = missing.map((name) => ({
      name,
      quantity: 1,
      unit: "pcs",
      recipeId: String(recipe.id),
    }))

    await addBatchShoppingList(itemsToAdd)
    addToast(`Added ${missing.length} missing ingredients to your Shopping List! 🛒`, "success")
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) return

    setIsSubmittingReview(true)
    try {
      if (editingReviewId) {
        const res = await fetch(`/api/reviews?id=${editingReviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: ratingInput, text: reviewText.trim() }),
        })
        const data = await res.json()
        if (data.success) {
          setReviews((prev) => prev.map((r) => (r.id === editingReviewId ? data.data : r)))
          addToast("Review updated!", "success")
        }
      } else {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: String(recipe.id), rating: ratingInput, text: reviewText.trim() }),
        })
        const data = await res.json()
        if (data.success) {
          setReviews((prev) => [data.data, ...prev])
          addToast("Review submitted!", "success")
        }
      }
      setReviewText("")
      setEditingReviewId(null)
    } catch {
      addToast("Failed to submit review", "warning")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (revId: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${revId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== revId))
        addToast("Review deleted", "info")
      }
    } catch {
      // error deleting
    }
  }

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // Extract YouTube Embed URL
  const getEmbedYoutubeUrl = (url?: string) => {
    if (!url) return null
    if (url.includes("embed/")) return url
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|v\/|embed\/))([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const embedUrl = getEmbedYoutubeUrl(recipe.youtubeUrl)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-6 space-y-5 border shadow-2xl max-h-[90vh] overflow-y-auto" style={{ borderColor: "#E6E0D5" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C18A5A]/15 text-[#C18A5A]">
              {recipe.category || "Recipe"}
            </span>
            {recipe.country && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#315A63]/15 text-[#315A63]">
                {recipe.country}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(recipe.id)}
              className={`p-2 rounded-xl border transition-all ${
                isFav ? "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]" : "text-[#6B7280] hover:bg-[#F1EEE6]"
              }`}
              style={!isFav ? { borderColor: "#E6E0D5" } : {}}
            >
              <HeartIcon size={18} className={isFav ? "text-[#EF4444]" : ""} />

            </button>
            <button onClick={onClose} className="p-2 text-[#6B7280] hover:text-[#172A35]">
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {/* Recipe Title & Image */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-[#172A35]">{recipe.name}</h2>
              {avgRating ? (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B7280]">
                  <StarIcon size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="font-bold text-[#172A35]">{avgRating}</span>
                  <span>({reviews.length} reviews)</span>
                </div>
              ) : (
                <div className="text-xs text-[#6B7280] mt-0.5">No reviews yet</div>
              )}
            </div>

            <button
              onClick={handleAddMissingIngredients}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-[#FFFFFF] shadow-sm shrink-0"
              style={{ background: "#C18A5A" }}
            >
              <ShoppingCartIcon size={16} />
              <span>Add Missing Ingredients</span>
            </button>
          </div>

          <img src={recipe.img} alt={recipe.name} className="w-full h-48 sm:h-64 rounded-2xl object-cover border" style={{ borderColor: "#E6E0D5" }} />
        </div>

        {/* Recipe Pricing System */}
        <div className="bg-[#F7F5EF] p-4 rounded-xl border grid grid-cols-2 gap-4" style={{ borderColor: "#E6E0D5" }}>
          <div>
            <div className="text-xs text-[#6B7280]">Approx. Home Prep Cost</div>
            <div className="text-base font-extrabold text-[#315A63] font-display mt-0.5">
              {recipe.homePrepCost !== undefined ? `${recipe.homePrepCost} ${recipe.currency || "USD"}` : "Price unavailable"}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Approx. Restaurant Price</div>
            <div className="text-base font-extrabold text-[#C18A5A] font-display mt-0.5">
              {recipe.restaurantPrice !== undefined ? `${recipe.restaurantPrice} ${recipe.currency || "USD"}` : "Price unavailable"}
            </div>
          </div>
        </div>

        {/* Nutrition Macros */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-[#F7F5EF] p-2.5 rounded-xl border" style={{ borderColor: "#E6E0D5" }}>
            <div className="text-[10px] text-[#6B7280]">Calories</div>
            <div className="text-sm font-extrabold text-[#172A35] font-display">{recipe.calories} kcal</div>
          </div>
          <div className="bg-[#F7F5EF] p-2.5 rounded-xl border" style={{ borderColor: "#E6E0D5" }}>
            <div className="text-[10px] text-[#6B7280]">Protein</div>
            <div className="text-sm font-extrabold text-[#315A63] font-display">{recipe.protein}g</div>
          </div>
          <div className="bg-[#F7F5EF] p-2.5 rounded-xl border" style={{ borderColor: "#E6E0D5" }}>
            <div className="text-[10px] text-[#6B7280]">Carbs</div>
            <div className="text-sm font-extrabold text-[#C18A5A] font-display">{recipe.carbs}g</div>
          </div>
          <div className="bg-[#F7F5EF] p-2.5 rounded-xl border" style={{ borderColor: "#E6E0D5" }}>
            <div className="text-[10px] text-[#6B7280]">Fat</div>
            <div className="text-sm font-extrabold text-[#172A35] font-display">{recipe.fat}g</div>
          </div>
        </div>

        {/* YouTube Embedded Video */}
        {embedUrl && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#172A35] font-display flex items-center gap-1.5">
              <PlayIcon size={16} className="text-[#EF4444]" />
              <span>Video Cooking Guide</span>
            </h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden border" style={{ borderColor: "#E6E0D5" }}>
              <iframe
                src={embedUrl}
                title={recipe.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Ingredients & Steps */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#172A35] font-display">Ingredients</h3>
            <div className="flex flex-wrap gap-1.5">
              {recipe.ingredients.map((ing, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-[#F7F5EF] border text-xs text-[#172A35]" style={{ borderColor: "#E6E0D5" }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ratings & Reviews Section */}
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: "#E6E0D5" }}>
          <h3 className="text-base font-bold text-[#172A35] font-display">Ratings & Community Reviews</h3>

          {/* Form */}
          <form onSubmit={handleSubmitReview} className="bg-[#F7F5EF] p-4 rounded-xl border space-y-3" style={{ borderColor: "#E6E0D5" }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#172A35]">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="p-1 text-[#F59E0B]"
                  >
                    <StarIcon size={18} fill={ratingInput >= star ? "#F59E0B" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={2}
              placeholder="Write your honest review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-2.5 rounded-xl border text-xs text-[#172A35] focus:outline-none bg-[#FFFFFF]"
              style={{ borderColor: "#E6E0D5" }}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#FFFFFF] shadow-sm disabled:opacity-50"
                style={{ background: "#315A63" }}
              >
                {editingReviewId ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-xs text-[#6B7280] italic">No reviews yet. Be the first to review this recipe!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-[#FFFFFF] p-3 rounded-xl border space-y-1" style={{ borderColor: "#E6E0D5" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#172A35]">{rev.userName || "Veyra Member"}</span>
                      <div className="flex items-center text-[#F59E0B]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <StarIcon size={12} key={i} fill="#F59E0B" />
                        ))}
                      </div>
                    </div>

                    <button onClick={() => handleDeleteReview(rev.id)} className="p-1 text-[#6B7280] hover:text-[#EF4444]">
                      <TrashIcon size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-[#6B7280]">{rev.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
