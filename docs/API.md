# Mockly API Reference

Complete API documentation for the Mockly mock data generator library.

## Table of Contents

- [MockBuilder](#mockbuilder)
- [mock()](#mock)
- [join()](#join)
- [joinOne()](#joinone)
- [SeededRandom](#seededrandom)
- [GeneratorRegistry](#generatorregistry)
- [TypeAnalyzer](#typeanalyzer)
- [Exporters](#exporters)
- [Utilities](#utilities)
- [Types](#types)

---

## MockBuilder

The main class for configuring and generating mock data.

### Constructor

```typescript
constructor(prototype?: Partial<T>, registry?: GeneratorRegistry)
```

**Parameters:**

- `prototype` - Optional template object for type inference
- `registry` - Optional custom GeneratorRegistry (defaults to global)

### Methods

#### `many(count: number): this`

Set the number of items to generate.

```typescript
mock<User>({ id: "", name: "" }).many(100).generate(); // Returns array of 100 users
```

#### `one(): this`

Generate exactly one item (same as `.many(1)`).

```typescript
const user = mock<User>({ id: "", name: "" }).one().generate()[0]; // Single user
```

#### `seed(value: number): this`

Set seed for deterministic generation. Same seed produces identical results.

```typescript
const users1 = mock<User>(proto).seed(42).many(5).generate();
const users2 = mock<User>(proto).seed(42).many(5).generate();
// users1 === users2 ✓
```

#### `override(resolvers: DeepPartial<MockResolvers<T>>): this`

Customize field generation. Can override with values, functions, or nested objects.

```typescript
mock<User>({ id: "", name: "", email: "" })
  .override({
    id: (ctx) => `user_${ctx.index}`,
    name: "Static Name",
    email: (ctx) => `user${ctx.index}@example.com`,
  })
  .generate();
```

**Parameter:**

- `resolvers` - Object with field overrides. Values can be:
  - Functions: `(ctx: MockContext) => T`
  - Static values: `'value'`
  - Nested objects: `{ /* nested overrides */ }`

#### `relations(config: RelationConfig): this`

Configure relational data linking.

```typescript
mock<Post>({ id: "", userId: "" }).relations({ userId: "users.id" }).generate();
```

**Parameter:**

- `config` - Object mapping fields to foreign key paths: `"collection.field"`

#### `generate(): T[]`

Generate the mock data.

```typescript
const users = mock<User>({ id: "", name: "", email: "" })
  .many(10)
  .seed(42)
  .generate(); // Returns T[]
```

**Returns:** Array of generated items

#### `first(): T`

Generate and return only the first item (convenience method).

```typescript
const user = mock<User>({ id: "", name: "", email: "" }).first(); // Returns T (not array)
```

**Returns:** Single generated item

---

## mock()

Main entry point function with overloaded signatures.

### Overload 1: Fluent API

```typescript
function mock<T extends object>(prototype?: Partial<T>): MockBuilder<T>;
```

Returns a builder for chaining methods.

```typescript
const builder = mock<User>({ id: "", name: "" });
const users = builder.many(10).generate();
```

### Overload 2: Immediate Generation

```typescript
function mock<T extends object>(
  options: MockOptions<T> & { prototype: Partial<T> },
): T[];
```

Generate immediately with options.

```typescript
const users = mock<User>({
  prototype: { id: "", name: "" },
  count: 10,
  seed: 42,
  overrides: { email: (ctx) => `user${ctx.index}@test.com` },
});
```

---

## join()

Create one-to-many relationships between datasets.

### Signature

```typescript
function join<TLocal extends object, TForeign extends object>(
  local: TLocal[],
  foreign: TForeign[],
  config: JoinConfig<TLocal, TForeign>,
): Array<TLocal & Record<string, TForeign[]>>;
```

### Parameters

- `local` - Array of local records (receives joined data)
- `foreign` - Array of foreign records to join
- `config` - Join configuration with:
  - `localKey: keyof TLocal` - Key in local records
  - `foreignKey: keyof TForeign` - Key in foreign records
  - `as: string` - Property name for joined data

### Example

```typescript
interface User {
  id: string;
  name: string;
}

interface Post {
  id: string;
  userId: string;
  title: string;
}

const users = [
  /* ... */
];
const posts = [
  /* ... */
];

const usersWithPosts = join<User, Post>(users, posts, {
  localKey: "id",
  foreignKey: "userId",
  as: "posts",
});

// Result:
// User[] with posts: Post[]
```

---

## joinOne()

Create many-to-one relationships between datasets.

### Signature

```typescript
function joinOne<TLocal extends object, TForeign extends object>(
  local: TLocal[],
  foreign: TForeign[],
  config: Omit<JoinConfig<TLocal, TForeign>, "as"> & { as: string },
): Array<TLocal & Record<string, TForeign | null>>;
```

### Parameters

- `local` - Array of local records
- `foreign` - Array of foreign records
- `config` - Configuration (same as join, result can be null)

### Example

```typescript
const postsWithAuthor = joinOne<Post, User>(posts, users, {
  localKey: "userId",
  foreignKey: "id",
  as: "author",
});

// Result:
// Post[] with author: User | null
```

---

## SeededRandom

Linear Congruential Generator for deterministic random numbers.

### Constructor

```typescript
constructor(seed: number = Date.now())
```

### Methods

#### `next(): number`

Generate random float between 0 and 1.

```typescript
const value = random.next(); // 0.123456...
```

**Returns:** `[0, 1)` float

#### `nextInt(min?: number, max?: number): number`

Generate random integer in range [min, max] inclusive.

```typescript
const value = random.nextInt(1, 100); // Integer between 1-100
```

**Parameters:**

- `min` - Minimum (default: 0)
- `max` - Maximum (default: 100)

**Returns:** Integer in range

#### `nextFloat(min?: number, max?: number): number`

Generate random float in range [min, max).

```typescript
const price = random.nextFloat(10, 1000); // 234.567...
```

**Parameters:**

- `min` - Minimum (default: 0)
- `max` - Maximum (default: 1)

**Returns:** Float in range

#### `nextBoolean(): boolean`

Generate random boolean (50% probability).

```typescript
const active = random.nextBoolean(); // true or false
```

**Returns:** Boolean

#### `pick<T>(array: T[]): T`

Pick random element from array.

```typescript
const status = random.pick(["active", "inactive", "pending"]);
```

**Parameters:**

- `array` - Array to pick from (non-empty)

**Returns:** Random element

#### `date(start?: Date, end?: Date): Date`

Generate random date in range.

```typescript
const date = random.date(new Date(2020, 0, 1), new Date(2024, 11, 31));
```

**Parameters:**

- `start` - Start date (default: 2020-01-01)
- `end` - End date (default: now)

**Returns:** Random Date

#### `uuid(): string`

Generate UUID v4-like string.

```typescript
const id = random.uuid(); // "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
```

**Returns:** UUID string

#### `clone(): SeededRandom`

Create a clone with same seed state.

```typescript
const clone = random.clone(); // Identical sequence
```

**Returns:** Cloned SeededRandom

#### `get currentSeed: number`

Get current seed value.

```typescript
const seed = random.currentSeed;
```

**Returns:** Current seed

---

## GeneratorRegistry

Manages custom generator functions.

### Constructor

```typescript
constructor();
```

Automatically registers default generators.

### Methods

#### `register<T>(key: string, generator: GeneratorFn<T>): this`

Register a custom generator.

```typescript
registry.register("string:zipcode", (ctx) =>
  String(ctx.random.nextInt(10000, 99999)),
);
```

**Parameters:**

- `key` - Unique identifier (format: "type:variant")
- `generator` - Function that generates values

**Returns:** `this` for chaining

#### `get(key: string): GeneratorFn | undefined`

Get generator by key.

```typescript
const gen = registry.get("string:email");
if (gen) {
  const email = gen(mockContext);
}
```

**Parameters:**

- `key` - Generator identifier

**Returns:** Generator function or undefined

#### `has(key: string): boolean`

Check if generator exists.

```typescript
if (registry.has("string:custom")) {
  // Use custom generator
}
```

#### `keys(): string[]`

Get all registered generator keys.

```typescript
const allKeys = registry.keys();
```

**Returns:** Array of key strings

#### `unregister(key: string): boolean`

Remove a generator.

```typescript
registry.unregister("string:custom");
```

**Returns:** True if removed

#### `clear(): void`

Clear all generators including defaults.

```typescript
registry.clear();
```

---

## TypeAnalyzer

Utility for type analysis and generator inference.

### Static Methods

#### `static inferGenerator(key: string, value: unknown): string`

Infer appropriate generator based on property name and value.

```typescript
TypeAnalyzer.inferGenerator("email", ""); // Returns 'string:email'
TypeAnalyzer.inferGenerator("price", 0); // Returns 'number:price'
TypeAnalyzer.inferGenerator("createdAt", new Date()); // Returns 'Date:recent'
```

**Parameters:**

- `key` - Property name
- `value` - Current value (for type detection)

**Returns:** Generator key string

#### `static isPlainObject(value: unknown): value is Record<string, unknown>`

Check if value is plain object (not array, Date, or null).

```typescript
TypeAnalyzer.isPlainObject({}); // true
TypeAnalyzer.isPlainObject([]); // false
TypeAnalyzer.isPlainObject(new Date()); // false
```

#### `static getGenerator(key: string, value: unknown)`

Get generator function for a type, with fallbacks.

```typescript
const generator = TypeAnalyzer.getGenerator("email", "");
```

---

## Exporters

### JSONExporter

Export data to JSON format.

#### `export<T>(data: T[], options?: JSONExportOptions): string`

```typescript
const json = jsonExporter.export(users, {
  pretty: true,
  includeMetadata: true,
  rootKey: "users",
  includeStats: true,
});
```

**Options:**

- `pretty?: boolean` - Pretty print with indentation
- `includeMetadata?: boolean` - Add generation metadata
- `includeStats?: boolean` - Add dataset statistics
- `rootKey?: string` - Root object key (default: 'data')
- `dateFormat?: 'iso' | 'unix' | 'locale'` - Date format

#### `getExtension(): string`

Returns `'json'`

#### `getMimeType(): string`

Returns `'application/json'`

### CSVExporter

Export data to CSV format.

#### `export<T>(data: T[], options?: CSVExportOptions): string`

```typescript
const csv = csvExporter.export(products, {
  header: true,
  delimiter: ",",
  dateFormat: "iso",
  nestedHandling: "flatten",
});
```

**Options:**

- `header?: boolean` - Include header row (default: true)
- `delimiter?: string` - Field delimiter (default: ',')
- `dateFormat?: 'iso' | 'unix' | 'locale'` - Date format
- `nestedHandling?: 'flatten' | 'exclude' | 'json'` - How to handle nested objects

#### `getExtension(): string`

Returns `'csv'`

#### `getMimeType(): string`

Returns `'text/csv'`

---

## Utilities

### File Operations

#### `ensureDir(dirPath: string): void`

Ensure directory exists, creating if necessary.

```typescript
ensureDir("./data");
```

#### `writeFile(filePath: string, data: string): void`

Write data to file, ensuring directory exists.

```typescript
writeFile("./data/users.json", jsonData);
```

#### `timestampFilename(baseName: string, extension: string): string`

Generate filename with ISO timestamp.

```typescript
const filename = timestampFilename("export", "json");
// 'export-2024-04-19T10-30-45.json'
```

### Data Operations

#### `deepClone<T>(obj: T): T`

Deep clone an object using JSON.

```typescript
const copy = deepClone(originalObject);
```

#### `pickRandom<T>(array: T[], count: number): T[]`

Pick random subset from array.

```typescript
const sample = pickRandom(items, 5);
```

#### `groupBy<T>(array: T[], key: keyof T): Record<string, T[]>`

Group array by property value.

```typescript
const byDept = groupBy(employees, "department");
```

#### `sum(array: number[]): number`

Calculate sum of numbers.

```typescript
const total = sum([10, 20, 30]); // 60
```

#### `average(array: number[]): number`

Calculate average of numbers.

```typescript
const avg = average([10, 20, 30]); // 20
```

### Format Operations

#### `formatCurrency(amount: number, currency?: string): string`

Format number as currency.

```typescript
formatCurrency(1234.56, "USD"); // '$1,234.56'
```

#### `slugify(text: string): string`

Convert to URL-friendly slug.

```typescript
slugify("Hello World"); // 'hello-world'
```

#### `isValidEmail(email: string): boolean`

Validate email format.

```typescript
isValidEmail("user@example.com"); // true
```

#### `calculateAge(birthDate: Date): number`

Calculate age from birth date.

```typescript
const age = calculateAge(new Date(1990, 0, 1));
```

---

## Types

### MockOptions<T>

Configuration for mock generation.

```typescript
interface MockOptions<T extends object> {
  count?: number; // Number of items (default: 1)
  seed?: number; // Random seed
  overrides?: DeepPartial<MockResolvers<T>>; // Field overrides
  relations?: RelationConfig; // Relational config
  prototype?: Partial<T>; // Template object
}
```

### MockContext

Available in resolver functions.

```typescript
interface MockContext {
  index: number; // Current item index (0-based)
  seed: number; // Generation seed
  random: SeededRandom; // Random generator
  parent?: unknown; // Parent object (nested)
  siblings?: unknown[]; // Previously generated items
}
```

### FieldResolver<T>

Function type for resolving field values.

```typescript
type FieldResolver<T> = (ctx: MockContext) => T;
```

### MockResolvers<T>

Resolvers for all fields in a type.

```typescript
type MockResolvers<T> = {
  [K in keyof T]?: MockResolver<T[K]>;
};
```

### DeepPartial<T>

Recursively makes all properties optional.

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### RelationConfig

Relational data configuration.

```typescript
interface RelationConfig {
  [field: string]: string; // "collection.field" format
}
```

### JoinConfig<TLocal, TForeign>

Join operation configuration.

```typescript
interface JoinConfig<TLocal, TForeign> {
  foreignKey: keyof TForeign; // Foreign key field
  localKey: keyof TLocal; // Local key field
  as: string; // Joined property name
}
```

### ExportOptions

General export options.

```typescript
interface ExportOptions {
  includeMetadata?: boolean; // Include generation metadata
  pretty?: boolean; // Pretty print
  dateFormat?: "iso" | "unix" | "locale"; // Date format
}
```

### CSVExportOptions

CSV-specific export options.

```typescript
interface CSVExportOptions extends ExportOptions {
  delimiter?: string; // Field delimiter
  header?: boolean; // Include header row
  nestedHandling?: "flatten" | "exclude" | "json"; // Nested handling
}
```

---

## Global Exports

```typescript
export const globalRegistry: GeneratorRegistry;
export const jsonExporter: JSONExporter;
export const csvExporter: CSVExporter;
```

## createMockEnvironment()

Create an isolated mock environment with separate registry.

```typescript
const env = createMockEnvironment();

env.registerGenerator("string:custom", (ctx) => "custom");
const data = env.mock<User>(proto).generate();
```

**Returns:** Object with:

- `mock` - Local mock function
- `registerGenerator` - Local generator registration
- `join` - Join function
- `joinOne` - JoinOne function

## registerGenerator()

Register a global generator.

```typescript
registerGenerator<T>(
  key: string,
  generator: (ctx: MockContext) => T
): void
```

---

For more examples, see the `/examples` directory.
