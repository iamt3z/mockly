/**
 * GENERATOR REGISTRY - Plugin system for custom value generators
 * 
 * Manages a collection of named generator functions that produce mock data.
 * Supports default generators for primitives and allows custom registration.
 * Uses a hierarchical naming scheme: type:variant (e.g., "string:email")
 */

import { MockContext } from './types';

/** Function type for generators */
export type GeneratorFn<T = unknown> = (ctx: MockContext) => T;

/**
 * Registry for managing generator functions
 * Provides default generators and allows custom registration
 */
export class GeneratorRegistry {
  /** Internal map storing generators by name */
  private generators = new Map<string, GeneratorFn>();

  /**
   * Creates registry and registers default generators
   */
  constructor() {
    this.registerDefaults();
  }

  /**
   * Registers built-in default generators
   * These handle common mock data patterns
   */
  private registerDefaults(): void {
    // ==================== STRING GENERATORS ====================
    
    /** Basic lorem ipsum text generator */
    this.register('string', (ctx) => {
      const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 
                     'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor'];
      const length = ctx.random.nextInt(3, 8);
      return words.slice(0, length).join(' ');
    });

    /** Person name generator */
    this.register('string:name', (ctx) => {
      const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 
                          'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 
                         'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'];
      return `${ctx.random.pick(firstNames)} ${ctx.random.pick(lastNames)}`;
    });

    /** Email address generator */
    this.register('string:email', (ctx) => {
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 
                       'business.org', 'tech.io'];
      const local = `user${ctx.index}${ctx.random.nextInt(100, 999)}`;
      return `${local}@${ctx.random.pick(domains)}`;
    });

    /** UUID generator */
    this.register('string:uuid', (ctx) => ctx.random.uuid());

    /** URL generator */
    this.register('string:url', (ctx) => {
      const protocols = ['https', 'http'];
      const domains = ['example.com', 'test.org', 'demo.io', 'site.net'];
      const paths = ['api', 'v1', 'users', 'products', 'images'];
      return `${ctx.random.pick(protocols)}://${ctx.random.pick(domains)}/${ctx.random.pick(paths)}/${ctx.random.uuid()}`;
    });

    /** Phone number generator */
    this.register('string:phone', (ctx) => {
      const area = ctx.random.nextInt(100, 999);
      const prefix = ctx.random.nextInt(100, 999);
      const line = ctx.random.nextInt(1000, 9999);
      return `+1-${area}-${prefix}-${line}`;
    });

    // ==================== NUMBER GENERATORS ====================

    /** Integer generator (1-100 default) */
    this.register('number', (ctx) => ctx.random.nextInt(1, 100));
    
    /** Explicit integer generator */
    this.register('number:int', (ctx) => ctx.random.nextInt(1, 100));
    
    /** Float generator (0-1 default) */
    this.register('number:float', (ctx) => ctx.random.nextFloat(0, 100));
    
    /** Age generator (18-80) */
    this.register('number:age', (ctx) => ctx.random.nextInt(18, 80));
    
    /** Price generator (0.99-999.99) */
    this.register('number:price', (ctx) => {
      const price = ctx.random.nextFloat(0.99, 999.99);
      return Math.round(price * 100) / 100; // 2 decimal places
    });

    // ==================== BOOLEAN GENERATOR ====================
    
    this.register('boolean', (ctx) => ctx.random.nextBoolean());

    // ==================== DATE GENERATORS ====================

    /** Recent date (last 30 days) */
    this.register('Date', (ctx) => ctx.random.date());
    
    /** Recent date (last 30 days) */
    this.register('Date:recent', (ctx) => 
      ctx.random.date(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    );
    
    /** Past date (2000-2020) */
    this.register('Date:past', (ctx) => 
      ctx.random.date(new Date(2000, 0, 1), new Date(2020, 0, 1))
    );
    
    /** Future date (next 30 days) */
    this.register('Date:future', (ctx) => 
      ctx.random.date(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    );
  }

  /**
   * Registers a custom generator
   * @param key - Unique identifier (use format "type:variant" for variants)
   * @param generator - Function that generates values
   * @returns this for chaining
   */
  register<T>(key: string, generator: GeneratorFn<T>): this {
    this.generators.set(key, generator as GeneratorFn);
    return this;
  }

  /**
   * Retrieves a generator by key
   * @param key - Generator identifier
   * @returns Generator function or undefined if not found
   */
  get(key: string): GeneratorFn | undefined {
    return this.generators.get(key);
  }

  /**
   * Checks if generator exists
   * @param key - Generator identifier
   * @returns true if registered
   */
  has(key: string): boolean {
    return this.generators.has(key);
  }

  /**
   * Gets all registered generator keys
   * @returns Array of generator names
   */
  keys(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Removes a generator
   * @param key - Generator to remove
   * @returns true if removed
   */
  unregister(key: string): boolean {
    return this.generators.delete(key);
  }

  /**
   * Clears all generators (including defaults)
   */
  clear(): void {
    this.generators.clear();
  }
}

/** Global singleton registry instance */
export const globalRegistry = new GeneratorRegistry();