import { VeyraUserContext } from './aiContext';
import { currentAIProvider, VeyraAIResponse } from './aiProvider';
import { classifyIntent } from './intentClassifier';

export class VeyraAIService {
  static async queryAI(
    message: string,
    context: VeyraUserContext,
    history: Array<{ role: 'user' | 'ai'; text: string }> = []
  ): Promise<VeyraAIResponse> {
    const intent = classifyIntent(message);

    if (intent === 'OUT_OF_SCOPE') {
      return {
        text: `I'm Veyra, your personal wellness companion! I specialize in food, nutrition, macros, hydration, workouts, and wellness goals. How can I help with your health journey today?`,
        provider: 'veyra-scope-gate',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    return await currentAIProvider.queryAI(message, context, history);
  }

  static generateDashboardInsight(context: VeyraUserContext): { title: string; body: string; tag: string } {
    const { caloriesRemaining, proteinRemaining, waterLiters, waterTarget } = context.nutrition;
    const name = context.user.firstName;

    if (proteinRemaining > 50 && caloriesRemaining > 800) {
      return {
        title: `Protein priority for ${name}`,
        body: `You have ${proteinRemaining}g of protein left today. Prioritizing lean protein in your next meal will optimize your ${context.user.goal.toLowerCase()} plan.`,
        tag: 'Nutrition Insight',
      };
    }

    if (waterLiters < waterTarget * 0.5) {
      return {
        title: 'Hydration check',
        body: `You've logged ${waterLiters}L of your ${waterTarget}L hydration target. A fresh glass of water now will boost energy & metabolism.`,
        tag: 'Hydration',
      };
    }

    return {
      title: `On track with ${context.user.goal}`,
      body: `You have ${caloriesRemaining} kcal remaining today. Excellent job staying consistent with your daily targets!`,
      tag: 'Goal Progress',
    };
  }

  static generateSmartCoachRecommendations(context: VeyraUserContext): Array<{
    title: string;
    category: string;
    description: string;
    impact: 'High' | 'Medium' | 'Optimal';
    actionLabel: string;
  }> {
    const { caloriesRemaining, proteinRemaining, waterLiters, waterTarget } = context.nutrition;
    const name = context.user.firstName;

    const recs = [];

    if (proteinRemaining > 40) {
      recs.push({
        title: `High-Protein Dinner Focus`,
        category: 'Nutrition Strategy',
        description: `${name}, you have ${proteinRemaining}g of protein left today. We suggest chicken breast, salmon, or Greek yogurt to reach your ${context.nutrition.dailyProtein}g target.`,
        impact: 'High' as const,
        actionLabel: 'Explore Protein Recipes',
      });
    } else {
      recs.push({
        title: 'Macro Balance Maintained',
        category: 'Nutrition Strategy',
        description: `Great work on protein intake today! Keep meals light and nutrient-rich for the rest of the evening.`,
        impact: 'Optimal' as const,
        actionLabel: 'View Meal Log',
      });
    }

    if (waterLiters < waterTarget) {
      const remainingWater = Math.max(0, Math.round((waterTarget - waterLiters) * 10) / 10);
      recs.push({
        title: 'Hydration Booster',
        category: 'Daily Habits',
        description: `Log +0.5L water now to close the remaining ${remainingWater}L gap before the end of the day.`,
        impact: 'Medium' as const,
        actionLabel: 'Log Water Intake',
      });
    }

    recs.push({
      title: `${context.user.goal} Workout Circuit`,
      category: 'Fitness Guidance',
      description: `Complement your current calorie budget of ${caloriesRemaining} kcal with a quick 20-minute active recovery or core session.`,
      impact: 'Optimal' as const,
      actionLabel: 'Start Recommended Routine',
    });

    return recs;
  }
}
