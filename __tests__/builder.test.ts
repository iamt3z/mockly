/**
 * CORE BUILDER TESTS
 *
 * Tests for MockBuilder functionality:
 * - Fluent API chaining
 * - Generation and seeding
 * - Field overrides
 * - Nested objects and arrays
 */

import { describe, it, expect, beforeEach } from "vitest";
import { mock, MockContext } from "../src/index";

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  active: boolean;
}

describe("MockBuilder", () => {
  describe("Basic Generation", () => {
    it("should generate a single item with .one()", () => {
      const user = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .one()
        .generate()[0];

      expect(user).toBeDefined();
      expect(user.id).toBeTruthy();
      expect(user.name).toBeTruthy();
      expect(user.email).toContain("@");
      expect(user.age).toBeGreaterThan(0);
    });

    it("should generate multiple items with .many()", () => {
      const users = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(5)
        .generate();

      expect(users).toHaveLength(5);
      expect(users.every((u) => u.id)).toBe(true);
    });

    it("should default to 1 item if no count specified", () => {
      const users = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      }).generate();

      expect(users).toHaveLength(1);
    });

    it("should return empty array for .many(0)", () => {
      const users = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(0)
        .generate();

      expect(users).toHaveLength(0);
    });
  });

  describe("Seeding & Determinism", () => {
    it("should generate identical data with same seed", () => {
      const seed = 42;
      const proto = { id: "", name: "", email: "", age: 0, active: true };

      const users1 = mock<User>(proto).many(5).seed(seed).generate();
      const users2 = mock<User>(proto).many(5).seed(seed).generate();

      expect(JSON.stringify(users1)).toBe(JSON.stringify(users2));
    });

    it("should generate different data with different seeds", () => {
      const proto = { id: "", name: "", email: "", age: 0, active: true };

      const users1 = mock<User>(proto).many(5).seed(1).generate();
      const users2 = mock<User>(proto).many(5).seed(2).generate();

      expect(JSON.stringify(users1)).not.toBe(JSON.stringify(users2));
    });

    it("should handle seed(0)", () => {
      const users = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(3)
        .seed(0)
        .generate();

      expect(users).toHaveLength(3);
      expect(users.every((u) => u.id)).toBe(true);
    });
  });

  describe("Field Overrides", () => {
    it("should override fields with static values", () => {
      const users = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(3)
        .override({
          email: () => "fixed@example.com",
          active: () => false,
        })
        .generate();

      expect(users.every((u) => u.email === "fixed@example.com")).toBe(true);
      expect(users.every((u) => u.active === false)).toBe(true);
    });

    it("should override fields with functions", () => {
      const users = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(3)
        .override({
          id: (ctx: MockContext) => `user_${ctx.index}`,
          email: (ctx: MockContext) => `user${ctx.index}@example.com`,
        })
        .generate();

      expect(users[0].id).toBe("user_0");
      expect(users[1].id).toBe("user_1");
      expect(users[0].email).toBe("user0@example.com");
      expect(users[1].email).toBe("user1@example.com");
    });

    it("should access context in override functions", () => {
      const users = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(3)
        .override({
          age: (ctx: MockContext) => ctx.index * 10,
        })
        .generate();

      expect(users[0].age).toBe(0);
      expect(users[1].age).toBe(10);
      expect(users[2].age).toBe(20);
    });

    it("should support partial overrides", () => {
      const users = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(1)
        .override({
          email: () => "test@example.com",
        })
        .generate();

      expect(users[0].email).toBe("test@example.com");
      expect(users[0].name).toBeTruthy();
      expect(users[0].id).toBeTruthy();
    });
  });

  describe("Fluent API", () => {
    it("should support method chaining", () => {
      const result = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(5)
        .seed(42)
        .override({ email: () => "test@example.com" });

      expect(result.generate()).toHaveLength(5);
    });

    it("should support chaining in any order", () => {
      const result1 = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .seed(42)
        .many(5)
        .generate();

      const result2 = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .many(5)
        .seed(42)
        .generate();

      expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
    });

    it("should support .first() shorthand", () => {
      const user = mock<User>({
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      })
        .seed(42)
        .first();

      expect(user.id).toBeTruthy();
      expect(user.email).toBeTruthy();
    });
  });

  describe("Type Inference", () => {
    it("should infer UUID from id field name", () => {
      const proto = {
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      };

      const users = mock<User>(proto).many(5).generate();

      expect(users.every((u) => /^[0-9a-f-]{36}$/i.test(u.id))).toBe(true);
    });

    it("should infer email from email field name", () => {
      const proto = {
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      };

      const users = mock<User>(proto).many(5).generate();

      expect(
        users.every((u) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)),
      ).toBe(true);
    });

    it("should infer age from age field name", () => {
      const proto = {
        id: "",
        name: "",
        email: "",
        age: 0,
        active: true,
      };

      const users = mock<User>(proto).many(5).generate();

      expect(users.every((u) => u.age >= 18 && u.age <= 80)).toBe(true);
    });
  });
});

describe("Nested Objects", () => {
  interface Address {
    street: string;
    city: string;
    zipCode: string;
  }

  interface UserWithAddress {
    id: string;
    name: string;
    address: Address;
  }

  it("should generate nested objects", () => {
    const users = mock<UserWithAddress>({
      id: "",
      name: "",
      address: {
        street: "",
        city: "",
        zipCode: "",
      },
    })
      .many(3)
      .generate();

    expect(users).toHaveLength(3);
    expect(users.every((u) => u.address.street)).toBe(true);
    expect(users.every((u) => u.address.city)).toBe(true);
  });

  it("should override nested fields", () => {
    const users = mock<UserWithAddress>({
      id: "",
      name: "",
      address: {
        street: "",
        city: "",
        zipCode: "",
      },
    })
      .many(2)
      .override({
        address: {
          city: () => "New York",
        },
      })
      .generate();

    expect(users[0].address.city).toBe("New York");
    expect(users[1].address.city).toBe("New York");
  });
});

describe("Arrays", () => {
  interface Post {
    id: string;
    title: string;
    tags: string[];
  }

  it("should generate arrays", () => {
    const posts = mock<Post>({
      id: "",
      title: "",
      tags: ["tag1"],
    })
      .many(2)
      .generate();

    expect(posts[0].tags).toBeInstanceOf(Array);
    expect(posts[0].tags.length).toBeGreaterThan(0);
  });

  it("should respect array prototype length", () => {
    const posts = mock<Post>({
      id: "",
      title: "",
      tags: ["tag1", "tag2", "tag3"],
    })
      .many(1)
      .generate();

    expect(posts[0].tags).toHaveLength(3);
  });
});
