"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Real-time badge showing count of orders needing attention (confirmed/processing).
 * Plays a short beep when a new order arrives.
 */
export function PendingOrdersBadge() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(0);

  /** Play a short 440Hz beep via Web Audio API. */
  function playBeep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext not available (SSR guard or browser restriction)
    }
  }

  useEffect(() => {
    const supabase = createClient();

    // Load initial count
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["confirmed", "processing"])
      .then(({ count: n }) => {
        const initial = n ?? 0;
        setCount(initial);
        prevCountRef.current = initial;
      });

    // Subscribe to realtime changes on orders table
    const channel = supabase
      .channel("pending-orders-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          // Re-fetch count on any change
          supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .in("status", ["confirmed", "processing"])
            .then(({ count: n }) => {
              const newCount = n ?? 0;
              if (newCount > prevCountRef.current) {
                playBeep();
              }
              prevCountRef.current = newCount;
              setCount(newCount);
            });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
