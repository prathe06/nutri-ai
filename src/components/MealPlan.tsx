import React, { useState } from 'react';
import { DayPlan, NutritionTargets, Meal, DailyHabitLog, MealSlotKey } from '../types';
import { Check, Circle, Utensils, Coffee, Sun, Sunset, Moon, Apple, LayoutGrid, Table } from 'lucide-react';

interface MealPlanProps {
  dayPlan: DayPlan;
  targets: NutritionTargets;
  habitDayLog?: DailyHabitLog;
  onToggleMeal?: (slot: MealSlotKey) => void;
}

export const ProgressBar = ({ label, value, color, onClick }: { label: string, value: number, color: string, onClick?: () => void }) => {
  const safeValue = Math.min(Math.max(value || 0, 0), 100);
  return (
    <div className={`space-y-1 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} onClick={onClick}>
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-500 font-mono">{Math.round(safeValue)}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-fill ${color}`} 
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};

const slotIcons: Record<MealSlotKey, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4 text-amber-500" />,
  morningSnack: <Apple className="w-4 h-4 text-emerald-500" />,
  lunch: <Sun className="w-4 h-4 text-amber-600" />,
  eveningSnack: <Sunset className="w-4 h-4 text-orange-500" />,
  dinner: <Moon className="w-4 h-4 text-indigo-500" />,
};

const slotTimes: Record<MealSlotKey, string> = {
  breakfast: '8:00 AM - 8:30 AM',
  morningSnack: '11:00 AM',
  lunch: '1:00 PM - 1:30 PM',
  eveningSnack: '5:00 PM',
  dinner: '8:00 PM - 8:30 PM',
};

const MealCard = ({
  name,
  meal,
  slotKey,
  isFollowed,
  onToggle
}: {
  name: string;
  meal?: Meal;
  slotKey: MealSlotKey;
  isFollowed?: boolean;
  onToggle?: (slot: MealSlotKey) => void;
}) => {
  if (!meal) return null;

  return (
    <div className={`p-4.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
      isFollowed 
        ? 'bg-emerald-50/50 border-emerald-300 shadow-xs' 
        : 'bg-white hover:bg-slate-50/70 border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
    }`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100/80">
              {slotIcons[slotKey]}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">{name}</span>
              <span className="text-[10px] text-slate-400 font-medium block">{slotTimes[slotKey]}</span>
            </div>
          </div>

          {onToggle && (
            <button
              type="button"
              onClick={() => onToggle(slotKey)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isFollowed 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
              }`}
            >
              {isFollowed ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Eaten</span>
                </>
              ) : (
                <span>Mark Eaten</span>
              )}
            </button>
          )}
        </div>

        <h4 className={`text-base font-bold transition-colors mb-1 ${isFollowed ? 'text-emerald-950 line-through opacity-85' : 'text-slate-900'}`}>
          {meal.foodName}
        </h4>

        <p className="text-xs text-slate-500 font-medium mb-3">
          Portion: <span className="text-slate-700 font-semibold">{meal.portionSize}</span>
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-900 font-black">
          <span>{meal.calories}</span>
          <span className="text-[10px] font-normal text-slate-400">kcal</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span title="Protein">P: <strong className="text-slate-700">{meal.protein}g</strong></span>
          <span title="Carbs">C: <strong className="text-slate-700">{meal.carbs}g</strong></span>
          <span title="Fats">F: <strong className="text-slate-700">{meal.fat}g</strong></span>
        </div>
      </div>
    </div>
  );
};

const MealRow = ({ 
  name, 
  meal,
  slotKey,
  isFollowed,
  onToggle
}: { 
  name: string; 
  meal?: Meal;
  slotKey?: MealSlotKey;
  isFollowed?: boolean;
  onToggle?: (slot: MealSlotKey) => void;
}) => {
  if (!meal) return null;
  return (
    <tr className={`border-b border-slate-100 last:border-0 transition-colors ${
      isFollowed ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
    }`}>
      {onToggle && slotKey && (
        <td className="py-3.5 px-3 text-center">
          <button
            type="button"
            onClick={() => onToggle(slotKey)}
            title={isFollowed ? "Marked as eaten (Click to uncheck)" : "Click to mark as eaten"}
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
              isFollowed 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'border border-slate-300 hover:border-emerald-500 bg-white text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </td>
      )}
      <td className="py-3.5 px-3 font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          {slotKey && slotIcons[slotKey]}
          <span>{name}</span>
          {isFollowed && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
              Eaten
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-3">
        <p className={`font-bold transition-colors ${isFollowed ? 'text-emerald-950' : 'text-slate-900'}`}>
          {meal.foodName}
        </p>
      </td>
      <td className="py-3.5 px-3 text-slate-600 text-xs">{meal.portionSize}</td>
      <td className="py-3.5 px-3 text-right font-black text-slate-900">{meal.calories}</td>
      <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-600">
        {meal.protein}g / {meal.carbs}g / {meal.fat}g
      </td>
    </tr>
  );
};

export default function MealPlan({ dayPlan, targets, habitDayLog, onToggleMeal }: MealPlanProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const s = dayPlan.summary;
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* View Switcher Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Day {dayPlan.dayNumber} Scheduled Meals
          </h3>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'cards' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'table' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        /* Culinary Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MealCard 
            name="Breakfast" 
            meal={dayPlan.meals.breakfast} 
            slotKey="breakfast" 
            isFollowed={habitDayLog?.meals?.breakfast} 
            onToggle={onToggleMeal} 
          />
          <MealCard 
            name="Morning Snack" 
            meal={dayPlan.meals.morningSnack} 
            slotKey="morningSnack" 
            isFollowed={habitDayLog?.meals?.morningSnack} 
            onToggle={onToggleMeal} 
          />
          <MealCard 
            name="Lunch" 
            meal={dayPlan.meals.lunch} 
            slotKey="lunch" 
            isFollowed={habitDayLog?.meals?.lunch} 
            onToggle={onToggleMeal} 
          />
          <MealCard 
            name="Evening Snack" 
            meal={dayPlan.meals.eveningSnack} 
            slotKey="eveningSnack" 
            isFollowed={habitDayLog?.meals?.eveningSnack} 
            onToggle={onToggleMeal} 
          />
          <MealCard 
            name="Dinner" 
            meal={dayPlan.meals.dinner} 
            slotKey="dinner" 
            isFollowed={habitDayLog?.meals?.dinner} 
            onToggle={onToggleMeal} 
          />
        </div>
      ) : (
        /* Meals Table */
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/70">
              <tr>
                {onToggleMeal && <th className="py-3 px-3 text-center font-bold w-10">Done</th>}
                <th className="py-3 px-3 font-bold">Meal Time</th>
                <th className="py-3 px-3 font-bold">Suggested Dish</th>
                <th className="py-3 px-3 font-bold">Portion</th>
                <th className="py-3 px-3 font-bold text-right">Kcal</th>
                <th className="py-3 px-3 font-bold text-right">Macros (P/C/F)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
              <MealRow 
                name="Breakfast" 
                meal={dayPlan.meals.breakfast} 
                slotKey="breakfast" 
                isFollowed={habitDayLog?.meals?.breakfast} 
                onToggle={onToggleMeal} 
              />
              <MealRow 
                name="M. Snack" 
                meal={dayPlan.meals.morningSnack} 
                slotKey="morningSnack" 
                isFollowed={habitDayLog?.meals?.morningSnack} 
                onToggle={onToggleMeal} 
              />
              <MealRow 
                name="Lunch" 
                meal={dayPlan.meals.lunch} 
                slotKey="lunch" 
                isFollowed={habitDayLog?.meals?.lunch} 
                onToggle={onToggleMeal} 
              />
              <MealRow 
                name="E. Snack" 
                meal={dayPlan.meals.eveningSnack} 
                slotKey="eveningSnack" 
                isFollowed={habitDayLog?.meals?.eveningSnack} 
                onToggle={onToggleMeal} 
              />
              <MealRow 
                name="Dinner" 
                meal={dayPlan.meals.dinner} 
                slotKey="dinner" 
                isFollowed={habitDayLog?.meals?.dinner} 
                onToggle={onToggleMeal} 
              />
            </tbody>
          </table>
        </div>
      )}

      {/* Daily Target vs Plan Progress Section */}
      <div className="card p-6 bg-gradient-to-r from-slate-50/60 via-white to-emerald-50/20 border-slate-200/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
          Day {dayPlan.dayNumber} Caloric & Macronutrient Equilibrium
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-700">Calories</span>
              <span className="font-mono text-slate-500">{s.calories} / {targets.calorieRequirement} kcal</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill bg-emerald-500" style={{ width: `${Math.min(100, (s.calories / targets.calorieRequirement) * 100)}%` }} />
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-700">Protein</span>
              <span className="font-mono text-slate-500">{s.protein}g / {targets.proteinRequirement}g</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill bg-sky-500" style={{ width: `${Math.min(100, (s.protein / targets.proteinRequirement) * 100)}%` }} />
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-700">Carbohydrates</span>
              <span className="font-mono text-slate-500">{s.carbs}g / {targets.carbsRequirement}g</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill bg-amber-500" style={{ width: `${Math.min(100, (s.carbs / targets.carbsRequirement) * 100)}%` }} />
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-700">Healthy Fats</span>
              <span className="font-mono text-slate-500">{s.fat}g / {targets.fatRequirement}g</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill bg-rose-400" style={{ width: `${Math.min(100, (s.fat / targets.fatRequirement) * 100)}%` }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
