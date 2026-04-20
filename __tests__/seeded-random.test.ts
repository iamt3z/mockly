/**
 * SEEDED RANDOM TESTS
 *
 * Tests for the SeededRandom number generator
 */

import { describe, it, expect } from "vitest";
import { SeededRandom } from "../src/index";

describe("SeededRandom", () => {
  describe("Determinism", () => {
    it("should generate same sequence with same seed", () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);

      const seq1 = Array.from({ length: 10 }, () => rng1.next());
      const seq2 = Array.from({ length: 10 }, () => rng2.next());

      expect(seq1).toEqual(seq2);
    });

    it("should generate different sequence with different seed", () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(99);

      const seq1 = Array.from({ length: 5 }, () => rng1.next());
      const seq2 = Array.from({ length: 5 }, () => rng2.next());

      expect(seq1).not.toEqual(seq2);
    });
  });

  describe("next()", () => {
    it("should return values between 0 and 1", () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it("should not return exact 1", () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 1000; i++) {
        expect(rng.next()).not.toBe(1);
      }
    });
  });

  describe("nextInt()", () => {
    it("should return integers in range", () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(1, 100);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(100);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it("should include both min and max", () => {
      const rng = new SeededRandom(42);
      const values = new Set<number>();

      for (let i = 0; i < 10000; i++) {
        values.add(rng.nextInt(1, 2));
      }

      expect(values.has(1)).toBe(true);
      expect(values.has(2)).toBe(true);
    });

    it("should use defaults", () => {
      const rng = new SeededRandom(42);
      const value = rng.nextInt();

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });

  describe("nextFloat()", () => {
    it("should return floats in range", () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(1, 100);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThan(100);
      }
    });

    it("should use defaults", () => {
      const rng = new SeededRandom(42);
      const value = rng.nextFloat();

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });
  });

  describe("nextBoolean()", () => {
    it("should return boolean values", () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextBoolean();
        expect(typeof value).toBe("boolean");
      }
    });

    it("should return both true and false", () => {
      const rng = new SeededRandom(42);
      const values = new Set<boolean>();

      for (let i = 0; i < 1000; i++) {
        values.add(rng.nextBoolean());
      }

      expect(values.has(true)).toBe(true);
      expect(values.has(false)).toBe(true);
    });
  });

  describe("pick()", () => {
    it("should pick element from array", () => {
      const rng = new SeededRandom(42);
      const array = ["a", "b", "c"];

      const picked = rng.pick(array);

      expect(array).toContain(picked);
    });

    it("should pick all elements over many iterations", () => {
      const rng = new SeededRandom(42);
      const array = ["a", "b", "c"];
      const picked = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        picked.add(rng.pick(array));
      }

      expect(picked.size).toBe(3);
    });

    it("should throw on empty array", () => {
      const rng = new SeededRandom(42);

      expect(() => rng.pick([])).toThrow();
    });
  });

  describe("date()", () => {
    it("should return date in range", () => {
      const rng = new SeededRandom(42);
      const start = new Date(2020, 0, 1);
      const end = new Date(2024, 11, 31);

      for (let i = 0; i < 100; i++) {
        const date = rng.date(start, end);
        expect(date.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(date.getTime()).toBeLessThanOrEqual(end.getTime());
      }
    });

    it("should use defaults", () => {
      const rng = new SeededRandom(42);
      const date = rng.date();

      expect(date instanceof Date).toBe(true);
    });
  });

  describe("uuid()", () => {
    it("should return UUID-like string", () => {
      const rng = new SeededRandom(42);
      const uuid = rng.uuid();

      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("should generate unique UUIDs", () => {
      const rng = new SeededRandom(42);
      const uuids = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        uuids.add(rng.uuid());
      }

      expect(uuids.size).toBe(1000);
    });
  });

  describe("clone()", () => {
    it("should clone random state", () => {
      const rng1 = new SeededRandom(42);
      rng1.next();
      rng1.next();

      const rng2 = rng1.clone();

      const seq1 = Array.from({ length: 5 }, () => rng1.next());
      const seq2 = Array.from({ length: 5 }, () => rng2.next());

      expect(seq1).toEqual(seq2);
    });

    it("should not share state with original", () => {
      const rng1 = new SeededRandom(42);
      const rng2 = rng1.clone();

      rng1.next();
      rng1.next();

      const val1 = rng1.next();
      const val2 = rng2.next();

      expect(val1).not.toBe(val2);
    });
  });

  describe("currentSeed", () => {
    it("should return current seed", () => {
      const rng = new SeededRandom(42);

      expect(rng.currentSeed).toBe(42);
    });

    it("should change after operations", () => {
      const rng = new SeededRandom(42);
      const seed1 = rng.currentSeed;

      rng.next();

      const seed2 = rng.currentSeed;

      expect(seed2).not.toBe(seed1);
    });
  });
});
