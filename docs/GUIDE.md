# Advanced Usage Guide

Comprehensive guide for advanced patterns, optimization, and complex scenarios with Mockly.

## Table of Contents

- [Testing Strategies](#testing-strategies)
- [Performance Optimization](#performance-optimization)
- [Complex Data Patterns](#complex-data-patterns)
- [Custom Generators](#custom-generators)
- [Relational Data](#relational-data)
- [Seeding & Reproducibility](#seeding--reproducibility)
- [Data Validation](#data-validation)
- [Integration Patterns](#integration-patterns)
- [Troubleshooting](#troubleshooting)

---

## Testing Strategies

### Unit Test Isolation

Use isolated mock environments to prevent test pollution:

```typescript
import { createMockEnvironment } from "@iamt3z/mockly";

describe("User Service", () => {
  let mockEnv: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    mockEnv = createMockEnvironment();

    // Register test-specific generators
    mockEnv.registerGenerator("string:testId", (ctx) => `test_${ctx.index}`);
  });

  it("should process users correctly", () => {
    const users = mockEnv.mock<User>(proto).many(5).seed(42).generate();

    expect(users).toHaveLength(5);
  });
});
```

### Snapshot Testing

Use seeded generation for reliable snapshots:

```typescript
describe("Data Generation", () => {
  const SNAPSHOT_SEED = 999;

  it("should match snapshot", () => {
    const data = mock<User>(proto).many(10).seed(SNAPSHOT_SEED).generate();

    expect(data).toMatchSnapshot();
  });
});
```

### Boundary Testing

Generate edge case data systematically:

```typescript
const boundaryUsers = mock<User>(proto)
  .many(5)
  .override({
    age: (ctx) => {
      const ages = [0, 1, 17, 18, 65, 100, 120];
      return ages[ctx.index % ages.length];
    },
    salary: (ctx) => {
      const salaries = [0, -1, 999999999, 0.01];
      return salaries[ctx.index % salaries.length];
    },
  })
  .generate();
```

### Performance Testing

Generate large datasets for performance validation:

```typescript
describe("Performance", () => {
  it("should process 10k records within 1s", () => {
    const start = performance.now();

    const data = mock<User>(proto).many(10000).seed(42).generate();

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

---

## Performance Optimization

### Batching Operations

Generate related data efficiently:

```typescript
const BATCH_SIZE = 1000;

// Generate users in batches
const userBatches = Array.from({ length: 10 }, (_, batch) =>
  mock<User>(proto).many(BATCH_SIZE).seed(batch).generate(),
);

const allUsers = userBatches.flat();
```

### Caching Generators

Reuse expensive generator functions:

```typescript
const expensiveGenerator = (ctx: MockContext) => {
  // Expensive computation
  return complexCalculation(ctx.index);
};

const cached = new Map<number, any>();

const users = mock<User>(proto)
  .many(1000)
  .override({
    data: (ctx) => {
      if (!cached.has(ctx.index)) {
        cached.set(ctx.index, expensiveGenerator(ctx));
      }
      return cached.get(ctx.index);
    },
  })
  .generate();
```

### Lazy Generation

Generate data only when needed:

```typescript
class LazyMockGenerator<T> {
  private data: T[] | null = null;

  constructor(
    private prototype: Partial<T>,
    private config: { count: number; seed: number },
  ) {}

  getData(): T[] {
    if (!this.data) {
      this.data = mock<T>(this.prototype)
        .many(this.config.count)
        .seed(this.config.seed)
        .generate();
    }
    return this.data;
  }
}

const lazyUsers = new LazyMockGenerator(proto, { count: 1000, seed: 42 });
// Data only generated when getData() is called
const users = lazyUsers.getData();
```

---

## Complex Data Patterns

### Hierarchical Data

Generate multi-level nested structures:

```typescript
interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

function generateTree(depth: number, breadth: number): TreeNode[] {
  if (depth === 0) return [];

  return mock<TreeNode>({
    id: "",
    name: "",
    children: [],
  })
    .many(breadth)
    .override({
      id: (ctx) => `node_${depth}_${ctx.index}`,
      name: (ctx) => `Node L${depth} #${ctx.index}`,
      children: (ctx) => generateTree(depth - 1, breadth),
    })
    .generate();
}

const tree = generateTree(3, 2); // 3 levels, 2 children per node
```

### Graph Data

Generate interconnected datasets:

```typescript
interface Node {
  id: string;
  name: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

function generateGraph(nodeCount: number, edgeCount: number) {
  const nodes = mock<Node>({
    id: "",
    name: "",
  })
    .many(nodeCount)
    .override({
      id: (ctx) => `node_${ctx.index}`,
    })
    .generate();

  const edges = mock<Edge>({
    id: "",
    source: "",
    target: "",
    weight: 0,
  })
    .many(edgeCount)
    .override({
      id: (ctx) => `edge_${ctx.index}`,
      source: (ctx) => nodes[ctx.random.nextInt(0, nodeCount - 1)].id,
      target: (ctx) => nodes[ctx.random.nextInt(0, nodeCount - 1)].id,
      weight: (ctx) => ctx.random.nextFloat(0.1, 1),
    })
    .generate();

  return { nodes, edges };
}

const graph = generateGraph(50, 200);
```

### Time Series Data

Generate temporal sequences:

```typescript
interface DataPoint {
  timestamp: Date;
  value: number;
  trend: "up" | "stable" | "down";
}

const timeSeries = mock<DataPoint>({
  timestamp: new Date(),
  value: 0,
  trend: "stable",
})
  .many(365) // One year of daily data
  .override({
    timestamp: (ctx) => {
      const date = new Date(2024, 0, 1);
      date.setDate(date.getDate() + ctx.index);
      return date;
    },
    value: (ctx) => {
      const baseValue = 100;
      const noise = ctx.random.nextFloat(-5, 5);
      const trend = Math.sin(ctx.index / 30) * 10;
      return baseValue + trend + noise;
    },
    trend: (ctx) => {
      const value = ctx.random.nextFloat(0, 1);
      if (value < 0.33) return "up" as const;
      if (value < 0.66) return "stable" as const;
      return "down" as const;
    },
  })
  .generate();
```

---

## Custom Generators

### Advanced Custom Generator

Create reusable, configurable generators:

```typescript
import { registerGenerator, MockContext } from "@iamt3z/mockly";

// Generate structured IDs with prefix
registerGenerator("string:prefixed-id", (ctx: MockContext) => {
  const prefixes = ["USR", "ORD", "PRD"];
  const prefix = prefixes[ctx.index % prefixes.length];
  return `${prefix}-${String(ctx.index + 1).padStart(8, "0")}`;
});

// Generate realistic URLs
registerGenerator("string:realistic-url", (ctx: MockContext) => {
  const domains = ["example.com", "test.io", "mock.dev"];
  const paths = ["api", "data", "resource"];
  const domain = domains[ctx.index % domains.length];
  const path = paths[ctx.index % paths.length];
  return `https://${domain}/${path}/${ctx.index}`;
});

// Generate color codes
registerGenerator("string:hex-color", (ctx: MockContext) => {
  const hex = ctx.random.nextInt(0, 16777215).toString(16);
  return `#${hex.padStart(6, "0").toUpperCase()}`;
});

// Use custom generators
const ids = mock<{ id: string }>({ id: "" })
  .many(5)
  .override({
    id: (ctx) =>
      ctx.random.pick(
        mock({ id: "" })
          .many(5)
          .generate()
          .map((u) => u.id),
      ),
  })
  .generate();
```

### Stateful Generators

Maintain state across generations:

```typescript
class CounterGenerator {
  private counter = 0;

  constructor(private prefix: string = "ID") {}

  generate(ctx: MockContext): string {
    return `${this.prefix}-${++this.counter}`;
  }
}

const counter = new CounterGenerator("USER");

registerGenerator("string:counter-id", (ctx) => counter.generate(ctx));
```

### Dependent Generators

Create generators that depend on context:

```typescript
registerGenerator("object:address-with-postal", (ctx: MockContext) => {
  // Generate address based on index context
  const states = ["CA", "TX", "NY", "FL", "WA"];
  const state = states[ctx.index % states.length];

  return {
    street: `${ctx.random.nextInt(1, 9999)} Main St`,
    city: `City ${ctx.index}`,
    state,
    country: "USA",
    zipCode: `${ctx.random.nextInt(10000, 99999)}`,
  };
});
```

---

## Relational Data

### Complex Joins

Handle multiple relationships:

```typescript
const usersWithAllData = mock<User>(proto).many(50).generate();

const postsForUsers = mock<Post>(postProto)
  .many(200)
  .override({
    userId: (ctx) => usersWithAllData[ctx.index % 50].id,
  })
  .generate();

const commentsOnPosts = mock<Comment>(commentProto)
  .many(500)
  .override({
    postId: (ctx) => postsForUsers[ctx.index % 200].id,
  })
  .generate();

// Build full hierarchy
const hierarchicalData = join<User, Post>(usersWithAllData, postsForUsers, {
  localKey: "id",
  foreignKey: "userId",
  as: "posts",
});

// Add comments to posts
const fullData = hierarchicalData.map((user) => ({
  ...user,
  posts: user.posts.map((post) => ({
    ...post,
    comments: commentsOnPosts.filter((c) => c.postId === post.id),
  })),
}));
```

### Many-to-Many Relationships

Handle junction tables:

```typescript
interface User {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
}

const users = mock<User>({ id: "", name: "" }).many(50).generate();

const roles = mock<Role>({ id: "", name: "" })
  .many(5)
  .override({
    id: (ctx) => `role_${ctx.index}`,
    name: (ctx) =>
      ["admin", "user", "moderator", "editor", "viewer"][ctx.index],
  })
  .generate();

const userRoles = mock<UserRole>({
  userId: "",
  roleId: "",
  assignedAt: new Date(),
})
  .many(150)
  .override({
    userId: (ctx) => users[ctx.random.nextInt(0, 49)].id,
    roleId: (ctx) => roles[ctx.random.nextInt(0, 4)].id,
  })
  .generate();

// Build user with roles
const usersWithRoles = users.map((user) => ({
  ...user,
  roles: userRoles
    .filter((ur) => ur.userId === user.id)
    .map((ur) => roles.find((r) => r.id === ur.roleId)),
}));
```

---

## Seeding & Reproducibility

### Deterministic Test Suites

```typescript
const TEST_SEEDS = {
  happy: 100,
  edge: 200,
  stress: 300,
  boundary: 400,
};

describe("DataProcessor", () => {
  it("should handle happy path", () => {
    const data = mock<User>(proto).many(10).seed(TEST_SEEDS.happy).generate();

    expect(process(data)).toEqual("success");
  });

  it("should handle edge cases", () => {
    const data = mock<User>(proto).many(10).seed(TEST_SEEDS.edge).generate();

    expect(process(data)).not.toThrow();
  });
});
```

### Reproducible Exports

```typescript
function exportTestData(scenario: string, seed: number) {
  const data = mock<User>(proto).many(1000).seed(seed).generate();

  const json = jsonExporter.export(data, {
    pretty: true,
    includeMetadata: true,
  });

  writeFile(`./test-data/${scenario}-${seed}.json`, json);
}

// Create reproducible test datasets
exportTestData("baseline", 42);
exportTestData("high-volume", 123);
exportTestData("edge-cases", 456);
```

---

## Data Validation

### Schema Validation

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().min(0).max(150),
  active: z.boolean(),
});

const users = mock<User>(proto).many(100).generate();

// Validate all generated data
const validUsers = users.filter((user) => {
  const result = UserSchema.safeParse(user);
  if (!result.success) {
    console.warn("Invalid user:", user, result.error);
  }
  return result.success;
});

console.log(`Valid: ${validUsers.length}/${users.length}`);
```

### Data Quality Checks

```typescript
function validateDataQuality<T extends object>(
  data: T[],
  rules: {
    [K in keyof T]?: (value: T[K]) => boolean;
  },
): boolean {
  return data.every((item) =>
    Object.entries(rules).every(([key, check]) =>
      (check as any)(item[key as keyof T]),
    ),
  );
}

const qualityCheck = validateDataQuality(users, {
  id: (id) => typeof id === "string" && id.length > 0,
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email as string),
  age: (age) => age >= 0 && age <= 150,
});

console.log("Data quality check:", qualityCheck ? "✓ Passed" : "✗ Failed");
```

---

## Integration Patterns

### Database Seeding

```typescript
import { writeFile, ensureDir } from "@iamt3z/mockly";

async function seedDatabase(db: Database) {
  ensureDir("./seeds");

  const users = mock<User>(proto).many(1000).seed(42).generate();

  // Insert into database
  await db.users.insertMany(users);

  // Backup to file
  const json = jsonExporter.export(users, { pretty: true });
  writeFile("./seeds/users-backup.json", json);
}
```

### API Testing

```typescript
describe("User API", () => {
  let testUsers: User[];

  beforeAll(() => {
    testUsers = mock<User>(proto).many(50).seed(42).generate();
  });

  it("GET /users should return all users", async () => {
    const response = await api.get("/users");
    expect(response.data).toHaveLength(50);
  });

  it("POST /users should create new user", async () => {
    const newUser = testUsers[0];
    const response = await api.post("/users", newUser);
    expect(response.status).toBe(201);
  });
});
```

### Migration Testing

```typescript
function testDataMigration(fromVersion: number, toVersion: number) {
  const oldData = mock<OldUserSchema>(oldProto).many(1000).seed(42).generate();

  const migratedData = migrate(oldData, fromVersion, toVersion);

  const newData = migratedData as NewUserSchema[];
  expect(validateNew(newData)).toBe(true);
}
```

---

## Troubleshooting

### Issue: Type Inference Not Working

**Problem:** Generated data doesn't match expected types

```typescript
// ✗ Poor type inference
mock({ id: "", price: "" });

// ✓ Use correct prototype types
mock<Product>({ id: "", price: 0 });
```

**Solution:**

- Always use type generic parameter
- Provide prototype with correct types
- Use `as const` for literal types

### Issue: Nested Objects Empty

**Problem:** Nested properties not generating

```typescript
// ✗ Won't work - empty prototype
mock<User>({ profile: {} });

// ✓ Provide proper prototype
mock<User>({ profile: { bio: "", avatar: "" } });
```

### Issue: Random Not Seeded Properly

**Problem:** Same seed produces different results

```typescript
// ✗ Multiple instances don't share seed
const gen1 = mock(proto).seed(42);
const gen2 = mock(proto).seed(42);

// ✓ Use same instance or independent generations
const data1 = mock(proto).seed(42).generate();
const data2 = mock(proto).seed(42).generate();
```

### Issue: Performance Degradation

**Problem:** Generation becomes slow with large datasets

**Solution:**

- Use batching instead of single large generation
- Cache expensive computations
- Use lazy generation
- Profile with `performance.now()`

```typescript
// Profile generation
const start = performance.now();
const data = mock(proto).many(10000).generate();
console.log(`Generated in ${performance.now() - start}ms`);
```

---

For more examples, check the `/examples` directory.
