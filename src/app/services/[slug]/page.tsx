import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Dumbbell,
    Apple,
    TestTube,
    Droplets,
    Users,
    ShoppingBag,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Dumbbell,
    Apple,
    TestTube,
    Droplets,
    Users,
    ShoppingBag,
};

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const service = siteConfig.services.find((s) => s.slug === slug);
    if (!service) return {};
    return {
        title: service.title,
        description: service.shortDescription,
    };
}

export function generateStaticParams() {
    return siteConfig.services.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: Props) {
    const { slug } = await params;
    const service = siteConfig.services.find((s) => s.slug === slug);
    if (!service) notFound();

    const Icon = iconMap[service.icon] || Dumbbell;

    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                </Link>

                <div className="max-w-3xl">
                    <div className="w-16 h-16 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-[var(--color-accent)]" />
                    </div>

                    <h1 className="heading-xl mb-4">{service.title}</h1>
                    <p className="body-lg mb-8">{service.description}</p>

                    <div className="card mb-8">
                        <h3 className="heading-sm mb-4">What&apos;s Included</h3>
                        <ul className="space-y-3">
                            {[
                                "Initial assessment & goal setting",
                                "Personalized action plan",
                                "Ongoing support & adjustments",
                                "Progress tracking",
                                "Access to member resources",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                                    <span className="text-[var(--color-text-secondary)]">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {slug === "online-store" ? (
                            <>
                                <Link href="/store" className="btn btn-primary">
                                    Browse Supplement Store <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/book" className="btn btn-secondary">
                                    Book Consultation
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/book" className="btn btn-primary">
                                    Book This Service <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/contact?form=quote" className="btn btn-secondary">
                                    Get a Quote
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
