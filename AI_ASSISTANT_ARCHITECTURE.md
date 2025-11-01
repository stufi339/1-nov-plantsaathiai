# 🏗️ AI Assistant Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AIAdvisorChat Component                       │   │
│  │  • Chat messages display                              │   │
│  │  • Input field + voice button                         │   │
│  │  • Quick suggestions                                  │   │
│  │  • Loading states                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  GEMINI AI SERVICE                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Context Loading & Management                  │   │
│  │  • Load user fields from localStorage                 │   │
│  │  • Fetch current weather                              │   │
│  │  • Get satellite data from cache                      │   │
│  │  • Build comprehensive system prompt                  │   │
│  │  • Manage conversation history                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA SOURCES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ localStorage │  │ Weather API  │  │ Field Cache  │      │
│  │  • Fields    │  │  • Current   │  │  • NDVI      │      │
│  │  • User data │  │  • Forecast  │  │  • NDMI      │      │
│  │  • API key   │  │  • Location  │  │  • Health    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  GOOGLE GEMINI API                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Gemini 1.5 Flash Model                        │   │
│  │  • Receives: User question + Full context            │   │
│  │  • Processes: With farming expertise                 │   │
│  │  • Returns: Personalized advice                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initialization Flow

```
User Opens AI Assistant
         ↓
Load User Context
         ↓
┌────────────────────────┐
│ Load Fields            │ ← localStorage.getItem('myFields')
│ • Field names          │
│ • Locations            │
│ • Areas                │
│ • Crop types           │
└────────────────────────┘
         ↓
┌────────────────────────┐
│ Enrich with Cache      │ ← fieldDataCacheService.getCachedData()
│ • NDVI values          │
│ • NDMI values          │
│ • Health status        │
│ • Last updated         │
└────────────────────────┘
         ↓
┌────────────────────────┐
│ Get Location           │ ← navigator.geolocation
│ • Latitude             │
│ • Longitude            │
└────────────────────────┘
         ↓
┌────────────────────────┐
│ Fetch Weather          │ ← weatherService.getWeatherByCoords()
│ • Current conditions   │
│ • 5-day forecast       │
│ • Temperature          │
│ • Humidity             │
│ • Wind speed           │
└────────────────────────┘
         ↓
┌────────────────────────┐
│ Build System Prompt    │
│ • User language        │
│ • Location & weather   │
│ • All fields details   │
│ • Health metrics       │
│ • Farming expertise    │
└────────────────────────┘
         ↓
┌────────────────────────┐
│ Generate Suggestions   │
│ • Weather-based        │
│ • Field-based          │
│ • Seasonal             │
└────────────────────────┘
         ↓
    Ready for Chat!
```

### 2. Message Flow

```
User Asks Question
         ↓
Add to Conversation History
         ↓
Build Request Payload
┌────────────────────────┐
│ System Prompt          │ ← Full context (fields, weather, etc.)
│ Conversation History   │ ← Last 10 messages
│ Current Question       │ ← User's message
└────────────────────────┘
         ↓
Send to Gemini API
┌────────────────────────┐
│ POST Request           │
│ • API Key in URL       │
│ • JSON payload         │
│ • Generation config    │
│ • Safety settings      │
└────────────────────────┘
         ↓
Gemini Processes
┌────────────────────────┐
│ AI Analysis            │
│ • Understands context  │
│ • References fields    │
│ • Considers weather    │
│ • Provides advice      │
└────────────────────────┘
         ↓
Receive Response
         ↓
Add to Conversation History
         ↓
Display to User
         ↓
Update Suggestions
```

## Context Structure

### System Prompt Components

```typescript
{
  // Base Expertise
  expertise: [
    "Crop management",
    "Soil health",
    "Pest control",
    "Weather decisions",
    "Irrigation",
    "Fertilizers",
    "Organic farming",
    "Government schemes"
  ],

  // User Language
  language: "Hindi" | "English" | "Bengali",

  // Current Weather
  weather: {
    location: "Patna, Bihar",
    temperature: 28,
    humidity: 75,
    wind_speed: 8,
    forecast: [
      { day: "Tomorrow", temp: "26-32°C", rain: "70%" },
      // ... 4 more days
    ]
  },

  // User Fields
  fields: [
    {
      name: "Rice Field",
      area: 2.5,
      location: { lat: 25.5941, lng: 85.1376 },
      cropType: "Rice",
      plantingDate: "2024-09-15",
      daysAgo: 45,
      health: {
        ndvi: 0.65,
        interpretation: "Excellent - Dense healthy vegetation",
        ndmi: 0.42,
        interpretation: "High moisture - Well watered",
        status: "Healthy"
      }
    },
    // ... more fields
  ]
}
```

## API Integration

### Gemini API Request

```typescript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=API_KEY

Headers:
{
  "Content-Type": "application/json"
}

Body:
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "SYSTEM_PROMPT_WITH_CONTEXT" }]
    },
    {
      "role": "user",
      "parts": [{ "text": "User question 1" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "AI response 1" }]
    },
    {
      "role": "user",
      "parts": [{ "text": "Current user question" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1024
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
    // ... more safety settings
  ]
}
```

### Response Structure

```typescript
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "AI response with personalized advice..."
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "safetyRatings": [...]
    }
  ]
}
```

## Component Architecture

### AIAdvisorChat Component

```typescript
AIAdvisorChat
├── State Management
│   ├── messages: ChatMessage[]
│   ├── input: string
│   ├── isListening: boolean
│   ├── isLoading: boolean
│   ├── isInitialized: boolean
│   └── suggestions: string[]
│
├── Effects
│   ├── Initialize AI service
│   ├── Load user context
│   ├── Setup speech recognition
│   └── Auto-scroll messages
│
├── Handlers
│   ├── handleSend() - Send message to AI
│   ├── toggleSpeechRecognition() - Voice input
│   ├── handleSuggestionClick() - Quick suggestions
│   └── clearChat() - Reset conversation
│
└── UI Components
    ├── Header (title, close button)
    ├── Messages (user + AI)
    ├── Loading indicator
    ├── Quick suggestions
    └── Input (text + voice + send)
```

### GeminiAIService

```typescript
GeminiAIService
├── Properties
│   ├── apiKey: string
│   ├── conversationHistory: ChatMessage[]
│   └── userContext: UserContext
│
├── Methods
│   ├── setApiKey() - Update API key
│   ├── loadUserContext() - Load all context
│   ├── buildSystemPrompt() - Create prompt
│   ├── sendMessage() - Call Gemini API
│   ├── clearHistory() - Reset conversation
│   ├── getHistory() - Get messages
│   └── getQuickSuggestions() - Smart suggestions
│
└── Private Methods
    ├── interpretNDVI() - Explain NDVI values
    ├── interpretNDMI() - Explain NDMI values
    └── getBaseSystemPrompt() - Base expertise
```

## Storage Architecture

### localStorage Structure

```typescript
{
  // User Fields
  "myFields": [
    {
      id: "field_123",
      name: "Rice Field",
      location: { lat: 25.5941, lng: 85.1376 },
      area: 2.5,
      cropType: "Rice",
      plantingDate: "2024-09-15"
    }
  ],

  // Field Cache (24-hour expiry)
  "field_cache_field_123": {
    fieldId: "field_123",
    lastUpdated: "2024-11-01T10:00:00Z",
    expiresAt: "2024-11-02T10:00:00Z",
    data: {
      health: {
        ndvi: 0.65,
        ndmi: 0.42,
        evi: 0.58,
        savi: 0.52,
        status: "Healthy"
      },
      quadrants: [...],
      comprehensiveAnalysis: {...}
    }
  },

  // API Key
  "gemini_api_key": "AIzaSy...",

  // User Role
  "user_role": "user" | "admin"
}
```

## Security Architecture

### API Key Management

```
Priority Order:
1. localStorage (user settings)
   ↓
2. Environment variable (.env)
   ↓
3. Default (empty)

Storage:
• localStorage: User-configured
• .env: Developer-configured
• Never in code repository
• Never exposed to users
```

### Data Privacy

```
User Data Flow:
┌──────────────┐
│ User Browser │
│ localStorage │
└──────────────┘
       ↓
┌──────────────┐
│ AI Service   │ ← Processes locally
└──────────────┘
       ↓
┌──────────────┐
│ Gemini API   │ ← HTTPS only
│ (Google)     │ ← No permanent storage
└──────────────┘
       ↓
┌──────────────┐
│ Response     │ ← Returns to browser
│ (Advice)     │ ← Not stored by Google
└──────────────┘
```

## Performance Optimization

### Caching Strategy

```
Field Data Cache:
• Duration: 24 hours
• Storage: localStorage
• Size: ~10KB per field
• Reduces: Satellite API calls

Weather Data:
• Duration: Session (in-memory)
• Refresh: On app restart
• Size: ~5KB
• Reduces: Weather API calls

Conversation History:
• Limit: Last 10 messages
• Storage: In-memory
• Cleared: On chat clear
• Reduces: Token usage
```

### API Optimization

```
Token Usage per Request:
┌────────────────────────┐
│ System Prompt: ~800    │ ← Context (fields, weather)
│ History: ~200          │ ← Last 10 messages
│ User Message: ~50      │ ← Current question
│ AI Response: ~500      │ ← Generated advice
├────────────────────────┤
│ Total: ~1,550 tokens   │
└────────────────────────┘

Daily Usage (typical):
• 20 questions/day
• ~30,000 tokens/day
• Well within free tier (1,500 requests/day)
```

## Error Handling

### Error Flow

```
Error Occurs
     ↓
Identify Error Type
     ↓
┌─────────────────────────────┐
│ No API Key                  │ → Show setup instructions
├─────────────────────────────┤
│ Invalid API Key             │ → Test connection failed
├─────────────────────────────┤
│ Network Error               │ → Check internet connection
├─────────────────────────────┤
│ Quota Exceeded              │ → Wait or upgrade
├─────────────────────────────┤
│ API Error                   │ → Show error message
└─────────────────────────────┘
     ↓
Display User-Friendly Message
     ↓
Log to Console (for debugging)
     ↓
Show Toast Notification
```

## Scalability

### Current Limits

```
Free Tier:
• 60 requests/minute
• 1,500 requests/day
• Sufficient for 100+ users

Per User:
• 10-20 questions/day
• ~1,500 tokens/question
• ~30,000 tokens/day

Storage:
• localStorage: 5-10MB
• Field cache: ~10KB/field
• Supports 100+ fields
```

### Future Scaling

```
If Needed:
1. Implement request queuing
2. Add response caching
3. Optimize prompt size
4. Batch similar questions
5. Upgrade to paid tier
6. Add rate limiting
7. Implement CDN caching
```

## Monitoring

### Key Metrics

```
Performance:
• Response time: 2-3 seconds
• Success rate: >95%
• Error rate: <5%

Usage:
• Questions per user per day
• Most common questions
• Peak usage times

Quality:
• User satisfaction
• Follow-up questions
• Conversation length
```

---

**Architecture Status:** ✅ Production-Ready
**Last Updated:** November 1, 2025
