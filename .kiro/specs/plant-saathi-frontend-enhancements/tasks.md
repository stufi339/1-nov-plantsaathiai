# Soil Saathi Implementation Plan

- [x] 1. Set up shared services and utilities for Soil Saathi
  - Create AudioService class for centralized text-to-speech functionality
  - Implement API service utilities for backend communication
  - Create data formatting utilities for vegetation indices
  - Create black box data collection service for user interactions and measurements
  - _Requirements: 4.1, 4.4, 4.5, 5.1, 5.2, 5.3_

- [x] 2. Enhance VegetationIndicesGrid component with complete vegetation indices set
  - [x] 2.1 Update TypeScript interfaces for complete vegetation indices
    - Add all vegetation indices: NDVI, MSAVI2, NDRE, NDWI, NDMI, SOC_VIS, RSM, RVI
    - Add optional NPK properties (nitrogen, phosphorus, potassium, npk_confidence)
    - Update component props interface for comprehensive data structure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_

  - [x] 2.2 Implement comprehensive vegetation indices display logic
    - Add NDVI (vegetation health) index with optimal range 0.3-0.8
    - Add MSAVI2 (soil-adjusted vegetation) index with optimal range 0.4-0.7
    - Add NDRE (nitrogen content) index with optimal range 0.2-0.6
    - Add NDWI (water content) index with optimal range 0.2-0.5
    - Add NDMI (moisture index) index with optimal range 0.2-0.6
    - Add SOC_VIS (soil organic carbon) index with optimal range 0.3-0.7
    - Add RSM (root zone soil moisture) index with optimal range 0.3-0.6
    - Add RVI (ratio vegetation index) with optimal range 2.0-8.0
    - Implement farmer-friendly explanations and recommendations for each index
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.3 Create derived NPK indicators section
    - Implement NPK section that displays only when npk_confidence > 0.7
    - Add Nitrogen estimate derived from NDRE + vegetation vigor analysis
    - Add Phosphorus estimate derived from vegetation indices + soil data correlation
    - Add Potassium estimate derived from plant health + stress indicators
    - Include confidence levels and estimation methodology explanations
    - Include disclaimer about estimated values and recommendation for soil testing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.4 Update mock data in FieldDetailsDashboard
    - Add comprehensive vegetation indices values to mockFieldData
    - Include sample NPK data with confidence levels and derivation sources
    - Ensure realistic value ranges for all indices based on crop types
    - Add temporal data to show index changes over time
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 3. Implement comprehensive audio explanations for Soil Saathi
  - [x] 3.1 Create audio explanations for vegetation indices
    - Add audio buttons for each vegetation index (NDVI, MSAVI2, NDRE, NDWI, NDMI, SOC_VIS, RSM, RVI)
    - Implement farmer-friendly audio explanations for each index meaning and implications
    - Create audio explanations for optimal ranges and current status interpretation
    - _Requirements: 4.1, 4.2_

  - [x] 3.2 Create audio explanations for NPK estimates
    - Add audio buttons for nitrogen, phosphorus, and potassium estimates
    - Implement audio explanations for NPK derivation methodology
    - Create audio recommendations based on nutrient levels and confidence
    - _Requirements: 4.2, 4.3_

  - [x] 3.3 Implement overall soil health audio summary
    - Create comprehensive audio summary of field health status
    - Add audio recommendations for soil management actions
    - Implement audio explanations for seasonal variations and trends
    - _Requirements: 4.3, 4.4_

- [x] 4. Implement black box data collection system
  - [x] 4.1 Create comprehensive data logging service
    - Implement logging for all vegetation indices views and interactions
    - Add logging for audio feature usage patterns and preferences
    - Create logging for field access patterns and time spent on different sections
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 4.2 Implement NPK estimation data collection
    - Log NPK confidence levels and estimation accuracy data
    - Store derivation source data (which indices contributed to estimates)
    - Record user feedback on NPK estimate accuracy when available
    - _Requirements: 5.4, 5.5_

  - [x] 4.3 Create user interaction analytics
    - Track user navigation patterns within soil analysis
    - Log error occurrences and user retry behaviors
    - Store user preferences for display formats and audio usage
    - _Requirements: 5.3, 5.5_

- [ ] 5. Implement shared AudioService functionality for Soil Saathi
  - [x] 5.1 Create AudioService class
    - Implement centralized text-to-speech using Web Speech API
    - Add queue management to stop current audio when new audio starts
    - Create visual feedback system for active audio playback
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 5.2 Integrate AudioService in VegetationIndicesGrid
    - Update VegetationIndicesGrid to use centralized AudioService
    - Add audio buttons for each vegetation index with proper labeling
    - Implement audio state management and visual feedback
    - _Requirements: 4.1, 4.2_

  - [ ]* 5.3 Add audio accessibility enhancements
    - Implement fallback messaging for browsers without speech synthesis
    - Add audio control preferences (speed, voice selection)
    - Create keyboard shortcuts for audio controls
    - _Requirements: 4.1, 4.4_

- [ ] 6. Update Soil Saathi component styling and responsive design
  - [x] 6.1 Ensure consistent styling across vegetation indices display
    - Apply existing design system patterns to enhanced vegetation indices
    - Maintain gradient backgrounds and card styling consistency
    - Update responsive breakpoints for mobile optimization of indices grid
    - _Requirements: 6.3, 6.4_

  - [x] 6.2 Add loading states and transitions for soil analysis
    - Implement skeleton screens for vegetation indices loading
    - Add smooth transitions between different soil health states
    - Create progress indicators for data fetching and processing
    - _Requirements: 6.1, 6.2_

  - [ ]* 6.3 Optimize performance for vegetation indices display
    - Implement React.memo for VegetationIndicesGrid component
    - Add memoization for complex vegetation index calculations
    - Optimize rendering of multiple indices with large datasets
    - _Requirements: 6.3, 6.4_

- [ ] 7. Add comprehensive error handling for Soil Saathi
  - [x] 7.1 Implement error handling for vegetation indices
    - Add error boundaries for vegetation indices component
    - Create user-friendly error messages for API failures
    - Implement retry functionality for failed vegetation data requests
    - _Requirements: 6.2, 6.5_

  - [x] 7.2 Add user feedback and notifications for soil analysis
    - Implement toast notifications for successful data loading
    - Add visual feedback for completed soil analysis operations
    - Create confirmation messages for data refresh actions
    - _Requirements: 6.3, 6.4_

- [ ]* 8. Testing and validation for Soil Saathi
  - [ ]* 8.1 Write unit tests for vegetation indices components
    - Test VegetationIndicesGrid with all vegetation indices
    - Test NPK estimation display and confidence logic
    - Test audio functionality for soil analysis explanations
    - _Requirements: All requirements_

  - [ ]* 8.2 Add integration tests for soil analysis user flows
    - Test complete soil analysis flow from field selection to results
    - Test audio functionality across all vegetation indices
    - Test black box data collection during user interactions
    - _Requirements: All requirements_

  - [ ]* 8.3 Validate accessibility compliance for Soil Saathi
    - Test screen reader compatibility for vegetation indices
    - Validate keyboard navigation functionality
    - Check color contrast and visual accessibility for soil health indicators
    - _Requirements: 4.1, 4.4, 4.5_