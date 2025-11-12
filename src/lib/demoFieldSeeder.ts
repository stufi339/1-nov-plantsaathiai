// Demo field data seeder for testing the dashboard with field information
// Run this in browser console: import('./lib/demoFieldSeeder').then(m => m.seedDemoFields())

export const seedDemoFields = () => {
  // Demo fields list (basic field info)
  const demoFieldsList = [
    {
      id: "field_1",
      name: "Rice Field - North Block",
      cropType: "rice",
      area: 2.5,
      sowingDate: "2024-10-15",
      location: "Punjab, India"
    },
    {
      id: "field_2",
      name: "Wheat Field - South Block",
      cropType: "wheat",
      area: 3.2,
      sowingDate: "2024-11-20",
      location: "Haryana, India"
    }
  ];

  // Demo detailed field data for field_1
  const demoField1Data = {
    satelliteData: {
      ndvi: 0.75,
      evi: 0.68,
      lst: 28.5,
      chirps: 45.2,
      lastUpdated: new Date().toISOString()
    },
    soilData: {
      ph: 6.8,
      nitrogen: 45,
      phosphorus: 32,
      potassium: 180,
      organicMatter: 2.1,
      texture: "loam"
    },
    health: {
      status: "healthy",
      ndvi: 0.75,
      riskLevel: "low",
      recommendations: [
        "Continue current irrigation schedule",
        "Monitor for early pest detection"
      ]
    },
    irrigation: {
      lastIrrigation: "2024-12-10",
      nextIrrigation: "2024-12-12",
      waterUsed: 1250,
      efficiency: 85
    },
    yield: {
      predicted: 6.2,
      confidence: 78,
      factors: {
        weather: 85,
        soil: 80,
        management: 75
      }
    }
  };

  // Demo detailed field data for field_2
  const demoField2Data = {
    satelliteData: {
      ndvi: 0.82,
      evi: 0.71,
      lst: 26.8,
      chirps: 38.7,
      lastUpdated: new Date().toISOString()
    },
    soilData: {
      ph: 7.2,
      nitrogen: 52,
      phosphorus: 28,
      potassium: 195,
      organicMatter: 2.8,
      texture: "sandy loam"
    },
    health: {
      status: "excellent",
      ndvi: 0.82,
      riskLevel: "very low",
      recommendations: [
        "Optimal growth conditions",
        "Consider early harvest preparation"
      ]
    },
    irrigation: {
      lastIrrigation: "2024-12-08",
      nextIrrigation: "2024-12-14",
      waterUsed: 980,
      efficiency: 92
    },
    yield: {
      predicted: 5.8,
      confidence: 82,
      factors: {
        weather: 90,
        soil: 85,
        management: 80
      }
    }
  };

  // Save to localStorage
  localStorage.setItem('fields_list', JSON.stringify(demoFieldsList));
  localStorage.setItem('field_field_1_data', JSON.stringify(demoField1Data));
  localStorage.setItem('field_field_2_data', JSON.stringify(demoField2Data));

  console.log('✅ Demo fields seeded successfully!');
  console.log('📍 Fields:', demoFieldsList.length);
  console.log('🌾 Field 1 (Rice):', demoField1Data.health.status, '- NDVI:', demoField1Data.satelliteData.ndvi);
  console.log('🌾 Field 2 (Wheat):', demoField2Data.health.status, '- NDVI:', demoField2Data.satelliteData.ndvi);
  console.log('\n🔄 Refresh the dashboard page to see the field information!');

  return {
    fields: demoFieldsList.length,
    field1: demoField1Data,
    field2: demoField2Data
  };
};

// Auto-seed on import if in development
if (import.meta.env.DEV) {
  console.log('🌾 Run seedDemoFields() to populate demo field data');
}
