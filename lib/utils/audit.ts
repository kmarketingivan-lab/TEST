import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";

/**
 * Log an audit event to the audit_log table via service role client.
 * Uses an untyped client to avoid circular dependency with Database types.
 * The audit_log table will be created in Phase 1 (Task 1.12).
 * @param userId - The ID of the user performing the action (null for system actions)
 * @param action - The action performed (e.g., "create", "update", "delete")
 * @param entityType - The type of entity affected (e.g., "product", "order")
 * @param entityId - The ID of the affected entity
 * @param oldValues - Previous values before the change (optional)
 * @param newValues - New values after the change (optional)
 */
export async function logAuditEvent(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
    });
  } catch (err) {
    // Audit logging should never crash the main operation
    logger.error("Failed to write audit log", {
      action,
      entityType,
      entityId,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
