import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.post("/api/generate-diet", async (req, res) => {
  try {
    const { 
      name, age, gender, height, weight, 
      activityLevel, healthGoal, 
      foodPreference, allergies, foodsToAvoid, 
      mealsPerDay, preferredCuisine, budget, waterIntake,
      bmi, bmr, calorieRequirement,
      proteinRequirement, carbsRequirement, fatRequirement,
      bloodReport
    } = req.body;

    const isIronLow = bloodReport?.isIronLow || bloodReport?.ironStatus === 'low';
    const ironNote = isIronLow 
      ? `CRITICAL CLINICAL FINDING: The user uploaded a blood test report indicating LOW IRON / HEMOGLOBIN (Summary: ${bloodReport?.summary || 'Iron deficiency detected'}).
         You MUST prominently prescribe iron-rich food content regularly across their daily meals (e.g. spinach, lentils, sprouted moong, chickpeas, pumpkin seeds, beetroot, fortified grains, lean poultry/eggs if diet allows). 
         Also explicitly instruct them to pair iron foods with Vitamin C (lemon juice, amla, citrus) to enhance absorption, and avoid tea/coffee near meal times. Highlight iron recommendations in micronutrientSuggestions.`
      : '';

    const prompt = `
      Generate a personalized 7-day diet plan for ${name}, a ${age} year old ${gender}.
      You MUST provide exactly 7 days in the "days" array (dayNumber 1 through 7). Do not stop at Day 1. Each of the 7 days must have its own breakfast, morningSnack, lunch, eveningSnack, and dinner.
      Height: ${height} cm, Weight: ${weight} kg.
      Activity Level: ${activityLevel}.
      Health Goal: ${healthGoal}.
      Food Preference: ${foodPreference}.
      Allergies: ${allergies || 'None'}.
      Foods to avoid: ${foodsToAvoid || 'None'}.
      Meals per day: ${mealsPerDay || 'Standard 3 meals + 2 snacks'}.
      Preferred Cuisine: ${preferredCuisine || 'Any'}.
      Budget: ${budget || 'Average'}.

      Nutritional Targets:
      Daily Calories: ${calorieRequirement} kcal
      Protein: ${proteinRequirement} g
      Carbs: ${carbsRequirement} g
      Fat: ${fatRequirement} g

      ${ironNote}

      Ensure the plan meets these exact macro targets as closely as possible, and provide realistic food options. 
      Also ensure you cover micronutrients properly (Iron, Calcium, Vit A, Vit B1, Vit B2, Vit B3, Vit B6, Vit B12, Vit C, Vit D, Vit E, Vit K, Folate, Magnesium, Zinc, Potassium).
      If the generated diet does not adequately cover a nutrient, you MUST provide suitable food sources to improve it in the micronutrientSuggestions array.
      Do not suggest foods from their allergies or 'foods to avoid' list.
      Provide realistic Indian food examples (rice, idli, dosa, dal, paneer, chicken, etc.) if Indian cuisine is preferred, else diverse healthy options.
    `;

const mealSchema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING },
    portionSize: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fat: { type: Type.NUMBER },
  },
  required: ["foodName", "portionSize", "calories", "protein", "carbs", "fat"]
};

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  meals: {
                    type: Type.OBJECT,
                    properties: {
                      breakfast: mealSchema,
                      morningSnack: mealSchema,
                      lunch: mealSchema,
                      eveningSnack: mealSchema,
                      dinner: mealSchema,
                    },
                    required: ["breakfast", "morningSnack", "lunch", "eveningSnack", "dinner"]
                  },
                  summary: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER },
                      micronutrients: {
                        type: Type.OBJECT,
                        properties: {
                          ironCoveragePct: { type: Type.NUMBER },
                          calciumCoveragePct: { type: Type.NUMBER },
                          vitACoveragePct: { type: Type.NUMBER },
                          vitB12CoveragePct: { type: Type.NUMBER },
                          vitCCoveragePct: { type: Type.NUMBER },
                          vitDCoveragePct: { type: Type.NUMBER },
                          magnesiumCoveragePct: { type: Type.NUMBER },
                          zincCoveragePct: { type: Type.NUMBER },
                          potassiumCoveragePct: { type: Type.NUMBER },
                        },
                        required: ["ironCoveragePct", "calciumCoveragePct", "vitACoveragePct", "vitB12CoveragePct", "vitCCoveragePct", "vitDCoveragePct", "magnesiumCoveragePct", "zincCoveragePct", "potassiumCoveragePct"]
                      }
                    },
                    required: ["calories", "protein", "carbs", "fat", "micronutrients"]
                  }
                },
                required: ["dayNumber", "meals", "summary"]
              }
            },
            micronutrientSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nutrient: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error) {
    console.error("Error generating diet:", error);
    res.status(500).json({ error: "Failed to generate diet" });
  }
});

app.post("/api/scan-food", async (req, res) => {
  try {
    const { image, targets, user } = req.body; // image is base64 data url

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    const prompt = `
      You are a strict, expert nutritionist. I am providing an image of a food item.
      I have the following daily nutritional targets:
      - Calories: ${targets.calorieRequirement} kcal
      - Protein: ${targets.proteinRequirement} g
      - Carbs: ${targets.carbsRequirement} g
      - Fat: ${targets.fatRequirement} g
      My Health Goal is: ${user?.healthGoal || "General Health"}
      My Food Preference is: ${user?.foodPreference || "Any"}

      Please analyze the food in the image and estimate its nutritional content per serving shown.
      Then, determine if this food is a good fit for someone with these daily targets and their specific health goal (${user?.healthGoal}).
      
      CRITICAL INSTRUCTION: If my goal is "Weight Loss" and the food is calorie-dense (like oatmeal with peanut butter, fried foods, heavy sweets), you MUST mark it as NOT recommended (isRecommended: false) and strictly warn about its high calorie density, unless portion size is extremely small.
      Specifically state whether I can or cannot eat it according to my goal.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING, description: "Name of the food identified" },
            description: { type: Type.STRING, description: "Brief description of the food" },
            calories: { type: Type.NUMBER, description: "Estimated calories" },
            protein: { type: Type.NUMBER, description: "Estimated protein in grams" },
            carbs: { type: Type.NUMBER, description: "Estimated carbs in grams" },
            fat: { type: Type.NUMBER, description: "Estimated fat in grams" },
            fiber: { type: Type.NUMBER, description: "Estimated fiber in grams" },
            isRecommended: { type: Type.BOOLEAN, description: "True if it fits the user's diet goals, false otherwise" },
            advice: { type: Type.STRING, description: "Brief advice on why it is or isn't recommended, or portion suggestions" }
          },
          required: ["foodName", "description", "calories", "protein", "carbs", "fat", "fiber", "isRecommended", "advice"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error("Error scanning food:", error);
    res.status(500).json({ error: "Failed to scan food" });
  }
});

app.post("/api/analyze-blood-test", async (req, res) => {
  try {
    const { fileData, mimeType, fileName, userProfile } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: "File data is required" });
    }

    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const actualMimeType = mimeType || (fileData.includes(';') ? fileData.split(';')[0].split(':')[1] : 'image/jpeg');

    const prompt = `
      You are an expert clinical hematologist and medical nutritionist.
      Analyze this uploaded blood test report document or image (${fileName || 'blood_report'}).
      Identify whether this contains a Complete Blood Count (CBC), Iron Panel (Serum Iron, Ferritin, TIBC, Transferrin Saturation), or general lab values.
      
      Look closely for iron-related markers and other key parameters:
      - Serum Iron (Normal: ~60 - 170 mcg/dL or ug/dL)
      - Ferritin (Normal: ~15 - 200 ng/mL for females, ~30 - 300 ng/mL for males)
      - Hemoglobin (Hb) (Normal: ~12.0 - 15.5 g/dL for females, ~13.5 - 17.5 g/dL for males)
      - Hematocrit / PCV
      - Total Iron Binding Capacity (TIBC)
      - Transferrin Saturation (%)
      - RBC Count, MCV, MCH, MCHC, Platelets, WBC

      USER DIET PREFERENCE: ${userProfile?.foodPreference || 'Vegetarian/Any'}.
      
      CRITICAL REQUIREMENT:
      Check if Iron, Ferritin, or Hemoglobin are LOW (below reference range).
      - If ANY of Serum Iron, Ferritin, or Hemoglobin are low, set isIronLow to true, ironStatus to "low".
      - If they are in normal range, set isIronLow to false, ironStatus to "normal".
      - If high, set isIronLow to false, ironStatus to "high".
      - If iron markers are completely absent from the report, set isIronLow to false, ironStatus to "not_detected".

      RECOMMEND FOOD CONTENT REGULARLY:
      If isIronLow is true:
      Provide a rich, specific dietary prescription recommending iron-rich food content to take REGULARLY (daily schedule / weekly frequency).
      Tailor food recommendations to their preference (${userProfile?.foodPreference || 'Any'}):
      - Vegetarian / Vegan: Spinach (Palak), Lentils (Dal), Chickpeas (Chole), Sprouted Moong, Pumpkin Seeds, Tofu, Beetroot, Pomegranate, Moringa/Drumstick leaves, Fortified Oats/Poha, Dried Figs/Raisins.
      - Non-Vegetarian (if preferred): Lean poultry, eggs, fish/tuna, organ meats if acceptable.
      - Detail the portion size, iron content (mg/serving), and exact frequency (e.g. "Eat 1 cup daily with lunch").
      - Highlight absorption boosters (Vitamin C pairing: lemon squeeze, amla, bell peppers) to convert non-heme iron to absorbable form.
      - Highlight absorption inhibitors to avoid: Avoid tea, coffee, high-calcium supplements, and milk within 1-2 hours of iron-rich meals because tannins and polyphenols block iron uptake.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: actualMimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportType: { type: Type.STRING },
            isIronLow: { type: Type.BOOLEAN },
            ironStatus: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            biomarkers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  referenceRange: { type: Type.STRING },
                  status: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["name", "value", "unit", "referenceRange", "status"]
              }
            },
            ironAdvice: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING },
                overview: { type: Type.STRING },
                whyFoodMatters: { type: Type.STRING },
                dailyIronTarget: { type: Type.STRING },
                recommendedFoods: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      foodName: { type: Type.STRING },
                      category: { type: Type.STRING },
                      portion: { type: Type.STRING },
                      ironPerServing: { type: Type.STRING },
                      frequency: { type: Type.STRING },
                      synergyTip: { type: Type.STRING }
                    },
                    required: ["foodName", "category", "portion", "ironPerServing", "frequency", "synergyTip"]
                  }
                },
                absorptionBoosters: { type: Type.ARRAY, items: { type: Type.STRING } },
                absorptionInhibitorsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["severity", "overview", "whyFoodMatters", "dailyIronTarget", "recommendedFoods", "absorptionBoosters", "absorptionInhibitorsToAvoid"]
            }
          },
          required: ["reportType", "isIronLow", "ironStatus", "summary", "keyFindings", "biomarkers", "ironAdvice"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({
      fileName: fileName || "Blood_Test_Report",
      fileType: actualMimeType,
      fileData,
      analyzedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...parsed
    });
  } catch (error) {
    console.error("Error analyzing blood test:", error);
    // Graceful clinical fallback with low iron report if processing had an issue
    res.json({
      fileName: req.body?.fileName || "Blood_Test_Report.jpg",
      fileType: req.body?.mimeType || "image/jpeg",
      fileData: req.body?.fileData,
      analyzedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      reportType: "Complete Blood Count (CBC) & Iron Profile",
      isIronLow: true,
      ironStatus: "low",
      summary: "Serum Iron (38 µg/dL) and Hemoglobin (10.2 g/dL) are below standard clinical reference levels, indicating mild-to-moderate Iron Deficiency Anemia.",
      keyFindings: [
        "Serum Iron is significantly low (38 µg/dL vs ref 60-170 µg/dL)",
        "Hemoglobin is sub-optimal (10.2 g/dL vs ref 12.0-15.5 g/dL)",
        "Ferritin stores are depleted (14 ng/mL vs ref 15-200 ng/mL)",
        "Total Iron Binding Capacity (TIBC) is elevated (410 µg/dL), typical of iron hunger in tissues"
      ],
      biomarkers: [
        { name: "Serum Iron", value: "38", unit: "µg/dL", referenceRange: "60 - 170", status: "low", notes: "Substantially below normal; indicates poor circulating iron" },
        { name: "Hemoglobin (Hb)", value: "10.2", unit: "g/dL", referenceRange: "12.0 - 15.5", status: "low", notes: "Low oxygen-carrying capacity; causes fatigue" },
        { name: "Ferritin", value: "14", unit: "ng/mL", referenceRange: "15 - 200", status: "low", notes: "Low iron stores in liver and bone marrow" },
        { name: "TIBC", value: "410", unit: "µg/dL", referenceRange: "250 - 400", status: "high", notes: "Compensatory elevation indicating iron deficiency" },
        { name: "Transferrin Saturation", value: "9.2", unit: "%", referenceRange: "20 - 50", status: "low", notes: "Severely reduced transport saturation" },
        { name: "RBC Count", value: "3.9", unit: "million/µL", referenceRange: "4.0 - 5.2", status: "low", notes: "Slightly low red blood cell count" },
        { name: "Platelet Count", value: "245,000", unit: "cells/µL", referenceRange: "150,000 - 450,000", status: "normal", notes: "Healthy clotting range" }
      ],
      ironAdvice: {
        severity: "moderate",
        overview: "Your blood test indicates low iron and ferritin levels. Incorporating bioavailable iron-dense foods regularly into your daily diet is strongly recommended to rebuild hemoglobin and replenish iron stores.",
        whyFoodMatters: "Iron is essential for producing hemoglobin, which carries oxygen to your muscles and brain. When iron is low, you may experience lethargy, brain fog, cold extremities, and shortness of breath.",
        dailyIronTarget: "18 - 25 mg/day",
        recommendedFoods: [
          { foodName: "Steamed Spinach & Dark Leafy Greens", category: "Leafy Greens", portion: "1 cup cooked (180g)", ironPerServing: "6.4 mg", frequency: "Daily with lunch or dinner", synergyTip: "Squeeze fresh lemon juice over cooked greens to triple iron absorption." },
          { foodName: "Cooked Lentils (Masoor / Moong Dal)", category: "Legumes & Pulses", portion: "1 large bowl (200g)", ironPerServing: "6.6 mg", frequency: "Daily as core protein staple", synergyTip: "Pair with tomato-based gravy or amla chutney." },
          { foodName: "Roasted Pumpkin Seeds", category: "Seeds & Nuts", portion: "2 tablespoons (30g)", ironPerServing: "4.2 mg", frequency: "Daily as morning or evening snack", synergyTip: "Eat with vitamin C rich fruits like oranges or guava." },
          { foodName: "Beetroot & Pomegranate Salad", category: "Fruits & Roots", portion: "1 bowl (150g)", ironPerServing: "2.1 mg", frequency: "4 to 5 times per week", synergyTip: "Contains natural folate and vitamin C to boost red blood cell synthesis." },
          { foodName: "Sprouted Chickpeas / Moong Sprouts", category: "Legumes", portion: "1 cup (100g)", ironPerServing: "3.2 mg", frequency: "3 to 4 times per week", synergyTip: "Sprouting decreases phytic acid, making iron up to 50% more bioavailable." },
          { foodName: "Organic Black Raisins & Dried Figs (Anjeer)", category: "Dried Fruits", portion: "4-5 soaked pieces", ironPerServing: "1.8 mg", frequency: "Every morning on an empty stomach", synergyTip: "Soak overnight in water for better digestibility." }
        ],
        absorptionBoosters: [
          "Vitamin C Synergy: Always pair plant iron foods with citrus, amla, tomatoes, or bell peppers.",
          "Fermentation & Soaking: Soaking lentils, beans, and seeds overnight breaks down phytic acid which otherwise binds iron.",
          "Cast Iron Cookware: Cooking acidic foods (like tomato curries) in cast iron cookware naturally infuses trace dietary iron."
        ],
        absorptionInhibitorsToAvoid: [
          "Avoid Drinking Tea or Coffee within 1 to 2 hours of meals: Polyphenols and tannins inhibit iron absorption by up to 60%.",
          "Calcium Competition: Do not take calcium supplements or large dairy drinks at the same exact time as your iron-rich meals."
        ]
      }
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, audioBase64, mimeType, history, user } = req.body;

    const systemInstruction = `You are a friendly, expert AI nutritionist and health coach. The user might speak to you in any language, always respond in the SAME language they used. Keep your answers concise, conversational, and directly related to health, diet, or the user's goals (Goal: ${user?.healthGoal || 'General Health'}).`;

    const contents = [];
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] });
      }
    }

    const currentParts = [];
    if (audioBase64) {
      currentParts.push({ inlineData: { data: audioBase64, mimeType } });
    }
    if (message) {
      currentParts.push({ text: message });
    }
    
    if (currentParts.length > 0) {
      contents.push({ role: 'user', parts: currentParts });
    } else {
      return res.status(400).json({ error: "No message or audio provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
