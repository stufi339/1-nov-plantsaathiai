# Disease Detection - System Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                  DiseaseDetectionView.tsx                       │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Capture  │→ │ Analyze  │→ │ Outbreak │→ │ Results  │      │
│  │  Image   │  │  Image   │  │  Prompt  │  │  Display │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         diseaseDetectionService.ts                     │   │
│  │                                                        │   │
│  │  • analyzeDisease()                                   │   │
│  │  • saveDiseaseOutbreak()                              │   │
│  │  • getDiseaseOutbreaks()                              │   │
│  │  • getAllFieldsWithDiseases()                         │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                    ↓                           ↓
┌──────────────────────────────┐  ┌──────────────────────────────┐
│      EXTERNAL API            │  │     LOCAL STORAGE            │
│                              │  │                              │
│  Supabase Edge Function      │  │  field_<id>_data             │
│  /analyze-disease            │  │  {                           │
│                              │  │    disease_outbreaks: [...]  │
│  • Image Analysis            │  │  }                           │
│  • Disease Detection         │  │                              │
│  • Treatment Recommendations │  │  • Offline Access            │
│  • Confidence Scoring        │  │  • Persistent Storage        │
└──────────────────────────────┘  └──────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BLACK BOX SERVICE                            │
│                                                                 │
│  • User Interaction Logging                                    │
│  • API Call Tracking                                           │
│  • Error Logging                                               │
│  • Analytics Data Collection                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Component Structure

```
src/
├── components/
│   └── disease/
│       ├── DiseaseDetectionView.tsx      ← Main component
│       ├── DiseaseResultCard.tsx         ← Results display
│       ├── TreatmentRecommendations.tsx  ← Treatment UI
│       └── EducationalResources.tsx      ← Learning resources
│
├── lib/
│   ├── diseaseDetectionService.ts        ← API & storage service
│   ├── blackBoxService.ts                ← Analytics logging
│   ├── audioService.ts                   ← Audio narration
│   └── reportService.ts                  ← PDF/WhatsApp sharing
│
└── test-disease-api.js                   ← API testing script
```

## 🔄 Data Flow Diagram

### 1. Image Capture Flow
```
User Action
    ↓
Camera/Gallery Input
    ↓
FileReader API
    ↓
Base64 Conversion
    ↓
State Update (selectedImage)
    ↓
Preview Display
```

### 2. Analysis Flow
```
User Clicks "Analyze"
    ↓
diseaseDetectionService.analyzeDisease()
    ↓
HTTP POST to Supabase
    ↓
API Processing (2-3s)
    ↓
Response Parsing
    ↓
Type Normalization
    ↓
State Update (diseaseResult)
    ↓
Outbreak Prompt Display
```

### 3. Outbreak Tracking Flow
```
User Confirms Outbreak
    ↓
Load User Fields from localStorage
    ↓
Display Field Selection UI
    ↓
User Selects Field
    ↓
diseaseDetectionService.saveDiseaseOutbreak()
    ↓
Read field_<id>_data from localStorage
    ↓
Append to disease_outbreaks array
    ↓
Write back to localStorage
    ↓
Log to Black Box
    ↓
Show Success Message
    ↓
Display Results
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────┐
│         Client Application              │
│                                         │
│  • API Key stored in service file       │
│  • Bearer token for authentication      │
│  • No sensitive data in localStorage    │
└─────────────────────────────────────────┘
                    ↓
            HTTPS Connection
                    ↓
┌─────────────────────────────────────────┐
│      Supabase Edge Function             │
│                                         │
│  • API Key validation                   │
│  • Bearer token verification            │
│  • Rate limiting                        │
│  • Request validation                   │
└─────────────────────────────────────────┘
```

## 💾 Storage Architecture

### localStorage Structure
```javascript
{
  // Field Data
  "field_abc123_data": {
    "fieldName": "Rice Field 1",
    "fieldId": "abc123",
    "disease_outbreaks": [
      {
        "fieldId": "abc123",
        "fieldName": "Rice Field 1",
        "disease_name": "Black Rot",
        "confidence": 0.95,
        "detected_at": "2025-10-27T10:30:00Z",
        "image": "data:image/png;base64,...",
        "treatments": { ... },
        "yield_impact": "High",
        "recovery_chance": "Fair"
      }
    ],
    // Other field data...
  },
  
  // Black Box Logs
  "blackbox_user_interaction_session_xyz": [...],
  "blackbox_error_session_xyz": [...],
  "blackbox_audio_interaction_session_xyz": [...]
}
```

## 🎯 State Management

### Component State
```typescript
interface DiseaseDetectionState {
  selectedImage: string | null;
  analysisState: "capture" | "analyzing" | "outbreak_prompt" | "results";
  diseaseResult: DiseaseResult | null;
  apiError: string | null;
  userFields: Array<{ id: string; name: string }>;
}
```

### State Transitions
```
capture → analyzing → outbreak_prompt → results
   ↑                                       ↓
   └───────────────────────────────────────┘
              (Retake Photo)
```

## 🔌 API Integration

### Request Pipeline
```
Component
    ↓
diseaseDetectionService.analyzeDisease()
    ↓
fetch() with headers
    ↓
Supabase Edge Function
    ↓
AI Model Processing
    ↓
Response JSON
    ↓
Type Normalization
    ↓
Component State Update
```

### Error Handling Pipeline
```
API Call
    ↓
Try/Catch Block
    ↓
Error Detected
    ↓
blackBoxService.logError()
    ↓
setApiError(message)
    ↓
Display Error UI
    ↓
Allow Retry
```

## 📊 Analytics Architecture

### Black Box Logging
```
User Action
    ↓
blackBoxService.logUserInteraction()
    ↓
Create Log Entry
    ↓
Add to Memory Array
    ↓
Persist to localStorage
    ↓
Queue for Backend Sync (future)
```

### Logged Events
- Image capture (method, size, type)
- Analysis start (timestamp)
- Analysis complete (disease, confidence)
- Outbreak decision (yes/no)
- Field selection (field ID, name)
- API errors (type, message, stack)
- Audio interactions (play, pause, complete)

## 🎨 UI Component Hierarchy

```
DiseaseDetectionView
├── Header
│   ├── Back Button
│   └── Title & Description
│
├── Content (conditional)
│   ├── Capture State
│   │   ├── Camera Input
│   │   ├── Gallery Input
│   │   └── Tips Card
│   │
│   ├── Analyzing State
│   │   └── Loading Spinner
│   │
│   ├── Outbreak Prompt State
│   │   ├── Confirmation Message
│   │   └── Field Selection List
│   │
│   └── Results State
│       └── DiseaseResultCard
│           ├── Disease Info
│           ├── Impact Badges
│           ├── Image Preview
│           ├── Symptoms List
│           ├── Action Plan
│           ├── TreatmentRecommendations
│           └── EducationalResources
│
└── Navigation
```

## 🚀 Performance Optimization

### Image Handling
```
User Selects Image
    ↓
FileReader.readAsDataURL()
    ↓
Base64 Encoding
    ↓
(Future: Compression)
    ↓
API Upload
```

### Storage Optimization
```
New Outbreak Record
    ↓
Check Storage Quota
    ↓
If > 80% Full
    ↓
Cleanup Old Sessions
    ↓
Trim to Last 50 Records
    ↓
Save New Record
```

## 🔄 Offline Capability

### Current Implementation
- Disease results stored in localStorage
- Outbreak history persists offline
- Black box logs cached locally

### Future Enhancement
```
Online Mode
    ↓
API Call Success
    ↓
Cache Response
    ↓
Save to localStorage
    ↓
Mark as Synced

Offline Mode
    ↓
Check localStorage Cache
    ↓
Display Cached Results
    ↓
Queue for Sync
    ↓
Sync When Online
```

## 🧪 Testing Architecture

### Test Layers
```
Unit Tests (Future)
    ↓
Integration Tests
    ↓
API Tests (test-disease-api.js)
    ↓
E2E Tests (Future)
```

### Current Test Coverage
- ✅ API connectivity
- ✅ Authentication
- ✅ Request/response format
- ✅ Error handling
- ⏳ Component testing (future)
- ⏳ Storage testing (future)

## 📈 Scalability Considerations

### Current Limits
- localStorage: ~5MB per domain
- Image size: Recommended < 5MB
- Outbreaks per field: Unlimited (trimmed at 50)

### Future Scaling
```
Current: localStorage
    ↓
Phase 2: IndexedDB (larger storage)
    ↓
Phase 3: Backend Database
    ↓
Phase 4: CDN for Images
```

## 🔗 Integration Points

### With Other Features
```
Disease Detection
    ↓
├─→ Soil Saathi (field data)
├─→ Black Box (analytics)
├─→ Audio Service (accessibility)
├─→ Report Service (PDF/sharing)
└─→ Yield Prediction (future: disease impact)
```

## 🎯 Key Design Decisions

1. **localStorage over Backend**: Offline-first, faster access
2. **Base64 Images**: Simple, no file server needed
3. **Outbreak Prompt**: User control over data saving
4. **Type Normalization**: API flexibility, type safety
5. **Black Box Integration**: Comprehensive analytics
6. **Singleton Service**: Consistent state, easy access

## 📝 Architecture Benefits

✅ **Modularity**: Clear separation of concerns
✅ **Testability**: Services can be tested independently
✅ **Maintainability**: Well-organized code structure
✅ **Scalability**: Easy to add features
✅ **Offline-First**: Works without internet
✅ **Type Safety**: Full TypeScript support
✅ **Error Resilience**: Comprehensive error handling
✅ **Analytics Ready**: Built-in logging
