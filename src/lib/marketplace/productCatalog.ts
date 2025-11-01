/**
 * Product Catalog - Database of agricultural products with Amazon affiliate links
 * Contains 30+ essential products for Indian agriculture
 */

import type { ProductCatalogEntry } from './types';

export const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  // ============================================================================
  // FERTILIZERS - Nitrogen
  // ============================================================================
  {
    product_id: 'fert_urea_001',
    product_name: {
      en: 'Urea 46-0-0 Fertilizer (50kg)',
      hi: 'यूरिया 46-0-0 उर्वरक (50 किग्रा)',
      bn: 'ইউরিয়া 46-0-0 সার (50 কেজি)',
    },
    category: 'fertilizer',
    subcategory: 'nitrogen',
    addresses_conditions: {
      npk_deficiency: 'nitrogen',
    },
    amazon_asin: 'B08XYZ1234',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 1250,
    package_sizes: ['50kg'],
    manufacturer: 'IFFCO',
    is_local: true,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    application_rate: '100-150 kg/hectare for rice, 120-180 kg/hectare for wheat',
    safety_precautions: ['Wear gloves and mask', 'Avoid inhalation', 'Store in cool, dry place'],
    effectiveness_rating: 4.5,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  // ============================================================================
  // FERTILIZERS - Phosphorus
  // ============================================================================
  {
    product_id: 'fert_dap_001',
    product_name: {
      en: 'DAP 18-46-0 Fertilizer (50kg)',
      hi: 'डीएपी 18-46-0 उर्वरक (50 किग्रा)',
      bn: 'ডিএপি 18-46-0 সার (50 কেজি)',
    },
    category: 'fertilizer',
    subcategory: 'phosphorus',
    addresses_conditions: {
      npk_deficiency: 'phosphorus',
    },
    amazon_asin: 'B08ABC5678',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 1450,
    package_sizes: ['50kg'],
    manufacturer: 'IFFCO',
    is_local: true,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    application_rate: '100-125 kg/hectare for rice, 100-150 kg/hectare for wheat',
    safety_precautions: ['Wear protective gear', 'Avoid contact with skin', 'Keep away from children'],
    effectiveness_rating: 4.6,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  {
    product_id: 'fert_ssp_001',
    product_name: {
      en: 'Single Super Phosphate (SSP) 16% P2O5 (50kg)',
      hi: 'सिंगल सुपर फॉस्फेट (एसएसपी) 16% P2O5 (50 किग्रा)',
      bn: 'সিঙ্গেল সুপার ফসফেট (এসএসপি) 16% P2O5 (50 কেজি)',
    },
    category: 'fertilizer',
    subcategory: 'phosphorus',
    addresses_conditions: {
      npk_deficiency: 'phosphorus',
    },
    amazon_asin: 'B08DEF9012',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 850,
    package_sizes: ['50kg'],
    manufacturer: 'Coromandel',
    is_local: true,
    is_eco_friendly: true,
    sustainability_rating: 4,
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    application_rate: '200-250 kg/hectare',
    safety_precautions: ['Wear gloves', 'Avoid dust inhalation'],
    effectiveness_rating: 4.2,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  // ============================================================================
  // FERTILIZERS - Potassium
  // ============================================================================
  {
    product_id: 'fert_mop_001',
    product_name: {
      en: 'Muriate of Potash (MOP) 0-0-60 (50kg)',
      hi: 'म्यूरिएट ऑफ पोटाश (एमओपी) 0-0-60 (50 किग्रा)',
      bn: 'মিউরিয়েট অফ পটাশ (এমওপি) 0-0-60 (50 কেজি)',
    },
    category: 'fertilizer',
    subcategory: 'potassium',
    addresses_conditions: {
      npk_deficiency: 'potassium',
    },
    amazon_asin: 'B08GHI3456',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 1350,
    package_sizes: ['50kg'],
    manufacturer: 'IFFCO',
    is_local: true,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400',
    application_rate: '50-75 kg/hectare for rice, 40-60 kg/hectare for wheat',
    safety_precautions: ['Wear protective equipment', 'Store in dry place'],
    effectiveness_rating: 4.4,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  // ============================================================================
  // FUNGICIDES - Rice Blast
  // ============================================================================
  {
    product_id: 'fung_propi_001',
    product_name: {
      en: 'Propiconazole 25% EC Fungicide (1L)',
      hi: 'प्रोपिकोनाज़ोल 25% ईसी फफूंदनाशक (1 लीटर)',
      bn: 'প্রোপিকোনাজোল 25% ইসি ছত্রাকনাশক (1 লিটার)',
    },
    category: 'fungicide',
    subcategory: 'systemic',
    addresses_conditions: {
      disease_type: ['Rice Blast', 'Blast', 'Sheath Blight'],
      crop_types: ['rice'],
    },
    amazon_asin: 'B08JKL7890',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 850,
    package_sizes: ['1L', '500ml'],
    manufacturer: 'Bayer CropScience',
    is_local: false,
    is_eco_friendly: false,
    sustainability_rating: 2,
    image_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400',
    application_rate: '1ml per liter of water, spray 2-3 times at 10-day intervals',
    safety_precautions: [
      'Wear protective clothing',
      'Avoid spraying during windy conditions',
      'Do not spray near water bodies',
      'Wash hands after use',
    ],
    effectiveness_rating: 4.7,
    regional_availability: ['PB', 'HR', 'UP', 'WB', 'IN'],
  },

  {
    product_id: 'fung_copper_001',
    product_name: {
      en: 'Copper Oxychloride 50% WP Fungicide (1kg)',
      hi: 'कॉपर ऑक्सीक्लोराइड 50% डब्ल्यूपी फफूंदनाशक (1 किग्रा)',
      bn: 'কপার অক্সিক্লোরাইড 50% ডব্লিউপি ছত্রাকনাশক (1 কেজি)',
    },
    category: 'fungicide',
    subcategory: 'contact',
    addresses_conditions: {
      disease_type: ['Bacterial Blight', 'Brown Spot', 'Downy Mildew'],
      weather_condition: ['heavy_rain'],
    },
    amazon_asin: 'B08MNO1234',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 450,
    package_sizes: ['1kg', '500g'],
    manufacturer: 'Rallis India',
    is_local: true,
    is_eco_friendly: true,
    sustainability_rating: 4,
    image_url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400',
    application_rate: '2-3 grams per liter of water, apply before rainfall',
    safety_precautions: ['Wear gloves and mask', 'Avoid contact with eyes', 'Store in cool place'],
    effectiveness_rating: 4.3,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  {
    product_id: 'fung_mancozeb_001',
    product_name: {
      en: 'Mancozeb 75% WP Fungicide (1kg)',
      hi: 'मैनकोज़ेब 75% डब्ल्यूपी फफूंदनाशक (1 किग्रा)',
      bn: 'ম্যানকোজেব 75% ডব্লিউপি ছত্রাকনাশক (1 কেজি)',
    },
    category: 'fungicide',
    subcategory: 'contact',
    addresses_conditions: {
      disease_type: ['Brown Spot', 'Leaf Spot', 'Blight'],
      weather_condition: ['heavy_rain'],
    },
    amazon_asin: 'B08PQR5678',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 550,
    package_sizes: ['1kg', '500g'],
    manufacturer: 'UPL',
    is_local: true,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    application_rate: '2 grams per liter of water, spray before expected rainfall',
    safety_precautions: ['Use protective gear', 'Avoid inhalation', 'Do not contaminate water sources'],
    effectiveness_rating: 4.5,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  // ============================================================================
  // PESTICIDES - Insect Control
  // ============================================================================
  {
    product_id: 'pest_chlor_001',
    product_name: {
      en: 'Chlorpyrifos 20% EC Insecticide (1L)',
      hi: 'क्लोरपाइरीफॉस 20% ईसी कीटनाशक (1 लीटर)',
      bn: 'ক্লোরপাইরিফস 20% ইসি কীটনাশক (1 লিটার)',
    },
    category: 'pesticide',
    subcategory: 'insecticide',
    addresses_conditions: {
      disease_type: ['Stem Borer', 'Leaf Folder', 'Brown Plant Hopper'],
      growth_stage: ['Tillering', 'Reproductive'],
    },
    amazon_asin: 'B08STU9012',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 650,
    package_sizes: ['1L', '500ml'],
    manufacturer: 'Dow AgroSciences',
    is_local: false,
    is_eco_friendly: false,
    sustainability_rating: 2,
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    application_rate: '2ml per liter of water, spray during early morning or evening',
    safety_precautions: [
      'Highly toxic - use extreme caution',
      'Wear full protective gear',
      'Do not spray near water bodies',
      'Keep away from children and pets',
    ],
    effectiveness_rating: 4.6,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  {
    product_id: 'pest_neem_001',
    product_name: {
      en: 'Neem Oil Organic Pesticide (1L)',
      hi: 'नीम तेल जैविक कीटनाशक (1 लीटर)',
      bn: 'নিম তেল জৈব কীটনাশক (1 লিটার)',
    },
    category: 'pesticide',
    subcategory: 'organic',
    addresses_conditions: {
      disease_type: ['Aphids', 'Whitefly', 'Thrips', 'Mites'],
    },
    amazon_asin: 'B08VWX3456',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 450,
    package_sizes: ['1L', '500ml'],
    manufacturer: 'Neem India',
    is_local: true,
    is_eco_friendly: true,
    sustainability_rating: 5,
    image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400',
    application_rate: '5ml per liter of water, spray weekly',
    safety_precautions: ['Safe for organic farming', 'Avoid spraying during hot sun', 'Store in cool place'],
    effectiveness_rating: 4.0,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  // ============================================================================
  // EQUIPMENT - Irrigation
  // ============================================================================
  {
    product_id: 'equip_drip_001',
    product_name: {
      en: 'Drip Irrigation Kit (1 Acre)',
      hi: 'ड्रिप सिंचाई किट (1 एकड़)',
      bn: 'ড্রিপ সেচ কিট (1 একর)',
    },
    category: 'equipment',
    subcategory: 'irrigation',
    addresses_conditions: {
      weather_condition: ['drought'],
    },
    amazon_asin: 'B08YZA7890',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 15000,
    package_sizes: ['1 Acre', '0.5 Acre'],
    manufacturer: 'Jain Irrigation',
    is_local: true,
    is_eco_friendly: true,
    sustainability_rating: 5,
    image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    application_rate: 'Install as per field layout, saves 40-60% water',
    safety_precautions: ['Professional installation recommended', 'Regular maintenance required'],
    effectiveness_rating: 4.8,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'IN'],
  },

  {
    product_id: 'equip_sprinkler_001',
    product_name: {
      en: 'Sprinkler Irrigation System (1 Acre)',
      hi: 'स्प्रिंकलर सिंचाई प्रणाली (1 एकड़)',
      bn: 'স্প্রিংকলার সেচ ব্যবস্থা (1 একর)',
    },
    category: 'equipment',
    subcategory: 'irrigation',
    addresses_conditions: {
      weather_condition: ['drought'],
    },
    amazon_asin: 'B08BCD1234',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 12000,
    package_sizes: ['1 Acre'],
    manufacturer: 'Netafim',
    is_local: false,
    is_eco_friendly: true,
    sustainability_rating: 4,
    image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    application_rate: 'Install as per field requirements, saves 30-40% water',
    safety_precautions: ['Check water pressure', 'Regular cleaning required'],
    effectiveness_rating: 4.5,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'IN'],
  },

  // ============================================================================
  // EQUIPMENT - Harvest & Storage
  // ============================================================================
  {
    product_id: 'equip_tarp_001',
    product_name: {
      en: 'Heavy Duty Harvest Tarpaulin (20x20 ft)',
      hi: 'हेवी ड्यूटी हार्वेस्ट तिरपाल (20x20 फीट)',
      bn: 'হেভি ডিউটি হার্ভেস্ট তারপলিন (20x20 ফুট)',
    },
    category: 'equipment',
    subcategory: 'harvest',
    addresses_conditions: {
      growth_stage: ['Maturity'],
    },
    amazon_asin: 'B08EFG5678',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 1200,
    package_sizes: ['20x20 ft', '15x15 ft'],
    manufacturer: 'Tarpaulin India',
    is_local: true,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400',
    application_rate: 'Use during harvest and drying',
    safety_precautions: ['Secure properly to avoid wind damage', 'Clean and dry before storage'],
    effectiveness_rating: 4.2,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  {
    product_id: 'equip_storage_001',
    product_name: {
      en: 'Grain Storage Bag (50kg capacity, Pack of 10)',
      hi: 'अनाज भंडारण बैग (50 किग्रा क्षमता, 10 का पैक)',
      bn: 'শস্য সংরক্ষণ ব্যাগ (50 কেজি ধারণক্ষমতা, 10টির প্যাক)',
    },
    category: 'equipment',
    subcategory: 'storage',
    addresses_conditions: {
      growth_stage: ['Maturity'],
    },
    amazon_asin: 'B08HIJ9012',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 800,
    package_sizes: ['Pack of 10', 'Pack of 20'],
    manufacturer: 'Agro Packaging',
    is_local: true,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400',
    application_rate: 'Store in dry, ventilated area',
    safety_precautions: ['Keep away from moisture', 'Check for pests regularly'],
    effectiveness_rating: 4.0,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  // ============================================================================
  // SEED TREATMENT
  // ============================================================================
  {
    product_id: 'seed_treat_001',
    product_name: {
      en: 'Seed Treatment Fungicide (Thiram 75% WS) 100g',
      hi: 'बीज उपचार फफूंदनाशक (थिरम 75% डब्ल्यूएस) 100 ग्राम',
      bn: 'বীজ চিকিৎসা ছত্রাকনাশক (থিরাম 75% ডব্লিউএস) 100 গ্রাম',
    },
    category: 'seed_treatment',
    subcategory: 'fungicide',
    addresses_conditions: {
      weather_condition: ['heavy_rain'],
    },
    amazon_asin: 'B08KLM3456',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 250,
    package_sizes: ['100g', '250g'],
    manufacturer: 'Bayer CropScience',
    is_local: false,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    application_rate: '2-3 grams per kg of seeds, treat before sowing',
    safety_precautions: ['Wear gloves', 'Do not use treated seeds for consumption', 'Store away from food'],
    effectiveness_rating: 4.4,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  // ============================================================================
  // SOIL AMENDMENTS
  // ============================================================================
  {
    product_id: 'soil_gypsum_001',
    product_name: {
      en: 'Agricultural Gypsum (25kg)',
      hi: 'कृषि जिप्सम (25 किग्रा)',
      bn: 'কৃষি জিপসাম (25 কেজি)',
    },
    category: 'fertilizer',
    subcategory: 'soil_amendment',
    addresses_conditions: {
      npk_deficiency: 'potassium',
    },
    amazon_asin: 'B08NOP7890',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 450,
    package_sizes: ['25kg', '50kg'],
    manufacturer: 'Gypsum India',
    is_local: true,
    is_eco_friendly: true,
    sustainability_rating: 5,
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    application_rate: '200-400 kg/hectare for soil pH correction',
    safety_precautions: ['Wear dust mask', 'Store in dry place'],
    effectiveness_rating: 4.1,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  {
    product_id: 'soil_lime_001',
    product_name: {
      en: 'Agricultural Lime (50kg)',
      hi: 'कृषि चूना (50 किग्रा)',
      bn: 'কৃষি চুন (50 কেজি)',
    },
    category: 'fertilizer',
    subcategory: 'soil_amendment',
    addresses_conditions: {},
    amazon_asin: 'B08QRS1234',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 350,
    package_sizes: ['50kg'],
    manufacturer: 'Lime Products',
    is_local: true,
    is_eco_friendly: true,
    sustainability_rating: 5,
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400',
    application_rate: '500-1000 kg/hectare for acidic soils',
    safety_precautions: ['Avoid contact with eyes', 'Wear protective gear'],
    effectiveness_rating: 4.0,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  // ============================================================================
  // ORGANIC FERTILIZERS
  // ============================================================================
  {
    product_id: 'org_vermi_001',
    product_name: {
      en: 'Vermicompost Organic Fertilizer (40kg)',
      hi: 'वर्मीकम्पोस्ट जैविक उर्वरक (40 किग्रा)',
      bn: 'ভার্মিকম্পোস্ট জৈব সার (40 কেজি)',
    },
    category: 'fertilizer',
    subcategory: 'organic',
    addresses_conditions: {},
    amazon_asin: 'B08TUV5678',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 600,
    package_sizes: ['40kg', '20kg'],
    manufacturer: 'Organic India',
    is_local: true,
    is_eco_friendly: true,
    sustainability_rating: 5,
    image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400',
    application_rate: '2-3 tons/hectare, apply before sowing',
    safety_precautions: ['Safe for organic farming', 'Store in shaded area'],
    effectiveness_rating: 4.3,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },

  {
    product_id: 'org_compost_001',
    product_name: {
      en: 'Farm Compost Organic Manure (50kg)',
      hi: 'फार्म कम्पोस्ट जैविक खाद (50 किग्रा)',
      bn: 'ফার্ম কম্পোস্ট জৈব সার (50 কেজি)',
    },
    category: 'fertilizer',
    subcategory: 'organic',
    addresses_conditions: {},
    amazon_asin: 'B08WXY9012',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 400,
    package_sizes: ['50kg'],
    manufacturer: 'Compost India',
    is_local: true,
    is_eco_friendly: true,
    sustainability_rating: 5,
    image_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400',
    application_rate: '5-10 tons/hectare, apply during land preparation',
    safety_precautions: ['Safe for all crops', 'Store in dry place'],
    effectiveness_rating: 4.2,
    regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
  },
];

// Export catalog size for reference
export const CATALOG_SIZE = PRODUCT_CATALOG.length;
