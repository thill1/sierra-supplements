/**
 * Upsert admin_users from ADMIN_EMAILS (comma-separated) as owner role.
 * Run after schema push: DATABASE_URL=... pnpm db:seed-admins
 */

import "./load-local-env";
import { db } from "./index";
import { adminUsers } from "./schema.pg";
import { parseAdminEmailAllowlist } from "@/lib/admin-allowlist";
async function main() {
    const emails = [...parseAdminEmailAllowlist()];
    if (emails.length === 0) {
        console.error(
            "No emails in ADMIN_EMAILS. Set ADMIN_EMAILS in .env and retry.",
        );
        process.exit(1);
    }

    for (const raw of emails) {
        const email = raw.trim().toLowerCase();
        await db
            .insert(adminUsers)
            .values({ email, role: "owner", active: true })
            .onConflictDoUpdate({
                target: adminUsers.email,
                set: { active: true },
            });
        console.log(`Upserted admin: ${email}`);
    }

    console.log("Done.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
