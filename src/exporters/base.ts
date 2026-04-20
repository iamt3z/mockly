/**
 * BASE EXPORTER - Abstract base class for data exporters
 * 
 * Defines the interface that all exporters must implement.
 * Provides common functionality for data transformation and validation.
 */

import { ExportOptions } from '../core/types';
import { TypeAnalyzer } from '../core/analyzer';

/**
 * Abstract base class for data exporters
 * Implementations must provide format-specific export logic
 */
export abstract class BaseExporter {
  /**
   * Export data to specific format
   * @param data - Array of objects to export
   * @param options - Export configuration
   * @returns Formatted string or binary data
   */
  abstract export<T extends object>(data: T[], options?: ExportOptions): string;

  /**
   * Get file extension for this format
   * @returns File extension without dot
   */
  abstract getExtension(): string;

  /**
   * Get MIME type for this format
   * @returns MIME type string
   */
  abstract getMimeType(): string;

  /**
   * Serialize value for export
   * Handles Dates, nulls, and nested objects
   * @param value - Value to serialize
   * @param options - Export options
   * @returns Serialized value
   */
  protected serializeValue(value: unknown, options?: ExportOptions): unknown {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDate(value, options?.dateFormat || 'iso');
    }

    if (typeof value === 'object') {
      // For nested objects, either flatten or JSON stringify based on options
      return JSON.stringify(value);
    }

    return value;
  }

  /**
   * Format date according to specified format
   * @param date - Date to format
   * @param format - Target format
   * @returns Formatted date string
   */
  protected formatDate(date: Date, format: 'iso' | 'unix' | 'locale'): string {
    switch (format) {
      case 'unix':
        return Math.floor(date.getTime() / 1000).toString();
      case 'locale':
        return date.toLocaleString();
      case 'iso':
      default:
        return date.toISOString();
    }
  }

  /**
   * Flatten nested object for CSV export
   * @param obj - Object to flatten
   * @param prefix - Key prefix for nesting
   * @returns Flattened object with dot-notation keys
   */
  protected flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (TypeAnalyzer.isPlainObject(value)) {
        Object.assign(result, this.flattenObject(value as Record<string, unknown>, newKey));
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }
}