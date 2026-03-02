import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CartItem, CartWithPrices } from "@/lib/cart/types";

// ---- Mocks ----

const mockGetCart = vi.fn<() => Promise<CartItem[]>>();
const mockSetCart = vi.fn();
const mockAddToCart = vi.fn();
const mockUpdateQuantity = vi.fn();
const mockClearCart = vi.fn();
const mockCalculateTotals = vi.fn<(items: CartItem[]) => Promise<CartWithPrices>>();

vi.mock("@/lib/cart/cart", () => ({
  getCart: (...args: unknown[]) => mockGetCart(...(args as [])),
  setCart: (...args: unknown[]) => mockSetCart(...(args as [CartItem[]])),
  addToCart: (...args: unknown[]) => mockAddToCart(...(args as [string, string | null, number])),
  updateQuantity: (...args: unknown[]) => mockUpdateQuantity(...(args as [string, string | null, number])),
  clearCart: (...args: unknown[]) => mockClearCart(...(args as [])),
  calculateTotals: (...args: unknown[]) => mockCalculateTotals(...(args as [CartItem[]])),
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "user-1", email: "test@test.com", role: "customer" })),
}));

vi.mock("@/lib/utils/audit", () => ({
  logAuditEvent: vi.fn(),
}));

const mockFrom = vi.fn();
const mockRpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

import { addToCartAction, updateCartAction } from "@/lib/cart/actions";
import { createOrder } from "@/lib/checkout/actions";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

describe("E-commerce Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: empty cart so currentItems.find() doesn't crash
    mockGetCart.mockResolvedValue([]);
    // Default: sufficient stock for validateStock calls in cart actions
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { stock_quantity: 100, name: "Product" }, error: null }),
        }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "order-1" }, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    });
    // Default: successful atomic order creation
    mockRpc.mockResolvedValue({ data: { order_id: "order-1", order_number: "ORD-001000" }, error: null });
  });

  it("should add product to cart", async () => {
    mockAddToCart.mockResolvedValue(undefined);

    const result = await addToCartAction("product-1", null, 1);
    expect(result).toEqual({ success: true });
    expect(mockAddToCart).toHaveBeenCalledWith("product-1", null, 1);
  });

  it("should reject adding with invalid quantity", async () => {
    const result = await addToCartAction("product-1", null, -1);
    expect("error" in result).toBe(true);
  });

  it("should update cart item quantity", async () => {
    mockUpdateQuantity.mockResolvedValue(undefined);

    const result = await updateCartAction("product-1", null, 3);
    expect(result).toEqual({ success: true });
    expect(mockUpdateQuantity).toHaveBeenCalledWith("product-1", null, 3);
  });

  it("should complete full checkout flow with mocked data", async () => {
    // 1. Cart has items
    mockGetCart.mockResolvedValue([
      { productId: "p1", variantId: null, quantity: 2 },
    ]);

    // 2. Calculate totals
    mockCalculateTotals.mockResolvedValue({
      items: [
        { productId: "p1", variantId: null, quantity: 2, name: "Widget", price: 25, total: 50 },
      ],
      subtotal: 50,
      tax: 11,
      shipping: 0,
      total: 61,
    });

    mockClearCart.mockResolvedValue(undefined);

    // 3. Mock Supabase calls
    // Sequence: products (stock check) → orders (insert) → order_items (insert)
    // Order number + stock decrement use rpc()
    let fromCallCount = 0;
    mockFrom.mockImplementation((table: string) => {
      fromCallCount++;
      if (table === "products" && fromCallCount === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: { stock_quantity: 10, name: "Widget" }, error: null })
              ),
            })),
          })),
        };
      }
      if (table === "orders" && fromCallCount === 2) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: { id: "order-1" }, error: null })
              ),
            })),
          })),
        };
      }
      // order_items
      return {
        insert: vi.fn(() => Promise.resolve({ error: null })),
      };
    });

    // Mock RPC: atomic order creation returns order object
    mockRpc.mockResolvedValue({ data: { order_id: "order-1", order_number: "ORD-001000" }, error: null });

    const fd = makeFormData({
      email: "buyer@test.com",
      shipping_street: "Via Roma 1",
      shipping_city: "Milano",
      shipping_zip: "20100",
      shipping_country: "IT",
    });

    const result = await createOrder(fd);

    // Verify success and order number generation
    expect("error" in result).toBe(false);
    if ("orderNumber" in result) {
      expect(result.orderNumber).toMatch(/^ORD-\d{6}$/);
      expect(result.success).toBe(true);
    }

    // Verify cart was cleared
    expect(mockClearCart).toHaveBeenCalled();
  });

  it("should fail checkout with empty cart", async () => {
    mockGetCart.mockResolvedValue([]);

    const fd = makeFormData({
      email: "buyer@test.com",
      shipping_street: "Via Roma 1",
      shipping_city: "Milano",
      shipping_zip: "20100",
      shipping_country: "IT",
    });

    const result = await createOrder(fd);
    expect(result).toEqual({ error: "Il carrello è vuoto" });
  });

  it("should fail checkout with insufficient stock", async () => {
    mockGetCart.mockResolvedValue([
      { productId: "p1", variantId: null, quantity: 100 },
    ]);

    mockCalculateTotals.mockResolvedValue({
      items: [
        { productId: "p1", variantId: null, quantity: 100, name: "Widget", price: 25, total: 2500 },
      ],
      subtotal: 2500,
      tax: 550,
      shipping: 0,
      total: 3050,
    });

    // Simulate atomic RPC returning stock error
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "Insufficient stock for product p1: available 5, requested 100", code: "P0001" },
    });

    const fd = makeFormData({
      email: "buyer@test.com",
      shipping_street: "Via Roma 1",
      shipping_city: "Milano",
      shipping_zip: "20100",
      shipping_country: "IT",
    });

    const result = await createOrder(fd);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("stock sufficiente");
    }
  });
});
