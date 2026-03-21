import type { AdminRole } from "@/db/schema.pg";

const ROLE_RANK: Record<AdminRole, number> = {
    owner: 3,
    manager: 2,
    editor: 1,
};

export function roleMeetsMinimum(role: AdminRole, minRole: AdminRole): boolean {
    return ROLE_RANK[role] >= ROLE_RANK[minRole];
}
