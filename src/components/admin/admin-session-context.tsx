"use client";

import { createContext, useContext } from "react";
import type { AdminRole } from "@/db/schema";
import { roleMeetsMinimum } from "@/lib/admin-role";

type AdminSessionValue = {
    role: AdminRole;
};

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function AdminSessionProvider({
    role,
    children,
}: {
    role: AdminRole;
    children: React.ReactNode;
}) {
    return (
        <AdminSessionContext.Provider value={{ role }}>
            {children}
        </AdminSessionContext.Provider>
    );
}

export function useAdminSession(): AdminSessionValue {
    const ctx = useContext(AdminSessionContext);
    if (!ctx) {
        throw new Error("useAdminSession must be used within AdminSessionProvider");
    }
    return ctx;
}

/** Product create, variants, inventory writes, order/lead updates, etc. */
export function useCanManageCatalog(): boolean {
    return roleMeetsMinimum(useAdminSession().role, "manager");
}

/** Team (admin users) management */
export function useIsOwner(): boolean {
    return useAdminSession().role === "owner";
}

/** Settings PUT */
export function useCanEditSiteSettings(): boolean {
    return useIsOwner();
}
