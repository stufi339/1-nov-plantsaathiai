/**
 * AmazonAffiliateService - Generate trackable affiliate links and handle purchases
 */

import { blackBoxService } from '../blackBoxService';

export class AmazonAffiliateService {
  private affiliateTag = 'plantsaathi-21'; // Replace with actual affiliate tag

  /**
   * Generate Amazon India affiliate link
   */
  generateAffiliateLink(asin: string, productName: string): string {
    if (!asin) {
      console.error('[Amazon] Invalid ASIN provided');
      return '';
    }

    const link = `https://www.amazon.in/dp/${asin}?tag=${this.affiliateTag}&linkCode=ogi&th=1&psc=1`;
    console.log(`[Amazon] Generated affiliate link for ${productName}`);
    return link;
  }

  /**
   * Track click to BlackBoxService for analytics
   */
  trackClick(productId: string, fieldId: string, recommendationContext: any): void {
    blackBoxService.logUserInteraction('button_click', 'marketplace_product_click', fieldId, {
      product_id: productId,
      recommendation_context: recommendationContext,
      timestamp: new Date().toISOString(),
      affiliate_tag: this.affiliateTag,
    });

    console.log(`[Amazon] Tracked click for product: ${productId}`);
  }

  /**
   * Open product page in new tab
   */
  openProductPage(affiliateLink: string, productName: string): void {
    if (!affiliateLink) {
      console.error('[Amazon] Cannot open empty link');
      return;
    }

    try {
      window.open(affiliateLink, '_blank', 'noopener,noreferrer');
      console.log(`[Amazon] Opened product page for: ${productName}`);
    } catch (error) {
      console.error('[Amazon] Failed to open product page:', error);
    }
  }

  /**
   * Validate ASIN format
   */
  validateASIN(asin: string): boolean {
    // Amazon ASIN is typically 10 characters (alphanumeric)
    const asinRegex = /^[A-Z0-9]{10}$/;
    return asinRegex.test(asin);
  }

  /**
   * Handle buy button click
   */
  handleBuyClick(
    productId: string,
    productName: string,
    asin: string,
    fieldId: string,
    recommendationContext: any
  ): void {
    // Validate ASIN
    if (!this.validateASIN(asin)) {
      console.warn(`[Amazon] Invalid ASIN format: ${asin}`);
    }

    // Generate affiliate link
    const link = this.generateAffiliateLink(asin, productName);

    // Track click
    this.trackClick(productId, fieldId, recommendationContext);

    // Open product page
    this.openProductPage(link, productName);
  }

  /**
   * Get affiliate tag
   */
  getAffiliateTag(): string {
    return this.affiliateTag;
  }

  /**
   * Set affiliate tag (for configuration)
   */
  setAffiliateTag(tag: string): void {
    this.affiliateTag = tag;
    console.log(`[Amazon] Updated affiliate tag to: ${tag}`);
  }
}

// Create singleton instance
export const amazonAffiliateService = new AmazonAffiliateService();
