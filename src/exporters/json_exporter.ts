/**
 * JSON EXPORTER - Exports mock data to JSON format
 * 
 * Provides formatted JSON output with optional metadata.
 * Supports pretty printing and date formatting options.
 */

import { BaseExporter } from './base';
import { ExportOptions } from '../core/types';

/**
 * JSON-specific export options
 */
export interface JSONExportOptions extends ExportOptions {
  /** Include summary statistics */
  includeStats?: boolean;
  
  /** Root object key name */
  rootKey?: string;
}

/**
 * Exports data to JSON format
 */
export class JSONExporter extends BaseExporter {
  /**
   * Export data array to JSON string
   * 
   * @param data - Array of objects to export
   * @param options - JSON export options
   * @returns JSON string
   */
  export<T extends object>(data: T[], options: JSONExportOptions = {}): string {
    const { 
      pretty = true, 
      includeMetadata = false,
      includeStats = false,
      rootKey = 'data',
      dateFormat = 'iso'
    } = options;

    // Transform data for export
    const transformedData = data.map(item => this.transformItem(item, dateFormat));

    // Build output structure
    let output: Record<string, unknown> = {
      [rootKey]: transformedData
    };

    // Add metadata if requested
    if (includeMetadata) {
      output.metadata = {
        generatedAt: new Date().toISOString(),
        count: data.length,
        version: '1.0.0'
      };
    }

    // Add statistics if requested
    if (includeStats && data.length > 0) {
      output.stats = this.calculateStats(data);
    }

    // Serialize to JSON
    return pretty 
      ? JSON.stringify(output, null, 2) 
      : JSON.stringify(output);
  }

  /**
   * Transform single item for export
   * Handles date serialization and nested objects
   */
  private transformItem<T extends object>(item: T, dateFormat: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(item)) {
      result[key] = this.serializeValue(value, { dateFormat: dateFormat as 'iso' | 'unix' | 'locale' });
    }

    return result;
  }

  /**
   * Calculate basic statistics about the dataset
   */
  private calculateStats<T extends object>(data: T[]): Record<string, unknown> {
    const firstItem = data[0];
    const keys = Object.keys(firstItem);

    const fieldStats: Record<string, unknown> = {};

    keys.forEach(key => {
      const values = data.map(item => (item as Record<string, unknown>)[key]);
      const types = new Set(values.map(v => v === null ? 'null' : typeof v));
      
      fieldStats[key] = {
        types: Array.from(types),
        nullCount: values.filter(v => v === null).length
      };
    });

    return {
      totalRecords: data.length,
      fields: Object.keys(firstItem).length,
      fieldStats
    };
  }

  getExtension(): string {
    return 'json';
  }

  getMimeType(): string {
    return 'application/json';
  }
}

/** Singleton instance */
export const jsonExporter = new JSONExporter();