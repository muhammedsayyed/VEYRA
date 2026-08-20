export type IntentType =
  | 'MEAL_RECOMMENDATION'
  | 'PROTEIN'
  | 'CALORIES'
  | 'MACROS'
  | 'HYDRATION'
  | 'FOOD_ANALYSIS'
  | 'PRODUCT_ANALYSIS'
  | 'FITNESS'
  | 'WORKOUT'
  | 'WEIGHT_GOAL'
  | 'GENERAL_WELLNESS'
  | 'OUT_OF_SCOPE'

export function classifyIntent(query: string): IntentType {
  const q = query.toLowerCase().trim()

  // Out of scope check
  if (
    q.includes('python') ||
    q.includes('code') ||
    q.includes('javascript') ||
    q.includes('world cup') ||
    q.includes('quantum') ||
    q.includes('politics') ||
    q.includes('crypto')
  ) {
    return 'OUT_OF_SCOPE'
  }

  if (q.includes('dinner') || q.includes('lunch') || q.includes('breakfast') || q.includes('eat') || q.includes('recipe')) {
    return 'MEAL_RECOMMENDATION'
  }

  if (q.includes('protein')) {
    return 'PROTEIN'
  }

  if (q.includes('calorie') || q.includes('kcal') || q.includes('budget')) {
    return 'CALORIES'
  }

  if (q.includes('macro') || q.includes('carb') || q.includes('fat')) {
    return 'MACROS'
  }

  if (q.includes('water') || q.includes('hydration') || q.includes('drink')) {
    return 'HYDRATION'
  }

  if (q.includes('workout') || q.includes('exercise') || q.includes('gym') || q.includes('hiit') || q.includes('cardio')) {
    return 'WORKOUT'
  }

  if (q.includes('scan') || q.includes('product') || q.includes('ingredient') || q.includes('barcode')) {
    return 'PRODUCT_ANALYSIS'
  }

  if (q.includes('weight') || q.includes('goal') || q.includes('lose') || q.includes('muscle')) {
    return 'WEIGHT_GOAL'
  }

  return 'GENERAL_WELLNESS'
}
