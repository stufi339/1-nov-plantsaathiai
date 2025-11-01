# Soil Saathi - Focused Soil Analysis Requirements Document

## Introduction

This specification defines the frontend enhancements for Soil Saathi, a focused soil analysis module within Plant Saathi AI. Soil Saathi provides farmers with comprehensive vegetation indices analysis and derived NPK estimates based on satellite data and vegetation health indicators. The module focuses exclusively on soil and vegetation health analysis with audio accessibility features.

## Glossary

- **Soil_Saathi_Module**: The focused soil analysis component that displays vegetation indices and derived NPK estimates
- **Vegetation_Indices**: Numerical values derived from satellite imagery indicating plant and soil health metrics
- **NDVI**: Normalized Difference Vegetation Index - measures overall vegetation health and vigor
- **MSAVI2**: Modified Soil Adjusted Vegetation Index 2 - enhanced vegetation measurement accounting for soil background
- **NDRE**: Normalized Difference Red Edge - indicates nitrogen content and vegetation vigor
- **NDWI**: Normalized Difference Water Index - measures water content in plant leaves and water stress
- **NDMI**: Normalized Difference Moisture Index - indicates vegetation water content and drought stress
- **SOC_VIS**: Soil Organic Carbon Visibility - estimates soil organic matter content
- **RSM**: Root Zone Soil Moisture - soil moisture at root level affecting plant growth
- **RVI**: Ratio Vegetation Index - simple ratio indicating vegetation density and health
- **NPK_Derived_Estimates**: Nutrient estimates derived from vegetation indices and plant health indicators
- **Nitrogen_Estimate**: Derived from NDRE + vegetation vigor analysis
- **Phosphorus_Estimate**: Estimated from vegetation indices + soil data correlation
- **Potassium_Estimate**: Estimated from plant health + stress indicators analysis
- **Black_Box_Data**: Comprehensive data storage system for all user interactions and field measurements
- **Audio_Playback_System**: Text-to-speech functionality for accessibility and farmer education
- **Farmer_Friendly_Interface**: User interface designed for agricultural users with varying technical literacy

## Requirements

### Requirement 1

**User Story:** As a farmer using the Soil Saathi module, I want to view comprehensive vegetation indices including all soil and plant health indicators, so that I can understand my field's complete health status.

#### Acceptance Criteria

1. WHEN the farmer accesses field details, THE Soil_Saathi_Module SHALL display NDVI (Normalized Difference Vegetation Index) with values between 0.0 and 1.0
2. WHEN the farmer accesses field details, THE Soil_Saathi_Module SHALL display MSAVI2 (Modified Soil Adjusted Vegetation Index 2) with values between 0.0 and 1.0
3. WHEN the farmer accesses field details, THE Soil_Saathi_Module SHALL display NDRE (Normalized Difference Red Edge) with values between 0.0 and 1.0
4. WHEN the farmer accesses field details, THE Soil_Saathi_Module SHALL display NDWI (Normalized Difference Water Index) with values between 0.0 and 1.0
5. WHEN the farmer accesses field details, THE Soil_Saathi_Module SHALL display NDMI (Normalized Difference Moisture Index) with values between 0.0 and 1.0

### Requirement 2

**User Story:** As a farmer using the Soil Saathi module, I want to view additional soil and vegetation health indicators, so that I can get a complete picture of my field conditions.

#### Acceptance Criteria

1. WHEN the farmer accesses field details, THE Soil_Saathi_Module SHALL display SOC_VIS (Soil Organic Carbon Visibility) with values between 0.0 and 1.0
2. WHEN the farmer accesses field details, THE Soil_Saathi_Module SHALL display RSM (Root Zone Soil Moisture) with values between 0.0 and 1.0
3. WHEN the farmer accesses field details, THE Soil_Saathi_Module SHALL display RVI (Ratio Vegetation Index) with values between 1.0 and 10.0
4. WHEN displaying vegetation indices, THE Soil_Saathi_Module SHALL provide farmer-friendly explanations for each index
5. WHEN displaying vegetation indices, THE Soil_Saathi_Module SHALL show optimal ranges and current status for each index

### Requirement 3

**User Story:** As a farmer using the Soil Saathi module, I want to view derived NPK estimates based on vegetation analysis, so that I can understand my soil's nutrient status without expensive soil testing.

#### Acceptance Criteria

1. WHERE NPK confidence levels exceed 0.7, THE Soil_Saathi_Module SHALL display estimated Nitrogen levels derived from NDRE and vegetation vigor
2. WHERE NPK confidence levels exceed 0.7, THE Soil_Saathi_Module SHALL display estimated Phosphorus levels derived from vegetation indices and soil data correlation
3. WHERE NPK confidence levels exceed 0.7, THE Soil_Saathi_Module SHALL display estimated Potassium levels derived from plant health and stress indicators
4. WHEN displaying NPK estimates, THE Soil_Saathi_Module SHALL show confidence levels for each nutrient estimate
5. WHEN displaying NPK estimates, THE Soil_Saathi_Module SHALL include disclaimer about estimated values and recommendation for soil testing

### Requirement 4

**User Story:** As a farmer with varying technical literacy, I want audio explanations for vegetation indices and soil analysis data, so that I can understand the information regardless of my reading ability.

#### Acceptance Criteria

1. WHEN farmer clicks audio button on vegetation indices, THE Audio_Playback_System SHALL speak the index explanation in farmer-friendly language
2. WHEN farmer clicks audio button on NPK estimates, THE Audio_Playback_System SHALL speak the nutrient status and recommendations
3. WHEN farmer clicks audio button on soil health summary, THE Audio_Playback_System SHALL speak the overall field health assessment
4. WHILE audio is playing, THE Soil_Saathi_Module SHALL display visual indicators showing active audio playback
5. WHEN audio playback starts, THE Audio_Playback_System SHALL stop any previously playing audio

### Requirement 5

**User Story:** As a farmer managing field data, I want all my interactions and field measurements to be automatically saved, so that the system can learn and improve recommendations over time.

#### Acceptance Criteria

1. WHEN farmer views vegetation indices, THE Soil_Saathi_Module SHALL save all displayed values to the black box data system
2. WHEN farmer interacts with audio features, THE Soil_Saathi_Module SHALL log audio usage patterns to the black box data system
3. WHEN farmer accesses field details, THE Soil_Saathi_Module SHALL record field access patterns and time spent on different indices
4. WHEN NPK estimates are displayed, THE Soil_Saathi_Module SHALL store confidence levels and estimation accuracy data
5. WHEN farmer provides feedback or ratings, THE Soil_Saathi_Module SHALL save feedback data for model improvement

### Requirement 6

**User Story:** As a farmer using the Soil Saathi interface, I want responsive and intuitive navigation with proper error handling, so that I can efficiently access soil analysis features.

#### Acceptance Criteria

1. WHEN farmer accesses soil analysis, THE Soil_Saathi_Module SHALL display appropriate loading states during data processing
2. WHERE errors occur during API calls, THE Soil_Saathi_Module SHALL display user-friendly error messages with retry options
3. WHEN farmer navigates within soil analysis, THE Soil_Saathi_Module SHALL maintain consistent visual design and user experience
4. WHEN displaying multiple vegetation indices, THE Soil_Saathi_Module SHALL organize information in easily digestible sections
5. WHEN farmer uses mobile device, THE Soil_Saathi_Module SHALL provide responsive design optimized for touch interaction