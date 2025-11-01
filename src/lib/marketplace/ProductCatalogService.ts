/**
 * ProductCatalogService - Search and filter products from catalog
 */

import { PRODUCT_CATALOG } from './productCatalog';
import type { ProductCatalogEntry, ProductCategory } from './types';

export class ProductCatalogService {
  private catalog: ProductCatalogEntry[] = PRODUCT_CATALOG;

  /**
   * Get product by ID
   */
  getProductById(productId: string): ProductCatalogEntry | undefined {
    return this.catalog.find((p) => p.product_id === productId);
  }

  /**
   * Search products by NPK deficiency
   */
  searchByNPKDeficiency(nutrient: 'nitrogen' | 'phosphorus' | 'potassium'): ProductCatalogEntry[] {
    return this.catalog.filter(
      (p) => p.addresses_conditions.npk_deficiency === nutrient
    );
  }

  /**
   * Search products by disease type
   */
  searchByDiseaseType(diseaseType: string): ProductCatalogEntry[] {
    return this.catalog.filter((p) => {
      const diseases = p.addresses_conditions.disease_type || [];
      return diseases.some((d) => d.toLowerCase().includes(diseaseType.toLowerCase()));
    });
  }

  /**
   * Search products by weather condition
   */
  searchByWeatherCondition(condition: string): ProductCatalogEntry[] {
    return this.catalog.filter((p) => {
      const conditions = p.addresses_conditions.weather_condition || [];
      return conditions.includes(condition);
    });
  }

  /**
   * Search products by growth stage
   */
  searchByGrowthStage(stage: string): ProductCatalogEntry[] {
    return this.catalog.filter((p) => {
      const stages = p.addresses_conditions.growth_stage || [];
      return stages.some((s) => s.toLowerCase().includes(stage.toLowerCase()));
    });
  }

  /**
   * Filter by category
   */
  filterByCategory(category: ProductCategory): ProductCatalogEntry[] {
    return this.catalog.filter((p) => p.category === category);
  }

  /**
   * Filter by subcategory
   */
  filterBySubcategory(subcategory: string): ProductCatalogEntry[] {
    return this.catalog.filter((p) => p.subcategory === subcategory);
  }

  /**
   * Filter by regional availability
   */
  filterByRegion(region: string): ProductCatalogEntry[] {
    return this.catalog.filter((p) => p.regional_availability.includes(region));
  }

  /**
   * Filter eco-friendly products
   */
  filterEcoFriendly(): ProductCatalogEntry[] {
    return this.catalog.filter((p) => p.is_eco_friendly);
  }

  /**
   * Filter local manufacturer products
   */
  filterLocalManufacturers(): ProductCatalogEntry[] {
    return this.catalog.filter((p) => p.is_local);
  }

  /**
   * Filter by price range
   */
  filterByPriceRange(minPrice: number, maxPrice: number): ProductCatalogEntry[] {
    return this.catalog.filter((p) => p.base_price >= minPrice && p.base_price <= maxPrice);
  }

  /**
   * Filter by sustainability rating
   */
  filterBySustainability(minRating: number): ProductCatalogEntry[] {
    return this.catalog.filter((p) => p.sustainability_rating >= minRating);
  }

  /**
   * Get all products
   */
  getAllProducts(): ProductCatalogEntry[] {
    return [...this.catalog];
  }

  /**
   * Get products by multiple conditions (AND logic)
   */
  searchByConditions(conditions: {
    npk_deficiency?: 'nitrogen' | 'phosphorus' | 'potassium';
    disease_type?: string;
    weather_condition?: string;
    growth_stage?: string;
    category?: ProductCategory;
    region?: string;
    eco_friendly?: boolean;
    max_price?: number;
  }): ProductCatalogEntry[] {
    let results = [...this.catalog];

    if (conditions.npk_deficiency) {
      results = results.filter(
        (p) => p.addresses_conditions.npk_deficiency === conditions.npk_deficiency
      );
    }

    if (conditions.disease_type) {
      results = results.filter((p) => {
        const diseases = p.addresses_conditions.disease_type || [];
        return diseases.some((d) =>
          d.toLowerCase().includes(conditions.disease_type!.toLowerCase())
        );
      });
    }

    if (conditions.weather_condition) {
      results = results.filter((p) => {
        const weatherConditions = p.addresses_conditions.weather_condition || [];
        return weatherConditions.includes(conditions.weather_condition!);
      });
    }

    if (conditions.growth_stage) {
      results = results.filter((p) => {
        const stages = p.addresses_conditions.growth_stage || [];
        return stages.some((s) =>
          s.toLowerCase().includes(conditions.growth_stage!.toLowerCase())
        );
      });
    }

    if (conditions.category) {
      results = results.filter((p) => p.category === conditions.category);
    }

    if (conditions.region) {
      results = results.filter((p) => p.regional_availability.includes(conditions.region!));
    }

    if (conditions.eco_friendly !== undefined) {
      results = results.filter((p) => p.is_eco_friendly === conditions.eco_friendly);
    }

    if (conditions.max_price !== undefined) {
      results = results.filter((p) => p.base_price <= conditions.max_price!);
    }

    return results;
  }

  /**
   * Get product alternatives (similar products)
   */
  getAlternatives(productId: string): ProductCatalogEntry[] {
    const product = this.getProductById(productId);
    if (!product) return [];

    return this.catalog.filter(
      (p) =>
        p.product_id !== productId &&
        p.category === product.category &&
        p.subcategory === product.subcategory
    );
  }

  /**
   * Get budget-friendly alternatives
   */
  getBudgetAlternatives(productId: string): ProductCatalogEntry[] {
    const product = this.getProductById(productId);
    if (!product) return [];

    return this.catalog.filter(
      (p) =>
        p.product_id !== productId &&
        p.category === product.category &&
        p.subcategory === product.subcategory &&
        p.base_price < product.base_price
    );
  }

  /**
   * Get catalog statistics
   */
  getStats(): {
    total_products: number;
    by_category: { [key: string]: number };
    eco_friendly_count: number;
    local_manufacturer_count: number;
    avg_price: number;
  } {
    const byCategory: { [key: string]: number } = {};

    this.catalog.forEach((p) => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    const totalPrice = this.catalog.reduce((sum, p) => sum + p.base_price, 0);

    return {
      total_products: this.catalog.length,
      by_category: byCategory,
      eco_friendly_count: this.catalog.filter((p) => p.is_eco_friendly).length,
      local_manufacturer_count: this.catalog.filter((p) => p.is_local).length,
      avg_price: totalPrice / this.catalog.length,
    };
  }
}

// Create singleton instance
export const productCatalogService = new ProductCatalogService();
