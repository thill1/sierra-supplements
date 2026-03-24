import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolveAdmin } from "@/lib/admin-auth";
import { AdminSessionProvider } from "@/components/admin/admin-session-context";
import { AdminAppShell } from "@/components/admin/admin-app-shell";

/**
 * Server-side gate for every /admin/* route. Nested pages previously skipped auth
 * because only the dashboard page.tsx called `auth()` + `redirect()`.
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        redirect("/auth/signin?callbackUrl=/admin");
    }
    const admin = await resolveAdmin(email);
    if (!admin) {
        redirect("/auth/error?error=AccessDenied");
    }

    return (
        <AdminSessionProvider role={admin.role}>
            <AdminAppShell>{children}</AdminAppShell>
        </AdminSessionProvider>
    );
}
