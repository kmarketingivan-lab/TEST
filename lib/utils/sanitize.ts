import DOMPurify from "dompurify";

let purifyInstance: ReturnType<typeof DOMPurify> | null = null;

function getPurify(): ReturnType<typeof DOMPurify> {
  if (purifyInstance) return purifyInstance;

  if (typeof window !== "undefined") {
    purifyInstance = DOMPurify(window);
  } else {
    // Server-side: use JSDOM to provide a window object
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JSDOM } = require("jsdom") as typeof import("jsdom");
    const dom = new JSDOM("");
    // JSDOM's window provides all the DOM APIs DOMPurify needs
    purifyInstance = DOMPurify(
      dom.window as unknown as Parameters<typeof DOMPurify>[0]
    );
  }

  return purifyInstance;
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allows safe HTML tags while stripping dangerous ones.
 * @param dirty - The untrusted HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  return getPurify().sanitize(dirty, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "strong", "em", "b", "i", "u", "s",
      "a", "img",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
  });
}
