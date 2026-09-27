import React, { useState } from 'react';
import { 
  UserProfile, 
  NutritionTargets, 
  DietPlan, 
  HabitTrackerData, 
  MealSlotKey,
  Meal
} from '../types';
import { 
  MEAL_SLOTS, 
  calculateDayScore, 
  calculateStreaks, 
  generateDemoHabitData,
  createDefaultDayLog
} from '../utils/habitTracker';
import { 
  Flame, 
  CheckCircle2, 
  Circle, 
  Droplet, 
  HeartPulse, 
  Activity, 
  Moon, 
  Sparkles, 
  Calendar, 
  RotateCcw, 
  Check, 
  Trophy, 
  ArrowRight, 
  Utensils, 
  CheckCheck,
  Award,
  TrendingUp,
  FileEdit,
  Info
} from 'lucide-react';

interface DailyHabitTrackerProps {
  user: UserProfile;
  targets: NutritionTargets;
  dietPlan: DietPlan;
  habitData: HabitTrackerData;
  onUpdateHabitData: (newData: HabitTrackerData) => void;
  activeDay: number;
  onSelectDay: (day: number) => void;
  waterLog: Record<number, number>;
  onUpdateWater?: (day: number, amount: number) => void;
  isIronLow: boolean;
}

export default function DailyHabitTracker({
  user,
  targets,
  dietPlan,
  habitData,
  onUpdateHabitData,
  activeDay,
  onSelectDay,
  waterLog,
  onUpdateWater,
  isIronLow,
}: DailyHabitTrackerProps) {
  const currentDayLog = habitData[activeDay] || createDefaultDayLog();
  const dayPlan = dietPlan.days.find((d) => d.dayNumber === activeDay) || dietPlan.days[0];
  const currentWater = waterLog[activeDay] || 0;

  const [noteSaved, setNoteSaved] = useState(false);

  // Calculate overall metrics
  const { currentStreak, longestStreak, weeklyScore, totalMealsLogged } = calculateStreaks(
    habitData,
    isIronLow
  );

  const activeDayScore = calculateDayScore(currentDayLog, isIronLow);

  // Toggle meal slot
  const handleToggleMeal = (slot: MealSlotKey) => {
    const updatedMeals = {
      ...currentDayLog.meals,
      [slot]: !currentDayLog.meals[slot],
    };
    const updatedDay = {
      ...currentDayLog,
      meals: updatedMeals,
    };
    onUpdateHabitData({
      ...habitData,
      [activeDay]: updatedDay,
    });
  };

  // Toggle all meals for active day
  const handleToggleAllMeals = () => {
    const allChecked = Object.values(currentDayLog.meals).every(Boolean);
    const newStatus = !allChecked;
    const updatedMeals = {
      breakfast: newStatus,
      morningSnack: newStatus,
      lunch: newStatus,
      eveningSnack: newStatus,
      dinner: newStatus,
    };
    onUpdateHabitData({
      ...habitData,
      [activeDay]: {
        ...currentDayLog,
        meals: updatedMeals,
      },
    });
  };

  // Toggle single core habit
  const handleToggleHabit = (
    key: 'waterGoalMet' | 'ironRoutineMet' | 'calorieTargetMet' | 'movementMet' | 'mindfulEveningMet'
  ) => {
    const updatedDay = {
      ...currentDayLog,
      [key]: !currentDayLog[key],
    };

    // If toggling waterGoalMet to true and water is low, help user bump it
    if (key === 'waterGoalMet' && !currentDayLog.waterGoalMet && currentWater < 8 && onUpdateWater) {
      onUpdateWater(activeDay, 8);
    }

    onUpdateHabitData({
      ...habitData,
      [activeDay]: updatedDay,
    });
  };

  // Handle note change
  const handleNoteChange = (text: string) => {
    const updatedDay = {
      ...currentDayLog,
      notes: text,
    };
    onUpdateHabitData({
      ...habitData,
      [activeDay]: updatedDay,
    });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1500);
  };

  // Reset current week's tracking
  const handleReset = () => {
    if (window.confirm('Reset all adherence checkmarks for this week?')) {
      const resetData: HabitTrackerData = {};
      for (let d = 1; d <= 7; d++) {
        resetData[d] = createDefaultDayLog();
      }
      onUpdateHabitData(resetData);
    }
  };

  // Load demo progress
  const handleLoadDemo = () => {
    const demo = generateDemoHabitData(isIronLow);
    onUpdateHabitData(demo);
  };

  // Meal item helper
  const getMealDetail = (slot: MealSlotKey): Meal | undefined => {
    if (!dayPlan?.meals) return undefined;
    return dayPlan.meals[slot];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Consistency & Streak Summary Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-7 rounded-3xl shadow-lg border border-slate-700/60 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                Diet Consistency Engine
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300">Long-term Health Habit Tracker</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Daily Adherence Tracker
              </h2>
              {currentStreak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 font-extrabold text-xs shadow-xs">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
                  <span>{currentStreak} Day Streak!</span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Consistently following your prescribed meals and hydration cements metabolic adaptations. Mark off your meals and core wellness routines below as you complete them each day.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 shrink-0 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
            <div className="text-center px-2 py-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Streak</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                <span className="text-xl font-black text-white">{currentStreak}</span>
                <span className="text-xs text-slate-400">days</span>
              </div>
            </div>

            <div className="text-center px-2 py-1 border-x border-white/10">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weekly Score</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xl font-black text-emerald-300">{weeklyScore}%</span>
              </div>
            </div>

            <div className="text-center px-2 py-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Meals Eaten</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Utensils className="w-4 h-4 text-blue-400" />
                <span className="text-xl font-black text-white">{totalMealsLogged}</span>
                <span className="text-xs text-slate-400">/35</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Banner / Action Footer */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {weeklyScore >= 80 
                ? 'Outstanding commitment! Your body is responding to optimal nutrient consistency.' 
                : weeklyScore >= 50 
                ? 'Good momentum! Building habits takes daily small wins. Check off today’s meals.' 
                : 'Every healthy meal counts! Mark your progress today to spark your consistency streak.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadDemo}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold transition-colors"
              title="Populate Days 1-3 with sample logged data to preview charts"
            >
              Demo Progress
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-300 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Week
            </button>
          </div>
        </div>
      </section>

      {/* 7-Day Consistency Matrix / Timeline */}
      <section className="card p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500">
              7-Day Adherence Matrix
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Click any day to log or view
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {dietPlan.days.map((day) => {
            const dayNum = day.dayNumber;
            const log = habitData[dayNum];
            const { percentage, completedCount, totalCount } = calculateDayScore(log, isIronLow);
            const isSelected = activeDay === dayNum;
            const isCompleted = percentage >= 70;
            const isInProgress = percentage > 0 && percentage < 70;

            return (
              <button
                key={dayNum}
                onClick={() => onSelectDay(dayNum)}
                className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                    : isInProgress
                    ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                    Day {dayNum}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  ) : isInProgress ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>

                <div>
                  <div className="flex items-baseline justify-between text-[11px] font-bold">
                    <span className={isCompleted ? 'text-emerald-700' : isInProgress ? 'text-amber-700' : 'text-slate-400'}>
                      {percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {completedCount}/{totalCount}
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-600' : isInProgress ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Checklist Container for Active Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Meals Adherence & Habits Checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Meals Checklist Card */}
          <section className="card p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Day {activeDay} Meals Checklist
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {Object.values(currentDayLog.meals).filter(Boolean).length} / 5 Eaten
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check off each meal item as you eat it to record dietary compliance.
                </p>
              </div>

              <button
                onClick={handleToggleAllMeals}
                className="self-start sm:self-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>
                  {Object.values(currentDayLog.meals).every(Boolean) ? 'Uncheck All' : 'Mark All Eaten'}
                </span>
              </button>
            </div>

            {/* Meal Items List */}
            <div className="space-y-3">
              {MEAL_SLOTS.map((slot) => {
                const meal = getMealDetail(slot.key);
                const isChecked = !!currentDayLog.meals[slot.key];

                if (!meal) return null;

                return (
                  <div
                    key={slot.key}
                    onClick={() => handleToggleMeal(slot.key)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-emerald-50/40 border-emerald-300/80 shadow-xs'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    {/* Interactive Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMeal(slot.key);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isChecked
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border-2 border-slate-300 hover:border-emerald-500 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    {/* Meal Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                            {slot.label}
                          </span>
                          <span className="text-slate-300 text-xs">·</span>
                          <span className="text-xs text-slate-400 font-medium">{slot.time}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {meal.calories} kcal
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold mt-1 transition-colors ${
                        isChecked ? 'text-emerald-950 line-through decoration-emerald-500/40' : 'text-slate-900'
                      }`}>
                        {meal.foodName}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>Portion: <strong>{meal.portionSize}</strong></span>
                        <span className="text-slate-300">·</span>
                        <span>P: {meal.protein}g</span>
                        <span className="text-slate-300">·</span>
                        <span>C: {meal.carbs}g</span>
                        <span className="text-slate-300">·</span>
                        <span>F: {meal.fat}g</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0 self-center hidden sm:block">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isChecked ? 'Followed ✓' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Daily Health Habits Checklist */}
          <section className="card p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Core Daily Health Habits
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scientific habits that enhance nutrient bio-availability and metabolic consistency.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Habit 1: Hydration */}
              <div
                onClick={() => handleToggleHabit('waterGoalMet')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  currentDayLog.waterGoalMet
                    ? 'bg-blue-50/50 border-blue-200 text-blue-950'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    currentDayLog.waterGoalMet ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Droplet className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      Hydration Goal (8 Glasses / 2L)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Current intake: {currentWater} / 8 glasses
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    currentDayLog.waterGoalMet ? 'bg-blue-600 text-white' : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {currentDayLog.waterGoalMet && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>

              {/* Habit 2: Low Iron Protocol (Special spotlight if iron is low) */}
              {isIronLow && (
                <div
                  onClick={() => handleToggleHabit('ironRoutineMet')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    currentDayLog.ironRoutineMet
                      ? 'bg-red-50/60 border-red-200 text-red-950'
                      : 'bg-gradient-to-r from-red-50/30 to-amber-50/30 hover:bg-red-50/50 border-red-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      currentDayLog.ironRoutineMet ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                    }`}>
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Iron-Rich Food Routine
                        </h4>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                          Prescribed
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-tight mt-0.5">
                        Consumed iron-dense foods (spinach/dal/seeds) with lemon/Vitamin C; no tea/coffee around meals.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      currentDayLog.ironRoutineMet ? 'bg-red-600 text-white' : 'border-2 border-red-300 bg-white'
                    }`}
                  >
                    {currentDayLog.ironRoutineMet && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                </div>
              )}

              {/* Habit 3: Calorie Target Discipline */}
              <div
                onClick={() => handleToggleHabit('calorieTargetMet')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  currentDayLog.calorieTargetMet
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    currentDayLog.calorieTargetMet ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      Energy & Calorie Budget
                    </h4>
                    <p className="text-xs text-slate-500">
                      Kept within recommended ~{targets.calorieRequirement} kcal target.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    currentDayLog.calorieTargetMet ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {currentDayLog.calorieTargetMet && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>

              {/* Habit 4: Active Digestion / Movement */}
              <div
                onClick={() => handleToggleHabit('movementMet')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  currentDayLog.movementMet
                    ? 'bg-purple-50/50 border-purple-200 text-purple-950'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    currentDayLog.movementMet ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'
                  }`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      Post-Meal Movement / 15-Min Walk
                    </h4>
                    <p className="text-xs text-slate-500">
                      Blunts glucose spikes and improves gastrointestinal transit.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    currentDayLog.movementMet ? 'bg-purple-600 text-white' : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {currentDayLog.movementMet && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>

              {/* Habit 5: Mindful Evening Routine */}
              <div
                onClick={() => handleToggleHabit('mindfulEveningMet')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  currentDayLog.mindfulEveningMet
                    ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    currentDayLog.mindfulEveningMet ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      Mindful Night Routine
                    </h4>
                    <p className="text-xs text-slate-500">
                      Finished eating 2+ hours before bed; no late high-sodium snacking.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    currentDayLog.mindfulEveningMet ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {currentDayLog.mindfulEveningMet && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>
            </div>
          </section>

          {/* Daily Reflection & Notes */}
          <section className="card p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500">
                  Day {activeDay} Adherence Journal & Notes
                </h3>
              </div>
              {noteSaved && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3" /> Auto-saved
                </span>
              )}
            </div>

            <textarea
              value={currentDayLog.notes || ''}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Jot down notes (e.g. 'Felt full after lunch', 'Substituted brown rice for quinoa', 'Energy was high during afternoon work')..."
              className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-y min-h-[85px] text-slate-700 bg-slate-50/40"
            />
          </section>
        </div>

        {/* Right 1 Column: Active Day Score Gauge & Consistency Milestones */}
        <div className="space-y-6">
          
          {/* Day Adherence Score Card */}
          <section className="card p-6 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400">
              Day {activeDay} Adherence
            </h3>

            {/* Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={
                    activeDayScore.percentage >= 75
                      ? 'text-emerald-500'
                      : activeDayScore.percentage >= 40
                      ? 'text-amber-500'
                      : 'text-slate-300'
                  }
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * activeDayScore.percentage) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 leading-none">
                  {activeDayScore.percentage}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                  Complete
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
              <strong>{activeDayScore.completedCount} of {activeDayScore.totalCount}</strong> items adhered to on Day {activeDay}.
              {activeDayScore.percentage >= 75 ? (
                <span className="text-emerald-700 block mt-1 font-semibold">
                  ✓ High adherence threshold achieved! Counts toward your consistency streak.
                </span>
              ) : (
                <span className="text-slate-500 block mt-1">
                  Complete 60%+ to extend your daily streak.
                </span>
              )}
            </p>

            <button
              onClick={() => onSelectDay(activeDay < 7 ? activeDay + 1 : 1)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>{activeDay < 7 ? `Proceed to Day ${activeDay + 1}` : 'Jump to Day 1'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </section>

          {/* Long-Term Consistency Milestones */}
          <section className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Consistency Milestones</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {currentStreak} Day Streak
              </span>
            </div>

            <div className="space-y-3">
              {/* Milestone 1: First Step */}
              <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                totalMealsLogged >= 1 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className={`p-2 rounded-xl text-white font-bold text-xs ${
                  totalMealsLogged >= 1 ? 'bg-emerald-600' : 'bg-slate-400'
                }`}>
                  🌱
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">First Habit Step</p>
                    {totalMealsLogged >= 1 && <span className="text-[10px] font-extrabold text-emerald-700">Unlocked ✓</span>}
                  </div>
                  <p className="text-[11px] text-slate-500">Log your first meal adherence</p>
                </div>
              </div>

              {/* Milestone 2: 3-Day Spark */}
              <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                longestStreak >= 3 ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className={`p-2 rounded-xl text-white font-bold text-xs ${
                  longestStreak >= 3 ? 'bg-amber-500' : 'bg-slate-400'
                }`}>
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">3-Day Consistency Spark</p>
                    {longestStreak >= 3 && <span className="text-[10px] font-extrabold text-amber-700">Unlocked ✓</span>}
                  </div>
                  <p className="text-[11px] text-slate-500">Maintain 60%+ adherence for 3 days</p>
                </div>
              </div>

              {/* Milestone 3: Iron Defender (if iron is low) */}
              {isIronLow && (
                <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                  Object.values(habitData).filter(d => d.ironRoutineMet).length >= 3 
                    ? 'bg-red-50/70 border-red-200' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}>
                  <div className={`p-2 rounded-xl text-white font-bold text-xs ${
                    Object.values(habitData).filter(d => d.ironRoutineMet).length >= 3 ? 'bg-red-600' : 'bg-slate-400'
                  }`}>
                    🩸
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">Iron Protocol Mastery</p>
                      {Object.values(habitData).filter(d => d.ironRoutineMet).length >= 3 && (
                        <span className="text-[10px] font-extrabold text-red-700">Unlocked ✓</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">Adhere to iron meals for 3+ days</p>
                  </div>
                </div>
              )}

              {/* Milestone 4: 7-Day Clean Master */}
              <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                longestStreak >= 7 ? 'bg-purple-50/70 border-purple-200' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className={`p-2 rounded-xl text-white font-bold text-xs ${
                  longestStreak >= 7 ? 'bg-purple-600' : 'bg-slate-400'
                }`}>
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">7-Day Consistency Master</p>
                    {longestStreak >= 7 && <span className="text-[10px] font-extrabold text-purple-700">Unlocked ✓</span>}
                  </div>
                  <p className="text-[11px] text-slate-500">Achieve full weekly plan adherence</p>
                </div>
              </div>
            </div>
          </section>

          {/* Science-backed habit reinforcement tip */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>Behavioral Psychology Tip</span>
            </div>
            <p className="leading-relaxed">
              Research in nutritional adherence shows that marking off completed meals immediately after eating increases dietary adherence by over 40% compared to end-of-week recollection.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
