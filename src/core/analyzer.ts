/**
 * TYPE ANALYZER - Introspects values to determine appropriate generators
 * 
 * Analyzes property names and values to infer the most appropriate
 * generator to use. Uses naming conventions and value types to make
 * intelligent decisions about what kind of mock data to generate.
 */

import { globalRegistry } from './registry';

/**
 * Utility class for analyzing types and inferring generators
 */
export class TypeAnalyzer {
  /**
   * Infers the appropriate generator key based on property name and value
   * 
   * Naming convention detection:
   * - id/Id/ID → uuid
   * - name/Name → person name
   * - email/Email → email address
   * - phone/Phone → phone number
   * - url/Url/URL → url
   * - age/Age → age number
   * - price/amount/cost → price
   * 
   * @param key - Property name
   * @param value - Current value (for type detection)
   * @returns Generator key string
   */
  static inferGenerator(key: string, value: unknown): string {
    const type = typeof value;
    
    // ==================== STRING TYPE DETECTION ====================
    if (type === 'string') {
      // Check for ID patterns (short strings ending in id/Id/ID)
      if (/^(id|Id|ID)$/.test(key) || /[a-z]Id$/.test(key)) {
        return 'string:uuid';
      }
      
      // Name patterns
      if (/name/i.test(key) && !/user/i.test(key) && !/file/i.test(key)) {
        return 'string:name';
      }
      
      // Email patterns
      if (/email/i.test(key)) {
        return 'string:email';
      }
      
      // Phone patterns
      if (/phone|mobile|tel/i.test(key)) {
        return 'string:phone';
      }
      
      // URL patterns
      if (/url|link|href|website/i.test(key)) {
        return 'string:url';
      }
      
      // Description/content (longer text)
      if (/description|content|body|text|bio/i.test(key)) {
        return 'string'; // Basic lorem ipsum
      }
      
      // Default string
      return 'string';
    }
    
    // ==================== NUMBER TYPE DETECTION ====================
    if (type === 'number') {
      // Age
      if (/age/i.test(key)) {
        return 'number:age';
      }
      
      // Pricing
      if (/price|cost|amount|fee|salary|wage/i.test(key)) {
        return 'number:price';
      }
      
      // Quantity/Count
      if (/quantity|count|stock|inventory/i.test(key)) {
        return 'number:int';
      }
      
      // Rating/Score (usually 0-5 or 0-10)
      if (/rating|score|stars/i.test(key)) {
        return 'number:float';
      }
      
      // Default number
      return 'number';
    }
    
    // ==================== BOOLEAN TYPE ====================
    if (type === 'boolean') {
      return 'boolean';
    }
    
    // ==================== DATE TYPE ====================
    if (value instanceof Date) {
      // Check for specific date types by naming
      if (/created|started|born/i.test(key)) {
        return 'Date:past';
      }
      if (/expires|deadline|due/i.test(key)) {
        return 'Date:future';
      }
      return 'Date:recent';
    }
    
    // ==================== ARRAY TYPE ====================
    if (Array.isArray(value)) {
      return 'array';
    }
    
    // ==================== OBJECT TYPE ====================
    if (this.isPlainObject(value)) {
      return 'object';
    }
    
    // Fallback to type name
    return type;
  }

  /**
   * Checks if value is a plain object (not array, date, or null)
   * @param value - Value to check
   * @returns true if plain object
   */
  static isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' 
      && value !== null 
      && !Array.isArray(value) 
      && !(value instanceof Date);
  }

  /**
   * Gets generator for a specific type, falling back to defaults
   * @param key - Property name
   * @param value - Value to analyze
   * @returns Generator function
   */
  static getGenerator(key: string, value: unknown) {
    const generatorKey = this.inferGenerator(key, value);
    return globalRegistry.get(generatorKey) || globalRegistry.get(typeof value);
  }
}