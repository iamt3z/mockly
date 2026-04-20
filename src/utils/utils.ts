/**
 * UTILITY FUNCTIONS - Helper functions for common operations
 *
 * File system operations, data manipulation, and validation utilities.
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Ensures directory exists, creating if necessary
 * @param dirPath - Directory path
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Writes data to file, ensuring directory exists
 * @param filePath - Full file path
 * @param data - Data to write
 */
export function writeFile(filePath: string, data: string): void {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, data, "utf-8");
}

/**
 * Generates filename with timestamp
 * @param baseName - Base name
 * @param extension - File extension
 * @returns Filename with timestamp
 */
export function timestampFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${baseName}-${timestamp}.${extension}`;
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  // Handle null and non-objects
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as any;
  }

  // Handle objects
  const cloned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as any)[key]);
    }
  }
  return cloned;
}

/**
 * Pick random subset of array
 * @param array - Source array
 * @param count - Number to pick
 * @returns Random subset
 */
export function pickRandom<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Format currency amount
 * @param amount - Number amount
 * @param currency - Currency code
 * @returns Formatted string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Generate slug from string
 * @param text - Input text
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Calculate age from birthdate
 * @param birthDate - Date of birth
 * @returns Age in years
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Group array by key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export function groupBy<T extends object>(
  array: T[],
  key: keyof T,
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      result[groupKey] = result[groupKey] || [];
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Calculate sum of array values
 * @param array - Array of numbers
 * @returns Sum
 */
export function sum(array: number[]): number {
  return array.reduce((a, b) => a + b, 0);
}

/**
 * Calculate average of array values
 * @param array - Array of numbers
 * @returns Average or 0 if empty
 */
export function average(array: number[]): number {
  return array.length ? sum(array) / array.length : 0;
}
