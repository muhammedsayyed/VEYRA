import { VeyraUserContext } from './aiContext';
import { VEYRA_SYSTEM_PROMPT } from './aiPrompts';

export interface ServerAIResponse {
  message?: string;
  conversationId?: string;
  isUnavailable?: boolean;
  error?: string;
  provider?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export interface IServerAIProvider {
  name: string;
  generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: VeyraUserContext
  ): Promise<ServerAIResponse>;
}

export function buildSystemPrompt(context?: Partial<VeyraUserContext>): string {
  const u = context?.user || {
    firstName: 'Friend',
    email: '',
    goal: 'Maintain Weight & Wellness',
    dietaryPreferences: [],
    allergens: [],
  };
  const n = context?.nutrition || {
    dailyCalories: 2000,
    caloriesConsumed: 1200,
    caloriesRemaining: 800,
    dailyProtein: 140,
    proteinConsumed: 80,
    proteinRemaining: 60,
    dailyCarbs: 200,
    carbsRemaining: 100,
    dailyFat: 65,
    fatRemaining: 30,
    waterLiters: 1.8,
    waterTarget: 3.0,
  };

  return `${VEYRA_SYSTEM_PROMPT}

VERIFIED LIVE USER CONTEXT:
- Authenticated User: ${u.firstName} ${u.email ? `(${u.email})` : ''}
- Primary Goal: ${u.goal}
- Calorie Budget: ${n.dailyCalories} kcal (Consumed: ${n.caloriesConsumed} kcal, Remaining: ${n.caloriesRemaining} kcal)
- Protein Budget: ${n.dailyProtein}g (Consumed: ${n.proteinConsumed}g, Remaining: ${n.proteinRemaining}g)
- Carbs Budget: ${n.dailyCarbs}g (Remaining: ${n.carbsRemaining}g)
- Fat Budget: ${n.dailyFat}g (Remaining: ${n.fatRemaining}g)
- Water Intake: ${n.waterLiters}L / ${n.waterTarget}L
- Dietary Restrictions: ${u.dietaryPreferences?.length ? u.dietaryPreferences.join(', ') : 'None'}
- Allergies: ${u.allergens?.length ? u.allergens.join(', ') : 'None'}
- Logged Meals Today: ${JSON.stringify(context?.recentMeals || [])}
- Currently Scanned Product: ${context?.scannedProduct ? JSON.stringify(context.scannedProduct) : 'None'}
- Active Workout: ${context?.activeWorkout ? JSON.stringify(context.activeWorkout) : 'None'}

RESPONSE DIRECTIVES:
1. Greet ${u.firstName} naturally.
2. Provide concise, personalized advice using their EXACT remaining calories (${n.caloriesRemaining} kcal) and protein (${n.proteinRemaining}g).
3. Never invent fake nutrition numbers or fake food products.`;
}
