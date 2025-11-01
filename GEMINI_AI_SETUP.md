# 🤖 Intelligent AI Assistant with Gemini API

## Overview

The AI Assistant (Krishi Saathi) is now powered by Google's Gemini AI and has comprehensive knowledge about:

- ✅ **All your fields** - Names, locations, areas, crop types, planting dates
- ✅ **Real-time field health** - NDVI, NDMI, EVI, SAVI indices with interpretations
- ✅ **Current weather** - Temperature, humidity, wind, pressure at your location
- ✅ **5-day forecast** - Upcoming weather conditions and rain predictions
- ✅ **Soil conditions** - Moisture levels, health status, issues
- ✅ **Personalized advice** - Based on YOUR specific fields and weather

## Features

### 🧠 Context-Aware Intelligence

The AI assistant knows:
- Your field names and can reference them specifically
- Current vegetation health (NDVI) and moisture levels (NDMI)
- Days since planting for each field
- Current temperature and weather at your location
- Upcoming rain and weather changes
- Any issues or alerts for your fields

### 💬 Natural Conversation

- Multi-language support (English, Hindi, Bengali)
- Voice input in your preferred language
- Remembers conversation context
- Provides actionable, step-by-step advice
- Uses farmer-friendly language

### ⚡ Quick Suggestions

Smart suggestions based on:
- Current weather conditions (heat alerts, rain warnings)
- Field health status (low NDVI, dry soil)
- Seasonal recommendations
- Common farming questions

## Setup Instructions

### ⚡ Quick Start - No Setup Required!

**Good News:** The AI assistant comes pre-configured with a shared API key!

**Just open the app and start using it immediately!**

1. Open the app
2. Click the AI Assistant icon (🤖) in the bottom navigation
3. Start asking questions - it works right away!

### Optional: Use Your Own API Key

If you want to use your own Gemini API key (for higher quota or personal use):

#### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

#### Step 2: Configure API Key

**Option A: Via App Settings (Easiest)**

1. Open Plant Saathi app
2. Go to Profile → AI Assistant
3. Paste your API key
4. Click "Save API Key"
5. Click "Test Connection"

**Option B: Environment Variable**

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Restart the development server

#### Step 3: Test the Assistant

1. Open the app
2. Click the AI Assistant icon (🤖) in the bottom navigation
3. Try asking:
   - "What's the health status of my fields?"
   - "Should I irrigate today?"
   - "What crops are best for current weather?"
   - "How to protect from upcoming rain?"

## Example Conversations

### Field-Specific Advice

**User:** "Why is my rice field showing low vegetation?"

**AI:** "I can see your Rice Field has an NDVI of 0.32, which indicates sparse vegetation. Based on the current temperature of 28°C and humidity of 75%, here's what you should do:

1. **Check Soil Moisture**: Your NDMI is 0.18 (low moisture). Irrigate immediately with 2-3 inches of water.
2. **Fertilizer Application**: Apply Urea (10kg/acre) with irrigation for better nitrogen availability.
3. **Pest Check**: Inspect for stem borer - common in this weather. Look for dead hearts.
4. **Timing**: Best time to irrigate is 6-8 PM today to avoid evaporation.

The field was planted 45 days ago, so it's in the tillering stage. This is critical for yield!"

### Weather-Based Advice

**User:** "Should I spray pesticides today?"

**AI:** "Based on current conditions:
- Temperature: 32°C ✅
- Wind Speed: 8 km/h ✅
- Rain Forecast: 60% tomorrow ❌

**Recommendation**: DON'T spray today! Rain tomorrow will wash away the pesticide. Wait until day after tomorrow when:
- No rain expected
- Temperature will be 30°C
- Wind will be calm

Save your money and spray when it's effective. Use this time to prepare the spray solution and check equipment."

### Seasonal Planning

**User:** "What should I plant next month?"

**AI:** "Based on your location (Patna, Bihar) and upcoming Rabi season:

**Best Crops for November Planting:**
1. **Wheat** - Ideal temperature (15-25°C expected)
   - Variety: HD-2967, PBW-343
   - Seed rate: 40kg/acre
   - First irrigation: 20-25 days

2. **Mustard** - High market demand
   - Variety: Pusa Bold
   - Seed rate: 1.5kg/acre
   - Ready in 90-100 days

3. **Chickpea** - Good for your soil type
   - Variety: Pusa-256
   - Seed rate: 30kg/acre
   - Needs less water

Your Field 1 (2.5 hectares) is perfect for wheat. Field 2 (1 hectare) can be used for mustard for crop rotation."

## How It Works

### Context Loading

When you open the AI assistant, it automatically:

1. **Loads Your Fields**
   ```typescript
   const fieldsData = localStorage.getItem('myFields');
   ```

2. **Gets Current Weather**
   ```typescript
   const weather = await weatherService.getWeatherByCoords(lat, lon);
   ```

3. **Enriches with Satellite Data**
   ```typescript
   const cachedData = fieldDataCacheService.getCachedData(fieldId);
   ```

4. **Builds Comprehensive Context**
   - All field details with health metrics
   - Current weather and 5-day forecast
   - Soil moisture and vegetation indices
   - Any issues or alerts

### AI Processing

The AI receives:
- Your question
- Complete field context
- Weather data
- Conversation history (last 10 messages)

And provides:
- Specific advice for YOUR fields
- Weather-appropriate recommendations
- Actionable steps with quantities and timings
- Warnings about risks

## API Usage & Costs

### Gemini API Pricing (Free Tier)

- **Free Quota**: 60 requests per minute
- **Rate Limit**: 1,500 requests per day
- **Cost**: FREE for most users

### Typical Usage

- Average conversation: 5-10 messages
- Context loading: ~1000 tokens per request
- Response: ~500 tokens
- Daily usage: ~50-100 requests (well within free tier)

### Optimization

The service automatically:
- Caches field data (24 hours)
- Limits conversation history (last 10 messages)
- Uses efficient prompts
- Reuses weather data

## Troubleshooting

### "API key not configured"

**Solution**: Add your Gemini API key to `.env` file or directly in the service file.

### "API quota exceeded"

**Solution**: 
- Wait for quota reset (resets every minute)
- Check if you're making too many requests
- Consider upgrading to paid tier if needed

### "No response from AI"

**Solution**:
- Check internet connection
- Verify API key is valid
- Check browser console for errors
- Try rephrasing your question

### Voice input not working

**Solution**:
- Use Chrome or Edge browser (best support)
- Allow microphone permissions
- Check if microphone is working
- Use text input as alternative

## Advanced Features

### Custom System Prompts

Edit `src/lib/geminiAIService.ts` to customize:
- AI personality
- Response style
- Expertise areas
- Language preferences

### Field Data Integration

The AI automatically integrates:
- Satellite indices (NDVI, NDMI, EVI, SAVI)
- Soil analysis data
- Disease detection results
- Yield predictions
- Market intelligence

### Multi-Language Support

Automatically responds in:
- English (en)
- Hindi (hi) - Devanagari script
- Bengali (bn) - Bengali script

Language is detected from user's app settings.

## Privacy & Security

- ✅ All data processed securely via HTTPS
- ✅ No data stored on Google servers permanently
- ✅ Field data stays in your browser's localStorage
- ✅ API key is never exposed to users
- ✅ Conversation history cleared on demand

## Future Enhancements

- [ ] Image analysis (send field photos to AI)
- [ ] Voice responses (text-to-speech)
- [ ] Offline mode with cached responses
- [ ] Integration with disease detection
- [ ] Market price predictions
- [ ] Crop yield forecasting
- [ ] Government scheme recommendations
- [ ] Community knowledge sharing

## Support

If you need help:
1. Check this guide first
2. Review console logs for errors
3. Verify API key is correct
4. Test with simple questions first
5. Clear chat and try again

## Credits

- **AI Model**: Google Gemini 1.5 Flash
- **Weather Data**: OpenWeather API
- **Satellite Data**: Google Earth Engine
- **Voice Input**: Web Speech API

---

**Ready to use!** Just add your Gemini API key and start chatting with your intelligent farming assistant! 🌾🤖
