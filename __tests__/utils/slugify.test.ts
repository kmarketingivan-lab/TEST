import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils/slugify";

describe("slugify", () => {
  it("should convert a simple string to a slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should handle Italian accented characters", () => {
    expect(slugify("Caffè Espresso Città")).toBe("caffe-espresso-citta");
  });

  it("should remove special characters", () => {
    expect(slugify("Product #1 (New!)")).toBe("product-1-new");
  });

  it("should handle multiple spaces", () => {
    expect(slugify("too   many   spaces")).toBe("too-many-spaces");
  });

  it("should trim leading and trailing spaces", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("should handle empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("should lowercase everything", () => {
    expect(slugify("ALL CAPS")).toBe("all-caps");
  });

  it("should handle numbers", () => {
    expect(slugify("Prodotto 42")).toBe("prodotto-42");
  });
});
