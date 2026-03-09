import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Orders",
    description: "View and manage store orders.",
};

export default function AdminOrdersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
