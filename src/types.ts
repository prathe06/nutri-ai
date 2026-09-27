export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  healthGoal: 'Weight Loss' | 'Weight Gain' | 'Maintain Weight';
  foodPreference: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | 'Vegan';
  allergies: string;
  foodsToAvoid: string;
  mealsPerDay: string;
  preferredCuisine: string;
  budget: string;
  waterIntake: string;
  bloodReport?: BloodTestAnalysis;
}

export interface Biomarker {
  name: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  status: 'low' | 'normal' | 'high';
  notes?: string;
}

export interface RecommendedFood {
  foodName: string;
  category: string;
  portion: string;
  ironPerServing: string;
  frequency: string;
  synergyTip: string;
}

export interface BloodTestAnalysis {
  fileName: string;
  fileType: string;
  fileData?: string; // base64 data url for viewing
  analyzedAt: string;
  reportType: string;
  isIronLow: boolean;
  ironStatus: 'low' | 'normal' | 'high' | 'not_detected';
  summary: string;
  keyFindings: string[];
  biomarkers: Biomarker[];
  ironAdvice: {
    severity: 'mild' | 'moderate' | 'significant' | 'none';
    overview: string;
    whyFoodMatters: string;
    dailyIronTarget: string;
    recommendedFoods: RecommendedFood[];
    absorptionBoosters: string[];
    absorptionInhibitorsToAvoid: string[];
  };
}

export interface NutritionTargets {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee?: number;
  calorieRequirement: number;
  proteinRequirement: number;
  carbsRequirement: number;
  fatRequirement: number;
}

export interface Meal {
  foodName: string;
  portionSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micronutrients: {
    ironCoveragePct: number;
    calciumCoveragePct: number;
    vitACoveragePct: number;
    vitB12CoveragePct: number;
    vitCCoveragePct: number;
    vitDCoveragePct: number;
    magnesiumCoveragePct: number;
    zincCoveragePct: number;
    potassiumCoveragePct: number;
  };
}

export interface DayPlan {
  dayNumber: number;
  meals: {
    breakfast?: Meal;
    morningSnack?: Meal;
    lunch?: Meal;
    eveningSnack?: Meal;
    dinner?: Meal;
  };
  summary: DailySummary;
}

export interface DietPlan {
  days: DayPlan[];
  micronutrientSuggestions: {
    nutrient: string;
    suggestion: string;
  }[];
}

export type MealSlotKey = 'breakfast' | 'morningSnack' | 'lunch' | 'eveningSnack' | 'dinner';

export interface DailyHabitLog {
  meals: {
    breakfast: boolean;
    morningSnack: boolean;
    lunch: boolean;
    eveningSnack: boolean;
    dinner: boolean;
  };
  waterGoalMet: boolean;
  ironRoutineMet: boolean;
  calorieTargetMet: boolean;
  movementMet: boolean;
  mindfulEveningMet: boolean;
  notes: string;
}

export type HabitTrackerData = Record<number, DailyHabitLog>;
