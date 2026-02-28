import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "@/lib/utils/sanitize";

describe("sanitizeHtml", () => {
  it("should allow safe HTML tags", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    expect(sanitizeHtml(input)).toBe("<p>Hello <strong>world</strong></p>");
  });

  it("should strip script tags", () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(input)).toBe("<p>Hello</p>");
  });

  it("should strip onclick attributes", () => {
    const input = '<p onclick="alert(1)">Click me</p>';
    expect(sanitizeHtml(input)).toBe("<p>Click me</p>");
  });

  it("should allow href on links", () => {
    const input = '<a href="https://example.com">Link</a>';
    expect(sanitizeHtml(input)).toBe('<a href="https://example.com">Link</a>');
  });

  it("should allow img with src and alt", () => {
    const input = '<img src="/image.jpg" alt="Photo">';
    expect(sanitizeHtml(input)).toBe('<img src="/image.jpg" alt="Photo">');
  });

  it("should strip iframe tags", () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    expect(sanitizeHtml(input)).toBe("");
  });

  it("should strip style tags", () => {
    const input = "<style>body { display: none }</style><p>text</p>";
    expect(sanitizeHtml(input)).toBe("<p>text</p>");
  });

  it("should handle empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });
});
