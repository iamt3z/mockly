/**
 * CORE TYPES - TypeScript type definitions for the mock data generator
 * 
 * This file contains all type definitions used throughout the library.
 * It defines the shape of mock data, configuration options, and context objects.
 */

/** Primitive types that can be generated */
export type Primitive = string | number | boolean | Date | null | undefined;

/** Any value that can be generated */
export type MockValue = Primitive | object | Array<unknown>;

/**
 * DeepPartial utility type
 * Makes all properties optional recursively, handling nested objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Field Resolver function type
 * Takes a context and returns a value of type T
 * Used for dynamic field generation with access to generation context
 */
export type FieldResolver<T> = (ctx: MockContext) => T;

/**
 * Mock Resolver type - handles both primitive and object types
 * For arrays: returns resolver for array items
 * For objects: returns nested resolvers for each property
 * For primitives: returns field resolver
 */
export type MockResolver<T> = [T] extends [Array<infer U>]
  ? FieldResolver<U[]> | U[]
  : [T] extends [Date]
  ? FieldResolver<T> | T
  : [T] extends [object]
  ? MockResolvers<T> | FieldResolver<T> | T
  : FieldResolver<T> | T;

/**
 * Mock Resolvers object
 * Maps each key of T to an optional resolver function or nested resolver object
 */
export type MockResolvers<T> = {
  [K in keyof T]?: MockResolver<T[K]>;
};

/**
 * Context passed to every field resolver during generation
 * Provides access to generation state, random utilities, and sibling data
 */
export interface MockContext {
  /** Current index in the generation batch (0-based) */
  index: number;
  
  /** Seed value for deterministic generation */
  seed: number;
  
  /** Seeded random number generator instance */
  random: SeededRandom;
  
  /** Reference to the parent object being generated (for nested objects) */
  parent?: unknown;
  
  /** Array of already generated siblings in this batch */
  siblings?: unknown[];
}

/**
 * Configuration for relational data generation
 * Maps field names to paths like "users.id" for foreign key references
 */
export interface RelationConfig {
  [field: string]: string; // Format: "collection.field"
}

/**
 * Options for mock generation
 * Controls count, seeding, overrides, and relations
 */
export interface MockOptions<T extends object> {
  /** Number of items to generate (default: 1) */
  count?: number;
  
  /** Seed for deterministic generation (default: current timestamp) */
  seed?: number;
  
  /** Field-level overrides and custom resolvers */
  overrides?: DeepPartial<MockResolvers<T>>;
  
  /** Relational data configuration for foreign keys */
  relations?: RelationConfig;
  
  /** Prototype object for type inference (alternative to generic) */
  prototype?: Partial<T>;
}

/**
 * Configuration for joining two datasets
 * Defines how to match local and foreign records
 */
export interface JoinConfig<
  TLocal extends object,
  TForeign extends object,
  K extends string = string,
> {
  /** Field in foreign dataset to match against */
  foreignKey: keyof TForeign;
  
  /** Field in local dataset to match with */
  localKey: keyof TLocal;
  
  /** Property name to assign joined data to */
  as: K;
}

/**
 * Export format options for data serialization
 */
export interface ExportOptions {
  /** Include metadata about generation */
  includeMetadata?: boolean;
  
  /** Pretty print JSON output */
  pretty?: boolean;
  
  /** Date format for serialization */
  dateFormat?: 'iso' | 'unix' | 'locale';
}

/**
 * CSV export specific options
 */
export interface CSVExportOptions extends ExportOptions {
  /** Delimiter character (default: comma) */
  delimiter?: string;
  
  /** Include header row */
  header?: boolean;
  
  /** Handle nested objects by flattening or excluding */
  nestedHandling?: 'flatten' | 'exclude' | 'json';
}

// Forward declaration for SeededRandom (defined in random.ts)
export declare class SeededRandom {
  constructor(seed?: number);
  next(): number;
  nextInt(min?: number, max?: number): number;
  nextFloat(min?: number, max?: number): number;
  nextBoolean(): boolean;
  pick<T>(array: T[]): T;
  date(start?: Date, end?: Date): Date;
  uuid(): string;
  clone(): SeededRandom;
}