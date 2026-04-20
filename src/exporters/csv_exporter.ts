/**
 * CSV EXPORTER - Exports mock data to CSV format
 * 
 * Handles flattening of nested objects, array serialization,
 * and proper escaping of special characters.
 */

import { BaseExporter } from './base';
import { CSVExportOptions } from '../core/types';

/**
 * Exports data to CSV format
 */
export class CSVExporter extends BaseExporter {
  /**
   * Export data array to CSV string
   * 
   * @param data - Array of objects to export
   * @param options - CSV export options
   * @returns CSV formatted string
   */
  export<T extends object>(data: T[], options: CSVExportOptions = {}): string {
    const {
      delimiter = ',',
      header = true,
      nestedHandling = 'flatten',
      dateFormat = 'iso'
    } = options;

    if (data.length === 0) {
      return '';
    }

    // Flatten data if needed
    const processedData = nestedHandling === 'flatten' 
      ? data.map(item => this.flattenObject(item as Record<string, unknown>))
      : data.map(item => {
          // Convert nested objects to JSON strings
          const processed: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(item)) {
            if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
              processed[key] = JSON.stringify(value);
            } else {
              processed[key] = value;
            }
          }
          return processed;
        });

    // Get all unique headers
    const headers = this.extractHeaders(processedData);

    // Build CSV rows
    const rows: string[] = [];

    // Add header row
    if (header) {
      rows.push(this.formatRow(headers, delimiter));
    }

    // Add data rows
    for (const item of processedData) {
      const values = headers.map(h => this.serializeForCSV(item[h], dateFormat));
      rows.push(this.formatRow(values, delimiter));
    }

    return rows.join('\n');
  }

  /**
   * Extract all unique headers from data
   */
  private extractHeaders(data: Record<string, unknown>[]): string[] {
    const headerSet = new Set<string>();
    
    for (const item of data) {
      Object.keys(item).forEach(key => headerSet.add(key));
    }
    
    return Array.from(headerSet);
  }

  /**
   * Serialize value for CSV output
   */
  private serializeForCSV(value: unknown, dateFormat: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDate(value, dateFormat as 'iso' | 'unix' | 'locale');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Format array of values as CSV row
   * Handles escaping of quotes and special characters
   */
  private formatRow(values: string[], delimiter: string): string {
    return values.map(value => this.escapeValue(value, delimiter)).join(delimiter);
  }

  /**
   * Escape CSV value according to RFC 4180
   * Wraps in quotes if contains delimiter, quotes, or newlines
   */
  private escapeValue(value: string, delimiter: string): string {
    const needsQuotes = value.includes(delimiter) || 
                        value.includes('"') || 
                        value.includes('\n') ||
                        value.includes('\r');

    if (!needsQuotes) {
      return value;
    }

    // Double up quotes and wrap in quotes
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  getExtension(): string {
    return 'csv';
  }

  getMimeType(): string {
    return 'text/csv';
  }
}

/** Singleton instance */
export const csvExporter = new CSVExporter();