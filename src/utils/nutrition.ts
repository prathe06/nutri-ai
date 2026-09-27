import { UserProfile, NutritionTargets } from '../types';

export function calculateNutrition(user: UserProfile): NutritionTargets {
  // BMI calculation
  const heightInMeters = user.height / 100;
  const bmi = user.weight / (heightInMeters * heightInMeters);

  let bmiCategory = 'Normal weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 29.9) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  // BMR calculation (Mifflin-St Jeor Equation)
  let bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age;
  if (user.gender === 'male') {
    bmr += 5;
  } else if (user.gender === 'female') {
    bmr -= 161;
  } else {
    // Average for 'other'
    bmr -= 78;
  }

  // Activity Multiplier
  let activityMultiplier = 1.2;
  switch (user.activityLevel) {
    case 'Sedentary': activityMultiplier = 1.2; break;
    case 'Lightly Active': activityMultiplier = 1.375; break;
    case 'Moderately Active': activityMultiplier = 1.55; break;
    case 'Very Active': activityMultiplier = 1.725; break;
  }

  const maintenanceCalories = bmr * activityMultiplier;

  // Goal adjustment
  let calorieRequirement = maintenanceCalories;
  if (user.healthGoal === 'Weight Loss') {
    calorieRequirement -= 500; // ~0.5kg loss per week
  } else if (user.healthGoal === 'Weight Gain') {
    calorieRequirement += 500; // ~0.5kg gain per week
  }

  // Macronutrient split (General reference, can be adjusted based on preference but keeping standard for now)
  // Protein: 30%, Carbs: 45%, Fat: 25%
  // Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
  
  let proteinPct = 0.30;
  let carbsPct = 0.45;
  let fatPct = 0.25;

  // adjust slightly for vegans to allow more carbs, less protein if hard to hit, but 30 is still good goal.
  
  const proteinRequirement = (calorieRequirement * proteinPct) / 4;
  const carbsRequirement = (calorieRequirement * carbsPct) / 4;
  const fatRequirement = (calorieRequirement * fatPct) / 9;

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee: Math.round(maintenanceCalories),
    calorieRequirement: Math.round(calorieRequirement),
    proteinRequirement: Math.round(proteinRequirement),
    carbsRequirement: Math.round(carbsRequirement),
    fatRequirement: Math.round(fatRequirement),
  };
}

export function getSampleLowIronReport(): import('../types').BloodTestAnalysis {
  return {
    fileName: 'CBC_Iron_Profile_Lab_Report.pdf',
    fileType: 'application/pdf',
    analyzedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    reportType: 'Complete Blood Count & Serum Iron Profile',
    isIronLow: true,
    ironStatus: 'low',
    summary: 'Serum Iron (36 µg/dL) and Hemoglobin (10.2 g/dL) are below standard physiological reference ranges, indicating mild microcytic iron deficiency anemia. Dietary iron enhancement and Vitamin C synergy strongly recommended.',
    keyFindings: [
      'Serum Iron is critically low at 36 µg/dL (Normal: 60 - 170 µg/dL).',
      'Hemoglobin is sub-optimal at 10.2 g/dL (Normal: 12.0 - 15.5 g/dL).',
      'Ferritin is low at 11 ng/mL, indicating depleted intracellular iron reserves.',
      'Total Iron Binding Capacity (TIBC) is elevated at 438 µg/dL, confirming iron hunger.'
    ],
    biomarkers: [
      { name: 'Serum Iron', value: 36, unit: 'µg/dL', referenceRange: '60 - 170', status: 'low', notes: 'Below threshold' },
      { name: 'Hemoglobin (Hb)', value: 10.2, unit: 'g/dL', referenceRange: '12.0 - 15.5', status: 'low', notes: 'Mild anemia' },
      { name: 'Serum Ferritin', value: 11, unit: 'ng/mL', referenceRange: '15 - 150', status: 'low', notes: 'Iron stores depleted' },
      { name: 'Total Iron Binding Capacity (TIBC)', value: 438, unit: 'µg/dL', referenceRange: '240 - 450', status: 'normal', notes: 'Compensatory high' },
      { name: 'Transferrin Saturation', value: 8.2, unit: '%', referenceRange: '20 - 50', status: 'low', notes: 'Reduced iron transport' }
    ],
    ironAdvice: {
      severity: 'moderate',
      overview: 'Prioritize non-heme and heme iron-rich foods at every main meal. Pair non-heme plant iron with ascorbic acid (Vitamin C from fresh lemon juice or amla) to boost absorption by up to 300%.',
      whyFoodMatters: 'Iron is the core building block of hemoglobin, which carries oxygen from lungs to muscles and brain. Replenishing iron stores via consistent nutrition restores energy, reduces brain fog, and prevents exertional fatigue.',
      dailyIronTarget: '18 - 25 mg/day',
      recommendedFoods: [
        { foodName: 'Baby Spinach & Steamed Greens', category: 'Vegetables', portion: '1.5 cups cooked', ironPerServing: '4.8 mg', frequency: 'Daily with Lunch or Dinner', synergyTip: 'Always squeeze fresh lemon juice over cooked greens right before eating.' },
        { foodName: 'Lentils & Chickpea Curry (Dal)', category: 'Legumes', portion: '1.5 bowls (250g)', ironPerServing: '6.6 mg', frequency: 'Daily', synergyTip: 'Cook with tomatoes (Vitamin C) for maximum bio-availability.' },
        { foodName: 'Raw Pumpkin & Hemp Seeds', category: 'Nuts & Seeds', portion: '2 tablespoons (30g)', ironPerServing: '2.5 mg', frequency: 'Morning snack or topping', synergyTip: 'Eat with citrus fruits or berries.' },
        { foodName: 'Black Raisins & Medjool Dates', category: 'Dried Fruit', portion: '4-5 soaked overnight', ironPerServing: '1.8 mg', frequency: 'Early morning empty stomach', synergyTip: 'Drink the soaking water for extra soluble minerals.' }
      ],
      absorptionBoosters: [
        'Fresh lemon / lime juice squeezed over cooked dishes',
        'Indian gooseberry (Amla) juice or citrus wedges',
        'Fermented foods (dosa/idli batter or kimchi) which lower phytate inhibitors',
        'Cooking in traditional cast-iron cookware'
      ],
      absorptionInhibitorsToAvoid: [
        'Black tea, green tea, or coffee within 60 minutes of meals (tannins bind iron)',
        'High-calcium milk or antacids taken directly with iron meals',
        'Excess raw bran or unfermented wheat phytates'
      ]
    }
  };
}
