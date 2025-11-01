# Disease Detection Implementation

## Overview
Integrated real-time plant disease detection using Supabase Edge Function API with field outbreak tracking and black box data storage.

## Features Implemented

### 1. API Integration
- **Service**: `src/lib/diseaseDetectionService.ts`
- **Base URL**: `https://teejiieuaxzrucsttrid.supabase.co/functions/v1`
- **Endpoint**: `POST /analyze-disease`
- **Authentication**: Bearer token + API key

### 2. Disease Analysis Flow
1. **Image Capture**: User captures/uploads diseased plant image
2. **API Analysis**: Image sent to disease detection API
3. **Results Display**: Shows disease name, confidence, treatments
4. **Outbreak Prompt**: Asks if disease is a field outbreak
5. **Field Selection**: If outbreak, user selects affected field
6. **Black Box Storage**: Saves outbreak data to field records

### 3. User Experience Flow

```
┌─────────────────┐
│  Capture Image  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Analyze Image  │ ◄── API Call
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Outbreak Prompt │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  [Yes]     [No]
    │         │
    ▼         │
┌─────────────┐   │
│Select Field │   │
└────────┬────┘   │
         │        │
         ▼        ▼
┌─────────────────┐
│  Show Results   │
└─────────────────┘
```

### 4. Data Storage Structure

Disease outbreak data is stored in localStorage under field data:

```javascript
{
  "field_<fieldId>_data": {
    "fieldName": "Rice Field 1",
    "disease_outbreaks": [
      {
        "fieldId": "abc123",
        "fieldName": "Rice Field 1",
        "disease_name": "Black Rot",
        "confidence": 0.95,
        "detected_at": "2025-10-27T10:30:00.000Z",
        "image": "data:image/png;base64,...",
        "treatments": {
          "cultural": ["Remove infected leaves"],
          "chemical": ["Copper oxychloride @ 2.5g/L"],
          "organic": ["Neem oil spray"],
          "ipm": ["Use resistant varieties"]
        },
        "yield_impact": "High",
        "recovery_chance": "Fair"
      }
    ]
  }
}
```

## API Request/Response Format

### Request
```json
{
  "image": "data:image/png;base64,[BASE64_IMAGE]",
  "crop": "tomato",
  "location": "India",
  "symptoms": "Yellowing leaves"
}
```

### Response
```json
{
  "disease_name": "Black Rot",
  "confidence": 0.95,
  "treatments": {
    "cultural": ["Remove infected leaves", "Ensure proper drainage"],
    "chemical": ["Copper oxychloride @ 2.5g/L"],
    "organic": ["Neem oil spray"],
    "ipm": ["Use resistant varieties"]
  },
  "yield_impact": "High",
  "recovery_chance": "Fair"
}
```

## Files Modified/Created

### Created Files
1. `src/lib/diseaseDetectionService.ts` - Disease detection API service
2. `test-disease-api.js` - API testing script
3. `DISEASE_DETECTION_IMPLEMENTATION.md` - This documentation

### Modified Files
1. `src/components/disease/DiseaseDetectionView.tsx` - Updated with API integration and outbreak tracking

## Key Functions

### DiseaseDetectionService

#### `analyzeDisease(request)`
- Sends image to API for disease analysis
- Returns disease information with treatments
- Logs interactions to black box

#### `saveDiseaseOutbreak(fieldId, fieldName, diseaseData, imageUrl)`
- Saves disease outbreak to field's black box data
- Stores in localStorage for offline access
- Logs save action to black box service

#### `getDiseaseOutbreaks(fieldId)`
- Retrieves disease outbreak history for a field
- Returns array of outbreak records

#### `getAllFieldsWithDiseases()`
- Gets all fields that have disease outbreaks
- Useful for dashboard/overview displays

## Black Box Integration

All disease detection interactions are logged:

1. **Image Capture**: Logs capture method, file size, file type
2. **Analysis Start**: Logs timestamp and image presence
3. **Analysis Complete**: Logs disease name, confidence, impact
4. **Outbreak Save**: Logs field ID, disease name, timestamp
5. **API Errors**: Logs error type, message, and context

## Testing

Run the API test:
```bash
node test-disease-api.js
```

This will:
- Test API connectivity
- Verify authentication
- Send sample image for analysis
- Display full response

## Error Handling

1. **API Failures**: Shows error message, allows retry
2. **Network Issues**: Graceful degradation with error display
3. **Storage Errors**: Logs to console, shows user-friendly message
4. **No Fields**: Prompts user to add fields in Soil Saathi

## Future Enhancements

1. **Offline Support**: Cache API responses for offline viewing
2. **Image Optimization**: Compress images before sending to API
3. **Batch Analysis**: Analyze multiple images at once
4. **Disease History**: Show disease trends over time
5. **Treatment Tracking**: Track which treatments were applied
6. **Recovery Monitoring**: Follow up on disease recovery progress

## Usage Example

```typescript
import { diseaseDetectionService } from '@/lib/diseaseDetectionService';

// Analyze disease
const result = await diseaseDetectionService.analyzeDisease({
  image: base64Image,
  crop: "rice",
  location: "India",
  symptoms: "Yellowing leaves"
});

// Save to field if outbreak
diseaseDetectionService.saveDiseaseOutbreak(
  fieldId,
  fieldName,
  result,
  imageUrl
);

// Get outbreak history
const outbreaks = diseaseDetectionService.getDiseaseOutbreaks(fieldId);
```

## Notes

- Images are stored as base64 in localStorage (consider size limits)
- API requires both Bearer token and x-api-key header
- Disease data persists across sessions via localStorage
- Black box service logs all interactions for analytics
- Field selection only shows fields that exist in localStorage

## Support

For API issues, check:
1. Network connectivity
2. API key validity
3. Image format (must be base64 with data URI prefix)
4. Request headers (Authorization + x-api-key)

For storage issues:
1. Check localStorage quota
2. Verify field data exists
3. Check browser console for errors
