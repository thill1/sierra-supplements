import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

const CASE_STUDY_SLUGS = [
    "trail-running-team",
    "corporate-wellness",
    "weight-loss-transformation",
    "gym-partnership",
];

type Props = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    return { title: `Case Study: ${slug.replace(/-/g, " ")}` };
}

export default async function CaseStudyDetailPage({ params }: Props) {
    const { slug } = await params;
    const title = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return (
        <div className="pt-24">
            <article className="section-container section-padding max-w-3xl mx-auto">
                <Link
                    href="/case-studies"
                    className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Case Studies
                </Link>

                <h1 className="heading-xl mb-6">{title}</h1>

                <div className="card mb-8">
                    <h3 className="heading-sm mb-4">The Challenge</h3>
                    <p className="body-lg">
                        This client came to us with specific performance and wellness goals
                        that weren&apos;t being met by their current routine. They needed a
                        science-backed approach tailored to their unique situation.
                    </p>
                </div>

                <div className="card mb-8">
                    <h3 className="heading-sm mb-4">Our Approach</h3>
                    <ul className="space-y-3">
                        {[
                            "Comprehensive wellness assessment and lab panel review",
                            "Custom supplement protocol designed for their specific needs",
                            "Weekly coaching sessions with progress tracking",
                            "Ongoing adjustments based on results and feedback",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                                <span className="text-[var(--color-text-secondary)]">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card mb-8 card-highlighted">
                    <h3 className="heading-sm mb-4">The Results</h3>
                    <p className="body-lg">
                        Within 3 months, measurable improvements were seen across all target
                        metrics. The client reported significantly better energy, recovery,
                        and overall well-being.
                    </p>
                </div>

                <div className="card text-center">
                    <h3 className="heading-sm mb-2">Want similar results?</h3>
                    <p className="body-sm mb-4">
                        Book a free consultation and let&apos;s discuss your goals.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Free Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </article>
        </div>
    );
}
