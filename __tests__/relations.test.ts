/**
 * RELATIONS TESTS
 *
 * Tests for join and joinOne functionality
 */

import { describe, it, expect } from "vitest";
import { mock, join, joinOne } from "../src/index";

interface User {
  id: string;
  name: string;
}

interface Post {
  id: string;
  userId: string;
  title: string;
}

describe("Relations", () => {
  describe("join()", () => {
    it("should perform one-to-many join", () => {
      const users = [
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
      ];

      const posts = [
        { id: "p1", userId: "u1", title: "Post 1" },
        { id: "p2", userId: "u1", title: "Post 2" },
        { id: "p3", userId: "u2", title: "Post 3" },
      ];

      const result = join<User, Post>(users, posts, {
        localKey: "id",
        foreignKey: "userId",
        as: "posts",
      });

      expect(result).toHaveLength(2);
      expect(result[0].posts).toHaveLength(2);
      expect(result[1].posts).toHaveLength(1);
    });

    it("should include all matching foreign records", () => {
      const users = [{ id: "u1", name: "Alice" }];
      const posts = [
        { id: "p1", userId: "u1", title: "Post 1" },
        { id: "p2", userId: "u1", title: "Post 2" },
        { id: "p3", userId: "u1", title: "Post 3" },
      ];

      const result = join<User, Post>(users, posts, {
        localKey: "id",
        foreignKey: "userId",
        as: "posts",
      });

      expect(result[0].posts).toEqual(posts);
    });

    it("should handle no matches", () => {
      const users = [
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
      ];

      const posts = [{ id: "p1", userId: "u1", title: "Post 1" }];

      const result = join<User, Post>(users, posts, {
        localKey: "id",
        foreignKey: "userId",
        as: "posts",
      });

      expect(result[0].posts).toHaveLength(1);
      expect(result[1].posts).toHaveLength(0);
    });

    it('should use custom property name with "as"', () => {
      const users = [{ id: "u1", name: "Alice" }];
      const posts = [{ id: "p1", userId: "u1", title: "Post 1" }];

      const result = join<User, Post>(users, posts, {
        localKey: "id",
        foreignKey: "userId",
        as: "userPosts",
      });

      expect(result[0]).toHaveProperty("userPosts");
      expect((result[0] as any).userPosts).toHaveLength(1);
    });
  });

  describe("joinOne()", () => {
    it("should perform many-to-one join", () => {
      const users = [
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
      ];

      const posts = [
        { id: "p1", userId: "u1", title: "Post 1" },
        { id: "p2", userId: "u1", title: "Post 2" },
        { id: "p3", userId: "u2", title: "Post 3" },
      ];

      const result = joinOne<Post, User>(posts, users, {
        localKey: "userId",
        foreignKey: "id",
        as: "author",
      });

      expect(result).toHaveLength(3);
      expect(result[0].author).toBeDefined();
      expect((result[0] as any).author.id).toBe("u1");
    });

    it("should return null when no match found", () => {
      const users = [{ id: "u1", name: "Alice" }];
      const posts = [
        { id: "p1", userId: "u1", title: "Post 1" },
        { id: "p2", userId: "u999", title: "Post 2" },
      ];

      const result = joinOne<Post, User>(posts, users, {
        localKey: "userId",
        foreignKey: "id",
        as: "author",
      });

      expect((result[0] as any).author).toBeDefined();
      expect((result[1] as any).author).toBeNull();
    });

    it('should use custom property name with "as"', () => {
      const users = [{ id: "u1", name: "Alice" }];
      const posts = [{ id: "p1", userId: "u1", title: "Post 1" }];

      const result = joinOne<Post, User>(posts, users, {
        localKey: "userId",
        foreignKey: "id",
        as: "postAuthor",
      });

      expect(result[0]).toHaveProperty("postAuthor");
    });
  });

  describe("Integration with mock()", () => {
    it("should join generated mock data", () => {
      const users = mock<User>({
        id: "",
        name: "",
      })
        .many(3)
        .seed(42)
        .generate();

      const posts = mock<Post>({
        id: "",
        userId: "",
        title: "",
      })
        .many(10)
        .seed(43)
        .override({
          userId: (ctx) => users[ctx.index % 3].id,
        })
        .generate();

      const result = join<User, Post>(users, posts, {
        localKey: "id",
        foreignKey: "userId",
        as: "posts",
      });

      expect(result).toHaveLength(3);
      expect(result.every((u) => (u as any).posts.length > 0)).toBe(true);
    });
  });
});
