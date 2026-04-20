/**
 * UTILITIES TESTS
 *
 * Tests for utility functions
 */

import { describe, it, expect } from "vitest";
import {
  deepClone,
  pickRandom,
  groupBy,
  sum,
  average,
  formatCurrency,
  slugify,
  isValidEmail,
  calculateAge,
} from "../src/index";

describe("Utilities", () => {
  describe("deepClone", () => {
    it("should clone simple objects", () => {
      const original = { a: 1, b: 2 };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it("should clone nested objects", () => {
      const original = { a: { b: { c: 1 } } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.a).not.toBe(original.a);
    });

    it("should clone arrays", () => {
      const original = [1, 2, [3, 4]];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it("should preserve dates", () => {
      const date = new Date("2024-01-01");
      const original = { date };
      const cloned = deepClone(original);

      expect(cloned.date.getTime()).toBe(date.getTime());
    });
  });

  describe("pickRandom", () => {
    it("should pick random subset", () => {
      const array = [1, 2, 3, 4, 5];
      const picked = pickRandom(array, 3);

      expect(picked).toHaveLength(3);
      expect(picked.every((n) => array.includes(n))).toBe(true);
    });

    it("should pick all elements if count equals length", () => {
      const array = [1, 2, 3];
      const picked = pickRandom(array, 3);

      expect(picked.sort()).toEqual(array.sort());
    });

    it("should return empty array for count=0", () => {
      const array = [1, 2, 3];
      const picked = pickRandom(array, 0);

      expect(picked).toHaveLength(0);
    });
  });

  describe("groupBy", () => {
    it("should group by property", () => {
      const data = [
        { id: 1, category: "A" },
        { id: 2, category: "B" },
        { id: 3, category: "A" },
      ];

      const grouped = groupBy(data, "category");

      expect(grouped).toHaveProperty("A");
      expect(grouped).toHaveProperty("B");
      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(1);
    });

    it("should handle numeric keys", () => {
      const data = [
        { id: 1, score: 80 },
        { id: 2, score: 90 },
        { id: 3, score: 80 },
      ];

      const grouped = groupBy(data, "score");

      expect(grouped).toHaveProperty("80");
      expect(grouped).toHaveProperty("90");
      expect(grouped["80"]).toHaveLength(2);
    });
  });

  describe("sum", () => {
    it("should sum array of numbers", () => {
      expect(sum([1, 2, 3])).toBe(6);
    });

    it("should handle empty array", () => {
      expect(sum([])).toBe(0);
    });

    it("should handle negative numbers", () => {
      expect(sum([1, -2, 3])).toBe(2);
    });

    it("should handle floats", () => {
      expect(sum([1.5, 2.5, 3.0])).toBe(7);
    });
  });

  describe("average", () => {
    it("should calculate average", () => {
      expect(average([1, 2, 3])).toBe(2);
    });

    it("should handle empty array", () => {
      expect(average([])).toBe(0);
    });

    it("should handle single element", () => {
      expect(average([5])).toBe(5);
    });

    it("should handle negative numbers", () => {
      expect(average([1, -1, 2])).toBeCloseTo(0.67, 1);
    });
  });

  describe("formatCurrency", () => {
    it("should format as currency", () => {
      const formatted = formatCurrency(1234.56, "USD");

      expect(formatted).toContain("1");
      expect(formatted).toContain("234");
    });

    it("should handle zero", () => {
      const formatted = formatCurrency(0, "USD");

      expect(formatted).toBeTruthy();
    });

    it("should default to USD", () => {
      const formatted = formatCurrency(100);

      expect(formatted).toBeTruthy();
    });
  });

  describe("slugify", () => {
    it("should convert to lowercase", () => {
      expect(slugify("HELLO")).toBe("hello");
    });

    it("should replace spaces with hyphens", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should remove special characters", () => {
      expect(slugify("Hello! @World")).toBe("hello-world");
    });

    it("should collapse multiple hyphens", () => {
      expect(slugify("Hello---World")).toBe("hello-world");
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.email@domain.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
    });

    it("should reject emails with spaces", () => {
      expect(isValidEmail("user @example.com")).toBe(false);
      expect(isValidEmail("user@ example.com")).toBe(false);
    });
  });

  describe("calculateAge", () => {
    it("should calculate age correctly", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);

      const age = calculateAge(birthDate);

      expect(age).toBe(30);
    });

    it("should handle birthday not yet passed this year", () => {
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 25,
        today.getMonth() + 1,
        15,
      );

      const age = calculateAge(birthDate);

      expect(age).toBe(24);
    });

    it("should calculate age 0 for recent births", () => {
      const birthDate = new Date();
      birthDate.setDate(birthDate.getDate() - 5);

      const age = calculateAge(birthDate);

      expect(age).toBe(0);
    });
  });
});
