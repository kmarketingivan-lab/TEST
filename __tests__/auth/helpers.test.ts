import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`REDIRECT:${url}`);
  },
}));

import { getCurrentUser, requireAuth, requireAdmin, isAdmin } from "@/lib/auth/helpers";

describe("Auth Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should return null when no user is authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it("should return user with role from profile", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u1", email: "admin@test.com" } },
      });

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { role: "admin" }, error: null })
            ),
          })),
        })),
      });

      const result = await getCurrentUser();
      expect(result).toEqual({
        id: "u1",
        email: "admin@test.com",
        role: "admin",
      });
    });

    it("should default to customer role when profile not found", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u2", email: "user@test.com" } },
      });

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: null, error: null })
            ),
          })),
        })),
      });

      const result = await getCurrentUser();
      expect(result?.role).toBe("customer");
    });
  });

  describe("requireAuth", () => {
    it("should return user when authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u1", email: "test@test.com" } },
      });

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { role: "customer" }, error: null })
            ),
          })),
        })),
      });

      const result = await requireAuth();
      expect(result.id).toBe("u1");
    });

    it("should redirect to login when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      await expect(requireAuth()).rejects.toThrow("REDIRECT:/admin/login");
      expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
    });
  });

  describe("requireAdmin", () => {
    it("should return user when admin", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u1", email: "admin@test.com" } },
      });

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { role: "admin" }, error: null })
            ),
          })),
        })),
      });

      const result = await requireAdmin();
      expect(result.role).toBe("admin");
    });

    it("should redirect when user is not admin", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u1", email: "user@test.com" } },
      });

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { role: "customer" }, error: null })
            ),
          })),
        })),
      });

      await expect(requireAdmin()).rejects.toThrow("REDIRECT:/");
      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("should redirect when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
    });
  });

  describe("isAdmin", () => {
    it("should return true for admin users", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { role: "admin" }, error: null })
            ),
          })),
        })),
      });

      const result = await isAdmin("u1");
      expect(result).toBe(true);
    });

    it("should return false for non-admin users", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { role: "customer" }, error: null })
            ),
          })),
        })),
      });

      const result = await isAdmin("u2");
      expect(result).toBe(false);
    });

    it("should return false when profile not found", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: null, error: null })
            ),
          })),
        })),
      });

      const result = await isAdmin("u3");
      expect(result).toBe(false);
    });
  });
});
