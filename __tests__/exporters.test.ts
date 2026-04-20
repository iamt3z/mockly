/**
 * EXPORTER TESTS
 *
 * Tests for JSON and CSV exporters
 */

import { describe, it, expect } from "vitest";
import { mock, jsonExporter, csvExporter } from "../src/index";

interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
  createdAt: Date;
}

describe("Exporters", () => {
  describe("JSONExporter", () => {
    it("should export to valid JSON", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date(),
      })
        .many(3)
        .seed(42)
        .generate();

      const json = jsonExporter.export(products, { pretty: false });

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty("data");
      expect(parsed.data).toHaveLength(3);
    });

    it("should support custom rootKey", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date(),
      })
        .many(2)
        .generate();

      const json = jsonExporter.export(products, {
        rootKey: "products",
        pretty: false,
      });

      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty("products");
      expect(parsed.products).toHaveLength(2);
    });

    it("should include metadata when requested", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date(),
      })
        .many(2)
        .generate();

      const json = jsonExporter.export(products, {
        includeMetadata: true,
        pretty: false,
      });

      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty("metadata");
      expect(parsed.metadata).toHaveProperty("generatedAt");
      expect(parsed.metadata).toHaveProperty("count");
    });

    it("should pretty print when requested", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date(),
      })
        .many(1)
        .generate();

      const prettyJson = jsonExporter.export(products, { pretty: true });
      const minifiedJson = jsonExporter.export(products, {
        pretty: false,
      });

      expect(prettyJson.length).toBeGreaterThan(minifiedJson.length);
      expect(prettyJson).toContain("\n");
    });

    it("should format dates in ISO format", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date("2024-01-15"),
      })
        .many(1)
        .generate();

      const json = jsonExporter.export(products, {
        dateFormat: "iso",
        pretty: false,
      });

      const parsed = JSON.parse(json);
      expect(parsed.data[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should return correct MIME type", () => {
      expect(jsonExporter.getMimeType()).toBe("application/json");
    });

    it("should return correct extension", () => {
      expect(jsonExporter.getExtension()).toBe("json");
    });
  });

  describe("CSVExporter", () => {
    it("should export to CSV format", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date(),
      })
        .many(3)
        .seed(42)
        .generate();

      const csv = csvExporter.export(products, { header: true });

      expect(csv).toContain("\n");
      const lines = csv.split("\n");
      expect(lines.length).toBeGreaterThan(1);
    });

    it("should include headers", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date(),
      })
        .many(1)
        .generate();

      const csv = csvExporter.export(products, { header: true });
      const lines = csv.split("\n");

      expect(lines[0]).toContain("id");
      expect(lines[0]).toContain("name");
      expect(lines[0]).toContain("price");
    });

    it("should omit headers when header=false", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date(),
      })
        .many(1)
        .generate();

      const csv = csvExporter.export(products, { header: false });
      const lines = csv.split("\n");

      expect(lines[0]).not.toContain("id");
    });

    it("should support different delimiters", () => {
      const products = mock<Product>({
        id: "",
        name: "",
        price: 0,
        active: true,
        createdAt: new Date(),
      })
        .many(1)
        .generate();

      const commaCSV = csvExporter.export(products, {
        header: true,
        delimiter: ",",
      });

      const semicolonCSV = csvExporter.export(products, {
        header: true,
        delimiter: ";",
      });

      expect(commaCSV).toContain(",");
      expect(semicolonCSV).toContain(";");
    });

    it("should escape quotes in values", () => {
      interface Item {
        id: string;
        description: string;
      }

      const items = mock<Item>({
        id: "",
        description: "",
      })
        .many(1)
        .override({
          description: () => 'Text with "quotes" inside',
        })
        .generate();

      const csv = csvExporter.export(items, { header: true });

      expect(csv).toContain('""');
    });

    it("should return correct MIME type", () => {
      expect(csvExporter.getMimeType()).toBe("text/csv");
    });

    it("should return correct extension", () => {
      expect(csvExporter.getExtension()).toBe("csv");
    });
  });

  describe("Empty Data", () => {
    it("should handle empty arrays for JSON", () => {
      const json = jsonExporter.export([], { pretty: false });
      const parsed = JSON.parse(json);

      expect(parsed.data).toEqual([]);
    });

    it("should handle empty arrays for CSV", () => {
      const csv = csvExporter.export([], { header: true });

      expect(csv).toBe("");
    });
  });
});
