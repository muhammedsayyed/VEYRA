import { UserProfile, FoodItem } from '@/types';

export interface UserTargets {
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  bmi: number;
  idealLow: number;
  idealHigh: number;
  maintenance: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  status: 'weightLoss' | 'muscleGain' | 'balanced';
}

export interface RiskAssessment {
  level: 'ok' | 'warning';
  label: string;
  reason: string;
  portion: string;
}

export interface ExerciseItem {
  title: string;
  query: string;
  videoId: string;
  duration: string;
  intensity: 'Beginner' | 'Moderate' | 'Easy';
  embedUrl: string;
  url: string;
}

const exerciseBank: Record<string, Omit<ExerciseItem, 'embedUrl' | 'url'>[]> = {
  weightLoss: [
    { title: 'Low Impact Fat Burn Cardio', query: '20 min low impact cardio workout', videoId: '77h45P8IKOY', duration: '20 min', intensity: 'Beginner' },
    { title: 'HIIT Starter Workout', query: '25 min HIIT workout no equipment', videoId: 'cbKkB3POqaY', duration: '25 min', intensity: 'Moderate' },
    { title: 'Walking Fat Burn Routine', query: '20 min indoor walking workout', videoId: 'mP_PbbTR-P0', duration: '20 min', intensity: 'Beginner' },
  ],
  muscleGain: [
    { title: 'Full Body Strength Routine', query: 'beginner full body strength workout', videoId: 'JkVHrA5o23o', duration: '30 min', intensity: 'Moderate' },
    { title: 'Upper Body Dumbbell Workout', query: 'beginner upper body dumbbell workout', videoId: 'cbKkB3POqaY', duration: '25 min', intensity: 'Moderate' },
  ],
  balanced: [
    { title: '15-Minute Daily Movement', query: '15 minute daily workout beginner', videoId: 'M6m_t10WlfU', duration: '15 min', intensity: 'Easy' },
    { title: 'Full Body Mobility Flow', query: '10 minute mobility routine', videoId: 'qxIk6KZrO1o', duration: '20 min', intensity: 'Easy' },
  ],
};

export function calculateUserTargets(user: UserProfile): UserTargets {
  const age = user.age || 28;
  const height = user.heightCm || 178;
  const weight = user.weightKg || 82;
  const gender = 'male';
  const heightM = height / 100;
  const bmi = heightM > 0 ? weight / (heightM * heightM) : 0;
  const idealLow = 18.5 * heightM * heightM;
  const idealHigh = 24.9 * heightM * heightM;
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const maintenance = Math.max(1400, Math.round(bmr * 1.35));

  let status: 'weightLoss' | 'muscleGain' | 'balanced' = 'balanced';
  if (user.goal === 'Lose Weight') status = 'weightLoss';
  if (user.goal === 'Build Muscle') status = 'muscleGain';

  const targetCalories = user.dailyCalories || (status === 'weightLoss' ? Math.max(1400, maintenance - 450) : maintenance);
  const protein = user.dailyProtein || Math.round(weight * (status === 'muscleGain' ? 1.8 : 1.5));
  const fat = user.dailyFat || Math.round(weight * 0.8);
  const carbs = user.dailyCarbs || Math.max(90, Math.round((targetCalories - protein * 4 - fat * 9) / 4));

  return {
    age,
    height,
    weight,
    gender,
    bmi: Number(bmi.toFixed(1)),
    idealLow: Math.round(idealLow),
    idealHigh: Math.round(idealHigh),
    maintenance,
    targetCalories,
    protein,
    carbs,
    fat,
    status,
  };
}

export function getExerciseRecommendations(user: UserProfile): ExerciseItem[] {
  const targets = calculateUserTargets(user);
  const bank = exerciseBank[targets.status] || exerciseBank.balanced;

  return bank.map((item) => ({
    ...item,
    embedUrl: `https://www.youtube.com/embed/${item.videoId}`,
    url: `https://www.youtube.com/watch?v=${item.videoId}`,
  }));
}

export function assessProductRisk(product: Partial<FoodItem>, user: UserProfile): RiskAssessment {
  const sugar = product.sugar || 0;
  const salt = product.salt || 0;
  const fat = product.fat || 0;
  const warnings = product.warnings || [];
  const allergens = user.allergens || [];
  const name = (product.name || '').toLowerCase();

  const reasons: string[] = [];

  if (sugar >= 12 || warnings.includes('High Sugar')) {
    reasons.push('high sugar intake may cause blood glucose spikes');
  }
  if (salt >= 1.2 || warnings.includes('High Sodium')) {
    reasons.push('high sodium content can affect blood pressure');
  }
  if (fat >= 20 && user.goal === 'Lose Weight') {
    reasons.push('high fat content uses up a large portion of your daily calorie budget');
  }
  if (allergens.some((a) => name.includes(a.toLowerCase()))) {
    reasons.push('contains potential allergen matching your profile');
  }

  if (reasons.length === 0) {
    return {
      level: 'ok',
      label: 'Recommended',
      reason: 'Matches your dietary profile and macro goals.',
      portion: 'Normal logged portion',
    };
  }

  return {
    level: 'warning',
    label: 'Consume in Moderation',
    reason: reasons.join('; '),
    portion: 'Keep portion small (around 30-50g)',
  };
}

export function getCoachMessage(user: UserProfile, totalCal: number, totalProtein: number): string {
  const targets = calculateUserTargets(user);
  const overCal = totalCal > targets.targetCalories;
  const proteinLeft = targets.protein - totalProtein;

  if (overCal) {
    return `You're slightly over your calorie target for today. A light 20-minute walk will balance your energy burn.`;
  }
  if (proteinLeft > 35) {
    return `You have ${proteinLeft}g protein remaining today. Adding a high-protein snack like Greek yogurt or grilled chicken will hit your muscle goal.`;
  }
  return `Great progress today, ${user.name.split(' ')[0]}! You are staying well within your target fuel zone.`;
}
