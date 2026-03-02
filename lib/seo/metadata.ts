const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armeriapalmetto.it";

export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${cleanPath}`;
}

interface PaginationMeta {
  prev: string | null;
  next: string | null;
}

export function generatePaginationMeta(
  currentPage: number,
  totalPages: number,
  basePath: string
): PaginationMeta {
  const base = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return {
    prev: currentPage > 1 ? `${siteUrl}${base}?page=${currentPage - 1}` : null,
    next: currentPage < totalPages ? `${siteUrl}${base}?page=${currentPage + 1}` : null,
  };
}
