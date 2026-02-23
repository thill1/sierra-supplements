import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { STORE_CATEGORIES } from "@/lib/store-categories";
import { ProductCard } from "@/components/store/product-card";
import { StoreGrid } from "@/components/store/store-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Supplement Store",
    description: `Shop ${siteConfig.name}'s curated selection of pre-workout, creatine, protein, and more. Third-party tested for purity.`,
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function StorePage({ searchParams }: Props) {
    const { category } = await searchParams;
    return (
        <div className="pt-24">
            {/* Hero */}
            <section className="section-container section-padding text-center border-b border-[var(--color-border-subtle)]">
                <span className="label">Shop Supplements</span>
                <h1 className="heading-xl mt-2 mb-4">
                    The <span className="gradient-text">Store</span>
                </h1>
                <p className="body-lg max-w-2xl mx-auto">
                    Curated, third-party-tested supplements shipped to your door.
                    Pre-workout, creatine, protein, vitamins, and more.
                </p>
            </section>

            {/* Category filters + Product grid */}
            <section className="section-container section-padding">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - categories */}
                    <aside className="lg:w-56 flex-shrink-0">
                        <h2 className="font-semibold mb-3 text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
                            Categories
                        </h2>
                        <nav className="space-y-1">
                            <Link
                                href="/store"
                                className="block py-2 px-3 rounded-lg text-sm font-medium text-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                            >
                                All Products
                            </Link>
                            {STORE_CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/store?category=${cat.slug}`}
                                    className="block py-2 px-3 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)] transition-colors"
                                >
                                    {cat.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Products */}
                    <div className="flex-1 min-w-0">
                        <Suspense
                            fallback={
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="card h-80 animate-pulse bg-[var(--color-bg-muted)]"
                                        />
                                    ))}
                                </div>
                            }
                        >
                            <StoreGrid category={category} />
                        </Suspense>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[var(--color-bg-elevated)] section-padding">
                <div className="section-container text-center">
                    <h2 className="heading-md mb-4">Not sure what you need?</h2>
                    <p className="body-lg mb-6 max-w-lg mx-auto">
                        Book a free consultation and we&apos;ll recommend a
                        personalized supplement stack.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Free Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
