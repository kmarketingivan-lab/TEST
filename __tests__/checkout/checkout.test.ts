import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CartItem, CartWithPrices } from "@/lib/cart/types";

// Mock cart functions
const mockGetCart = vi.fn<() => Promise<CartItem[]>>();
const mockClearCart = vi.fn();
const mockCalculateTotals = vi.fn<(items: CartItem[]) => Promise<CartWithPrices>>();

vi.mock("@/lib/cart/cart", () => ({
  getCart: (...args: unknown[]) => mockGetCart(...(args as [])),
  clearCart: (...args: unknown[]) => mockClearCart(...(args as [])),
  calculateTotals: (...args: unknown[]) => mockCalculateTotals(...(args as [CartItem[]])),
}));

// Mock auth
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "user-1", email: "test@test.com", role: "customer" })),
}));

// Mock audit
vi.mock("@/lib/utils/audit", () => ({
  logAuditEvent: vi.fn(),
}));

// Mock Supabase
const mockSelectProducts = vi.fn();
const mockSelectOrders = vi.fn();
const mockInsertOrder = vi.fn();
const mockInsertItems = vi.fn();
const mockUpdateStock = vi.fn();

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

import { createOrder } from "@/lib/checkout/actions";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

const validFormData = makeFormData({
  email: "buyer@test.com",
  shipping_street: "Via Roma 1",
  shipping_city: "Milano",
  shipping_zip: "20100",
  shipping_country: "IT",
});

describe("Checkout — createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: cart with one item
    mockGetCart.mockResolvedValue([
      { productId: "p1", variantId: null, quantity: 2 },
    ]);

    mockCalculateTotals.mockResolvedValue({
      items: [
        { productId: "p1", variantId: null, quantity: 2, name: "Product 1", price: 25, total: 50 },
      ],
      subtotal: 50,
      tax: 11,
      shipping: 0,
      total: 61,
    });

    mockClearCart.mockResolvedValue(undefined);

    // Mock Supabase from() calls
    let fromCallCount = 0;
    mockFrom.mockImplementation((table: string) => {
      fromCallCount++;
      if (table === "products" && fromCallCount <= 2) {
        // Stock check
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { stock_quantity: 10, name: "Product 1" },
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      if (table === "orders" && fromCallCount <= 3) {
        // Count query
        return {
          select: vi.fn(() =>
            Promise.resolve({ count: 5, error: null })
          ),
        };
      }
      if (table === "orders") {
        // Insert order
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { id: "order-1" },
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      if (table === "order_items") {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
        };
      }
      // Stock update (products again)
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { stock_quantity: 10 },
                error: null,
              })
            ),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      };
    });
  });

  it("should return validation error for invalid email", async () => {
    const fd = makeFormData({
      email: "not-an-email",
      shipping_street: "Via Roma 1",
      shipping_city: "Milano",
      shipping_zip: "20100",
      shipping_country: "IT",
    });

    const result = await createOrder(fd);
    expect("error" in result).toBe(true);
  });

  it("should return error when cart is empty", async () => {
    mockGetCart.mockResolvedValue([]);

    const result = await createOrder(validFormData);
    expect(result).toEqual({ error: "Il carrello è vuoto" });
  });

  it("should return error when stock is insufficient", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { stock_quantity: 1, name: "Product 1" },
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      return { select: vi.fn(() => Promise.resolve({ count: 0, error: null })) };
    });

    const result = await createOrder(validFormData);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("Stock insufficiente");
    }
  });

  it("should return error for missing shipping address", async () => {
    const fd = makeFormData({
      email: "buyer@test.com",
      shipping_street: "",
      shipping_city: "Milano",
      shipping_zip: "20100",
      shipping_country: "IT",
    });

    const result = await createOrder(fd);
    expect("error" in result).toBe(true);
  });
});
