export type Language = 'english' | 'hindi' | 'punjabi' | 'tamil' | 'telugu' | 'bengali' | 'marathi' | 'haryanvi';

export const translations: Record<Language, Record<string, string>> = {
  english: {
    // App Navigation
    'app_title': 'Plant Saathi',
    'soilsati': 'SoilSati',
    'disease_detection': 'Disease Detection',
    'yield_prediction': 'Yield Prediction',
    'marketplace': 'Marketplace',
    'schemes': 'Schemes',
    'profile': 'Profile',
    'crop_guide': 'Crop Guide',

    // Main Headers
    'satellite_powered_field_intelligence': 'Satellite-powered field intelligence',
    'real_time_crop_advisory': 'Real-time crop advisory',
    'your_farming_companion': 'Your farming companion',
    'smart_farming_decisions': 'Make smart farming decisions with AI',

    // Soil Sati
    'soil_sati_title': '🌍 SoilSati',
    'soil_analysis_subtitle': 'Satellite-powered field intelligence',
    'my_fields': 'My Fields',
    'add_field': 'Add Field',
    'field_details': 'Field Details',
    'satellite_data': 'Satellite Data',
    'vegetation_indices': 'Vegetation Indices',
    'soil_properties': 'Soil Properties',
    'field_health': 'Field Health',
    'performance_trends': 'Performance Trends',

    // Disease Detection
    'disease_detection_title': '🦠 Disease Detection',
    'upload_image': 'Upload Image',
    'take_photo': 'Take Photo',
    'analyze_plant': 'Analyze Plant',
    'disease_results': 'Disease Results',
    'treatment_recommendations': 'Treatment Recommendations',
    'organic_methods': 'Organic Methods',
    'chemical_methods': 'Chemical Methods',
    'prevention_tips': 'Prevention Tips',
    'early_warning': 'Early Warning',

    // AI Advisor
    'ai_advisor': '🤖 AI Advisor',
    'ask_farming_question': 'Ask your farming question',
    'how_can_i_help': 'How can I help you today?',
    'send_message': 'Send',

    // Common Messages
    'loading': 'Loading...',
    'error': 'Error occurred',
    'retry': 'Retry',
    'success': 'Success',
    'cancel': 'Cancel',
    'ok': 'OK',
    'yes': 'Yes',
    'no': 'No',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'back': 'Back',

    // Voice Features
    'voice_input': 'Voice Input',
    'listen_message': 'Listen to Message',
    'voice_commands': 'Voice Commands',
    'speak_in_hindi': 'Speak in Hindi',
    'voice_help': 'Voice Help',

    // Language Selector
    'select_language': 'Select Language',
    'language_english': 'English',
    'language_hindi': 'हिंदी',
    'language_punjabi': 'ਪੰਜਾਬੀ',
    'language_tamil': 'தமிழ்',
    'language_telugu': 'తెలుగు',
    'language_bengali': 'বাংলা',
    'language_marathi': 'मराठी',
    'language_haryanvi': 'हरियाणवी',

    // Weather & Advice
    'weather_alerts': 'Weather Alerts',
    'crop_recommendations': 'Crop Recommendations',
    'irrigation_advice': 'Irrigation Advice',
    'pest_alerts': 'Pest Alerts',
    'market_prices': 'Market Prices',
  },

  hindi: {
    // App Navigation
    'app_title': 'प्लांट साथी',
    'soilsati': 'मिट्टी साथी',
    'disease_detection': 'बीमारी पता लगाना',
    'yield_prediction': 'उपज अनुमान',
    'marketplace': 'बाजार',
    'schemes': 'योजनाएं',
    'profile': 'प्रोफ़ाइल',
    'crop_guide': 'फसल मार्गदर्शिका',

    // Main Headers
    'satellite_powered_field_intelligence': 'उपग्रह संचालित खेत बुद्धि',
    'real_time_crop_advisory': 'वास्तविक समय फसल सलाह',
    'your_farming_companion': 'आपका कृषि साथी',
    'smart_farming_decisions': 'AI के साथ स्मार्ट कृषि निर्णय लें',

    // Soil Sati
    'soil_sati_title': '🌍 मिट्टी साथी',
    'soil_analysis_subtitle': 'उपग्रह संचालित खेत बुद्धि',
    'my_fields': 'मेरे खेत',
    'add_field': 'खेत जोड़ें',
    'field_details': 'खेत विवरण',
    'satellite_data': 'उपग्रह डेटा',
    'vegetation_indices': 'वनस्पति सूचकांक',
    'soil_properties': 'मिट्टी गुण',
    'field_health': 'खेत स्वास्थ्य',
    'performance_trends': 'प्रदर्शन रुझान',

    // Disease Detection
    'disease_detection_title': '🦠 बीमारी पता लगाना',
    'upload_image': 'तस्वीर अपलोड करें',
    'take_photo': 'फोटो खींचें',
    'analyze_plant': 'पौधे का विश्लेषण करें',
    'disease_results': 'बीमारी परिणाम',
    'treatment_recommendations': 'उपचार सिफारिशें',
    'organic_methods': 'जैविक तरीके',
    'chemical_methods': 'रासायनिक तरीके',
    'prevention_tips': 'रोकथाम टिप्स',
    'early_warning': 'जल्दी चेतावनी',

    // AI Advisor
    'ai_advisor': '🤖 एआई सलाहकार',
    'ask_farming_question': 'अपना कृषि सवाल पूछें',
    'how_can_i_help': 'आज मैं आपकी कैसे मदद कर सकता हूं?',
    'send_message': 'भेजें',

    // Common Messages
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि हुई',
    'retry': 'पुनः प्रयास करें',
    'success': 'सफलता',
    'cancel': 'रद्द करें',
    'ok': 'ठीक है',
    'yes': 'हां',
    'no': 'नहीं',
    'save': 'सेव करें',
    'delete': 'मिटाएं',
    'edit': 'संपादित करें',
    'back': 'वापस',

    // Voice Features
    'voice_input': 'ध्वनि इनपुट',
    'listen_message': 'संदेश सुनें',
    'voice_commands': 'ध्वनि कमांड',
    'speak_in_hindi': 'हिंदी में बोलें',
    'voice_help': 'ध्वनि मदद',

    // Language Selector
    'select_language': 'भाषा चुनें',
    'language_english': 'English',
    'language_hindi': 'हिंदी',
    'language_punjabi': 'ਪੰਜਾਬੀ',
    'language_tamil': 'தமிழ்',
    'language_telugu': 'తెలుగు',
    'language_bengali': 'বাংলা',
    'language_marathi': 'मराठी',
    'language_haryanvi': 'हरियाणवी',

    // Weather & Advice
    'weather_alerts': 'मौसम अलर्ट',
    'crop_recommendations': 'फसल सिफारिशें',
    'irrigation_advice': 'सिंचाई सलाह',
    'pest_alerts': 'कीट अलर्ट',
    'market_prices': 'बाजार कीमतें',
  },

  // Placeholder structures for other languages
  punjabi: { /* To be translated */ },
  tamil: { /* To be translated */ },
  telugu: { /* To be translated */ },
  bengali: { /* To be translated */ },
  marathi: { /* To be translated */ },
  haryanvi: { /* To be translated */ },
};

export const getTranslation = (key: string, language: Language = 'english'): string => {
  return translations[language]?.[key] || translations.english[key] || key;
};
