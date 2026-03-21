import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolveAdmin } from "@/lib/admin-auth";
import {
    Package,
    AlertTriangle,
    FileEdit,
    ShoppingBag,
    Store,
    ClipboardList,
    Boxes,
    Activity,
} from "lucide-react";
import { db } from "@/db";
import {
    products,
    orders,
    inventoryMovements,
    auditLogs,
} from "@/db/schema";
import {
    and,
    asc,
    count,
    desc,
    eq,
    gt,
    gte,
    lte,
    notInArray,
    sql,
} from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        redirect("/auth/signin?callbackUrl=/admin");
    }
    const admin = await resolveAdmin(email);
    if (!admin) {
        redirect("/auth/error?error=AccessDenied");
    }

    const startOfUtcDay = new Date();
    startOfUtcDay.setUTCHours(0, 0, 0, 0);

    const [
        totalProducts,
        activeProducts,
        draftProducts,
        lowStockCount,
        outOfStockCount,
        openOrdersCount,
        inStoreToday,
        noImageCount,
    ] = await Promise.all([
        db.select({ c: count() }).from(products),
        db
            .select({ c: count() })
            .from(products)
            .where(
                and(eq(products.status, "active"), eq(products.published, true)),
            ),
        db.select({ c: count() }).from(products).where(eq(products.status, "draft")),
        db
            .select({ c: count() })
            .from(products)
            .where(
                and(
                    eq(products.status, "active"),
                    gt(products.stockQuantity, 0),
                    lte(products.stockQuantity, products.lowStockThreshold),
                ),
            ),
        db
            .select({ c: count() })
            .from(products)
            .where(
                and(
                    eq(products.status, "active"),
                    lte(products.stockQuantity, 0),
                ),
            ),
        db
            .select({ c: count() })
            .from(orders)
            .where(
                notInArray(orders.status, [
                    "fulfilled",
                    "cancelled",
                    "refunded",
                ]),
            ),
        db
            .select({ c: count() })
            .from(inventoryMovements)
            .where(
                and(
                    eq(inventoryMovements.source, "in_store"),
                    gte(inventoryMovements.createdAt, startOfUtcDay),
                ),
            ),
        db
            .select({ c: count() })
            .from(products)
            .where(
                and(
                    notInArray(products.status, ["archived"]),
                    sql`coalesce(${products.primaryImageUrl}, '') = ''`,
                    sql`coalesce(${products.image}, '') = ''`,
                ),
            ),
    ]);

    const recentAudit = await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(12);

    const alertDrafts = await db
        .select({
            id: products.id,
            name: products.name,
        })
        .from(products)
        .where(eq(products.status, "draft"))
        .orderBy(desc(products.updatedAt))
        .limit(5);

    const alertLow = await db
        .select({
            id: products.id,
            name: products.name,
            stockQuantity: products.stockQuantity,
        })
        .from(products)
        .where(
            and(
                eq(products.status, "active"),
                gt(products.stockQuantity, 0),
                lte(products.stockQuantity, products.lowStockThreshold),
            ),
        )
        .orderBy(asc(products.stockQuantity))
        .limit(5);

    const alertNoImg = await db
        .select({ id: products.id, name: products.name })
        .from(products)
        .where(
            and(
                notInArray(products.status, ["archived"]),
                sql`coalesce(${products.primaryImageUrl}, '') = ''`,
                sql`coalesce(${products.image}, '') = ''`,
            ),
        )
        .limit(5);

    const kpi = (v: { c: number }[]) => v[0]?.c ?? 0;

    const cards = [
        {
            label: "Total products",
            value: kpi(totalProducts),
            icon: Package,
        },
        {
            label: "Active (published)",
            value: kpi(activeProducts),
            icon: Package,
        },
        { label: "Drafts", value: kpi(draftProducts), icon: FileEdit },
        { label: "Low stock", value: kpi(lowStockCount), icon: AlertTriangle },
        { label: "Out of stock", value: kpi(outOfStockCount), icon: Boxes },
        { label: "Open orders", value: kpi(openOrdersCount), icon: ShoppingBag },
        {
            label: "In-store sales today",
            value: kpi(inStoreToday),
            icon: Store,
        },
    ];

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-xl font-bold mb-1">Control center</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                    Quick overview of catalog, inventory, and recent activity.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c) => (
                    <div key={c.label} className="card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                                <c.icon className="w-5 h-5 text-[var(--color-accent)]" />
                            </div>
                            <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                                {c.label}
                            </span>
                        </div>
                        <div className="text-3xl font-bold tabular-nums">{c.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" /> Quick actions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/admin/products/new" className="btn btn-primary text-sm">
                            Add product
                        </Link>
                        <Link href="/admin/inventory" className="btn btn-secondary text-sm">
                            Record in-store sale
                        </Link>
                        <Link href="/admin/inventory" className="btn btn-secondary text-sm">
                            Adjust inventory
                        </Link>
                        <Link href="/admin/products/new" className="btn btn-secondary text-sm">
                            Upload photos
                        </Link>
                        <Link href="/admin/orders" className="btn btn-secondary text-sm">
                            Review orders
                        </Link>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Photo uploads live in the product editor (per product). Use{" "}
                        <span className="text-[var(--color-accent)]">Inventory</span> for
                        gym-floor sales and stock counts.
                    </p>
                </div>

                <div className="card p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Alerts
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="text-[var(--color-text-muted)] mb-2">
                                Products with no image ({kpi(noImageCount)})
                            </p>
                            <ul className="space-y-1">
                                {alertNoImg.length === 0 ? (
                                    <li className="text-[var(--color-text-muted)]">None</li>
                                ) : (
                                    alertNoImg.map((p) => (
                                        <li key={p.id}>
                                            <Link
                                                href={`/admin/products/${p.id}`}
                                                className="text-[var(--color-accent)] hover:underline"
                                            >
                                                {p.name}
                                            </Link>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                        <div>
                            <p className="text-[var(--color-text-muted)] mb-2">Low stock</p>
                            <ul className="space-y-1">
                                {alertLow.length === 0 ? (
                                    <li className="text-[var(--color-text-muted)]">None</li>
                                ) : (
                                    alertLow.map((p) => (
                                        <li key={p.id}>
                                            <Link
                                                href={`/admin/products/${p.id}`}
                                                className="text-[var(--color-accent)] hover:underline"
                                            >
                                                {p.name}
                                            </Link>
                                            <span className="text-[var(--color-text-muted)]">
                                                {" "}
                                                — {p.stockQuantity} left
                                            </span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                        <div>
                            <p className="text-[var(--color-text-muted)] mb-2">Drafts</p>
                            <ul className="space-y-1">
                                {alertDrafts.length === 0 ? (
                                    <li className="text-[var(--color-text-muted)]">None</li>
                                ) : (
                                    alertDrafts.map((p) => (
                                        <li key={p.id}>
                                            <Link
                                                href={`/admin/products/${p.id}`}
                                                className="text-[var(--color-accent)] hover:underline"
                                            >
                                                {p.name}
                                            </Link>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <h3 className="font-semibold">Recent activity</h3>
                </div>
                <div className="divide-y divide-[var(--color-border-subtle)] max-h-[420px] overflow-y-auto">
                    {recentAudit.length === 0 ? (
                        <p className="p-6 text-sm text-[var(--color-text-muted)]">
                            No audit events yet. Changes to products and inventory will appear
                            here.
                        </p>
                    ) : (
                        recentAudit.map((a) => (
                            <div
                                key={a.id}
                                className="px-6 py-3 text-sm flex flex-wrap gap-x-3 gap-y-1"
                            >
                                <span className="text-[var(--color-text-muted)] tabular-nums">
                                    {a.createdAt?.toLocaleString?.() ?? "—"}
                                </span>
                                <span className="font-medium">{a.action}</span>
                                <span className="text-[var(--color-text-secondary)]">
                                    {a.entityType} #{a.entityId}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
