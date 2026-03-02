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

// Mock Supabase with rpc support
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    rpc: mockRpc,
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

    // Default: RPC succeeds
    mockRpc.mockResolvedValue({
      data: { order_id: "order-1", order_number: "ORD-001000" },
      error: null,
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
    mockRpc.mockResolvedValue({
      data: null,
      error: {
        message: "Insufficient stock for product p1: available 1, requested 2",
        code: "P0001",
      },
    });

    const result = await createOrder(validFormData);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("stock sufficiente");
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

  it("should create order successfully via atomic RPC", async () => {
    const result = await createOrder(validFormData);
    expect(result).toEqual({ success: true, orderNumber: "ORD-001000" });
    expect(mockRpc).toHaveBeenCalledWith("create_order_atomic", {
      p_params: expect.objectContaining({
        email: "buyer@test.com",
        status: "pending",
        total: 61,
        items: expect.arrayContaining([
          expect.objectContaining({
            product_id: "p1",
            quantity: 2,
          }),
        ]),
      }),
    });
    expect(mockClearCart).toHaveBeenCalled();
  });

  it("should return generic error when RPC fails", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "Internal server error", code: "XX000" },
    });

    const result = await createOrder(validFormData);
    expect(result).toEqual({ error: "Errore nella creazione dell'ordine" });
  });
});
