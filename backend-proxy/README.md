# Plant Saathi Satellite Data Proxy

Backend service for fetching real satellite data from Google Earth Engine.

## Why This Exists

Browser-based applications cannot directly authenticate with Google Earth Engine using service account private keys due to security restrictions (RSA JWT signing). This proxy server handles the authentication and data fetching server-side.

## Setup

### 1. Install Dependencies

```bash
cd backend-proxy
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your GEE credentials:

```bash
cp .env.example .env
```

Edit `.env` with your credentials from the main project's `.env` file.

### 3. Run Locally

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### 4. Test

```bash
curl -X POST http://localhost:3001/api/satellite/vegetation \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 28.368717,
    "lng": 77.540933,
    "startDate": "2025-10-01",
    "endDate": "2025-11-01"
  }'
```

## API Endpoints

### POST /api/satellite/vegetation

Fetch vegetation indices from Sentinel-2 satellite imagery.

**Request Body:**
```json
{
  "lat": 28.368717,
  "lng": 77.540933,
  "polygon": [[28.368717, 77.540933], ...],  // Optional
  "startDate": "2025-10-01",
  "endDate": "2025-11-01",
  "cloudCoverThreshold": 20  // Optional, default 20%
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ndvi": 0.65,
    "msavi2": 0.58,
    "ndre": 0.42,
    "ndwi": 0.25,
    "ndmi": 0.30,
    "soc_vis": 0.35,
    "rsm": 0.40,
    "rvi": 2.5,
    "cloudCover": 8.5,
    "imageCount": 12,
    "dataSource": "Sentinel-2 Real Satellite",
    "acquisitionDate": "2025-11-11T10:30:00Z",
    "confidence": 0.95
  }
}
```

### GET /health

Check server status.

**Response:**
```json
{
  "status": "ok",
  "eeInitialized": true,
  "timestamp": "2025-11-11T10:30:00Z"
}
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Option 2: Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Deploy:
```bash
railway login
railway init
railway up
```

### Option 3: Google Cloud Run

```bash
gcloud run deploy plant-saathi-proxy \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 4: AWS Lambda

Use Serverless Framework or AWS SAM.

## Frontend Integration

Update `src/lib/satelliteDataService.ts`:

```typescript
async getComprehensiveFieldData(coordinates) {
  // Try backend proxy first
  try {
    const response = await fetch('https://your-proxy.vercel.app/api/satellite/vegetation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: coordinates.lat,
        lng: coordinates.lng,
        polygon: coordinates.polygon,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data.imageCount > 0) {
        console.log('✅ Got REAL satellite data from backend proxy!');
        return {
          vegetation: result.data,
          dataSource: result.data.dataSource,
          confidence: result.data.confidence,
          lastUpdated: result.data.acquisitionDate
        };
      }
    }
  } catch (error) {
    console.log('Backend proxy not available, using fallback');
  }
  
  // Fall back to existing implementation
  // ... rest of your code
}
```

## Performance

- **Cold start:** ~2-3 seconds (first request)
- **Warm requests:** ~500ms - 1s
- **Data freshness:** Last 30 days of Sentinel-2 imagery
- **Resolution:** 10m per pixel

## Cost

- **Google Earth Engine:** Free (within quotas)
- **Hosting:** 
  - Vercel: Free tier (100GB bandwidth/month)
  - Railway: $5/month
  - Google Cloud Run: Pay per use (~$0.01/1000 requests)

## Troubleshooting

### "Earth Engine not initialized"

Wait 5-10 seconds after server start for GEE to initialize.

### "No images found"

- Check date range (Sentinel-2 started in 2015)
- Increase cloud cover threshold
- Verify coordinates are valid

### CORS errors

Add your frontend domain to CORS whitelist in `index.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-domain.com']
}));
```

## License

MIT
