# Disease Detection - Quick Start Guide

## 🚀 Getting Started

### For Users

1. **Navigate to Disease Detection**
   - Open Plant Saathi app
   - Click on "Disease Detection" from main menu

2. **Capture Plant Image**
   - Click "Open Camera" to take a photo
   - OR click "Upload from Gallery" to select existing image
   - Ensure good lighting and clear focus on affected area

3. **Analyze Disease**
   - Review captured image
   - Click "Analyze Disease" button
   - Wait for AI analysis (2-3 seconds)

4. **Review Results**
   - View disease name and confidence score
   - Check yield impact and recovery chance
   - Read treatment recommendations

5. **Track Field Outbreak (Optional)**
   - If prompted "Is this a field outbreak?"
   - Click "Yes, It's a Field Outbreak"
   - Select the affected field from list
   - Data saved automatically

### For Developers

#### Test the API
```bash
# Run the test script
node test-disease-api.js
```

#### Use the Service
```typescript
import { diseaseDetectionService } from '@/lib/diseaseDetectionService';

// Analyze an image
const result = await diseaseDetectionService.analyzeDisease({
  image: base64ImageString,
  crop: "rice",
  location: "India",
  symptoms: "Yellowing leaves"
});

// Save outbreak to field
diseaseDetectionService.saveDiseaseOutbreak(
  fieldId,
  fieldName,
  result,
  imageUrl
);

// Get field's disease history
const outbreaks = diseaseDetectionService.getDiseaseOutbreaks(fieldId);
```

#### Check Field Data
```javascript
// In browser console
const fieldData = localStorage.getItem('field_<fieldId>_data');
console.log(JSON.parse(fieldData).disease_outbreaks);
```

## 📋 API Details

### Endpoint
```
POST /analyze-disease
Base: https://teejiieuaxzrucsttrid.supabase.co/functions/v1
```

### Authentication
```javascript
headers: {
  'Authorization': 'Bearer eyJhbGci...',
  'x-api-key': 'pk_4af2789fa35a45d896311651f967b40c',
  'Content-Type': 'application/json'
}
```

### Request Body
```json
{
  "image": "data:image/png;base64,iVBORw0KG...",
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
    "cultural": ["Remove infected leaves"],
    "chemical": ["Copper oxychloride @ 2.5g/L"],
    "organic": ["Neem oil spray"],
    "ipm": ["Use resistant varieties"]
  },
  "yield_impact": "High",
  "recovery_chance": "Fair"
}
```

## 🔍 Troubleshooting

### API Not Responding
1. Check network connection
2. Verify API key is valid
3. Check browser console for errors
4. Try test script: `node test-disease-api.js`

### Image Upload Fails
1. Ensure image is base64 encoded
2. Check image size (< 5MB recommended)
3. Verify data URI format: `data:image/png;base64,...`

### Field Selection Empty
1. Add fields in Soil Saathi first
2. Check localStorage for field data
3. Verify field data format

### Storage Quota Exceeded
1. Clear old disease records
2. Optimize image sizes
3. Run: `localStorage.clear()` (caution: clears all data)

## 📊 Data Flow

```
User Captures Image
        ↓
Convert to Base64
        ↓
Send to API
        ↓
Receive Analysis
        ↓
Display Results
        ↓
User Confirms Outbreak
        ↓
Select Field
        ↓
Save to localStorage
        ↓
Log to Black Box
```

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `src/lib/diseaseDetectionService.ts` | API client & storage |
| `src/components/disease/DiseaseDetectionView.tsx` | Main UI component |
| `test-disease-api.js` | API testing script |
| `DISEASE_DETECTION_IMPLEMENTATION.md` | Full documentation |

## 💡 Tips

### For Best Results
- Use natural daylight
- Capture affected area clearly
- Hold camera steady
- Include entire leaf/fruit if possible
- Avoid shadows and glare

### For Development
- Check browser console for logs
- Use React DevTools to inspect state
- Monitor network tab for API calls
- Test with various image formats
- Verify localStorage data structure

## 🔗 Related Features

- **Soil Saathi**: Field management and soil analysis
- **Yield Prediction**: Crop yield forecasting
- **Black Box**: Analytics and logging
- **Audio Service**: Accessibility features

## 📞 Support

### Common Issues
1. **"No fields found"**: Add fields in Soil Saathi
2. **"API Error"**: Check network and API key
3. **"Storage full"**: Clear old data
4. **"Image too large"**: Compress image

### Debug Commands
```javascript
// Check disease outbreaks
diseaseDetectionService.getAllFieldsWithDiseases()

// Get specific field outbreaks
diseaseDetectionService.getDiseaseOutbreaks('fieldId')

// Clear all disease data (careful!)
localStorage.clear()
```

## ✅ Checklist

Before using:
- [ ] Network connection active
- [ ] Camera permissions granted
- [ ] At least one field created (for outbreak tracking)
- [ ] Sufficient storage space

After analysis:
- [ ] Disease identified correctly
- [ ] Confidence score reasonable (>60%)
- [ ] Treatments displayed
- [ ] Outbreak saved (if applicable)
- [ ] Data persisted in localStorage

## 🎉 Success!

You're ready to use the disease detection feature! Start by capturing an image of a diseased plant and let the AI help you identify and treat it.

For detailed documentation, see `DISEASE_DETECTION_IMPLEMENTATION.md`
