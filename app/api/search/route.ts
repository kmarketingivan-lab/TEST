import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/dal/products";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit") ?? "6"),
    20
  );

  if (q.trim().length < 2) {
    return NextResponse.json([]);
  }

  const results = await searchProducts(q.trim(), limit);
  return NextResponse.json(results);
}
