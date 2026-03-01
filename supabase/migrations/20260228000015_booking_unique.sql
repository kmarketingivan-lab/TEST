-- ============================================
-- Migration 0015: Unique constraint on bookings to prevent double-booking
-- ============================================

-- Partial unique index: no two non-cancelled bookings can overlap on the same
-- service + date + start_time.
CREATE UNIQUE INDEX idx_bookings_unique_slot
  ON bookings (service_id, booking_date, start_time)
  WHERE status != 'cancelled';
