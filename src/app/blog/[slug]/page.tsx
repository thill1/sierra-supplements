import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

// Placeholder blog post content
const blogPosts: Record<string, {
    title: string;
    category: string;
    date: string;
    readTime: string;
    content: string;
}> = {
    "altitude-supplement-guide": {
        title: "The Ultimate Guide to Supplements for High-Altitude Living",
        category: "Supplements",
        date: "2026-01-15",
        readTime: "8 min",
        content: `
Living above 6,000 feet presents unique challenges for your body. The reduced oxygen availability, increased UV exposure, and lower humidity all affect your nutritional needs.

## Why Altitude Matters for Supplementation

At higher elevations, your body works harder to deliver oxygen to your muscles and organs. This increased metabolic demand means you need more of certain nutrients to perform optimally.

### Iron & B12
Red blood cell production ramps up at altitude. Ensuring adequate iron and B12 intake supports this process and helps prevent altitude-related fatigue.

### Vitamin D
Despite more sun exposure in the mountains, many high-altitude residents are vitamin D deficient. The combination of cold weather (covered skin) and higher UV intensity that drives you indoors creates a paradox.

### Electrolytes
You lose more fluids at altitude due to increased respiration rate and lower humidity. A quality electrolyte supplement helps maintain hydration and prevent cramps.

### Antioxidants
Higher UV exposure and increased oxidative stress at altitude make antioxidants (vitamin C, E, and selenium) particularly important for mountain dwellers.

## Our Recommendations

At Sierra Strength, we've developed altitude-specific protocols that account for these unique demands. Our Base Camp and Summit plans both include altitude-optimized formulations.

Ready to optimize your supplements for altitude? Book a free consultation and we'll create a personalized plan based on your elevation, activity level, and goals.
    `,
    },
    "protein-timing-myth": {
        title: "Protein Timing: Does the 'Anabolic Window' Really Matter?",
        category: "Nutrition",
        date: "2026-01-08",
        readTime: "6 min",
        content: `
The "anabolic window" — that mythical 30-minute post-workout period where you must consume protein or lose your gains — has been a fitness staple for decades. But what does the science actually say?

## The Myth

For years, gym culture insisted that you needed to slam a protein shake within 30 minutes of your last rep. Miss the window, and your workout was "wasted."

## The Reality

Recent meta-analyses tell a more nuanced story. **Total daily protein intake matters far more than timing.** As long as you're hitting 1.6-2.2g of protein per kg of bodyweight throughout the day, the exact timing is less critical than once believed.

## When Timing Does Matter

That said, there are scenarios where timing becomes more relevant:

- **Fasted training**: If you train first thing in the morning, a post-workout meal or shake does help kickstart recovery
- **Multiple daily sessions**: Athletes training twice a day benefit from strategic protein timing between sessions
- **Very long endurance events**: During events lasting 3+ hours, intra-workout protein can help

## The Bottom Line

Focus on total daily intake first. Get enough protein from quality sources throughout the day, and don't stress about the exact minute you consume your post-workout meal.

Want help dialing in your protein strategy? Our nutrition coaches can create a plan that fits your training schedule and goals.
    `,
    },
    "winter-immune-support": {
        title: "5 Science-Backed Ways to Support Your Immune System This Winter",
        category: "Wellness",
        date: "2025-12-20",
        readTime: "5 min",
        content: `
Winter brings cold air, dry indoor heat, and more time in crowded spaces. Your immune system benefits from consistent sleep, protein, vitamin D, zinc, and hydration — not from mega-doses of random supplements.

## Sleep and stress

Short sleep reliably impairs immune function. Aim for a regular schedule and manage training load so you are not chronically under-recovered.

## Protein and whole foods

Adequate protein supports antibody production and tissue repair. Build meals around quality protein, colorful plants, and fermented foods when you tolerate them.

## Vitamin D and zinc

Many adults run low on vitamin D in winter. Zinc plays a role in normal immune function. Blood work with a clinician helps you supplement appropriately instead of guessing.

## Hydration and electrolytes

Dry winter air increases fluid loss. Water plus electrolytes during long training sessions supports mucosal barriers and performance.

## Train, but recover

Moderate exercise supports immunity; excessive volume without recovery can suppress it. Match intensity to your sleep and nutrition.

Book a consultation if you want a winter protocol tailored to your labs, training, and travel schedule.
    `,
    },
    "magnesium-types": {
        title: "Not All Magnesium Is Created Equal: A Guide to Forms & Doses",
        category: "Supplements",
        date: "2025-11-28",
        readTime: "6 min",
        content: `
Magnesium supports sleep, muscle relaxation, and energy production, but absorption and side effects vary widely by form.

## Common forms

### Glycinate

Often well tolerated and popular for evening use when relaxation and sleep quality are the goal.

### Citrate

Can have a mild osmotic effect at higher doses; some people use it deliberately for digestion support.

### Threonate

Marketed for cognitive applications; evidence is still evolving compared to more established forms.

### Oxide

Inexpensive but poorly absorbed for many people — not our first choice for repletion.

## Dosing and timing

Start low, use the form that matches your goal (sleep vs. digestion vs. general intake), and separate magnesium from certain medications per your pharmacist or physician.

We help clients pick forms and doses that match their symptoms and labs instead of buying the cheapest bottle on the shelf.
    `,
    },
    "athlete-recovery-stack": {
        title: "The Recovery Stack: What Pro Athletes Take After Training",
        category: "Performance",
        date: "2025-11-15",
        readTime: "9 min",
        content: `
Recovery is where adaptation happens. The best “stack” is always food first — then targeted supplements where data and your individual needs align.

## Protein and carbohydrates

Post-session, pairing protein with carbohydrates replenishes glycogen and starts muscle repair. Timing matters less than total daily intake, but convenience after hard sessions still helps adherence.

## Creatine

One of the most studied ergogenic aids. Supports strength, power, and lean mass when dosed consistently; hydration should stay on point.

## Electrolytes

Sodium, potassium, and magnesium matter for athletes who sweat heavily or train in heat or altitude — especially for long sessions.

## Omega-3s

May support recovery metrics for some athletes; quality and dose matter more than brand hype.

## Sleep and hydration

No supplement replaces sleep. Prioritize 7–9 hours and a wind-down routine; track morning hydration before stacking more pills.

Want a recovery protocol built around your sport, schedule, and blood work? Book a free consultation and we will map it out with you.
    `,
    },
};

type Props = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts[slug];
    if (!post) return {};
    return { title: post.title, description: post.content.slice(0, 160) };
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;
    const post = blogPosts[slug];

    if (!post) {
        return (
            <div className="pt-24 section-container section-padding text-center">
                <h1 className="heading-lg mb-4">Post Not Found</h1>
                <p className="body-lg mb-6">This blog post doesn&apos;t exist yet.</p>
                <Link href="/blog" className="btn btn-primary">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24">
            <article className="section-container section-padding max-w-3xl mx-auto">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </Link>

                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium">
                        {post.category}
                    </span>
                    <span className="body-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date}
                    </span>
                    <span className="body-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                </div>

                <h1 className="heading-xl mb-8">{post.title}</h1>

                <div
                    className="prose prose-invert max-w-none
            [&_h2]:heading-md [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:heading-sm [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:body-lg [&_p]:mb-4
            [&_ul]:space-y-2 [&_ul]:mb-6 [&_ul]:ml-4
            [&_li]:text-[var(--color-text-secondary)]
            [&_strong]:text-[var(--color-text)]"
                >
                    {post.content.split("\n").map((line, i) => {
                        if (line.startsWith("## ")) {
                            return (
                                <h2 key={i} className="heading-md mt-10 mb-4">
                                    {line.replace("## ", "")}
                                </h2>
                            );
                        }
                        if (line.startsWith("### ")) {
                            return (
                                <h3 key={i} className="heading-sm mt-8 mb-3">
                                    {line.replace("### ", "")}
                                </h3>
                            );
                        }
                        if (line.startsWith("- ")) {
                            return (
                                <li key={i} className="text-[var(--color-text-secondary)] ml-4">
                                    {line.replace("- ", "")}
                                </li>
                            );
                        }
                        if (line.trim() === "") return null;
                        return (
                            <p key={i} className="body-lg mb-4">
                                {line}
                            </p>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="card mt-12 text-center">
                    <h3 className="heading-sm mb-2">Ready to optimize your wellness?</h3>
                    <p className="body-sm mb-4">
                        Book a free consultation with our nutrition experts.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Free Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </article>
        </div>
    );
}
