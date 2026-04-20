/**
 * SEEDED RANDOM GENERATOR - Linear Congruential Generator (LCG)
 * 
 * Provides deterministic random number generation based on a seed value.
 * This ensures that the same seed always produces the same sequence of numbers,
 * making mock data generation reproducible and testable.
 */

/**
 * Linear Congruential Generator for seeded random numbers
 * 
 * LCG Formula: X(n+1) = (a * X(n) + c) % m
 * Where:
 *   a = 9301 (multiplier)
 *   c = 49297 (increment)
 *   m = 233280 (modulus)
 * 
 * These constants are chosen for good statistical properties and
 * to produce a full period (all possible values before repeating).
 */
export class SeededRandom {
  /** Current seed value */
  private seed: number;

  /**
   * Creates a new seeded random generator
   * @param seed - Initial seed value. Uses current timestamp if not provided
   */
  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generates next random float between 0 and 1
   * Uses LCG algorithm with carefully chosen constants
   * @returns Random number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    // LCG formula: (a * seed + c) % m
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generates random integer in range [min, max] (inclusive)
   * @param min - Minimum value (default: 0)
   * @param max - Maximum value (default: 100)
   * @returns Random integer
   */
  nextInt(min: number = 0, max: number = 100): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generates random float in range [min, max)
   * @param min - Minimum value (default: 0)
   * @param max - Maximum value (default: 1)
   * @returns Random float
   */
  nextFloat(min: number = 0, max: number = 1): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Generates random boolean
   * @returns true or false with 50% probability
   */
  nextBoolean(): boolean {
    return this.next() > 0.5;
  }

  /**
   * Picks random element from array
   * @param array - Array to pick from
   * @returns Random element
   */
  pick<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Generates random date within range
   * @param start - Start date (default: 2020-01-01)
   * @param end - End date (default: now)
   * @returns Random Date object
   */
  date(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return new Date(startTime + this.next() * (endTime - startTime));
  }

  /**
   * Generates UUID v4-like string
   * Not cryptographically secure, but suitable for mock data
   * @returns UUID string (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
   */
  uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = this.nextInt(0, 15);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Creates a clone of this random generator
   * Clone has same seed state, producing identical sequence
   * @returns Cloned SeededRandom instance
   */
  clone(): SeededRandom {
    const clone = new SeededRandom(0);
    clone.seed = this.seed;
    return clone;
  }

  /**
   * Gets current seed value (for debugging/state inspection)
   */
  get currentSeed(): number {
    return this.seed;
  }
}