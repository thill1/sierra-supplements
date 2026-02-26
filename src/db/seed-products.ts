/**
 * Seed mock supplement products for local SQLite.
 * Run with: pnpm db:seed
 */

import { db } from "./index";
import { products } from "./schema.pg";

const MOCK_PRODUCTS = [
    { slug: "peak-energy-preworkout", name: "Peak Energy Pre-Workout", shortDescription: "Explosive energy & focus for your toughest training", description: "Clinically dosed caffeine, beta-alanine, and citrulline malate for sustained energy, pump, and mental clarity. No crash, no jitters.", price: 3999, compareAtPrice: 4499, category: "pre-workout", image: "/images/store/preworkout.jpg", published: true, featured: true },
    { slug: "mountain-fuel-stim-free", name: "Mountain Fuel Stim-Free Pre-Workout", shortDescription: "Pump and endurance without caffeine", description: "Non-stimulant pre-workout for evening sessions or caffeine-sensitive athletes.", price: 3499, category: "pre-workout", image: "/images/store/stim-free.jpg", published: true },
    { slug: "sierra-pump-formula", name: "Sierra Pump Formula", shortDescription: "Maximum vascularity and muscle fullness", description: "Nitric oxide boosters and vasodilators for skin-splitting pumps.", price: 4299, compareAtPrice: 4999, category: "pre-workout", image: "/images/store/pump.jpg", published: true, featured: true },
    { slug: "creatine-monohydrate", name: "Creatine Monohydrate 500g", shortDescription: "The gold standard for strength & power", description: "99.9% pure creatine monohydrate. Scientifically proven to increase strength and power.", price: 2499, category: "creatine", image: "/images/store/creatine-mono.jpg", published: true, featured: true },
    { slug: "creatine-hcl", name: "Creatine HCl 120 Servings", shortDescription: "Improved solubility, no loading phase", description: "Creatine hydrochloride for better absorption. Lower dose per serving.", price: 3999, category: "creatine", image: "/images/store/creatine-hcl.jpg", published: true },
    { slug: "creatine-capsules", name: "Creatine Capsules 200ct", shortDescription: "No scoop, no mess, no taste", description: "Pre-measured creatine monohydrate in easy-to-swallow capsules.", price: 2999, category: "creatine", image: "/images/store/creatine-caps.jpg", published: true },
    { slug: "whey-protein-vanilla", name: "Whey Protein Isolate - Vanilla", shortDescription: "24g protein, 1g sugar, delicious", description: "Premium whey protein isolate from grass-fed cows. Third-party tested.", price: 5499, compareAtPrice: 5999, category: "protein", image: "/images/store/whey-vanilla.jpg", published: true, featured: true },
    { slug: "whey-protein-chocolate", name: "Whey Protein Isolate - Chocolate", shortDescription: "Rich chocolate, 24g protein", description: "Our best-selling flavor. Premium whey isolate with real cocoa.", price: 5499, category: "protein", image: "/images/store/whey-chocolate.jpg", published: true },
    { slug: "plant-protein-blend", name: "Plant Protein Blend - Vanilla", shortDescription: "Pea & rice blend, 22g protein", description: "Vegan-friendly protein from pea and rice. Complete amino acid profile.", price: 4999, category: "protein", image: "/images/store/plant-protein.jpg", published: true },
    { slug: "fish-oil-omega-3", name: "Fish Oil Omega-3 1000mg", shortDescription: "EPA & DHA for heart and joints", description: "Quality fish oil with high EPA and DHA.", price: 2999, category: "omega-3", image: "/images/store/fish-oil.jpg", published: true, featured: true },
    { slug: "electrolyte-mix", name: "Electrolyte Mix - Orange", shortDescription: "Sodium, potassium, magnesium", description: "Replenish what you lose in sweat. Perfect for long runs.", price: 2799, category: "electrolytes", image: "/images/store/electrolytes.jpg", published: true },
    { slug: "collagen-peptides", name: "Collagen Peptides Unflavored", shortDescription: "20g collagen per serving", description: "Grass-fed bovine collagen for joint, skin, and gut health.", price: 4299, category: "collagen", image: "/images/store/collagen.jpg", published: true },
    { slug: "sleep-support", name: "Sleep & Recovery Complex", shortDescription: "Melatonin, magnesium, GABA", description: "Fall asleep faster and wake refreshed.", price: 3299, category: "sleep-recovery", image: "/images/store/sleep.jpg", published: true },
];

async function seed() {
    console.log("Seeding products into Supabase Postgres...");
    for (const p of MOCK_PRODUCTS) {
        try {
            await db.insert(products).values({
                ...p,
                inStock: true,
            }).onConflictDoNothing({ target: products.slug });
        } catch (e) {
            // Ignore duplicates
        }
    }
    console.log(`Seeded ${MOCK_PRODUCTS.length} products.`);
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
