import type { DefaultSession } from "next-auth";
import type { AdminRole } from "@/db/schema.pg";

declare module "next-auth" {
    interface Session {
        user: DefaultSession["user"] & {
            id?: string;
            isAdmin?: boolean;
            adminRole?: AdminRole;
            /** Set when row exists in admin_users; null during bootstrap (env-only) */
            adminDbId?: number | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        isAdmin?: boolean;
        adminRole?: AdminRole;
        adminDbId?: number | null;
    }
}
