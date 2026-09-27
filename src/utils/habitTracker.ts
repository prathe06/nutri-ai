import { DailyHabitLog, HabitTrackerData, MealSlotKey } from '../types';

export const MEAL_SLOTS: { key: MealSlotKey; label: string; time: string }[] = [
  { key: 'breakfast', label: 'Breakfast', time: '8:00 AM' },
  { key: 'morningSnack', label: 'Morning Snack', time: '11:00 AM' },
  { key: 'lunch', label: 'Lunch', time: '1:30 PM' },
  { key: 'eveningSnack', label: 'Evening Snack', time: '5:00 PM' },
  { key: 'dinner', label: 'Dinner', time: '8:00 PM' },
];

export function createDefaultDayLog(): DailyHabitLog {
  return {
    meals: {
      breakfast: false,
      morningSnack: false,
      lunch: false,
      eveningSnack: false,
      dinner: false,
    },
    waterGoalMet: false,
    ironRoutineMet: false,
    calorieTargetMet: false,
    movementMet: false,
    mindfulEveningMet: false,
    notes: '',
  };
}

export function loadHabitData(userName?: string): HabitTrackerData {
  try {
    const key = `nutriai_habits_${userName || 'guest'}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all 7 days exist
      const result: HabitTrackerData = {};
      for (let day = 1; day <= 7; day++) {
        result[day] = {
          ...createDefaultDayLog(),
          ...(parsed[day] || {}),
          meals: {
            ...createDefaultDayLog().meals,
            ...(parsed[day]?.meals || {}),
          },
        };
      }
      return result;
    }
  } catch (e) {
    console.warn('Failed to read habit data from localStorage', e);
  }

  // Fallback fresh week
  const initial: HabitTrackerData = {};
  for (let day = 1; day <= 7; day++) {
    initial[day] = createDefaultDayLog();
  }
  return initial;
}

export function saveHabitData(data: HabitTrackerData, userName?: string): void {
  try {
    const key = `nutriai_habits_${userName || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save habit data to localStorage', e);
  }
}

/**
 * Calculates adherence score for a single day (0 - 100).
 * Counts:
 * - 5 meals (weight: 1 each)
 * - water goal (weight: 1)
 * - calorie target (weight: 1)
 * - movement (weight: 1)
 * - mindful evening (weight: 1)
 * - iron routine (weight: 1 if user needs iron focus, counted dynamically)
 */
export function calculateDayScore(
  log: DailyHabitLog | undefined,
  includeIronFocus: boolean = false
): { percentage: number; completedCount: number; totalCount: number } {
  if (!log) return { percentage: 0, completedCount: 0, totalCount: includeIronFocus ? 10 : 9 };

  let completed = 0;
  let total = 0;

  // Meals (5)
  const mealKeys: MealSlotKey[] = ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'];
  mealKeys.forEach((m) => {
    total++;
    if (log.meals[m]) completed++;
  });

  // Daily Core habits (4)
  total++;
  if (log.waterGoalMet) completed++;

  total++;
  if (log.calorieTargetMet) completed++;

  total++;
  if (log.movementMet) completed++;

  total++;
  if (log.mindfulEveningMet) completed++;

  // Optional iron routine (1)
  if (includeIronFocus) {
    total++;
    if (log.ironRoutineMet) completed++;
  }

  const percentage = Math.round((completed / total) * 100);
  return { percentage, completedCount: completed, totalCount: total };
}

/**
 * Calculates current streak and longest streak.
 * A day is considered "adhered" if its score >= 60%.
 */
export function calculateStreaks(
  data: HabitTrackerData,
  includeIronFocus: boolean = false
): { currentStreak: number; longestStreak: number; weeklyScore: number; totalMealsLogged: number } {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let totalPercentages = 0;
  let totalMeals = 0;

  for (let day = 1; day <= 7; day++) {
    const log = data[day];
    const { percentage } = calculateDayScore(log, includeIronFocus);
    totalPercentages += percentage;

    if (log) {
      const meals = log.meals;
      if (meals.breakfast) totalMeals++;
      if (meals.morningSnack) totalMeals++;
      if (meals.lunch) totalMeals++;
      if (meals.eveningSnack) totalMeals++;
      if (meals.dinner) totalMeals++;
    }

    if (percentage >= 60) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Current streak is consecutive completed days up to the most recently logged day
  let streakFromToday = 0;
  for (let day = 1; day <= 7; day++) {
    const { percentage } = calculateDayScore(data[day], includeIronFocus);
    if (percentage >= 60) {
      streakFromToday++;
    } else if (percentage === 0) {
      // Future or unstarted day
      break;
    } else {
      // Started but didn't hit threshold
      break;
    }
  }
  currentStreak = streakFromToday;

  const weeklyScore = Math.round(totalPercentages / 7);

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    weeklyScore,
    totalMealsLogged: totalMeals,
  };
}

/**
 * Generates sample demo progress for Day 1-3 to let the user immediately visualize streaks & progress.
 */
export function generateDemoHabitData(includeIronFocus: boolean = false): HabitTrackerData {
  const data: HabitTrackerData = {};
  for (let d = 1; d <= 7; d++) {
    data[d] = createDefaultDayLog();
  }

  // Day 1: 100% completed
  data[1] = {
    meals: { breakfast: true, morningSnack: true, lunch: true, eveningSnack: true, dinner: true },
    waterGoalMet: true,
    ironRoutineMet: includeIronFocus,
    calorieTargetMet: true,
    movementMet: true,
    mindfulEveningMet: true,
    notes: 'Felt great energy throughout the morning! Followed breakfast and lunch strictly.',
  };

  // Day 2: 90% completed
  data[2] = {
    meals: { breakfast: true, morningSnack: true, lunch: true, eveningSnack: true, dinner: true },
    waterGoalMet: true,
    ironRoutineMet: includeIronFocus,
    calorieTargetMet: true,
    movementMet: true,
    mindfulEveningMet: false,
    notes: 'Slightly late dinner, but hit macro and hydration goals easily.',
  };

  // Day 3: partially completed (today in progress)
  data[3] = {
    meals: { breakfast: true, morningSnack: true, lunch: true, eveningSnack: false, dinner: false },
    waterGoalMet: true,
    ironRoutineMet: includeIronFocus,
    calorieTargetMet: false,
    movementMet: true,
    mindfulEveningMet: false,
    notes: 'Had lemon water with spinach lunch. Ready for dinner.',
  };

  return data;
}
