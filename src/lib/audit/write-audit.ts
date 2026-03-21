import type { DbTransaction } from "@/db";
import { auditLogs } from "@/db/schema.pg";

export type AuditPayload = {
    actorUserId: number | null;
    entityType: string;
    entityId: string;
    action: string;
    before?: unknown;
    after?: unknown;
};

export async function writeAuditLog(
    tx: DbTransaction,
    payload: AuditPayload,
): Promise<void> {
    await tx.insert(auditLogs).values({
        actorUserId: payload.actorUserId,
        entityType: payload.entityType,
        entityId: payload.entityId,
        action: payload.action,
        beforeJson: payload.before === undefined ? null : payload.before,
        afterJson: payload.after === undefined ? null : payload.after,
    });
}
