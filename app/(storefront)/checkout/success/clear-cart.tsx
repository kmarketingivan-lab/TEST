"use client";

import { useEffect } from "react";

export function ClearCart() {
  useEffect(() => {
    // Clear cart cookie by setting it to empty with expired date
    document.cookie = "cart=; path=/; max-age=0";
  }, []);

  return null;
}
