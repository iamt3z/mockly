/**
 * API TESTING EXAMPLE
 *
 * Demonstrates using Mockly for realistic API testing scenarios:
 * - User authentication mocking
 * - Paginated endpoint responses
 * - Error response generation
 * - Request/response lifecycle simulation
 * - Test data with various edge cases
 */

import { mock, MockContext, FieldResolver } from "../src/index";

// ==================== API MODELS ====================

interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: "admin" | "moderator" | "user";
  createdAt: Date;
  lastLogin: Date | null;
  isVerified: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  publishedAt: Date;
  updatedAt: Date;
  featured: boolean;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    username: string;
    avatar: string;
  };
  content: string;
  likes: number;
  replies: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: Date;
  requestId: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  timestamp: Date;
}

// ==================== EXAMPLE 1: MOCK AUTHENTICATED USERS ====================

console.log("=== API Testing Examples ===\n");

const roles: ("admin" | "moderator" | "user")[] = [
  "admin",
  "moderator",
  "user",
];

const mockUsers = mock<AuthUser>({
  id: "",
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  avatar: "",
  role: "user",
  createdAt: new Date(),
  lastLogin: null,
  isVerified: false,
})
  .many(10)
  .seed(42)
  .override({
    id: (ctx: MockContext) => `user_${ctx.index + 1}`,
    username: (ctx: MockContext) => `user_${ctx.index + 1}`,
    email: (ctx: MockContext) => `user${ctx.index + 1}@example.com`,
    firstName: (ctx: MockContext) =>
      ["John", "Jane", "Bob", "Alice", "Charlie"][ctx.index % 5],
    lastName: (ctx: MockContext) =>
      ["Doe", "Smith", "Johnson", "Williams", "Brown"][ctx.index % 5],
    avatar: (ctx: MockContext) =>
      `https://api.example.com/avatars/${ctx.index + 1}.jpg`,
    role: (ctx: MockContext) =>
      roles[ctx.index % roles.length] as "admin" | "moderator" | "user",
    createdAt: (ctx: MockContext) =>
      ctx.random.date(new Date(2022, 0, 1), new Date(2024, 0, 1)),
    lastLogin: (ctx: MockContext) =>
      ctx.random.nextBoolean() ? ctx.random.date() : (null as Date | null),
    isVerified: (ctx: MockContext) => (ctx.index < 7) as true | false, // First 7 are verified
  })
  .generate();

console.log("Mock Users for Testing:");
console.log(JSON.stringify(mockUsers.slice(0, 2), null, 2));

// ==================== EXAMPLE 2: PAGINATED BLOG POSTS RESPONSE ====================

const mockBlogPosts = mock<BlogPost>({
  id: "",
  title: "",
  slug: "",
  content: "",
  authorId: "",
  author: { id: "", username: "", avatar: "" },
  tags: ["javascript", "typescript"],
  likes: 0,
  comments: 0,
  views: 0,
  publishedAt: new Date(),
  updatedAt: new Date(),
  featured: false,
})
  .many(20)
  .seed(123)
  .override({
    id: (ctx: MockContext) => `post_${ctx.index + 1}`,
    title: (ctx: MockContext) =>
      [
        "Getting Started with TypeScript",
        "Advanced React Patterns",
        "REST API Best Practices",
        "Database Optimization Tips",
        "Understanding Closures in JavaScript",
      ][ctx.index % 5] + ` - Part ${Math.floor(ctx.index / 5) + 1}`,
    slug: (ctx: MockContext) => `post-${ctx.index + 1}`,
    content: (ctx: MockContext) =>
      `This is a detailed article about ${ctx.index}. Lorem ipsum dolor sit amet...`,
    authorId: (ctx: MockContext) => `user_${(ctx.index % 5) + 1}`,
    author: (ctx: MockContext) =>
      ({
        id: `user_${(ctx.index % 5) + 1}`,
        username: `user_${(ctx.index % 5) + 1}`,
        avatar: `https://api.example.com/avatars/${(ctx.index % 5) + 1}.jpg`,
      }) as { id: string; username: string; avatar: string },
    tags: (ctx: MockContext) => {
      const tagPool = [
        ["javascript", "web-dev"],
        ["typescript", "tooling"],
        ["react", "frontend"],
        ["nodejs", "backend"],
        ["database", "optimization"],
      ];
      return tagPool[ctx.index % tagPool.length] as string[];
    },
    likes: (ctx: MockContext) => ctx.random.nextInt(0, 5000),
    comments: (ctx: MockContext) => ctx.random.nextInt(0, 200),
    views: (ctx: MockContext) => ctx.random.nextInt(100, 50000),
    publishedAt: (ctx: MockContext) =>
      ctx.random.date(new Date(2023, 0, 1), new Date()),
    updatedAt: (ctx: MockContext) =>
      ctx.random.date(new Date(2023, 6, 1), new Date()),
    featured: (ctx: MockContext) => (ctx.index < 3) as true | false, // First 3 are featured
  })
  .generate();

// Create paginated response
const blogPostsPage1: PaginatedResponse<BlogPost> = {
  success: true,
  data: mockBlogPosts.slice(0, 10),
  pagination: {
    page: 1,
    perPage: 10,
    total: 20,
    totalPages: 2,
  },
  timestamp: new Date(),
};

console.log("\nPaginated Blog Posts Response (Page 1):");
console.log(JSON.stringify(blogPostsPage1.data.slice(0, 1), null, 2));
console.log(
  `\nPagination: Page ${blogPostsPage1.pagination.page} of ${blogPostsPage1.pagination.totalPages}`,
);

// ==================== EXAMPLE 3: COMMENTS WITH NESTED DATA ====================

const mockComments = mock<Comment>({
  id: "",
  postId: "",
  authorId: "",
  author: { username: "", avatar: "" },
  content: "",
  likes: 0,
  replies: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
})
  .many(15)
  .seed(456)
  .override({
    id: (ctx: MockContext) => `comment_${ctx.index + 1}`,
    postId: (ctx: MockContext) => `post_${(ctx.index % 5) + 1}`,
    authorId: (ctx: MockContext) => `user_${(ctx.index % 7) + 1}`,
    author: (ctx: MockContext) =>
      ({
        username: `user_${(ctx.index % 7) + 1}`,
        avatar: `https://api.example.com/avatars/${(ctx.index % 7) + 1}.jpg`,
      }) as { username: string; avatar: string },
    content: (ctx: MockContext) =>
      [
        "Great article! Very helpful.",
        "Thanks for sharing this knowledge.",
        "Could you elaborate on this part?",
        "I have a different approach to solve this.",
        "Exactly what I needed!",
      ][ctx.index % 5],
    likes: (ctx: MockContext) => ctx.random.nextInt(0, 500),
    replies: (ctx: MockContext) => ctx.random.nextInt(0, 20),
    createdAt: (ctx: MockContext) =>
      ctx.random.date(new Date(2024, 0, 1), new Date()),
    updatedAt: (ctx: MockContext) =>
      ctx.random.date(new Date(2024, 1, 1), new Date()),
  })
  .generate();

console.log("\nComments with Nested Author Data:");
console.log(JSON.stringify(mockComments.slice(0, 2), null, 2));

// ==================== EXAMPLE 4: ERROR RESPONSE SCENARIOS ====================

interface ErrorResponse {
  success: boolean;
  data: null;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: Date;
}

const errorScenarios: ErrorResponse[] = [
  {
    success: false,
    data: null,
    error: {
      code: "VALIDATION_ERROR",
      message: "Email validation failed",
      details: {
        email: "Invalid email format",
      },
    },
    timestamp: new Date(),
  },
  {
    success: false,
    data: null,
    error: {
      code: "UNAUTHORIZED",
      message: "Authentication required",
    },
    timestamp: new Date(),
  },
  {
    success: false,
    data: null,
    error: {
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource",
    },
    timestamp: new Date(),
  },
  {
    success: false,
    data: null,
    error: {
      code: "NOT_FOUND",
      message: "Resource not found",
    },
    timestamp: new Date(),
  },
];

console.log("\nError Response Scenarios:");
console.log(JSON.stringify(errorScenarios.slice(0, 2), null, 2));

// ==================== EXAMPLE 5: TESTING WITH DIFFERENT SEEDS ====================

console.log("\n--- Testing Deterministic Behavior ---");

const testRun1 = mock<AuthUser>({
  id: "",
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  avatar: "",
  role: "user",
  createdAt: new Date(),
  lastLogin: null,
  isVerified: false,
})
  .many(3)
  .seed(999)
  .generate();

const testRun2 = mock<AuthUser>({
  id: "",
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  avatar: "",
  role: "user",
  createdAt: new Date(),
  lastLogin: null,
  isVerified: false,
})
  .many(3)
  .seed(999)
  .generate();

const identical = JSON.stringify(testRun1) === JSON.stringify(testRun2);
console.log(`Seed 999 Run 1 & 2 identical: ${identical} ✓`);

// ==================== EXAMPLE 6: RATE LIMIT SIMULATION ====================

interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

const generateRateLimitHeaders = (): RateLimitInfo => ({
  limit: 1000,
  remaining:
    Math.random() > 0.3
      ? 500 + Math.floor(Math.random() * 500)
      : Math.floor(Math.random() * 50),
  resetAt: new Date(Date.now() + Math.random() * 3600000),
});

console.log("\nRate Limit Headers Simulation:");
[...Array(3)].forEach(() => {
  const headers = generateRateLimitHeaders();
  console.log(`  Remaining: ${headers.remaining}/${headers.limit}`);
});

// ==================== EXAMPLE 7: BULK OPERATION MOCKING ====================

interface BulkOperation<T> {
  id: string;
  operation: "create" | "update" | "delete";
  resource: string;
  data: T;
  status: "pending" | "completed" | "failed";
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

const bulkOps = mock<BulkOperation<AuthUser>>({
  id: "",
  operation: "create",
  resource: "users",
  data: {
    id: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    avatar: "",
    role: "user",
    createdAt: new Date(),
    lastLogin: null,
    isVerified: false,
  },
  status: "pending",
  createdAt: new Date(),
})
  .many(5)
  .override({
    id: (ctx: MockContext) => `op_${ctx.index + 1}`,
    operation: (ctx: MockContext) =>
      (["create", "update", "delete"] as const)[ctx.index % 3] as
        | "create"
        | "update"
        | "delete",
    status: (ctx: MockContext) =>
      (["pending", "completed", "failed"] as const)[ctx.index % 3] as
        | "pending"
        | "completed"
        | "failed",
    completedAt: (ctx: MockContext) =>
      ctx.random.nextBoolean() ? new Date() : (undefined as Date | undefined),
  })
  .generate();

console.log("\nBulk Operations:");
console.log(JSON.stringify(bulkOps.slice(0, 2), null, 2));

console.log("\n✓ All API testing examples completed successfully!");
