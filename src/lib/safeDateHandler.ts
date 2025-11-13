/**
 * Safe Date Handler - Global utility to prevent ALL date-related errors
 * This wraps ALL date operations to ensure they never crash
 */

export class SafeDateHandler {
  /**
   * Safely convert any value to ISO string
   */
  static toISOString(date: any): string {
    try {
      if (!date) return new Date().toISOString();
      
      const d = date instanceof Date ? date : new Date(date);
      
      if (isNaN(d.getTime())) {
        console.warn('Invalid date detected, using current date:', date);
        return new Date().toISOString();
      }
      
      return d.toISOString();
    } catch (error) {
      console.warn('Error in toISOString, using current date:', error);
      return new Date().toISOString();
    }
  }

  /**
   * Safely get timestamp
   */
  static getTime(date: any): number {
    try {
      if (!date) return Date.now();
      
      const d = date instanceof Date ? date : new Date(date);
      const time = d.getTime();
      
      if (isNaN(time)) {
        console.warn('Invalid date detected, using current time:', date);
        return Date.now();
      }
      
      return time;
    } catch (error) {
      console.warn('Error getting time, using current time:', error);
      return Date.now();
    }
  }

  /**
   * Safely format date to locale string
   */
  static toLocaleDateString(date: any, locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
    try {
      if (!date) return new Date().toLocaleDateString(locales, options);
      
      const d = date instanceof Date ? date : new Date(date);
      
      if (isNaN(d.getTime())) {
        console.warn('Invalid date detected, using current date:', date);
        return new Date().toLocaleDateString(locales, options);
      }
      
      return d.toLocaleDateString(locales, options);
    } catch (error) {
      console.warn('Error formatting date, using current date:', error);
      return new Date().toLocaleDateString(locales, options);
    }
  }

  /**
   * Safely create a Date object
   */
  static createDate(value?: any): Date {
    try {
      if (!value) return new Date();
      
      const d = value instanceof Date ? value : new Date(value);
      
      if (isNaN(d.getTime())) {
        console.warn('Invalid date detected, using current date:', value);
        return new Date();
      }
      
      return d;
    } catch (error) {
      console.warn('Error creating date, using current date:', error);
      return new Date();
    }
  }

  /**
   * Check if a date is valid
   */
  static isValid(date: any): boolean {
    try {
      if (!date) return false;
      
      const d = date instanceof Date ? date : new Date(date);
      return !isNaN(d.getTime());
    } catch (error) {
      return false;
    }
  }

  /**
   * Get safe date string for display
   */
  static getSafeDisplayDate(date: any, fallback: string = 'Not set'): string {
    try {
      if (!date) return fallback;
      
      const d = date instanceof Date ? date : new Date(date);
      
      if (isNaN(d.getTime())) {
        return fallback;
      }
      
      return d.toLocaleDateString();
    } catch (error) {
      return fallback;
    }
  }
}

// Global error handler for Date.prototype.toISOString
const originalToISOString = Date.prototype.toISOString;
Date.prototype.toISOString = function() {
  try {
    if (isNaN(this.getTime())) {
      console.warn('Invalid date in toISOString, returning current date');
      return new Date().toISOString.call(new Date());
    }
    return originalToISOString.call(this);
  } catch (error) {
    console.warn('Error in toISOString, returning current date:', error);
    return new Date().toISOString.call(new Date());
  }
};

export const safeDateHandler = SafeDateHandler;
