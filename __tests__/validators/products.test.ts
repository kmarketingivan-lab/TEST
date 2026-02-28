import { describe, it, expect } from "vitest";
import { productSchema } from "@/lib/validators/products";

describe("productSchema", () => {
  it("should accept valid product", () => {
    const result = productSchema.safeParse({
      name: "Maglietta Rossa",
      slug: "maglietta-rossa",
      price: 29.99,
    });
    expect(result.success).toBe(true);
  });

  it("should accept product with all fields", () => {
    const result = productSchema.safeParse({
      name: "Maglietta Rossa XL",
      slug: "maglietta-rossa-xl",
      description: "Una bella maglietta",
      price: 29.99,
      compare_at_price: 39.99,
      cost_price: 10.0,
      sku: "MAG-001",
      stock_quantity: 100,
      category_id: "550e8400-e29b-41d4-a716-446655440000",
      is_active: true,
      is_featured: true,
    });
    expect(result.success).toBe(true);
  });

  it("should accept price = 0 (valid for free products)", () => {
    const result = productSchema.safeParse({
      name: "Free Item",
      slug: "free-item",
      price: 0,
    });
    expect(result.success).toBe(true);
  });

  it("should reject negative price", () => {
    const result = productSchema.safeParse({
      name: "Bad Product",
      slug: "bad-product",
      price: -1,
    });
    expect(result.success).toBe(false);
  });

  it("should reject slug with spaces", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      slug: "test product",
      price: 10,
    });
    expect(result.success).toBe(false);
  });

  it("should reject name shorter than 2 chars", () => {
    const result = productSchema.safeParse({
      name: "A",
      slug: "a",
      price: 10,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative stock quantity", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      slug: "test-product",
      price: 10,
      stock_quantity: -5,
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer stock quantity", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      slug: "test-product",
      price: 10,
      stock_quantity: 5.5,
    });
    expect(result.success).toBe(false);
  });

  it("should default stock_quantity to 0", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      slug: "test-product",
      price: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock_quantity).toBe(0);
    }
  });
});
