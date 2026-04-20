/**
 * MOCK BUILDER - Core class for generating mock data
 *
 * Provides a fluent API for configuring and generating mock data.
 * Handles nested objects, arrays, relations, and field overrides.
 * Supports deterministic generation through seeding.
 */

import {
  MockOptions,
  MockContext,
  MockResolvers,
  DeepPartial,
  RelationConfig,
  JoinConfig,
} from "./types";
import { SeededRandom } from "./random";
import { GeneratorRegistry, globalRegistry } from "./registry";
import { TypeAnalyzer } from "./analyzer";

/**
 * Builder class for configuring and generating mock data
 *
 * Usage:
 *   const users = mock<User>()
 *     .many(10)
 *     .seed(42)
 *     .override({ email: () => 'test@test.com' })
 *     .generate();
 */
export class MockBuilder<T extends object> {
  /** Generation configuration options */
  private options: Required<MockOptions<T>> = {
    count: 1,
    seed: Date.now(),
    overrides: {},
    relations: {},
    prototype: {} as Partial<T>,
  };

  /** Generator registry instance (can be custom or global) */
  private registry: GeneratorRegistry;

  /**
   * Creates a new MockBuilder
   * @param prototype - Optional prototype object for type inference
   * @param registry - Optional custom registry (defaults to global)
   */
  constructor(
    private prototype?: Partial<T>,
    registry?: GeneratorRegistry,
  ) {
    this.registry = registry || globalRegistry;
    if (prototype) {
      this.options.prototype = prototype;
    }
  }

  // ==================== FLUENT API METHODS ====================

  /**
   * Set number of items to generate
   * @param count - Number of items
   * @returns this for chaining
   */
  many(count: number): this {
    this.options.count = count;
    return this;
  }

  /**
   * Set to generate exactly one item
   * @returns this for chaining
   */
  one(): this {
    this.options.count = 1;
    return this;
  }

  /**
   * Set seed for deterministic generation
   * @param seed - Number seed
   * @returns this for chaining
   */
  seed(seed: number): this {
    this.options.seed = seed;
    return this;
  }

  /**
   * Add field overrides and custom resolvers
   * @param overrides - Partial resolver object
   * @returns this for chaining
   */
  override(overrides: DeepPartial<MockResolvers<T>>): this {
    this.options.overrides = this.mergeDeep(this.options.overrides, overrides);
    return this;
  }

  /**
   * Configure relational data
   * @param relations - Relation configuration
   * @returns this for chaining
   */
  relations(relations: RelationConfig): this {
    this.options.relations = { ...this.options.relations, ...relations };
    return this;
  }

  // ==================== GENERATION METHODS ====================

  /**
   * Generate the mock data
   * @returns Array of generated items
   */
  generate(): T[] {
    const results: T[] = [];
    const random = new SeededRandom(this.options.seed);

    // Generate each item
    for (let i = 0; i < this.options.count; i++) {
      const ctx: MockContext = {
        index: i,
        seed: this.options.seed + i,
        random: random.clone(),
        siblings: results,
      };

      const item = this.generateObject(
        this.prototype || ({} as T),
        this.options.overrides,
        ctx,
      );

      results.push(item as T);
    }

    // Apply relations after all objects are generated
    this.applyRelations(results);

    return results;
  }

  /**
   * Generate and return first item only
   * @returns Single generated item
   */
  first(): T {
    return this.one().generate()[0];
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Recursively generates an object with all properties
   * @param prototype - Template object
   * @param overrides - Override resolvers
   * @param ctx - Generation context
   * @returns Generated object
   */
  private generateObject(
    prototype: Partial<T>,
    overrides: DeepPartial<MockResolvers<T>>,
    ctx: MockContext,
  ): T {
    const result = {} as Record<keyof T, unknown>;

    // Collect all keys from prototype and overrides
    const allKeys = new Set([
      ...Object.keys(prototype),
      ...Object.keys(overrides),
    ]) as Set<keyof T>;

    // Generate each property
    for (const key of allKeys) {
      const override = overrides[key];
      const protoValue = prototype[key];

      // Set parent reference for nested generation
      const childCtx = { ...ctx, parent: result };

      result[key] = this.generateValue(
        key as string,
        protoValue,
        override,
        childCtx,
      );
    }

    return result as T;
  }

  /**
   * Generates a single value based on type and overrides
   * @param key - Property name
   * @param protoValue - Prototype value
   * @param override - Override resolver or value
   * @param ctx - Generation context
   * @returns Generated value
   */
  private generateValue(
    key: string,
    protoValue: unknown,
    override: unknown,
    ctx: MockContext,
  ): unknown {
    // Handle function overrides (field resolvers)
    if (typeof override === "function") {
      return (override as (ctx: MockContext) => unknown)(ctx);
    }

    // Handle nested object overrides (deep partial)
    if (
      TypeAnalyzer.isPlainObject(override) &&
      TypeAnalyzer.isPlainObject(protoValue)
    ) {
      return this.generateObject(
        protoValue as any as Partial<T>,
        override as DeepPartial<MockResolvers<T>>,
        ctx,
      );
    }

    // Direct value override (primitive)
    if (override !== undefined && override !== null) {
      return override;
    }

    // Handle arrays
    if (Array.isArray(protoValue)) {
      return this.generateArray(key, protoValue, ctx);
    }

    // Handle nested objects
    if (TypeAnalyzer.isPlainObject(protoValue)) {
      return this.generateObject(protoValue as any as Partial<T>, {}, ctx);
    }

    // Use inferred generator
    return this.useGenerator(key, protoValue, ctx);
  }

  /**
   * Generates array values
   * @param key - Property name
   * @param protoArray - Prototype array
   * @param ctx - Generation context
   * @returns Generated array
   */
  private generateArray(
    key: string,
    protoArray: unknown[],
    ctx: MockContext,
  ): unknown[] {
    // Determine array length (random 1-5 if empty prototype, otherwise use prototype length)
    const length =
      protoArray.length > 0 ? protoArray.length : ctx.random.nextInt(1, 5);
    const itemPrototype = protoArray[0];

    return Array.from({ length }, (_, i) => {
      const itemCtx = { ...ctx, index: i };
      return this.generateValue(
        `${key}[${i}]`,
        itemPrototype,
        undefined,
        itemCtx,
      );
    });
  }

  /**
   * Uses registry generator based on type inference
   * @param key - Property name
   * @param value - Value to generate for
   * @param ctx - Generation context
   * @returns Generated value
   */
  private useGenerator(key: string, value: unknown, ctx: MockContext): unknown {
    const generatorKey = TypeAnalyzer.inferGenerator(key, value);
    const generator =
      this.registry.get(generatorKey) || this.registry.get(typeof value);

    if (generator) {
      return generator(ctx);
    }

    // Fallback generators
    switch (typeof value) {
      case "string":
        return ctx.random.uuid();
      case "number":
        return ctx.random.nextInt(1, 100);
      case "boolean":
        return ctx.random.nextBoolean();
      default:
        return null;
    }
  }

  /**
   * Applies relational configurations to link data
   * @param results - Generated items
   */
  private applyRelations(results: T[]): void {
    const { relations } = this.options;

    // This is a simplified implementation
    // Full implementation would resolve paths like "users.id" from a data store
    // For now, just a placeholder.
    for (const [field, relationPath] of Object.entries(relations)) {
      // Parse "collection.field" format
      const [sourceKey, sourceField] = relationPath.split(".");
      // Relation resolution would happen here using a data store
      // console.log(`Would link ${field} to ${sourceKey}.${sourceField}`);
    }
  }

  /**
   * Deep merge utility for nested override objects
   * @param target - Target object
   * @param source - Source object
   * @returns Merged object
   */
  private mergeDeep(target: any, source: any): any {
    if (!source) return target;
    if (!target) return source;

    const output = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        output[key] = this.mergeDeep(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }
}

/**
 * Joins two datasets on a key relationship
 * Creates one-to-many relationships
 *
 * @param local - Local dataset (receives joined data)
 * @param foreign - Foreign dataset (joined into local)
 * @param config - Join configuration
 * @returns Local dataset with joined foreign data
 */
export function join<
  TLocal extends object,
  TForeign extends object,
  K extends string = string,
>(
  local: TLocal[],
  foreign: TForeign[],
  config: JoinConfig<TLocal, TForeign, K>,
): Array<TLocal & { [P in K]: TForeign[] }> {
  const { foreignKey, localKey, as } = config;

  return local.map((item) => {
    const keyValue = item[localKey as keyof TLocal];
    const related = foreign.filter(
      (f) => (f[foreignKey as keyof TForeign] as any) === (keyValue as any),
    );

    return {
      ...item,
      [as]: related,
    };
  }) as Array<TLocal & { [P in K]: TForeign[] }>;
}

/**
 * Joins two datasets creating many-to-one relationship
 *
 * @param local - Local dataset
 * @param foreign - Foreign dataset (single match)
 * @param config - Join configuration
 * @returns Local dataset with single joined item
 */
export function joinOne<
  TLocal extends object,
  TForeign extends object,
  K extends string = string,
>(
  local: TLocal[],
  foreign: TForeign[],
  config: JoinConfig<TLocal, TForeign, K>,
): Array<TLocal & { [P in K]: TForeign | null }> {
  const { foreignKey, localKey, as } = config;

  return local.map((item) => {
    const keyValue = item[localKey as keyof TLocal];
    const related = foreign.find(
      (f) => (f[foreignKey as keyof TForeign] as any) === (keyValue as any),
    );

    return {
      ...item,
      [as]: related || null,
    };
  }) as Array<TLocal & { [P in K]: TForeign | null }>;
}
