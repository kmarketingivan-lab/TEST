import { describe, it, expect } from "vitest";
import { profileSchema, adminProfileUpdateSchema, roleEnum } from "@/lib/validators/profile";

describe("profileSchema", () => {
  it("should accept valid profile data", () => {
    const result = profileSchema.safeParse({
      full_name: "Mario Rossi",
      phone: "+39 333 1234567",
    });
    expect(result.success).toBe(true);
  });

  it("should accept profile with null phone", () => {
    const result = profileSchema.safeParse({
      full_name: "Mario Rossi",
      phone: null,
    });
    expect(result.success).toBe(true);
  });

  it("should accept profile without phone", () => {
    const result = profileSchema.safeParse({
      full_name: "Mario Rossi",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty full_name", () => {
    const result = profileSchema.safeParse({
      full_name: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject full_name with 1 char", () => {
    const result = profileSchema.safeParse({
      full_name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid phone", () => {
    const result = profileSchema.safeParse({
      full_name: "Mario Rossi",
      phone: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("roleEnum", () => {
  it("should accept 'admin'", () => {
    const result = roleEnum.safeParse("admin");
    expect(result.success).toBe(true);
  });

  it("should accept 'customer'", () => {
    const result = roleEnum.safeParse("customer");
    expect(result.success).toBe(true);
  });

  it("should reject 'superadmin'", () => {
    const result = roleEnum.safeParse("superadmin");
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = roleEnum.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("adminProfileUpdateSchema", () => {
  it("should accept valid admin update", () => {
    const result = adminProfileUpdateSchema.safeParse({
      full_name: "Admin User",
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid role", () => {
    const result = adminProfileUpdateSchema.safeParse({
      full_name: "Admin User",
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });
});
