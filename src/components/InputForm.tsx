import React, { useState, useMemo } from 'react';
import { UserProfile, BloodTestAnalysis } from '../types';
import { 
  Activity, Apple, ChevronRight, User, Target, 
  AlertCircle, FileText, HeartPulse, 
  Sparkles, CheckCircle2, AlertTriangle, Eye, Trash2,
  Upload, Scale, Zap, Compass, ShieldCheck, Flame, Droplet
} from 'lucide-react';
import BloodReportUploadModal from './BloodReportUploadModal';
import BloodReportViewer from './BloodReportViewer';
import { calculateNutrition, getSampleLowIronReport } from '../utils/nutrition';

interface InputFormProps {
  onSubmit: (data: UserProfile) => void;
  isLoading: boolean;
}

interface PersonaPreset {
  id: string;
  name: string;
  role: string;
  tagline: string;
  avatarEmoji: string;
  data: UserProfile;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 26,
    gender: 'female',
    height: 165,
    weight: 58,
    activityLevel: 'Moderately Active',
    healthGoal: 'Maintain Weight',
    foodPreference: 'Vegetarian',
    allergies: '',
    foodsToAvoid: '',
    mealsPerDay: '3 meals + 2 snacks',
    preferredCuisine: 'Indian',
    budget: 'Average',
    waterIntake: '2.5 Liters',
    bloodReport: undefined
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Live real-time calculations as user tweaks metrics
  const liveNutrition = useMemo(() => {
    return calculateNutrition(formData);
  }, [formData.height, formData.weight, formData.age, formData.gender, formData.activityLevel, formData.healthGoal]);

  const presets: PersonaPreset[] = [
    {
      id: 'maya-iron',
      name: 'Maya Chen',
      role: 'Plant-Based • Low Iron Protocol',
      tagline: 'Anemic fatigue recovery with iron-dense legumes, greens & lemon synergy',
      avatarEmoji: '🌿',
      data: {
        name: 'Maya Chen',
        age: 26,
        gender: 'female',
        height: 165,
        weight: 56,
        activityLevel: 'Lightly Active',
        healthGoal: 'Maintain Weight',
        foodPreference: 'Vegetarian',
        allergies: 'None',
        foodsToAvoid: 'Bitter gourd',
        mealsPerDay: '3 meals + 2 snacks',
        preferredCuisine: 'Mediterranean & Asian',
        budget: 'Average',
        waterIntake: '2.5 Liters',
        bloodReport: getSampleLowIronReport()
      }
    },
    {
      id: 'alex-athlete',
      name: 'Alex Rivera',
      role: 'Athletic Hypertrophy & Strength',
      tagline: 'Caloric surplus with high-bioavailability protein & complex fuel',
      avatarEmoji: '🏃',
      data: {
        name: 'Alex Rivera',
        age: 28,
        gender: 'male',
        height: 180,
        weight: 78,
        activityLevel: 'Very Active',
        healthGoal: 'Weight Gain',
        foodPreference: 'Non-Vegetarian',
        allergies: 'Peanuts',
        foodsToAvoid: 'Processed sugars',
        mealsPerDay: '3 meals + 2 snacks',
        preferredCuisine: 'High-Protein Mediterranean & Asian',
        budget: 'High',
        waterIntake: '3.5 Liters',
        bloodReport: undefined
      }
    },
    {
      id: 'david-metabolic',
      name: 'David Miller',
      role: 'Metabolic Health & Fat Loss',
      tagline: 'Nutrient-dense caloric deficit with sustained glycemic control',
      avatarEmoji: '⚡',
      data: {
        name: 'David Miller',
        age: 35,
        gender: 'male',
        height: 175,
        weight: 84,
        activityLevel: 'Moderately Active',
        healthGoal: 'Weight Loss',
        foodPreference: 'Eggetarian',
        allergies: 'Dairy sensitivity',
        foodsToAvoid: 'Refined flour',
        mealsPerDay: '3 meals + 2 snacks',
        preferredCuisine: 'Indian & Continental',
        budget: 'Average',
        waterIntake: '3.0 Liters',
        bloodReport: undefined
      }
    }
  ];

  const handleApplyPreset = (preset: PersonaPreset) => {
    setFormData(preset.data);
    setActivePresetId(preset.id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setActivePresetId(null);
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value
    }));
  };

  const handleSelectGender = (gender: 'male' | 'female' | 'other') => {
    setActivePresetId(null);
    setFormData(prev => ({ ...prev, gender }));
  };

  const handleSelectActivity = (activityLevel: UserProfile['activityLevel']) => {
    setActivePresetId(null);
    setFormData(prev => ({ ...prev, activityLevel }));
  };

  const handleSelectGoal = (healthGoal: UserProfile['healthGoal']) => {
    setActivePresetId(null);
    setFormData(prev => ({ ...prev, healthGoal }));
  };

  const handleSelectFoodPref = (foodPreference: UserProfile['foodPreference']) => {
    setActivePresetId(null);
    setFormData(prev => ({ ...prev, foodPreference }));
  };

  const handleReportAnalyzed = (report: BloodTestAnalysis) => {
    setFormData(prev => ({
      ...prev,
      bloodReport: report
    }));
  };

  const handleRemoveReport = () => {
    setFormData(prev => ({
      ...prev,
      bloodReport: undefined
    }));
  };

  const handleAttachSampleReport = () => {
    const sample = getSampleLowIronReport();
    setFormData(prev => ({
      ...prev,
      bloodReport: sample
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const hasReport = !!formData.bloodReport;
  const isIronLow = hasReport && (formData.bloodReport?.isIronLow || formData.bloodReport?.ironStatus === 'low');

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Refined Hero Header */}
      <div className="text-center space-y-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Precision Clinical & Lifestyle Nutrition Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
          Your Biological Blueprint, <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
            Translated into Precision Nutrition.
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Evidence-calibrated 7-day meal planning with automated blood test biomarker analysis and daily consistency tracking.
        </p>

        {/* Clean metadata bar per Zero-Pill discipline */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium pt-1">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> CBC & Iron Biomarker Aware
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>7-Day Tailored Meals</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Daily Habit Tracker</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>AI Food Vision Scanner</span>
        </div>
      </div>

      {/* Quick-Start Persona Showcase */}
      <div className="card p-5 sm:p-6 bg-gradient-to-br from-slate-50/80 via-white to-emerald-50/20 border-slate-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Explore Instant Demo Profiles</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any profile below to preview calibrated recommendations instantly
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 self-start sm:self-auto">
            1-Click Pre-fill
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {presets.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                    : 'bg-white hover:bg-slate-50/90 border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                    {preset.avatarEmoji}
                  </div>
                  {preset.data.bloodReport ? (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      Low Iron CBC Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {preset.data.healthGoal}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{preset.name}</h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">{preset.role}</p>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug line-clamp-2">
                  {preset.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form Inputs + Live Health Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Personal Metrics Card */}
          <div className="card overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Metrics & Biology</h2>
                  <p className="text-xs text-slate-500">Base variables used to calculate BMR, BMI, and daily energy</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                Step 1 of 4
              </span>
            </div>

            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</label>
                <input 
                  required 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-semibold bg-white placeholder:text-slate-400" 
                  placeholder="e.g. Sarah Jenkins" 
                />
              </div>

              {/* Biological Gender Segmented Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Biological Gender</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                  {(['male', 'female', 'other'] as const).map((genderOption) => (
                    <button
                      key={genderOption}
                      type="button"
                      onClick={() => handleSelectGender(genderOption)}
                      className={`py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                        formData.gender === genderOption 
                          ? 'bg-white text-emerald-950 shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {genderOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age, Height, Weight Triad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Age</label>
                    <span className="text-xs font-semibold text-slate-500">{formData.age} yrs</span>
                  </div>
                  <input 
                    required 
                    type="number" 
                    min="14" 
                    max="100" 
                    name="age" 
                    value={formData.age} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-semibold bg-white" 
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Height</label>
                    <span className="text-xs font-semibold text-slate-500">{formData.height} cm</span>
                  </div>
                  <input 
                    required 
                    type="number" 
                    min="100" 
                    max="240" 
                    name="height" 
                    value={formData.height} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-semibold bg-white" 
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Weight</label>
                    <span className="text-xs font-semibold text-slate-500">{formData.weight} kg</span>
                  </div>
                  <input 
                    required 
                    type="number" 
                    min="30" 
                    max="250" 
                    step="0.5"
                    name="weight" 
                    value={formData.weight} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-semibold bg-white" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Blood Test Report - Optional Clinical Feature */}
          <div className={`card overflow-hidden transition-all duration-300 border-2 ${
            hasReport 
              ? isIronLow 
                ? 'border-red-300 bg-red-50/10 shadow-sm' 
                : 'border-emerald-300 bg-emerald-50/10 shadow-sm'
              : 'border-slate-200 hover:border-emerald-300'
          }`}>
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-emerald-50/20 to-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl shadow-xs ${hasReport ? (isIronLow ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700') : 'bg-emerald-100 text-emerald-700'}`}>
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">Blood Test & Biomarkers</h2>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload CBC or Iron Profile to auto-prescribe iron-rich foods with Vitamin C pairing
                  </p>
                </div>
              </div>

              {hasReport && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsViewerModalOpen(true)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    Inspect Lab Report
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveReport}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove attached report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              {!hasReport ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Have a recent blood test report (CBC / Iron)?
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                      Upload an image/PDF or test with a realistic low-iron sample report to see how clinical food pairing functions.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Report
                    </button>
                    <button
                      type="button"
                      onClick={handleAttachSampleReport}
                      className="w-full sm:w-auto px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Attach Low-Iron Sample
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`p-4.5 rounded-2xl border ${
                  isIronLow 
                    ? 'bg-red-50/70 border-red-200 text-red-950' 
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isIronLow ? 'bg-red-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'
                    }`}>
                      {isIronLow ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm">
                          {formData.bloodReport?.fileName}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          isIronLow ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {isIronLow ? 'Low Iron / Anemia' : 'Normal Range'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                        {formData.bloodReport?.summary}
                      </p>
                      {isIronLow && (
                        <p className="text-xs font-bold text-red-700 flex items-center gap-1 mt-1">
                          <span>⚡ Active Iron Protocol: 18-25mg iron target, lemon synergy, tea timing rules.</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsViewerModalOpen(true)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    View Details
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Level & Goals Grid */}
          <div className="card p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Daily Physical Activity</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'Sedentary', label: 'Sedentary', desc: 'Desk job, minimal active walking' },
                  { id: 'Lightly Active', label: 'Lightly Active', desc: 'Light exercise / walks 1-3 days/wk' },
                  { id: 'Moderately Active', label: 'Moderately Active', desc: 'Moderate workout 3-5 days/wk' },
                  { id: 'Very Active', label: 'Very Active', desc: 'Intense sports / training 6-7 days/wk' }
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleSelectActivity(act.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.activityLevel === act.id 
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{act.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{act.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Primary Health Goal</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'Weight Loss', label: 'Weight Loss', sub: '-500 kcal deficit' },
                  { id: 'Maintain Weight', label: 'Maintain Weight', sub: 'Caloric balance' },
                  { id: 'Weight Gain', label: 'Muscle Gain', sub: '+500 kcal surplus' }
                ].map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleSelectGoal(goal.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.healthGoal === goal.id 
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{goal.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{goal.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dietary Preferences & Cuisine */}
          <div className="card p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Apple className="w-4 h-4 text-emerald-600" />
                <span>Dietary Preference</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Vegetarian', label: 'Vegetarian', icon: '🥗' },
                  { id: 'Non-Vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
                  { id: 'Eggetarian', label: 'Eggetarian', icon: '🍳' },
                  { id: 'Vegan', label: 'Vegan', icon: '🌱' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectFoodPref(item.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.foodPreference === item.id 
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold text-emerald-950' 
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-lg block mb-1">{item.icon}</span>
                    <span className="text-xs block font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Preferred Cuisine</label>
                <input 
                  type="text" 
                  name="preferredCuisine" 
                  value={formData.preferredCuisine} 
                  onChange={handleChange} 
                  placeholder="e.g. South Indian, Mediterranean, Asian" 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-semibold bg-white" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Meal Structure</label>
                <select 
                  name="mealsPerDay" 
                  value={formData.mealsPerDay} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-semibold bg-white"
                >
                  <option value="3 meals + 2 snacks">3 Meals + 2 Snacks (Recommended)</option>
                  <option value="3 meals + 1 snack">3 Meals + 1 Snack</option>
                  <option value="3 main meals only">3 Main Meals Only</option>
                </select>
              </div>
            </div>

            {/* Allergies & Foods to Avoid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Allergies</span>
                </label>
                <input 
                  type="text" 
                  name="allergies" 
                  value={formData.allergies} 
                  onChange={handleChange} 
                  placeholder="e.g. Peanuts, Gluten, Dairy (or none)" 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm bg-white" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Dislikes / Avoid</label>
                <input 
                  type="text" 
                  name="foodsToAvoid" 
                  value={formData.foodsToAvoid} 
                  onChange={handleChange} 
                  placeholder="e.g. Bitter gourd, Mushrooms" 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm bg-white" 
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Calorie & Health Diagnostic Hub (4 cols sticky) */}
        <div className="lg:col-span-4 sticky top-6 space-y-6">
          
          <div className="card p-6 bg-gradient-to-b from-white via-emerald-50/20 to-white border-emerald-200/80 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Live Biological Preview
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Real-Time
              </span>
            </div>

            {/* BMI Display */}
            <div className="space-y-3 mb-5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-semibold">Calculated BMI</span>
                <span className="text-2xl font-black text-slate-900">{liveNutrition.bmi}</span>
              </div>
              
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-sky-400 h-full w-[25%]" title="Underweight (<18.5)" />
                <div className="bg-emerald-500 h-full w-[35%]" title="Normal (18.5 - 24.9)" />
                <div className="bg-amber-400 h-full w-[25%]" title="Overweight (25 - 29.9)" />
                <div className="bg-rose-500 h-full w-[15%]" title="Obese (30+)" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Classification</span>
                <span className={`font-bold ${
                  liveNutrition.bmiCategory === 'Normal weight' ? 'text-emerald-700' :
                  liveNutrition.bmiCategory === 'Underweight' ? 'text-sky-700' : 'text-amber-700'
                }`}>
                  {liveNutrition.bmiCategory}
                </span>
              </div>
            </div>

            {/* Daily Energy Targets */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl mb-4 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Target Energy</span>
                <span className="text-2xl font-black text-emerald-950">
                  {liveNutrition.calorieRequirement} <span className="text-xs font-normal text-emerald-800">kcal/d</span>
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-800 pt-1 border-t border-emerald-200/50">
                <span>Basal Metabolic Rate (BMR)</span>
                <span className="font-semibold">{liveNutrition.bmr} kcal</span>
              </div>
            </div>

            {/* Projected Macro Target Split */}
            <div className="space-y-2 mb-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Projected Macros</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Protein</span>
                  <span className="text-sm font-black text-slate-800">{liveNutrition.proteinRequirement}g</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Carbs</span>
                  <span className="text-sm font-black text-slate-800">{liveNutrition.carbsRequirement}g</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Fats</span>
                  <span className="text-sm font-black text-slate-800">{liveNutrition.fatRequirement}g</span>
                </div>
              </div>
            </div>

            {/* Recommended Hydration */}
            <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100 mb-6 text-xs text-blue-950 font-semibold">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-blue-500 fill-blue-400" />
                Water Target
              </span>
              <span>8 - 10 Glasses (2.5L)</span>
            </div>

            {/* Submit Action inside Preview */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 active:scale-98 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing 7-Day Protocol...</span>
                </>
              ) : (
                <>
                  <span>Generate Personalized Plan</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-3 leading-tight">
              Calibrated by clinical nutrition rules and micronutrient absorption algorithms.
            </p>
          </div>

          {/* Trust Pillar Note */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-500 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Evidence-Based Safeguards</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              If iron deficiency or anemia is detected in blood tests, NutriAI prioritizes bioavailability: pairing Vitamin C with plant iron, and avoiding tannin inhibitors near meals.
            </p>
          </div>

        </div>

      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <BloodReportUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onAnalyzed={handleReportAnalyzed}
          userProfile={formData}
          currentReport={formData.bloodReport}
        />
      )}

      {/* Viewer Modal */}
      {isViewerModalOpen && formData.bloodReport && (
        <BloodReportViewer
          report={formData.bloodReport}
          onClose={() => setIsViewerModalOpen(false)}
          onReplaceReport={() => {
            setIsViewerModalOpen(false);
            setIsUploadModalOpen(true);
          }}
        />
      )}

      <footer className="text-[11px] text-center text-slate-400 max-w-2xl mx-auto pt-4 pb-8">
        NutriAI precision nutrition engine provides lifestyle and dietary recommendations. Blood test biomarker insights are designed for dietary wellness and do not substitute clinical diagnosis by a licensed physician.
      </footer>
    </form>
  );
}
