# Mockly 🎭

**TypeScript-first mock data generator with relational support, fluent API, seeded randomness, and built-in JSON/CSV exporters.**

![npm version](https://img.shields.io/npm/v/@iamt3z/mockly)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

## Features ✨

- 🎯 **Type-Safe**: Full TypeScript support with type inference from prototypes
- 🔀 **Fluent API**: Chainable methods for intuitive mock generation
- 🌱 **Seeded Randomness**: Deterministic generation for reproducible tests
- 🔗 **Relational Support**: Built-in `join()` and `joinOne()` for related data
- 📤 **Export Formats**: JSON and CSV exporters with customization options
- 🏗️ **Flexible Architecture**: Custom generators and isolated environments
- ⚡ **Zero Dependencies**: Lightweight and dependency-free

## Installation

```bash
npm install @iamt3z/mockly
```

## Quick Start

```typescript
import { mock } from "@iamt3z/mockly";

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Generate 10 users with fluent API
const users = mock<User>({ id: "", name: "", email: "", age: 0 })
  .many(10)
  .seed(42) // Optional: for deterministic generation
  .override({
    email: (ctx) => `user${ctx.index + 1}@example.com`,
    age: (ctx) => ctx.random.nextInt(25, 35),
  })
  .generate();

console.log(users);
```

## Core Concepts

### 1. Fluent API

```typescript
mock<User>(prototype)
  .many(count) // Set quantity
  .seed(value) // Set seed for reproducibility
  .override(resolvers) // Customize fields
  .generate(); // Get mock data
```

### 2. Type Inference

Mockly automatically infers appropriate generators based on:

- **Property names**: `id` → UUID, `email` → email address, `age` → number
- **Value types**: Auto-detection of primitives, arrays, and objects

```typescript
interface Product {
  id: string; // Auto: string:uuid
  name: string; // Auto: string
  email: string; // Auto: string:email
  price: number; // Auto: number:price
  tags: string[]; // Auto: array of strings
  createdAt: Date; // Auto: Date:recent
  active: boolean; // Auto: boolean
}
```

### 3. Field Overrides

Customize specific fields while others auto-generate:

```typescript
mock<User>({ id: "", name: "", email: "" })
  .override({
    email: (ctx) => `user${ctx.index}@test.com`,
    name: () => "Fixed Name",
  })
  .generate();
```

### 4. Seeded Generation

Generate identical data sets with the same seed:

```typescript
const set1 = mock<User>(proto).seed(123).many(5).generate();
const set2 = mock<User>(proto).seed(123).many(5).generate();

// set1 === set2 ✓
```

### 5. Nested Objects

```typescript
interface Post {
  id: string;
  author: {
    id: string;
    name: string;
  };
  comments: Comment[];
}

const posts = mock<Post>({
  id: "",
  author: { id: "", name: "" },
  comments: [],
}).generate();
```

### 6. Relational Data

Join datasets to create relationships:

```typescript
import { join, joinOne } from "@iamt3z/mockly";

// One-to-many: Each user has multiple posts
const usersWithPosts = join<User, Post>(users, posts, {
  localKey: "id",
  foreignKey: "userId",
  as: "posts",
});

// Many-to-one: Each post has one author
const postsWithAuthor = joinOne<Post, User>(posts, users, {
  localKey: "userId",
  foreignKey: "id",
  as: "author",
});
```

## Generators

### Built-in Generators

#### String Generators

- `string` - Lorem ipsum text
- `string:uuid` - UUID v4 format
- `string:email` - Email addresses
- `string:name` - Person names
- `string:url` - URLs
- `string:phone` - Phone numbers

#### Number Generators

- `number` - Integer (1-100)
- `number:int` - Integer (1-100)
- `number:float` - Float (0-100)
- `number:age` - Age (18-80)
- `number:price` - Price (0.99-999.99)

#### Date Generators

- `Date` - Recent dates (last 30 days)
- `Date:recent` - Last 30 days
- `Date:past` - 2000-2020
- `Date:future` - Next 30 days

#### Other

- `boolean` - True/false
- `array` - Auto-sized arrays

### Custom Generators

```typescript
import { registerGenerator, MockContext } from "@iamt3z/mockly";

// Global registration
registerGenerator("string:zipcode", (ctx: MockContext) =>
  String(ctx.random.nextInt(10000, 99999)),
);

// Use custom generator
const addresses = mock<Address>({
  zipCode: "",
})
  .override({
    zipCode: (ctx) => {
      const gen = globalRegistry.get("string:zipcode");
      return gen ? gen(ctx) : "";
    },
  })
  .generate();
```

### Isolated Environments

```typescript
import { createMockEnvironment } from "@iamt3z/mockly";

const env = createMockEnvironment();

// Register custom generators in isolated scope
env.registerGenerator("string:sku", (ctx) => `SKU-${ctx.index}`);

const products = env.mock<Product>(proto).many(10).generate();
```

## Export

### JSON Export

```typescript
import { jsonExporter, writeFile } from "@iamt3z/mockly";

const json = jsonExporter.export(users, {
  pretty: true,
  includeMetadata: true,
  rootKey: "users",
});

writeFile("./users.json", json);
```

### CSV Export

```typescript
import { csvExporter } from "@iamt3z/mockly";

const csv = csvExporter.export(products, {
  header: true,
  delimiter: ",",
  dateFormat: "iso",
  nestedHandling: "flatten", // or 'json', 'exclude'
});

writeFile("./products.csv", csv);
```

### Utilities

```typescript
import {
  ensureDir,
  timestampFilename,
  writeFile,
  deepClone,
  groupBy,
  sum,
  average,
  formatCurrency,
  isValidEmail,
} from "@iamt3z/mockly";

// File operations
ensureDir("./data");
const filename = timestampFilename("export", "json");
writeFile(`./data/${filename}`, jsonData);

// Data operations
const grouped = groupBy(users, "department");
const total = sum(prices);
const avg = average(prices);
const formatted = formatCurrency(1234.56, "USD"); // $1,234.56
```

## MockContext

Available in all resolver functions:

```typescript
interface MockContext {
  index: number; // Current item index (0-based)
  seed: number; // Generation seed
  random: SeededRandom; // Random number generator
  parent?: object; // Parent object (for nested)
  siblings?: unknown[]; // Previously generated items
}
```

### SeededRandom Methods

```typescript
const { random } = ctx;

random.next(); // 0-1 float
random.nextInt(min, max); // Integer in range
random.nextFloat(min, max); // Float in range
random.nextBoolean(); // True/false
random.pick(array); // Random element
random.date(start, end); // Random date in range
random.uuid(); // UUID v4-like string
```

## Examples

See the `/examples` directory for comprehensive examples:

1. **Basic Usage** (`1_basic_usage.ts`)
   - Simple generation
   - Multiple items
   - Seeded randomness
   - Field overrides
   - Nested objects and arrays

2. **API Testing** (`2_api_testing.ts`)
   - User authentication mocking
   - Paginated responses
   - Error scenarios
   - Complex nested data

3. **E-Commerce Scenario** (`3_ecommerce_scenario.ts`)
   - Product catalog
   - Customer profiles
   - Orders and fulfillment
   - Relational joins
   - Analytics

4. **Export Examples** (`4_export_examples.ts`)
   - JSON export options
   - CSV export variants
   - Filtered exports
   - Aggregated data
   - Custom transformations

### Running Examples

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run individual examples (requires ts-node)
npx ts-node examples/1_basic_usage.ts
npx ts-node examples/2_api_testing.ts
npx ts-node examples/3_ecommerce_scenario.ts
npx ts-node examples/4_export_examples.ts
```

## API Reference

See [API.md](./docs/API.md) for detailed API documentation.

## Advanced Usage

See [GUIDE.md](./docs/GUIDE.md) for advanced patterns and use cases.

## Configuration

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "moduleResolution": "bundler"
  }
}
```

### Seeding Strategy

For deterministic tests, use:

```typescript
describe("User Service", () => {
  const SEED = 42; // Fixed seed for all tests

  it("should generate consistent user data", () => {
    const users1 = mock<User>(proto).seed(SEED).many(10).generate();
    const users2 = mock<User>(proto).seed(SEED).many(10).generate();

    expect(users1).toEqual(users2);
  });
});
```

## Best Practices

1. **Always use TypeScript**: Leverage type safety and auto-completion
2. **Seed for tests**: Use fixed seeds in test suites for reproducibility
3. **Override sparingly**: Let generators handle most fields
4. **Use prototypes**: Helps with type inference and IDE support
5. **Name fields clearly**: Better generator inference (e.g., `userId`, `createdAt`)
6. **Validate exports**: Check generated data before use in tests
7. **Use isolated environments**: For multi-tenant or complex scenarios

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Performance

- Generates 1,000 items in ~50ms
- ~0.05ms per item on average
- Memory efficient with streaming exports available

## Troubleshooting

### Type Inference Issues

If inference isn't working as expected:

```typescript
// ✗ Poor inference
mock({ id: "", email: "", price: "" });

// ✓ Good inference - use correct types
mock<User>({ id: "", email: "", price: 0 });
```

### Nested Objects Not Generating

```typescript
// ✗ Won't generate nested data
mock<User>({ profile: {} });

// ✓ Provide prototype
mock<User>({ profile: { bio: "", avatar: "" } });
```

### Random Not Available

```typescript
// ✗ Context not passed
override: {
  age: () => 30;
}

// ✓ Use context
override: {
  age: (ctx) => ctx.random.nextInt(18, 65);
}
```

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT © 2024

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## Support

- 📖 [Documentation](./docs)
- 🐛 [Issue Tracker](https://github.com/iamt3z/mockly/issues)
- 💬 [Discussions](https://github.com/iamt3z/mockly/discussions)

---

**Made with ❤️ for better testing**
