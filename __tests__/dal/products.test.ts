import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a fluent mock that returns itself for all chained methods
function createFluentMock(resolveValue: Record<string, unknown> = {}) {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};
  const handler: ProxyHandler<Record<string, ReturnType<typeof vi.fn>>> = {
    get(_target, prop: string) {
      if (prop === "then") return undefined; // Prevent auto-promise resolution
      if (!mock[prop]) {
        mock[prop] = vi.fn(() => new Proxy({}, handler));
      }
      return mock[prop];
    },
  };

  // Terminal methods return resolved values
  const proxy = new Proxy({}, handler);

  // Override terminal methods to resolve
  const terminalResult = {
    data: resolveValue.data ?? [{ id: "1", name: "Product 1", slug: "product-1", price: 10 }],
    count: resolveValue.count ?? 1,
    error: resolveValue.error ?? null,
  };

  // Make range, limit, and single resolve
  const resolve = () => Promise.resolve(terminalResult);

  // We need a stable reference for terminal checks
  mock.range = vi.fn(() => resolve());
  mock.limit = vi.fn(() => {
    const p = resolve();
    // Also make .eq chainable after .limit
    (p as unknown as Record<string, unknown>).eq = vi.fn(() => resolve());
    return p;
  });
  mock.single = vi.fn(() => resolve());

  return { proxy, mock };
}

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

import {
  getProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  getRelatedProducts,
  searchProducts,
} from "@/lib/dal/products";

describe("DAL Products", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const { proxy } = createFluentMock();
    mockFrom.mockReturnValue(proxy);
  });

  describe("getProducts", () => {
    it("should query products table with defaults", async () => {
      const result = await getProducts();
      expect(mockFrom).toHaveBeenCalledWith("products");
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("should filter by category", async () => {
      const { proxy, mock } = createFluentMock();
      mockFrom.mockReturnValue(proxy);
      await getProducts({ categoryId: "cat-123" });
      expect(mock.eq).toHaveBeenCalledWith("category_id", "cat-123");
    });

    it("should apply search filter", async () => {
      const { proxy, mock } = createFluentMock();
      mockFrom.mockReturnValue(proxy);
      await getProducts({ search: "shirt" });
      expect(mock.or).toHaveBeenCalled();
    });

    it("should apply sorting", async () => {
      const { proxy, mock } = createFluentMock();
      mockFrom.mockReturnValue(proxy);
      await getProducts({ sortBy: "price", sortOrder: "asc" });
      expect(mock.order).toHaveBeenCalledWith("price", { ascending: true });
    });
  });

  describe("getProductBySlug", () => {
    it("should query by slug with relations", async () => {
      const { proxy, mock } = createFluentMock();
      mockFrom.mockReturnValue(proxy);
      const result = await getProductBySlug("product-1");
      expect(mockFrom).toHaveBeenCalledWith("products");
      expect(mock.select).toHaveBeenCalledWith("*, product_images(*), product_variants(*), brands(id,name,slug,logo_url)");
      expect(result).toBeTruthy();
    });

    it("should return null for non-existent slug", async () => {
      const { proxy } = createFluentMock({
        data: null,
        error: { code: "PGRST116", message: "not found" },
      });
      mockFrom.mockReturnValue(proxy);
      const result = await getProductBySlug("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("getProductById", () => {
    it("should query by id", async () => {
      const { proxy, mock } = createFluentMock();
      mockFrom.mockReturnValue(proxy);
      const result = await getProductById("uuid-123");
      expect(mock.eq).toHaveBeenCalledWith("id", "uuid-123");
      expect(result).toBeTruthy();
    });
  });

  describe("getFeaturedProducts", () => {
    it("should filter featured and active products", async () => {
      const { proxy, mock } = createFluentMock();
      mockFrom.mockReturnValue(proxy);
      await getFeaturedProducts(4);
      expect(mock.eq).toHaveBeenCalledWith("is_active", true);
      expect(mock.eq).toHaveBeenCalledWith("is_featured", true);
      expect(mock.limit).toHaveBeenCalledWith(4);
    });
  });

  describe("getRelatedProducts", () => {
    it("should exclude current product", async () => {
      const { proxy, mock } = createFluentMock();
      mockFrom.mockReturnValue(proxy);
      await getRelatedProducts("prod-1", null, 4);
      expect(mock.neq).toHaveBeenCalledWith("id", "prod-1");
    });
  });

  describe("searchProducts", () => {
    it("should search active products by name/description", async () => {
      const { proxy, mock } = createFluentMock();
      mockFrom.mockReturnValue(proxy);
      await searchProducts("maglietta", 5);
      expect(mock.eq).toHaveBeenCalledWith("is_active", true);
      expect(mock.or).toHaveBeenCalled();
      expect(mock.limit).toHaveBeenCalledWith(5);
    });
  });
});
