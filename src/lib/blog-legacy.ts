export const legacyBlogPostsBySlug: Record<string, {
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

/** Index page entries for slugs baked into the repo (DB posts override by slug). */
export const legacyBlogSummaries = [
    {
        slug: "altitude-supplement-guide",
        title: "The Ultimate Guide to Supplements for High-Altitude Living",
        excerpt:
            "Living above 6,000 feet puts unique demands on your body. Here are the supplements that actually make a difference at altitude.",
        category: "Supplements",
        date: "2026-01-15",
        readTime: "8 min",
    },
    {
        slug: "protein-timing-myth",
        title: "Protein Timing: Does the 'Anabolic Window' Really Matter?",
        excerpt:
            "We break down the science behind protein timing and what really matters for muscle recovery and growth.",
        category: "Nutrition",
        date: "2026-01-08",
        readTime: "6 min",
    },
    {
        slug: "winter-immune-support",
        title: "5 Science-Backed Ways to Support Your Immune System This Winter",
        excerpt:
            "Cold temperatures, dry air, and indoor crowds — here's how to keep your immune system strong all season.",
        category: "Wellness",
        date: "2025-12-20",
        readTime: "5 min",
    },
    {
        slug: "magnesium-types",
        title: "Not All Magnesium Is Created Equal: A Guide to Forms & Doses",
        excerpt:
            "Glycinate, citrate, threonate, oxide — the type of magnesium you take matters. Here's how to choose.",
        category: "Supplements",
        date: "2025-11-28",
        readTime: "6 min",
    },
    {
        slug: "athlete-recovery-stack",
        title: "The Recovery Stack: What Pro Athletes Take After Training",
        excerpt:
            "Recover faster and train harder with this evidence-based supplement stack used by endurance athletes.",
        category: "Performance",
        date: "2025-11-15",
        readTime: "9 min",
    },
] as const;
