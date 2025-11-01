/**
 * Gemini AI Service - Intelligent farming assistant with comprehensive context awareness
 * Knows about user's fields, weather, soil conditions, and provides personalized advice
 */

import { weatherService } from './weatherService';
import { fieldDataCacheService } from './fieldDataCacheService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCjjaEuaQMiQxgkUQLlZmGfZEOxRonx9vQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface UserContext {
  fields: FieldInfo[];
  currentWeather?: any;
  location?: { lat: number; lon: number; name: string };
  language: string;
}

export interface FieldInfo {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  area: number;
  cropType?: string;
  plantingDate?: string;
  lastUpdated?: string;
  health?: {
    ndvi: number;
    ndmi: number;
    evi: number;
    savi: number;
    status: string;
  };
  soilData?: any;
  issues?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class GeminiAIService {
  private apiKey: string;
  private conversationHistory: ChatMessage[] = [];
  private userContext: UserContext | null = null;

  constructor(apiKey?: string) {
    // Check localStorage first, then env variable
    const storedKey = localStorage.getItem('gemini_api_key');
    this.apiKey = apiKey || storedKey || GEMINI_API_KEY;
  }

  /**
   * Set API key dynamically
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Load comprehensive user context from localStorage and services
   */
  async loadUserContext(language: string = 'en'): Promise<UserContext> {
    try {
      // Load fields from localStorage
      const fieldsData = localStorage.getItem('myFields');
      const fields: FieldInfo[] = fieldsData ? JSON.parse(fieldsData) : [];

      // Enrich fields with cached data
      const enrichedFields = fields.map(field => {
        const cachedData = fieldDataCacheService.getCachedData(field.id);
        if (cachedData) {
          return {
            ...field,
            health: cachedData.data.health,
            lastUpdated: cachedData.lastUpdated,
          };
        }
        return field;
      });

      // Get current weather if location available
      let currentWeather;
      let location;
      
      try {
        const coords = await weatherService.getCurrentLocation();
        location = { ...coords, name: 'Current Location' };
        currentWeather = await weatherService.getWeatherByCoords(coords.lat, coords.lon);
      } catch (error) {
        console.log('Could not get location/weather:', error);
      }

      this.userContext = {
        fields: enrichedFields,
        currentWeather,
        location,
        language,
      };

      return this.userContext;
    } catch (error) {
      console.error('Error loading user context:', error);
      return {
        fields: [],
        language,
      };
    }
  }

  /**
   * Build comprehensive system prompt with all user context
   */
  private buildSystemPrompt(): string {
    if (!this.userContext) {
      return this.getBaseSystemPrompt();
    }

    const { fields, currentWeather, location, language } = this.userContext;

    let prompt = this.getBaseSystemPrompt();

    // Add language instruction
    const languageMap: { [key: string]: string } = {
      en: 'English',
      hi: 'Hindi (Devanagari script)',
      bn: 'Bengali (Bengali script)',
    };
    prompt += `\n\nIMPORTANT: Respond in ${languageMap[language] || 'English'}. Use simple, farmer-friendly language.`;

    // Add location and weather context
    if (location && currentWeather) {
      prompt += `\n\n## CURRENT LOCATION & WEATHER:
Location: ${currentWeather.location}, ${currentWeather.country}
Temperature: ${currentWeather.current.temp}°C (Feels like: ${currentWeather.current.feels_like}°C)
Humidity: ${currentWeather.current.humidity}%
Weather: ${currentWeather.current.description}
Wind Speed: ${currentWeather.current.wind_speed} km/h
Pressure: ${currentWeather.current.pressure} hPa

5-Day Forecast:
${currentWeather.forecast.map((day: any) => 
  `- ${day.day}: ${day.temp_min}-${day.temp_max}°C, ${day.description}, Rain: ${day.precipitation}%`
).join('\n')}`;
    }

    // Add fields information
    if (fields.length > 0) {
      prompt += `\n\n## USER'S FIELDS (${fields.length} total):`;
      
      fields.forEach((field, index) => {
        prompt += `\n\n### Field ${index + 1}: ${field.name}
- ID: ${field.id}
- Area: ${field.area} hectares
- Location: Lat ${field.location.lat.toFixed(4)}, Lng ${field.location.lng.toFixed(4)}`;

        if (field.cropType) {
          prompt += `\n- Crop: ${field.cropType}`;
        }

        if (field.plantingDate) {
          const plantingDate = new Date(field.plantingDate);
          const daysAgo = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
          prompt += `\n- Planted: ${plantingDate.toLocaleDateString()} (${daysAgo} days ago)`;
        }

        if (field.health) {
          prompt += `\n- Health Status: ${field.health.status}
- NDVI (Vegetation): ${field.health.ndvi.toFixed(3)} ${this.interpretNDVI(field.health.ndvi)}
- NDMI (Moisture): ${field.health.ndmi.toFixed(3)} ${this.interpretNDMI(field.health.ndmi)}
- EVI (Enhanced Vegetation): ${field.health.evi.toFixed(3)}
- SAVI (Soil-Adjusted): ${field.health.savi.toFixed(3)}`;
        }

        if (field.lastUpdated) {
          prompt += `\n- Last Updated: ${new Date(field.lastUpdated).toLocaleString()}`;
        }

        if (field.issues && field.issues.length > 0) {
          prompt += `\n- Issues: ${field.issues.join(', ')}`;
        }
      });
    } else {
      prompt += `\n\n## USER'S FIELDS:
No fields added yet. Encourage the user to add their fields using the Soil Saathi feature to get personalized advice.`;
    }

    return prompt;
  }

  /**
   * Get base system prompt with farming expertise
   */
  private getBaseSystemPrompt(): string {
    return `You are an expert agricultural AI assistant for Indian farmers. Your name is "Krishi Saathi" (Farming Companion).

## YOUR EXPERTISE:
- Crop management (wheat, rice, cotton, sugarcane, vegetables, fruits)
- Soil health and fertility management
- Pest and disease identification and treatment
- Weather-based farming decisions
- Irrigation scheduling and water management
- Fertilizer recommendations (NPK, micronutrients)
- Organic farming practices
- Government schemes and subsidies
- Market prices and selling strategies
- Seasonal crop planning

## YOUR PERSONALITY:
- Friendly, patient, and encouraging
- Use simple language that farmers can understand
- Provide ACTIONABLE advice with specific steps
- Give practical solutions that work in Indian conditions
- Be empathetic to farmer challenges
- Use local measurements (acre, bigha, quintal, kg)
- Reference Indian seasons (Kharif, Rabi, Zaid)

## RESPONSE GUIDELINES:
1. Always acknowledge the user's question
2. Provide specific, actionable advice
3. Include quantities, timings, and methods
4. Warn about risks or precautions
5. Suggest alternatives when possible
6. Use emojis sparingly for clarity (🌾 🌱 💧 ⚠️)
7. Keep responses concise but complete
8. If you don't have enough information, ask clarifying questions

## IMPORTANT CONTEXT AWARENESS:
- You have access to the user's field data, weather, and location
- Use this information to personalize your advice
- Reference specific fields by name when relevant
- Consider current weather in your recommendations
- Alert about weather-related risks
- Suggest timing based on weather forecast`;
  }

  /**
   * Interpret NDVI values
   */
  private interpretNDVI(ndvi: number): string {
    if (ndvi > 0.6) return '(Excellent - Dense healthy vegetation)';
    if (ndvi > 0.4) return '(Good - Healthy vegetation)';
    if (ndvi > 0.2) return '(Moderate - Sparse vegetation)';
    if (ndvi > 0) return '(Poor - Very sparse vegetation)';
    return '(No vegetation)';
  }

  /**
   * Interpret NDMI values
   */
  private interpretNDMI(ndmi: number): string {
    if (ndmi > 0.4) return '(High moisture - Well watered)';
    if (ndmi > 0.2) return '(Moderate moisture)';
    if (ndmi > 0) return '(Low moisture - Needs irrigation)';
    return '(Very dry - Urgent irrigation needed)';
  }

  /**
   * Send message to Gemini AI with full context
   */
  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Check for API key in localStorage if not set
      if (!this.apiKey) {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
          this.apiKey = storedKey;
        } else {
          throw new Error('Gemini API key not configured. Please add your API key in Settings.');
        }
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });

      // Build the full prompt with context
      const systemPrompt = this.buildSystemPrompt();
      
      // Prepare conversation for Gemini
      const contents = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        ...this.conversationHistory.slice(-10).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
      ];

      // Call Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from AI');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      });

      return aiResponse;
    } catch (error) {
      console.error('Gemini AI error:', error);
      throw error;
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Get quick suggestions based on context
   */
  getQuickSuggestions(): string[] {
    if (!this.userContext) {
      return [
        'What crops should I plant this season?',
        'How do I improve soil health?',
        'Tell me about government schemes',
      ];
    }

    const suggestions: string[] = [];
    const { fields, currentWeather } = this.userContext;

    // Weather-based suggestions
    if (currentWeather) {
      const temp = currentWeather.current.temp;
      const humidity = currentWeather.current.humidity;
      
      if (temp > 35) {
        suggestions.push('How to protect crops from heat?');
      }
      if (humidity > 80) {
        suggestions.push('Prevent fungal diseases in high humidity');
      }
      if (currentWeather.forecast.some((d: any) => d.precipitation > 50)) {
        suggestions.push('Prepare for upcoming rain');
      }
    }

    // Field-based suggestions
    if (fields.length > 0) {
      const unhealthyFields = fields.filter(f => f.health && f.health.ndvi < 0.4);
      if (unhealthyFields.length > 0) {
        suggestions.push(`Why is ${unhealthyFields[0].name} showing low vegetation?`);
      }

      const dryFields = fields.filter(f => f.health && f.health.ndmi < 0.2);
      if (dryFields.length > 0) {
        suggestions.push(`When should I irrigate ${dryFields[0].name}?`);
      }

      suggestions.push('Best fertilizer for my fields?');
      suggestions.push('Check my field health status');
    }

    // General suggestions
    suggestions.push('Market prices for crops');
    suggestions.push('Pest control methods');
    suggestions.push('Government subsidies available');

    return suggestions.slice(0, 6);
  }
}

// Create singleton instance
export const geminiAIService = new GeminiAIService();
