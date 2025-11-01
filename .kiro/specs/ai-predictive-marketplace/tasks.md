# Implementation Plan

- [x] 1. Set up core infrastructure and data models
  - Create TypeScript interfaces for all data structures (FieldAnalysis, ProductRecommendation, ProductCatalogEntry, etc.)
  - Set up localStorage schema extensions for marketplace data
  - Create utility functions for data validation and transformation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Implement Context Cache Service
  - [x] 2.1 Create ContextCacheService class with Map-based caching
    - Implement get(), set(), invalidate(), isValid(), and prune() methods
    - Add 24-hour TTL logic with expiration checking
    - Implement LRU eviction for max 5 cached entries
    - _Requirements: 1.1, 1.4_

  - [x] 2.2 Integrate cache with field data retrieval
    - Add cache check before querying BlackBoxService
    - Store data source versions for cache invalidation
    - Implement cache warming on app initialization
    - _Requirements: 1.1, 1.4_

- [x] 3. Build Product Catalog database
  - [x] 3.1 Create product catalog data structure
    - Define ProductCatalogEntry interface with all required fields
    - Create initial product catalog with 20-30 essential agricultural products (fertilizers, fungicides, pesticides, equipment)
    - Include multi-language product names for all supported languages
    - Add Amazon ASIN codes and affiliate tags
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 9.1, 9.2_

  - [x] 3.2 Implement product search and filtering functions
    - Create functions to search products by condition type (NPK deficiency, disease, weather)
    - Implement category and subcategory filtering
    - Add regional availability filtering
    - Create product lookup by ID
    - _Requirements: 3.1, 3.3, 9.1, 9.2, 9.4_

- [x] 4. Implement Lightweight Rule DSL Engine
  - [x] 4.1 Create ProductMappingRule interface and rule storage
    - Define rule structure with conditions and product mappings
    - Create rules.json file with initial 10-15 mapping rules
    - Implement rule validation logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Build RuleDSLEngine class
    - Implement loadRules() to parse JSON rules
    - Create evaluateRules() to match field analysis against rule conditions
    - Add updateRule(), addRule(), and disableRule() methods for rule management
    - Implement rule priority and conflict resolution
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Create Regional Intelligence Service
  - [x] 5.1 Build regional data structure
    - Create RegionalIntelligence interface with state-specific data
    - Populate regional data for major Indian states (Punjab, Haryana, UP, Maharashtra, Karnataka, Tamil Nadu, West Bengal)
    - Include banned products, monsoon months, primary crops, and common diseases
    - _Requirements: 1.1, 9.1, 9.2_

  - [x] 5.2 Implement RegionalIntelligenceService class
    - Create getRegionalData() method
    - Implement isProductBanned() checking
    - Add adjustMonsoonTiming() for seasonal recommendations
    - Create filterByRegionalAvailability() method
    - _Requirements: 1.1, 9.1, 9.2_

- [x] 6. Build MarketIntelligenceService core
  - [x] 6.1 Implement field data analysis methods
    - Create analyzeField() to fetch data from BlackBoxService, DiseaseDetectionService, WeatherService, YieldPredictionService
    - Implement analyzeAllFields() for multi-field aggregation
    - Add NPK deficiency detection and severity classification
    - Implement disease history analysis with recurrence risk calculation
    - Add weather risk assessment (drought, heavy rain, heat stress, cold stress)
    - Create growth stage determination from planting date and crop type
    - Calculate overall data quality score
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2_

  - [x] 6.2 Create recommendation generation engine
    - Implement generateRecommendations() using Rule DSL Engine
    - Add confidence weighting for each recommendation
    - Create reason string generation (max 80 chars)
    - Implement timing guidance calculation
    - Add expected benefit descriptions
    - Apply regional filtering
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 6.3 Implement recommendation prioritization
    - Create prioritizeRecommendations() with urgency score calculation
    - Implement multi-factor sorting (urgency, confidence, priority level)
    - Add deduplication logic for similar products
    - Create getRecommendationsByCategory() and getRecommendationsByPriority() filters
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.4, 4.1, 4.2_

- [ ] 7. Implement Feedback Learning System
  - [ ] 7.1 Create FeedbackLearningService class
    - Implement recordFeedback() to log user actions (purchased, ignored, dismissed, viewed_details)
    - Create getProductMetrics() to calculate conversion rates and ignore rates
    - Add adjustProductConfidence() to modify confidence multipliers based on feedback
    - Implement identifyLowPerformingProducts() and identifyHighPerformingProducts()
    - Create analyzeIgnorePatterns() for pattern detection
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 7.2 Integrate feedback tracking with BlackBoxService
    - Log all recommendation views to BlackBoxService
    - Track buy button clicks with recommendation context
    - Record product dismissals and ignores
    - Store feedback data in localStorage with field association
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 8. Build Amazon Affiliate Integration
  - [x] 8.1 Create AmazonAffiliateService class
    - Implement generateAffiliateLink() with proper affiliate tag and ASIN
    - Add trackClick() to log clicks to BlackBoxService
    - Create openProductPage() to open links in new tab
    - Implement error handling for broken links
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 8.2 Add affiliate link validation
    - Validate ASIN format before generating links
    - Check product availability on Amazon India
    - Implement fallback for unavailable products
    - _Requirements: 3.1, 3.2, 3.4_

- [ ] 9. Implement Offline Mode Support
  - [ ] 9.1 Create OfflineService class
    - Implement cacheRecommendations() to store recommendations in IndexedDB
    - Add cacheProductImages() to store base64 encoded images
    - Create cacheVoiceSummaries() to pre-generate and store audio
    - Implement getOfflineRecommendations() to retrieve cached data
    - Add isOffline() network detection
    - Create syncWhenOnline() for background sync
    - _Requirements: 1.1, 1.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 9.2 Implement offline cache management
    - Add getOfflineCacheSize() to monitor storage usage
    - Create clearOfflineCache() for manual cleanup
    - Implement automatic cache pruning when storage is low
    - Add offline indicator in UI
    - _Requirements: 1.4, 5.1, 5.2, 5.3_

- [x] 10. Create Marketplace UI components
  - [x] 10.1 Build MarketplaceHeader component
    - Create field selector dropdown with "All Fields" option
    - Add notification badge for new recommendations
    - Implement category filter tabs (All, Fertilizers, Pesticides, Fungicides, Equipment)
    - Add priority filter (Immediate, Preventive, Seasonal)
    - Integrate with existing i18n system for multi-language support
    - _Requirements: 2.1, 2.2, 2.4, 5.1, 5.2, 6.1, 6.2_

  - [x] 10.2 Create RecommendationCard component
    - Display product image with lazy loading
    - Show eco-friendly and local manufacturer badges
    - Render product name in selected language
    - Display reason box with confidence indicator (max 80 chars)
    - Add timing guidance with clock icon
    - Show expected benefit with trending up icon
    - Display price in Indian rupee format with package size
    - Implement buy button with shopping cart icon
    - Create collapsible details section with full explanation
    - Add voice playback button for audio explanation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 10.3 Build RecommendationSection component
    - Create section headers for Immediate, Preventive, and Seasonal priorities
    - Add urgency indicators (high/medium/low)
    - Implement grid layout for recommendation cards
    - Add empty state messaging when no recommendations
    - Create loading skeleton for async data fetching
    - _Requirements: 2.1, 2.2, 2.4, 4.1, 4.2, 4.3, 4.4_

  - [x] 10.4 Implement MarketplaceView main component
    - Integrate MarketplaceHeader, RecommendationSection, and RecommendationCard
    - Add field selection state management
    - Implement recommendation loading with Context Cache
    - Create error boundary for graceful error handling
    - Add pull-to-refresh for mobile
    - Integrate with BottomNavigation and AIAdvisorFAB
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Integrate voice guidance
  - [ ] 11.1 Add voice support to recommendation cards
    - Integrate with existing audioService
    - Generate voice summaries for each recommendation
    - Implement play/pause controls
    - Add voice command support ("Show fertilizer recommendations")
    - Create multi-language voice synthesis
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 11.2 Implement voice-guided shopping flow
    - Add voice confirmation before opening Amazon links
    - Create voice navigation between recommendation categories
    - Implement voice feedback for user actions
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 12. Add notification system
  - [ ] 12.1 Implement proactive notification triggers
    - Create notification logic for severe NPK deficiencies
    - Add disease outbreak pattern notifications
    - Implement crop growth stage transition alerts
    - Create weather-based protective product alerts (7-day window)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 12.2 Build notification UI components
    - Create notification badge on marketplace icon
    - Implement notification list view
    - Add notification dismissal functionality
    - Create deep links from notifications to specific recommendations
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 13. Implement analytics and tracking
  - [ ] 13.1 Add recommendation analytics
    - Track recommendation generation events
    - Log recommendation views by priority and category
    - Record time spent viewing each recommendation
    - Track field-specific recommendation patterns
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 13.2 Implement purchase tracking
    - Log all buy button clicks with full context
    - Track conversion rates by product category
    - Record recommendation acceptance rates
    - Calculate revenue metrics (affiliate commissions)
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 14. Add budget and pricing features
  - [ ] 14.1 Implement budget constraint filtering
    - Create budget setting UI in user profile
    - Add budget-aware recommendation filtering
    - Implement cost calculation for all immediate recommendations
    - Create cost-effective alternative suggestions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 14.2 Add price comparison features
    - Display price ranges for recommendation categories
    - Show multiple price point options for same deficiency
    - Implement "budget-friendly" badge for lower-cost options
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 15. Implement seasonal planning features
  - [ ] 15.1 Create seasonal forecast engine
    - Generate 90-day product timeline based on crop cycle
    - Implement monsoon season recommendations
    - Add harvest season product suggestions
    - Create seasonal budget planning view
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 15.2 Build timeline visualization
    - Create timeline UI showing when products will be needed
    - Add calendar integration for seasonal reminders
    - Implement save functionality for future reference
    - _Requirements: 7.1, 7.2, 7.5_

- [x] 16. Replace placeholder Marketplace page
  - [x] 16.1 Update Marketplace.tsx
    - Remove placeholder content
    - Integrate MarketplaceView component
    - Add loading states and error boundaries
    - Implement responsive design for mobile and desktop
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 16.2 Update navigation and routing
    - Ensure marketplace route is properly configured
    - Add deep linking support for specific recommendations
    - Update BottomNavigation to highlight marketplace when active
    - _Requirements: 1.1, 6.1, 6.2_

- [x] 17. Add localization for marketplace
  - [x] 17.1 Create translation keys
    - Add marketplace-specific translation keys to all language files (en, hi, bn, mr, ta, te, pa, ha)
    - Translate product categories, priorities, and UI labels
    - Add agricultural terminology translations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 17.2 Implement dynamic content translation
    - Translate product names from catalog
    - Localize reason strings and explanations
    - Adapt timing guidance for regional language conventions
    - _Requirements: 5.1, 5.2, 5.4_

- [ ] 18. Implement error handling and edge cases
  - [ ] 18.1 Add graceful degradation
    - Handle missing NPK data (skip fertilizer recommendations)
    - Handle no disease history (show preventive products only)
    - Handle invalid growth stage (estimate from planting date)
    - Handle API failures (use cached data with warning)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 18.2 Create user-friendly error messages
    - Add error boundary with retry functionality
    - Show informative messages for data quality issues
    - Implement fallback UI for network failures
    - Create educational content for users with no field data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2_

- [ ] 19. Optimize performance
  - [ ] 19.1 Implement lazy loading and code splitting
    - Code-split marketplace components
    - Lazy load recommendation cards below fold
    - Implement progressive image loading
    - Add skeleton loaders for async operations
    - _Requirements: 1.1, 1.4, 6.1, 6.2_

  - [ ] 19.2 Optimize data fetching
    - Parallelize service calls to BlackBox, Disease, Weather, Yield
    - Implement request debouncing for field selector
    - Add request cancellation for abandoned operations
    - Optimize localStorage read/write operations
    - _Requirements: 1.1, 1.4, 6.1, 6.2_

- [ ] 20. Add mobile optimizations
  - [ ] 20.1 Optimize for mobile devices
    - Implement touch-friendly UI elements
    - Add swipe gestures for category navigation
    - Optimize image sizes for mobile networks
    - Implement pull-to-refresh functionality
    - _Requirements: 1.1, 2.1, 2.2, 6.1, 6.2_

  - [ ] 20.2 Add mobile-specific features
    - Implement share functionality for recommendations
    - Add "Add to Home Screen" prompt
    - Create mobile-optimized product detail view
    - Implement haptic feedback for interactions
    - _Requirements: 2.1, 2.2, 6.1, 6.2_
