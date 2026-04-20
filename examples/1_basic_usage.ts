/**
 * BASIC USAGE EXAMPLE
 *
 * Demonstrates core functionality of the Mockly library:
 * - Simple mock data generation
 * - Type inference from prototypes
 * - Fluent API with chaining
 * - Field customization with overrides
 */

import { mock, FieldResolver, MockContext } from "../src/index";

// ==================== EXAMPLE 1: SIMPLE GENERATION ====================

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

// Generate a single user with inferred types
const singleUser = mock<User>({
  id: "",
  name: "",
  email: "",
  age: 0,
  isActive: false,
})
  .one()
  .generate()[0];

console.log("Single User:", singleUser);

// ==================== EXAMPLE 2: GENERATE MULTIPLE ITEMS ====================

// Generate 5 users
const users = mock<User>({
  id: "",
  name: "",
  email: "",
  age: 0,
  isActive: false,
})
  .many(5)
  .generate();

console.log("\n5 Generated Users:", users);

// ==================== EXAMPLE 3: DETERMINISTIC GENERATION (SEEDING) ====================

// Generate with a specific seed for reproducible results
const seedUsers1 = mock<User>({
  id: "",
  name: "",
  email: "",
  age: 0,
  isActive: false,
})
  .many(3)
  .seed(12345)
  .generate();

const seedUsers2 = mock<User>({
  id: "",
  name: "",
  email: "",
  age: 0,
  isActive: false,
})
  .many(3)
  .seed(12345)
  .generate();

console.log("\nSeed Test (should be identical):");
console.log("Users 1:", seedUsers1);
console.log("Users 2:", seedUsers2);
console.log(
  "Are identical:",
  JSON.stringify(seedUsers1) === JSON.stringify(seedUsers2),
);

// ==================== EXAMPLE 4: FIELD OVERRIDES ====================

// Customize specific fields while others are auto-generated
const customUsers = mock<User>({
  id: "",
  name: "",
  email: "",
  age: 0,
  isActive: false,
})
  .many(3)
  .override({
    email: (ctx: MockContext) => `user${ctx.index + 1}@example.com`,
    age: (ctx: MockContext) => ctx.random.nextInt(25, 35),
    isActive: () => true, // Always true
  })
  .generate();

console.log("\nCustomized Users:", customUsers);

// ==================== EXAMPLE 5: PRODUCT MOCKING ====================

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  tags: string[];
}

const products = mock<Product>({
  id: "",
  name: "",
  description: "",
  price: 0,
  stock: 0,
  tags: ["electronics"],
})
  .many(3)
  .override({
    name: (ctx: MockContext) => `Product ${ctx.index + 1}`,
    price: (ctx: MockContext) => parseFloat((Math.random() * 1000).toFixed(2)),
    stock: (ctx: MockContext) => ctx.random.nextInt(0, 100),
  })
  .generate();

console.log("\nGenerated Products:", products);

// ==================== EXAMPLE 6: NESTED OBJECTS ====================

interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

interface UserWithAddress {
  id: string;
  name: string;
  email: string;
  address: Address;
}

const usersWithAddresses = mock<UserWithAddress>({
  id: "",
  name: "",
  email: "",
  address: {
    street: "",
    city: "",
    country: "",
    zipCode: "",
  },
})
  .many(2)
  .generate();

console.log(
  "\nUsers with Addresses:",
  JSON.stringify(usersWithAddresses, null, 2),
);

// ==================== EXAMPLE 7: ARRAYS IN MODELS ====================

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
}

const posts = mock<Post>({
  id: "",
  title: "",
  content: "",
  tags: ["technology", "programming"],
  likes: 0,
})
  .many(2)
  .override({
    title: (ctx: MockContext) => `Post ${ctx.index + 1}`,
    likes: (ctx: MockContext) => ctx.random.nextInt(0, 1000),
  })
  .generate();

console.log("\nPosts with Tags:", posts);

// ==================== EXAMPLE 8: BATCH GENERATION ====================

// Generate multiple different entity types
const mockDataBatch = {
  users: mock<User>({ id: "", name: "", email: "", age: 0, isActive: false })
    .many(5)
    .seed(100)
    .generate(),

  products: mock<Product>({
    id: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    tags: [],
  })
    .many(5)
    .seed(200)
    .generate(),

  posts: mock<Post>({
    id: "",
    title: "",
    content: "",
    tags: [],
    likes: 0,
  })
    .many(5)
    .seed(300)
    .generate(),
};

console.log("\nMock Data Batch Generated:");
console.log(`- Users: ${mockDataBatch.users.length}`);
console.log(`- Products: ${mockDataBatch.products.length}`);
console.log(`- Posts: ${mockDataBatch.posts.length}`);

// ==================== EXAMPLE 9: NULLABLE FIELDS ====================

interface BlogPost {
  id: string;
  title: string;
  content: string;
  featuredImage: string | null;
  authorId: string | null;
}

const blogPosts = mock<BlogPost>({
  id: "",
  title: "",
  content: "",
  featuredImage: null,
  authorId: null,
})
  .many(2)
  .override({
    title: (ctx: MockContext) => `Blog Post ${ctx.index + 1}`,
    featuredImage: (ctx: MockContext) =>
      ctx.random.nextBoolean()
        ? "https://example.com/image.jpg"
        : (null as string | null),
    authorId: (ctx: MockContext) =>
      ctx.random.nextBoolean()
        ? `author_${ctx.random.nextInt(1, 100)}`
        : (null as string | null),
  })
  .generate();

console.log("\nBlog Posts (with optional fields):", blogPosts);

// ==================== EXAMPLE 10: EXPORT TO FILE ====================

import { jsonExporter, csvExporter, writeFile } from "../src/index";

// Export users to JSON
const usersJSON = jsonExporter.export(users, {
  pretty: true,
  includeMetadata: true,
});
writeFile("./data/users.json", usersJSON);
console.log("\n✓ Exported users to ./data/users.json");

// Export products to CSV
const productsCSV = csvExporter.export(products, {
  header: true,
  nestedHandling: "flatten",
});
writeFile("./data/products.csv", productsCSV);
console.log("✓ Exported products to ./data/products.csv");
