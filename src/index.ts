/**
 * MAIN ENTRY POINT - Mock Data Generator Library
 *
 * Exports all public APIs for the mock data generator.
 * Provides type-safe mock generation with fluent API, relational
 * data support, and export capabilities.
 */

// ==================== CORE EXPORTS ====================
export { MockBuilder, join, joinOne } from "./core";
export { SeededRandom } from "./core";
export { GeneratorRegistry, globalRegistry } from "./core";
export { TypeAnalyzer } from "./core";

// ==================== TYPE EXPORTS ====================
export type {
  MockOptions,
  MockContext,
  MockResolvers,
  MockResolver,
  FieldResolver,
  DeepPartial,
  RelationConfig,
  JoinConfig,
  ExportOptions,
  CSVExportOptions,
} from "./core";

// ==================== EXPORTER EXPORTS ====================
export { BaseExporter } from "./exporters";
export { JSONExporter, jsonExporter } from "./exporters";
export { CSVExporter, csvExporter } from "./exporters";

// ==================== UTILITY EXPORTS ====================
export {
  ensureDir,
  writeFile,
  timestampFilename,
  deepClone,
  pickRandom,
  formatCurrency,
  slugify,
  isValidEmail,
  calculateAge,
  groupBy,
  sum,
  average,
} from "./utils";

// ==================== MAIN API ====================

import { MockBuilder, join, joinOne } from "./core";
import { GeneratorRegistry, globalRegistry } from "./core";
import { MockOptions, DeepPartial, MockResolvers } from "./core";

/**
 * Main mock function - entry point for generating mock data
 *
 * Overloads:
 * 1. mock(prototype) - Returns builder for fluent API
 * 2. mock(options) - Generates immediately with options
 *
 * @example
 * // Fluent API
 * const users = mock<User>({ id: '', name: '' })
 *   .many(10)
 *   .seed(42)
 *   .generate();
 *
 * @example
 * // Immediate generation
 * const users = mock<User>({
 *   prototype: { id: '', name: '' },
 *   count: 10,
 *   seed: 42
 * });
 */
function mock<T extends object>(prototype?: Partial<T>): MockBuilder<T>;
function mock<T extends object>(
  options: MockOptions<T> & { prototype: Partial<T> },
): T[];
function mock<T extends object>(
  arg?: Partial<T> | (MockOptions<T> & { prototype?: Partial<T> }),
): MockBuilder<T> | T[] {
  // If arg is options object with generation params, generate immediately
  if (
    arg &&
    typeof arg === "object" &&
    ("count" in arg || "seed" in arg || "overrides" in arg)
  ) {
    const options = arg as MockOptions<T> & { prototype?: Partial<T> };
    const builder = new MockBuilder(options.prototype, globalRegistry);

    if (options.count) builder.many(options.count);
    if (options.seed !== undefined) builder.seed(options.seed);
    if (options.overrides)
      builder.override(options.overrides as DeepPartial<MockResolvers<T>>);
    if (options.relations) builder.relations(options.relations);

    return builder.generate();
  }

  // Return builder for fluent API
  return new MockBuilder(arg as Partial<T>, globalRegistry);
}

/**
 * Create isolated mock environment with separate registry
 * Useful for testing or when you need completely separate generators
 */
export function createMockEnvironment(): {
  mock: typeof mock;
  registerGenerator: <T>(
    key: string,
    generator: (ctx: import("./core").MockContext) => T,
  ) => void;
  join: typeof join;
  joinOne: typeof joinOne;
} {
  const localRegistry = new GeneratorRegistry();

  // Using function overloads to match the mock function signature
  function localMock<T extends object>(prototype?: Partial<T>): MockBuilder<T>;
  function localMock<T extends object>(
    options: MockOptions<T> & { prototype: Partial<T> },
  ): T[];
  function localMock<T extends object>(
    arg?: Partial<T> | (MockOptions<T> & { prototype?: Partial<T> }),
  ): MockBuilder<T> | T[] {
    if (arg && typeof arg === "object" && ("count" in arg || "seed" in arg)) {
      const options = arg as MockOptions<T> & { prototype?: Partial<T> };
      const builder = new MockBuilder(options.prototype, localRegistry);
      if (options.count) builder.many(options.count);
      if (options.seed !== undefined) builder.seed(options.seed);
      if (options.overrides)
        builder.override(options.overrides as DeepPartial<MockResolvers<T>>);
      if (options.relations) builder.relations(options.relations);
      return builder.generate();
    }
    return new MockBuilder(arg as Partial<T>, localRegistry);
  }

  return {
    mock: localMock,
    registerGenerator: (key, gen) => localRegistry.register(key, gen),
    join,
    joinOne,
  };
}

/**
 * Register a global custom generator
 * @param key - Generator identifier (e.g., "string:custom")
 * @param generator - Generator function
 */
export function registerGenerator<T>(
  key: string,
  generator: (ctx: import("./core").MockContext) => T,
): void {
  globalRegistry.register(key, generator);
}

// Export mock as default and named
export { mock };
export default mock;
