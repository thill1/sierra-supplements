import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Thank You",
    description: "Your submission was successful. Here's what happens next.",
};

export default function ThankYouPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-[var(--color-accent)]" />
                </div>

                <h1 className="heading-xl mb-4">Thank You! 🎉</h1>
                <p className="body-lg mb-10">
                    We&apos;ve received your information and will be in touch soon. Here&apos;s
                    what happens next:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <div className="card text-center py-6">
                        <div className="text-2xl mb-2">1</div>
                        <h3 className="font-semibold text-sm mb-1">Confirmation Email</h3>
                        <p className="body-sm">Check your inbox in the next few minutes.</p>
                    </div>
                    <div className="card text-center py-6">
                        <div className="text-2xl mb-2">2</div>
                        <h3 className="font-semibold text-sm mb-1">Team Review</h3>
                        <p className="body-sm">
                            We&apos;ll review your info and prepare for your session.
                        </p>
                    </div>
                    <div className="card text-center py-6">
                        <div className="text-2xl mb-2">3</div>
                        <h3 className="font-semibold text-sm mb-1">Your Consultation</h3>
                        <p className="body-sm">
                            We&apos;ll meet, discuss your goals, and create a plan.
                        </p>
                    </div>
                </div>

                <div className="card p-8 card-highlighted">
                    <Calendar className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-3" />
                    <h2 className="heading-sm mb-2">Book Your Consultation Now</h2>
                    <p className="body-sm mb-4">
                        Don&apos;t wait for us to reach out — secure your spot today.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Pick a Time <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
