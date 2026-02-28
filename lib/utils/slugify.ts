import slugifyLib from "slugify";

/**
 * Generate a URL-safe slug from a string.
 * Configured for Italian text: removes accents, lowercases, replaces spaces with hyphens.
 * @param text - The input string to slugify
 * @returns A URL-safe slug string
 */
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    locale: "it",
    trim: true,
  });
}
