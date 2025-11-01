import { DiseaseResult } from "./DiseaseResultCard";

export const mockDiseaseResult: DiseaseResult = {
  disease_name: "Late Blight",
  confidence: 0.87,
  disease_stage: "Moderate",
  symptoms: [
    "Dark brown to black lesions on leaves",
    "White fuzzy growth on leaf undersides during humid conditions",
    "Rapid spreading of lesions during wet weather",
    "Yellowing and wilting of affected leaves",
    "Brown spots on stems and petioles"
  ],
  action_plan: [
    "Remove and destroy all affected plant parts immediately",
    "Apply copper-based fungicide spray within 24 hours",
    "Improve air circulation around plants",
    "Avoid overhead watering to reduce leaf wetness",
    "Monitor surrounding plants for early symptoms"
  ],
  treatments: {
    organic: [
      "Copper sulfate spray (2-3 grams per liter) - Apply early morning or evening",
      "Baking soda solution (5 grams per liter) with liquid soap - Weekly application",
      "Neem oil spray (10ml per liter) - Apply during cooler hours",
      "Bordeaux mixture (1% solution) - Preventive spray every 10-14 days"
    ],
    chemical: [
      "Mancozeb 75% WP (2 grams per liter) - Apply with proper protective equipment",
      "Chlorothalonil 75% WP (2 grams per liter) - Avoid application during flowering",
      "Metalaxyl + Mancozeb (2.5 grams per liter) - Systemic and contact action",
      "Cymoxanil + Famoxadone (1.5 grams per liter) - For severe infections"
    ],
    ipm: [
      "Combine resistant varieties with cultural practices",
      "Use weather-based disease forecasting systems",
      "Rotate with non-host crops for 2-3 seasons",
      "Integrate biological control agents like Trichoderma",
      "Monitor with pheromone traps and regular scouting"
    ],
    cultural: [
      "Plant resistant or tolerant varieties when available",
      "Ensure proper plant spacing for air circulation",
      "Use drip irrigation instead of overhead sprinklers",
      "Remove crop residues and weeds that harbor the pathogen",
      "Avoid working in fields when plants are wet"
    ]
  },
  recommended_videos: [
    "Late blight disease management in tomatoes and potatoes",
    "Organic fungicide application techniques for vegetable crops",
    "Identifying early symptoms of late blight disease",
    "Integrated pest management for solanaceous crops"
  ],
  faqs: [
    {
      question: "How quickly does late blight spread?",
      answer: "Late blight can spread very rapidly under favorable conditions (cool, wet weather). It can destroy an entire field within 7-10 days if left untreated. The disease spreads through airborne spores that can travel several kilometers."
    },
    {
      question: "Can I save seeds from infected plants?",
      answer: "No, never save seeds from plants that showed any signs of late blight. The pathogen can survive in seeds and tubers, leading to infection in the next growing season. Always use certified disease-free seeds and planting material."
    },
    {
      question: "Is late blight the same as early blight?",
      answer: "No, they are different diseases caused by different pathogens. Late blight is caused by Phytophthora infestans and spreads rapidly in cool, wet conditions. Early blight is caused by Alternaria species and typically occurs in warmer, humid conditions."
    },
    {
      question: "How can I prevent late blight in future seasons?",
      answer: "Prevention includes using resistant varieties, ensuring good air circulation, avoiding overhead irrigation, removing crop debris, rotating crops, and applying preventive fungicide sprays during high-risk weather conditions."
    }
  ],
  tips: [
    "Monitor weather forecasts - late blight thrives in cool (15-20°C), wet conditions",
    "Inspect plants weekly, especially during humid weather or after rain",
    "Remove volunteer potato plants and tomato suckers that can harbor the disease",
    "Store harvested potatoes in cool, dry, well-ventilated areas",
    "Clean tools and equipment between fields to prevent disease spread",
    "Plant in well-draining soil and avoid low-lying, poorly drained areas",
    "Consider using plastic mulch to reduce soil splash onto lower leaves"
  ],
  yield_impact: "High",
  spread_risk: "High", 
  recovery_chance: "Fair",
  model_version: "PlantSaathi-Disease-v2.1"
};

export const mockImageUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRhNWU0YSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RGlzZWFzZWQgUGxhbnQgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=";