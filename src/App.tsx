/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import { UserProfile, NutritionTargets, DietPlan, BloodTestAnalysis } from './types';
import { calculateNutrition } from './utils/nutrition';
import { Activity, Sparkles, HeartPulse, ShieldCheck, Flame, ChevronLeft } from 'lucide-react';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDiet = async (profile: UserProfile, targets: NutritionTargets) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          ...targets
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate diet plan');
      }

      const data = await response.json();
      setDietPlan(data);
      setUserProfile(profile);
      setNutritionTargets(targets);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the diet plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (data: UserProfile) => {
    const targets = calculateNutrition(data);
    generateDiet(data, targets);
  };

  const handleRegenerate = () => {
    if (userProfile && nutritionTargets) {
      generateDiet(userProfile, nutritionTargets);
    }
  };

  const handleUpdateBloodReport = (report: BloodTestAnalysis | undefined) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, bloodReport: report };
    setUserProfile(updatedProfile);
    if (nutritionTargets) {
      generateDiet(updatedProfile, nutritionTargets);
    }
  };

  const handleBack = () => {
    setDietPlan(null);
  };

  return (
    <div className="min-h-screen bg-wellness-canvas font-sans text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Global Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900">
                  Nutri<span className="text-emerald-600">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  Clinical & Lifestyle
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dietPlan && userProfile ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border-r border-slate-200 pr-3 mr-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Plan Active for <strong>{userProfile.name}</strong></span>
                </div>
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="hidden md:inline-flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Evidence-Calibrated
                </span>
                <span className="hidden md:inline text-slate-300">·</span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-slate-600">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  Biomarker Engine
                </span>
                <span className="hidden md:inline text-slate-300">·</span>
                <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Habit Tracker
                </span>
              </div>
            )}
          </div>

        </div>
      </header>

      <main className="flex-1 py-6 px-3 sm:px-6 h-full flex flex-col">
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-xs">
            {error}
          </div>
        )}

        {!dietPlan ? (
          <div className="p-2 sm:p-4 pb-20">
            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
        ) : (
          <Dashboard 
            user={userProfile!} 
            targets={nutritionTargets!} 
            dietPlan={dietPlan} 
            onRegenerate={handleRegenerate} 
            onBack={handleBack}
            onUpdateBloodReport={handleUpdateBloodReport}
            isRegenerating={isLoading}
          />
        )}
      </main>
    </div>
  );
}
