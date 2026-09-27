import React, { useState } from 'react';
import { 
  UserProfile, 
  NutritionTargets, 
  DietPlan, 
  DayPlan, 
  BloodTestAnalysis, 
  HabitTrackerData, 
  MealSlotKey 
} from '../types';
import { 
  Activity, Apple, Download, Printer, RefreshCw, 
  Info, Calendar, Droplet, Plus, Minus, X, 
  Camera, FileText, HeartPulse, Eye, Upload, 
  AlertTriangle, Sparkles, CheckCircle2, ChevronRight,
  ShieldCheck, Flame, Utensils, PieChart as PieChartIcon,
  Scale, ArrowRight, Check
} from 'lucide-react';
import MealPlan, { ProgressBar } from './MealPlan';
import FoodScanner from './FoodScanner';
import AIChatBot from './AIChatBot';
import BloodReportViewer from './BloodReportViewer';
import BloodReportUploadModal from './BloodReportUploadModal';
import DailyHabitTracker from './DailyHabitTracker';
import { 
  loadHabitData, 
  saveHabitData, 
  calculateStreaks, 
  calculateDayScore,
  createDefaultDayLog 
} from '../utils/habitTracker';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export type DashboardTab = 'meals' | 'nutrition' | 'habits' | 'biomarkers' | 'body' | 'scanner';

const nutrientRecommendations: Record<string, string[]> = {
  Iron: ["Spinach", "Lentils", "Tofu", "Quinoa", "Pumpkin Seeds", "Broccoli", "Dark Chocolate"],
  Calcium: ["Milk", "Cheese", "Yogurt", "Almonds", "Leafy Greens", "Tofu", "Chia Seeds"],
  "Vitamin A": ["Carrots", "Sweet Potatoes", "Spinach", "Kale", "Cantaloupe", "Apricots"],
  "Vitamin B12": ["Nutritional Yeast", "Fortified Plant Milks", "Eggs", "Dairy Products", "Fortified Cereals"],
  "Vitamin C": ["Citrus Fruits (Oranges, Lemons)", "Strawberries", "Bell Peppers", "Broccoli", "Tomatoes"],
  "Vitamin D": ["Sunlight exposure", "Fortified Milk", "Mushrooms (UV exposed)", "Fortified Cereals"],
  Magnesium: ["Almonds", "Spinach", "Cashews", "Peanuts", "Black Beans", "Edamame", "Avocado"],
  Zinc: ["Hemp Seeds", "Pumpkin Seeds", "Lentils", "Chickpeas", "Cashews", "Yogurt"],
  Potassium: ["Bananas", "Sweet Potatoes", "Spinach", "Avocado", "White Beans", "Potatoes"]
};

interface DashboardProps {
  user: UserProfile;
  targets: NutritionTargets;
  dietPlan: DietPlan;
  onRegenerate: () => void;
  onBack: () => void;
  onUpdateBloodReport?: (report: BloodTestAnalysis | undefined) => void;
  isRegenerating: boolean;
}

export default function Dashboard({ 
  user, 
  targets, 
  dietPlan, 
  onRegenerate, 
  onBack, 
  onUpdateBloodReport,
  isRegenerating 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('meals');
  const [activeDay, setActiveDay] = useState<number>(1);
  const [waterLog, setWaterLog] = useState<Record<number, number>>({});
  const [weightLog, setWeightLog] = useState<Record<number, number>>({});
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Habit Tracker State (Persisted in localStorage)
  const [habitData, setHabitData] = useState<HabitTrackerData>(() => loadHabitData(user.name));

  const WATER_GOAL = 8;
  const currentWater = waterLog[activeDay] || 0;
  const currentWeight = weightLog[activeDay] || user.weight;

  const hasReport = !!user.bloodReport;
  const isIronLow = hasReport && (user.bloodReport?.isIronLow || user.bloodReport?.ironStatus === 'low');

  const { currentStreak, weeklyScore, totalMealsLogged } = calculateStreaks(
    habitData,
    isIronLow
  );

  const activeDayForScore = activeDay === 0 ? 1 : activeDay;
  const activeDayLog = habitData[activeDayForScore] || createDefaultDayLog();
  const activeDayAdherence = calculateDayScore(activeDayLog, isIronLow);

  const handleUpdateHabitData = (newData: HabitTrackerData) => {
    setHabitData(newData);
    saveHabitData(newData, user.name);
  };

  const handleToggleMealFromPlan = (slot: MealSlotKey) => {
    const targetDay = activeDay === 0 ? 1 : activeDay;
    const currentDay = habitData[targetDay] || createDefaultDayLog();
    const updatedMeals = {
      ...currentDay.meals,
      [slot]: !currentDay.meals[slot],
    };
    const updatedData = {
      ...habitData,
      [targetDay]: {
        ...currentDay,
        meals: updatedMeals,
      },
    };
    handleUpdateHabitData(updatedData);
  };

  const serumIronMarker = user.bloodReport?.biomarkers?.find(b => 
    b.name.toLowerCase().includes('iron') && !b.name.toLowerCase().includes('binding')
  );
  const hemoglobinMarker = user.bloodReport?.biomarkers?.find(b => 
    b.name.toLowerCase().includes('hemoglobin') || b.name.toLowerCase().includes('hb')
  );

  const handleSetWater = (val: number) => {
    setWaterLog(prev => ({ ...prev, [activeDay]: val }));
    const targetDay = activeDay === 0 ? 1 : activeDay;
    const currentDay = habitData[targetDay] || createDefaultDayLog();
    if (val >= WATER_GOAL && !currentDay.waterGoalMet) {
      handleUpdateHabitData({
        ...habitData,
        [targetDay]: { ...currentDay, waterGoalMet: true }
      });
    }
  };

  const handleSetWeight = (val: number) => {
    setWeightLog(prev => ({ ...prev, [activeDay]: val }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dietPlan, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nutriAI_diet_plan_${user.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const isWeekly = activeDay === 0;
  const activeDayPlan = dietPlan.days.find(d => d.dayNumber === activeDay) || dietPlan.days[0];

  let displayMacros = activeDayPlan.summary;
  if (isWeekly) {
    const total = dietPlan.days.reduce((acc, day) => {
      acc.calories += day.summary.calories;
      acc.protein += day.summary.protein;
      acc.carbs += day.summary.carbs;
      acc.fat += day.summary.fat;
      
      const m = day.summary.micronutrients;
      if (m) {
        acc.micro.iron += m.ironCoveragePct || 0;
        acc.micro.calcium += m.calciumCoveragePct || 0;
        acc.micro.vitA += m.vitACoveragePct || 0;
        acc.micro.vitB12 += m.vitB12CoveragePct || 0;
        acc.micro.vitC += m.vitCCoveragePct || 0;
        acc.micro.vitD += m.vitDCoveragePct || 0;
        acc.micro.magnesium += m.magnesiumCoveragePct || 0;
        acc.micro.zinc += m.zincCoveragePct || 0;
        acc.micro.potassium += m.potassiumCoveragePct || 0;
      }
      return acc;
    }, { 
      calories: 0, protein: 0, carbs: 0, fat: 0, 
      micro: { iron: 0, calcium: 0, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, magnesium: 0, zinc: 0, potassium: 0 } 
    });
    
    const count = dietPlan.days.length;
    displayMacros = {
      calories: Math.round(total.calories / count),
      protein: Math.round(total.protein / count),
      carbs: Math.round(total.carbs / count),
      fat: Math.round(total.fat / count),
      micronutrients: {
        ironCoveragePct: Math.round(total.micro.iron / count),
        calciumCoveragePct: Math.round(total.micro.calcium / count),
        vitACoveragePct: Math.round(total.micro.vitA / count),
        vitB12CoveragePct: Math.round(total.micro.vitB12 / count),
        vitCCoveragePct: Math.round(total.micro.vitC / count),
        vitDCoveragePct: Math.round(total.micro.vitD / count),
        magnesiumCoveragePct: Math.round(total.micro.magnesium / count),
        zincCoveragePct: Math.round(total.micro.zinc / count),
        potassiumCoveragePct: Math.round(total.micro.potassium / count),
      }
    };
  }

  const macroData = [
    { name: 'Protein', value: displayMacros.protein, color: '#3b82f6' },
    { name: 'Carbs', value: displayMacros.carbs, color: '#f59e0b' },
    { name: 'Fats', value: displayMacros.fat, color: '#f87171' }
  ];

  return (
    <div className="flex flex-col h-full max-w-[1240px] mx-auto w-full gap-5 animate-in fade-in duration-300 p-2 sm:p-4 md:p-6">
      
      {/* User Header & Fast Navigation Toolbar */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NA'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {user.name}
              </h2>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                {user.healthGoal}
              </span>
              {hasReport && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isIronLow ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {isIronLow ? 'Low Iron Protocol' : 'Normal Biomarkers'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-500 mt-1 font-medium">
              <span>{user.age} yrs</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{user.gender}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{user.weight} kg</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{user.foodPreference}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Daily Target: <strong className="text-slate-800 font-bold">{targets.calorieRequirement} kcal</strong></span>
            </div>
          </div>
        </div>
        
        {/* Quick Toolbar */}
        <div className="flex flex-wrap gap-2 items-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4 w-full lg:w-auto">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Print Diet Plan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          
          <button 
            onClick={handleDownload} 
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Export Diet Plan JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button 
            onClick={onRegenerate} 
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} /> 
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Plan'}</span>
          </button>
        </div>
      </header>

      {/* Main Clean Tab Navigation: Split Dashboard */}
      <nav aria-label="Dashboard views" className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs print:hidden">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar">
          
          {/* Tab 1: Meal Plan */}
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'meals'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Meal Plan</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              activeTab === 'meals' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-100 text-slate-500'
            }`}>
              {isWeekly ? '7 Days' : `Day ${activeDay}`}
            </span>
          </button>

          {/* Tab 2: Nutrition & Macros */}
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'nutrition'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span>Macros & Nutrients</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              activeTab === 'nutrition' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-100 text-slate-500'
            }`}>
              {displayMacros.calories} kcal
            </span>
          </button>

          {/* Tab 3: Daily Habits */}
          <button
            onClick={() => {
              if (activeDay === 0) setActiveDay(1);
              setActiveTab('habits');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'habits'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span>Daily Habits</span>
            {currentStreak > 0 ? (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                activeTab === 'habits' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {currentStreak}d 🔥
              </span>
            ) : (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                activeTab === 'habits' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {activeDayAdherence.percentage}%
              </span>
            )}
          </button>

          {/* Tab 4: Lab & Biomarkers */}
          <button
            onClick={() => setActiveTab('biomarkers')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'biomarkers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeartPulse className={`w-4 h-4 ${isIronLow ? 'text-red-500' : 'text-emerald-500'}`} />
            <span>Biomarkers & Lab</span>
            {hasReport ? (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                isIronLow 
                  ? 'bg-red-500 text-white' 
                  : activeTab === 'biomarkers' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isIronLow ? 'Low Iron' : 'Normal'}
              </span>
            ) : (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                activeTab === 'biomarkers' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-100 text-slate-400'
              }`}>
                Optional
              </span>
            )}
          </button>

          {/* Tab 5: Hydration & Body */}
          <button
            onClick={() => setActiveTab('body')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'body'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Droplet className="w-4 h-4 text-blue-500" />
            <span>Hydration & Body</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              activeTab === 'body' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-blue-50 text-blue-700'
            }`}>
              {currentWater}/{WATER_GOAL} 💧
            </span>
          </button>

          {/* Tab 6: Food Scanner */}
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-500" />
            <span>Food Scanner</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              activeTab === 'scanner' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-100 text-slate-500'
            }`}>
              AI Vision
            </span>
          </button>

        </div>
      </nav>

      {/* ============================================================== */}
      {/* VIEW 1: MEAL PLAN TAB (Clean, Spacious, Focused on Eating/Cooking) */}
      {/* ============================================================== */}
      {activeTab === 'meals' && (
        <section className="flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Low Iron Quick Notification in Meal Plan (Non-intrusive) */}
          {isIronLow && (
            <div className="bg-red-50/90 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 text-white rounded-xl shrink-0">
                  <HeartPulse className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold block text-sm">Low Iron Protocol Active</span>
                  <span className="text-red-900/90">
                    Meals are reinforced with iron-dense foods (spinach, lentils, quinoa). Pair with Vitamin C and space tea/coffee.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('biomarkers')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Lab Biomarkers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Macro Bar for the selected day */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Calories</p>
                <p className="text-lg font-black text-slate-900">{displayMacros.calories} <span className="text-xs font-normal text-slate-400">kcal</span></p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                {Math.round((displayMacros.calories / targets.calorieRequirement) * 100)}%
              </span>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Protein</p>
                <p className="text-lg font-black text-slate-900">{displayMacros.protein}g <span className="text-xs font-normal text-slate-400">/ {targets.proteinRequirement}g</span></p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                {Math.round((displayMacros.protein / targets.proteinRequirement) * 100)}%
              </span>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Carbs</p>
                <p className="text-lg font-black text-slate-900">{displayMacros.carbs}g <span className="text-xs font-normal text-slate-400">/ {targets.carbsRequirement}g</span></p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md">
                {Math.round((displayMacros.carbs / targets.carbsRequirement) * 100)}%
              </span>
            </div>

            <div className="p-3 bg-rose-50/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-rose-500 uppercase font-bold tracking-wider">Fats</p>
                <p className="text-lg font-black text-slate-900">{displayMacros.fat}g <span className="text-xs font-normal text-slate-400">/ {targets.fatRequirement}g</span></p>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-md">
                {Math.round((displayMacros.fat / targets.fatRequirement) * 100)}%
              </span>
            </div>
          </div>

          {/* Day Timeline Strip + Main Meal Content */}
          <div className="card bg-white shadow-xs overflow-hidden border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setActiveDay(0)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeDay === 0 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Weekly View
                </button>
                {dietPlan.days.map((day) => {
                  const dayLog = habitData[day.dayNumber];
                  const mealsEatenCount = dayLog ? Object.values(dayLog.meals).filter(Boolean).length : 0;
                  return (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDay(day.dayNumber)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeDay === day.dayNumber 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>Day {day.dayNumber}</span>
                      {mealsEatenCount > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${activeDay === day.dayNumber ? 'bg-white' : 'bg-emerald-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Detailed Macros</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {activeDay === 0 ? (
                <div className="space-y-12">
                  {dietPlan.days.map(day => (
                    <div key={day.dayNumber} className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-xl font-bold text-slate-800">Day {day.dayNumber}</h3>
                        <span className="text-xs text-slate-500">{day.summary.calories} kcal · {day.summary.protein}g protein</span>
                      </div>
                      <MealPlan 
                        dayPlan={day} 
                        targets={targets} 
                        habitDayLog={habitData[day.dayNumber]}
                        onToggleMeal={(slot) => {
                          const currentDay = habitData[day.dayNumber] || createDefaultDayLog();
                          handleUpdateHabitData({
                            ...habitData,
                            [day.dayNumber]: {
                              ...currentDay,
                              meals: {
                                ...currentDay.meals,
                                [slot]: !currentDay.meals[slot],
                              },
                            },
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : activeDayPlan && (
                <MealPlan 
                  dayPlan={activeDayPlan} 
                  targets={targets} 
                  habitDayLog={habitData[activeDay]}
                  onToggleMeal={handleToggleMealFromPlan}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: NUTRITION & MACROS TAB (Full analytics, charts, micronutrients) */}
      {/* ============================================================== */}
      {activeTab === 'nutrition' && (
        <section className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Day selection for analytics */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Analyzing:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveDay(0)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeDay === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Weekly Average
                </button>
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <button
                    key={d}
                    onClick={() => setActiveDay(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeDay === d ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    D{d}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Daily Target: <strong className="text-slate-800">{targets.calorieRequirement} kcal</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Donut Chart Telemetry */}
            <div className="card p-6 flex flex-col justify-between bg-white lg:col-span-4 border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  {isWeekly ? 'Weekly Macro Balance' : `Day ${activeDayForScore} Distribution`}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {isWeekly ? 'Average' : 'Actual'}
                </span>
              </div>

              <div className="w-full h-48 relative my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value}g`, name]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                  <span className="text-3xl font-black text-slate-900 leading-none">{displayMacros.calories}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Kcal / Day</span>
                </div>
              </div>

              <div className="flex items-center justify-around text-xs font-semibold text-slate-600 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Protein ({displayMacros.protein}g)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Carbs ({displayMacros.carbs}g)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Fats ({displayMacros.fat}g)
                </span>
              </div>
            </div>

            {/* 4 Macro Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-8">
              {/* Protein Card */}
              <div className="card p-5 flex flex-col justify-between bg-white border-slate-200/80 hover:border-blue-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Protein Target</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {Math.round((displayMacros.protein / targets.proteinRequirement) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">{displayMacros.protein}g</span>
                    <span className="text-xs text-slate-400 font-medium">/ {targets.proteinRequirement}g goal</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Essential for lean muscle preservation, tissue repair, and satiety.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (displayMacros.protein / targets.proteinRequirement) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Carbs Card */}
              <div className="card p-5 flex flex-col justify-between bg-white border-slate-200/80 hover:border-amber-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Carbohydrates Target</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {Math.round((displayMacros.carbs / targets.carbsRequirement) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">{displayMacros.carbs}g</span>
                    <span className="text-xs text-slate-400 font-medium">/ {targets.carbsRequirement}g goal</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Clean glycogen and cellular energy sourced from complex whole foods.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (displayMacros.carbs / targets.carbsRequirement) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Fats Card */}
              <div className="card p-5 flex flex-col justify-between bg-white border-slate-200/80 hover:border-rose-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Healthy Fats</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      {Math.round((displayMacros.fat / targets.fatRequirement) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">{displayMacros.fat}g</span>
                    <span className="text-xs text-slate-400 font-medium">/ {targets.fatRequirement}g goal</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Supports hormone balance, brain health, and lipid-soluble vitamin uptake.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (displayMacros.fat / targets.fatRequirement) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Calories Total Card */}
              <div className="card p-5 flex flex-col justify-between bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-600 shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Daily Energy Budget</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-950 bg-white/90 px-2 py-0.5 rounded-md">
                      {user.healthGoal}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white">{displayMacros.calories}</span>
                    <span className="text-xs text-emerald-200 font-medium">/ {targets.calorieRequirement} kcal</span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-2">
                    Calibrated based on Mifflin-St Jeor formula and {user.activityLevel} activity.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (displayMacros.calories / targets.calorieRequirement) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Micronutrient Coverage and Clinical Recommendations Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Micronutrients Coverage */}
            <div className="card p-6 bg-white border-slate-200/80 lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Micronutrient Target Coverage</h2>
                  <p className="text-xs text-slate-500">Click any nutrient to view rich food sources</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">RDA Benchmark</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {displayMacros && (
                  <>
                    <ProgressBar label="Iron" value={displayMacros.micronutrients?.ironCoveragePct} color="bg-red-400" onClick={() => setSelectedNutrient("Iron")} />
                    <ProgressBar label="Calcium" value={displayMacros.micronutrients?.calciumCoveragePct} color="bg-slate-400" onClick={() => setSelectedNutrient("Calcium")} />
                    <ProgressBar label="Vitamin A" value={displayMacros.micronutrients?.vitACoveragePct} color="bg-orange-400" onClick={() => setSelectedNutrient("Vitamin A")} />
                    <ProgressBar label="Vitamin B12" value={displayMacros.micronutrients?.vitB12CoveragePct} color="bg-blue-400" onClick={() => setSelectedNutrient("Vitamin B12")} />
                    <ProgressBar label="Vitamin C" value={displayMacros.micronutrients?.vitCCoveragePct} color="bg-yellow-400" onClick={() => setSelectedNutrient("Vitamin C")} />
                    <ProgressBar label="Vitamin D" value={displayMacros.micronutrients?.vitDCoveragePct} color="bg-amber-300" onClick={() => setSelectedNutrient("Vitamin D")} />
                    <ProgressBar label="Magnesium" value={displayMacros.micronutrients?.magnesiumCoveragePct} color="bg-emerald-400" onClick={() => setSelectedNutrient("Magnesium")} />
                    <ProgressBar label="Zinc" value={displayMacros.micronutrients?.zincCoveragePct} color="bg-zinc-400" onClick={() => setSelectedNutrient("Zinc")} />
                    <ProgressBar label="Potassium" value={displayMacros.micronutrients?.potassiumCoveragePct} color="bg-purple-400" onClick={() => setSelectedNutrient("Potassium")} />
                  </>
                )}
              </div>
            </div>

            {/* Micronutrient Suggestions */}
            <div className="card p-6 bg-white border-slate-200/80 lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800 mb-1">Clinical Micronutrient Guidance</h2>
                <p className="text-xs text-slate-500 mb-4">Personalized recommendations for optimal nutrient density</p>
                
                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {dietPlan.micronutrientSuggestions && dietPlan.micronutrientSuggestions.length > 0 ? (
                    dietPlan.micronutrientSuggestions.map((s, idx) => (
                      <div key={idx} className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong className="text-slate-900 block mb-0.5">{s.nutrient}</strong>
                        {s.suggestion}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl">
                      Standard balanced micronutrient distribution achieved across planned meals.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Want to log your habits?</span>
                <button
                  onClick={() => setActiveTab('habits')}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Go to Habit Tracker</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: DAILY HABITS TAB (Interactive daily checkoffs, streaks) */}
      {/* ============================================================== */}
      {activeTab === 'habits' && (
        <section className="animate-in fade-in duration-200">
          <DailyHabitTracker
            user={user}
            targets={targets}
            dietPlan={dietPlan}
            habitData={habitData}
            onUpdateHabitData={handleUpdateHabitData}
            activeDay={activeDayForScore}
            onSelectDay={(d) => setActiveDay(d)}
            waterLog={waterLog}
            onUpdateWater={(day, amt) => handleSetWater(amt)}
            isIronLow={isIronLow}
          />
        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 4: LAB & BIOMARKERS TAB (Clean clinical view for blood tests) */}
      {/* ============================================================== */}
      {activeTab === 'biomarkers' && (
        <section className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {hasReport ? (
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className={`p-6 rounded-3xl border shadow-xs ${
                isIronLow 
                  ? 'bg-gradient-to-r from-red-50/80 via-white to-amber-50/50 border-red-200' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3.5 rounded-2xl ${isIronLow ? 'bg-red-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'}`}>
                      <HeartPulse className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{user.bloodReport?.reportType || "Lab Biomarker Report"}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          isIronLow ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {isIronLow ? 'Low Iron / Anemia Detected' : 'Normal Biomarkers'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Report File: <strong>{user.bloodReport?.fileName}</strong> · Analyzed {user.bloodReport?.analyzedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setIsReportViewerOpen(true)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Full Lab Document</span>
                    </button>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Replace Report</span>
                    </button>
                  </div>
                </div>

                {/* Clinical Summary */}
                {user.bloodReport?.summary && (
                  <div className="mt-4 p-4 bg-white/80 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">Clinical Assessment:</strong>
                    {user.bloodReport.summary}
                  </div>
                )}
              </div>

              {/* Biomarkers Grid */}
              <div className="card p-6 bg-white border-slate-200/80">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Detected Biomarker Levels</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {user.bloodReport?.biomarkers && user.bloodReport.biomarkers.length > 0 ? (
                    user.bloodReport.biomarkers.map((b, idx) => {
                      const isLow = b.status === 'low';
                      const isHigh = b.status === 'high';
                      return (
                        <div key={idx} className={`p-4 rounded-2xl border ${
                          isLow ? 'bg-red-50/50 border-red-200' :
                          isHigh ? 'bg-amber-50/50 border-amber-200' :
                          'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-700">{b.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                              isLow ? 'bg-red-600 text-white' :
                              isHigh ? 'bg-amber-600 text-white' :
                              'bg-emerald-600 text-white'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 my-1">
                            <span className={`text-2xl font-black ${isLow ? 'text-red-700' : 'text-slate-900'}`}>{b.value}</span>
                            <span className="text-xs text-slate-500">{b.unit}</span>
                          </div>
                          {b.referenceRange && (
                            <p className="text-[10px] text-slate-400 mt-1">Ref: {b.referenceRange}</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-xs text-slate-500 p-4 bg-slate-50 rounded-xl">
                      Standard biomarker baseline extracted.
                    </div>
                  )}
                </div>
              </div>

              {/* Low Iron Protocol Rules */}
              {isIronLow && (
                <div className="card p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200/80">
                  <h3 className="text-sm font-bold text-red-950 mb-3 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-red-600" />
                    <span>Evidence-Based Iron Optimization Protocol</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-2xl border border-red-100">
                      <strong className="text-red-900 block mb-1 text-sm">1. Iron-Dense Foods</strong>
                      <p className="text-slate-600">
                        Incorporate lentils, spinach, tofu, pumpkin seeds, and quinoa daily into lunch and dinner.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-red-100">
                      <strong className="text-red-900 block mb-1 text-sm">2. Vitamin C Synergy</strong>
                      <p className="text-slate-600">
                        Always squeeze fresh lemon or pair meals with bell peppers/oranges to boost non-heme iron absorption by up to 300%.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-red-100">
                      <strong className="text-red-900 block mb-1 text-sm">3. Tannin Spacing</strong>
                      <p className="text-slate-600">
                        Avoid drinking black tea, green tea, or coffee within 60 minutes before or after your primary meals.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State: Prompt user to attach lab */
            <div className="card p-8 bg-white border-slate-200/80 text-center max-w-2xl mx-auto my-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <HeartPulse className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Unlock Clinical Biomarker Intelligence</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Attach an optional blood test report (CBC, Ferritin, Iron profile) to detect nutrient deficiencies, unlock custom low-iron recipes, and tailor absorption pairings.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Attach Blood Test Report</span>
                </button>
              </div>
            </div>
          )}

        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 5: HYDRATION & BODY TAB (Water tracker, weight, BMI stats) */}
      {/* ============================================================== */}
      {activeTab === 'body' && (
        <section className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Water Tracker */}
            <div className="card p-6 bg-white border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-blue-500 fill-blue-100" />
                      <span>Daily Water Tracker</span>
                    </h2>
                    <p className="text-xs text-slate-500">Day {activeDayForScore} Hydration</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    currentWater >= WATER_GOAL ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {currentWater >= WATER_GOAL ? 'Goal Reached! 💧' : `${currentWater} / ${WATER_GOAL} glasses`}
                  </span>
                </div>
                
                <div className="flex flex-col items-center gap-3 my-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900">{currentWater}</span>
                    <span className="text-slate-400 font-medium text-sm">/ {WATER_GOAL} glasses (250ml each)</span>
                  </div>
                  
                  {/* Interactive Glasses */}
                  <div className="flex flex-wrap gap-2.5 justify-center max-w-sm mt-2">
                    {Array.from({ length: WATER_GOAL }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleSetWater(i + 1 === currentWater ? i : i + 1)}
                        className="p-1.5 transition-all active:scale-90 hover:scale-110 cursor-pointer"
                        title={`Glass ${i + 1}`}
                      >
                        <Droplet 
                          className={`w-8 h-8 transition-colors duration-200 ${
                            i < currentWater 
                              ? 'fill-blue-500 text-blue-500' 
                              : 'fill-slate-100 text-slate-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSetWater(Math.max(0, currentWater - 1))}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Remove Glass</span>
                </button>
                <button
                  onClick={() => handleSetWater(currentWater + 1)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Glass</span>
                </button>
              </div>
            </div>

            {/* Weight Tracker */}
            <div className="card p-6 bg-white border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-purple-500" />
                      <span>Weight Progress Tracker</span>
                    </h2>
                    <p className="text-xs text-slate-500">Starting baseline: {user.weight} kg</p>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    Goal: {user.healthGoal}
                  </span>
                </div>
                
                <div className="flex flex-col items-center gap-3 my-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900">{currentWeight.toFixed(1)}</span>
                    <span className="text-slate-400 font-medium text-sm">kg</span>
                  </div>

                  <div className="text-xs font-semibold text-slate-500">
                    {currentWeight !== user.weight ? (
                      <span className={currentWeight < user.weight ? 'text-emerald-600' : 'text-amber-600'}>
                        {currentWeight < user.weight ? `▼ ${(user.weight - currentWeight).toFixed(1)} kg from baseline` : `▲ ${(currentWeight - user.weight).toFixed(1)} kg from baseline`}
                      </span>
                    ) : (
                      <span>At baseline weight</span>
                    )}
                  </div>
                  
                  <div className="flex gap-4 mt-2">
                    <button 
                      onClick={() => handleSetWeight(Math.max(0, currentWeight - 0.5))}
                      className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                      title="-0.5 kg"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleSetWeight(currentWeight + 0.5)}
                      className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      title="+0.5 kg"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-100">
                Log changes daily or weekly to monitor your progress toward your {user.healthGoal} goal.
              </div>
            </div>
          </div>

          {/* Clinical Diagnostic Metrics Summary */}
          <div className="card p-6 bg-white border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Body Composition & Metabolism Calibration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-500 mb-1 font-medium">Body Mass Index (BMI)</p>
                <p className="text-2xl font-black text-slate-900">{targets.bmi}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${
                  targets.bmiCategory === 'Normal weight' ? 'bg-emerald-100 text-emerald-800' :
                  targets.bmiCategory === 'Underweight' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {targets.bmiCategory}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-500 mb-1 font-medium">Basal Metabolic Rate</p>
                <p className="text-2xl font-black text-slate-900">{targets.bmr} <span className="text-xs font-normal text-slate-400">kcal</span></p>
                <p className="text-[10px] text-slate-400 mt-1">Resting energy burn</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-500 mb-1 font-medium">Total Daily Expenditure (TDEE)</p>
                <p className="text-2xl font-black text-slate-900">{targets.tdee} <span className="text-xs font-normal text-slate-400">kcal</span></p>
                <p className="text-[10px] text-slate-400 mt-1">Calibrated to {user.activityLevel}</p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                <p className="text-xs text-emerald-800 mb-1 font-medium">Prescribed Intake</p>
                <p className="text-2xl font-black text-emerald-900">{targets.calorieRequirement} <span className="text-xs font-normal text-emerald-700">kcal</span></p>
                <p className="text-[10px] text-emerald-700 mt-1 font-medium">Optimal for {user.healthGoal}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* VIEW 6: FOOD SCANNER TAB (AI Camera / Image analyzer) */}
      {/* ============================================================== */}
      {activeTab === 'scanner' && (
        <section className="animate-in fade-in duration-200">
          <FoodScanner user={user} targets={targets} onClose={() => setActiveTab('meals')} />
        </section>
      )}

      {/* ============================================================== */}
      {/* MODALS & OVERLAYS */}
      {/* ============================================================== */}
      
      {/* Nutrient Food Source Modal */}
      {selectedNutrient && nutrientRecommendations[selectedNutrient] && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{selectedNutrient} Sources</h3>
              <button 
                onClick={() => setSelectedNutrient(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3">To boost your {selectedNutrient}, try incorporating these foods into your diet:</p>
              <ul className="space-y-2">
                {nutrientRecommendations[selectedNutrient].map((food, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                    <Apple className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Blood Report Viewer Modal */}
      {isReportViewerOpen && user.bloodReport && (
        <BloodReportViewer
          report={user.bloodReport}
          onClose={() => setIsReportViewerOpen(false)}
          onReplaceReport={() => {
            setIsReportViewerOpen(false);
            setIsUploadModalOpen(true);
          }}
        />
      )}

      {/* Blood Report Upload Modal */}
      {isUploadModalOpen && (
        <BloodReportUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onAnalyzed={(report) => {
            onUpdateBloodReport?.(report);
            setIsUploadModalOpen(false);
            setActiveTab('biomarkers');
          }}
          userProfile={user}
          currentReport={user.bloodReport}
        />
      )}

      {/* AI Chatbot Assistant */}
      <AIChatBot user={user} />

      {/* Minimal Footer */}
      <footer className="text-[11px] text-slate-400 text-center py-2 border-t border-slate-200/60">
        NutriAI Clinical & Lifestyle Nutrition Engine · Dietary guidance for wellness and personal planning.
      </footer>
    </div>
  );
}
