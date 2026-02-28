import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BookingAvailability, BookingService } from "@/types/database";

// Fluent mock helper for Supabase chained queries
function createFluentMock(resolveValue: Record<string, unknown> = {}) {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};

  const terminalResult = {
    data: resolveValue.data ?? [],
    count: resolveValue.count ?? 0,
    error: resolveValue.error ?? null,
  };

  const handler: ProxyHandler<Record<string, ReturnType<typeof vi.fn>>> = {
    get(_target, prop: string) {
      if (prop === "then") {
        return (resolve: (v: unknown) => void) => resolve(terminalResult);
      }
      if (!mock[prop]) {
        mock[prop] = vi.fn(() => new Proxy({}, handler));
      }
      return mock[prop];
    },
  };

  mock.range = vi.fn(() => Promise.resolve(terminalResult));
  mock.limit = vi.fn(() => Promise.resolve(terminalResult));
  mock.single = vi.fn(() => Promise.resolve(terminalResult));

  return { proxy: new Proxy({}, handler), mock };
}

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

vi.mock("@/lib/auth/helpers", () => ({
  requireAdmin: vi.fn(async () => ({ id: "admin-1", email: "admin@test.com", role: "admin" })),
  getCurrentUser: vi.fn(async () => null),
}));

vi.mock("@/lib/utils/audit", () => ({
  logAuditEvent: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { getAvailableSlots, getBookingServices } from "@/lib/dal/bookings";
import { createBooking, confirmBooking } from "@/app/(admin)/admin/bookings/actions";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

describe("Bookings Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list active booking services", async () => {
    const services: BookingService[] = [
      {
        id: "s1",
        name: "Taglio",
        description: "Taglio capelli",
        duration_minutes: 30,
        price: 20,
        is_active: true,
        sort_order: 0,
        created_at: "2025-01-01",
      },
      {
        id: "s2",
        name: "Colore",
        description: "Colorazione completa",
        duration_minutes: 60,
        price: 50,
        is_active: true,
        sort_order: 1,
        created_at: "2025-01-01",
      },
    ];

    const fluentMock = createFluentMock({ data: services });
    mockFrom.mockReturnValue(fluentMock.proxy);

    const result = await getBookingServices();
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe("Taglio");
    expect(result[1]?.name).toBe("Colore");
  });

  it("should return available slots for a date", async () => {
    const availability: BookingAvailability[] = [
      { id: "a1", day_of_week: 1, start_time: "09:00", end_time: "12:00", is_active: true },
    ];

    const availMock = createFluentMock({ data: availability });
    const serviceMock = createFluentMock({ data: { duration_minutes: 60 } });
    const bookingsMock = createFluentMock({ data: [] });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return availMock.proxy;
      if (callCount === 2) return serviceMock.proxy;
      return bookingsMock.proxy;
    });

    // 2025-06-16 is a Monday (day_of_week=1)
    const slots = await getAvailableSlots("2025-06-16", "service-1");
    expect(slots).toHaveLength(3);
    expect(slots[0]).toEqual({ start_time: "09:00", end_time: "10:00" });
    expect(slots[1]).toEqual({ start_time: "10:00", end_time: "11:00" });
    expect(slots[2]).toEqual({ start_time: "11:00", end_time: "12:00" });
  });

  it("should exclude booked slot from available slots", async () => {
    const availability: BookingAvailability[] = [
      { id: "a1", day_of_week: 1, start_time: "09:00", end_time: "12:00", is_active: true },
    ];

    const availMock = createFluentMock({ data: availability });
    const serviceMock = createFluentMock({ data: { duration_minutes: 60 } });
    const bookingsMock = createFluentMock({
      data: [{ start_time: "10:00", end_time: "11:00" }],
    });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return availMock.proxy;
      if (callCount === 2) return serviceMock.proxy;
      return bookingsMock.proxy;
    });

    const slots = await getAvailableSlots("2025-06-16", "service-1");
    expect(slots).toHaveLength(2);
    expect(slots.find((s) => s.start_time === "10:00")).toBeUndefined();
  });

  it("should create a booking with valid data", async () => {
    // Mock conflict check (no conflicts)
    const conflictMock = createFluentMock({ data: [] });
    // Mock insert
    const insertMock = createFluentMock({ data: { id: "booking-1" } });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return conflictMock.proxy;
      return insertMock.proxy;
    });

    const fd = makeFormData({
      service_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      customer_name: "Mario Rossi",
      customer_email: "mario@test.com",
      booking_date: "2025-06-16",
      start_time: "09:00",
      end_time: "10:00",
    });

    const result = await createBooking(fd);
    expect(result).toEqual({ success: true });
  });

  it("should reject booking when slot is no longer available", async () => {
    // Mock conflict check — returns existing booking
    const conflictMock = createFluentMock({
      data: [{ id: "existing-booking" }],
    });

    mockFrom.mockReturnValue(conflictMock.proxy);

    const fd = makeFormData({
      service_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      customer_name: "Mario Rossi",
      customer_email: "mario@test.com",
      booking_date: "2025-06-16",
      start_time: "09:00",
      end_time: "10:00",
    });

    const result = await createBooking(fd);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("non è più disponibile");
    }
  });

  it("should confirm a pending booking (admin action)", async () => {
    // First call: get booking status
    const getMock = createFluentMock({ data: { status: "pending" } });
    // Second call: update status
    const updateMock = createFluentMock({});

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return getMock.proxy;
      return updateMock.proxy;
    });

    const result = await confirmBooking("booking-1");
    expect(result).toEqual({ success: true });
  });
});
