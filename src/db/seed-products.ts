/**
 * Seed products from Sierra Strength Inventory.
 * Run with: pnpm db:seed
 *
 * Retail prices sourced from sierra Strength Inventory.numbers
 */

import "./load-local-env";
import { db } from "./index";
import { products, testimonials } from "./schema.pg";
import { siteConfig } from "@/lib/site-config";

// Products from inventory spreadsheet – price in cents (retail)
// Images: /images/store/{slug}.jpg (files named by slug in public/images/store)
const INVENTORY_PRODUCTS = [
    // Protein Powders – $49
    {
        slug: "allmax-pb-choc",
        name: "Allmax Protein - PB Chocolate",
        shortDescription: "Peanut butter chocolate protein",
        description: "Premium protein from Allmax. Peanut butter chocolate flavor.",
        price: 4900,
        category: "protein",
        published: true,
        featured: true,
    },
    {
        slug: "allmax-choc-mint",
        name: "Allmax Protein - Chocolate Mint",
        shortDescription: "Chocolate mint protein",
        description: "Premium protein from Allmax. Chocolate mint flavor.",
        price: 4900,
        category: "protein",
        published: true,
    },
    {
        slug: "muscle-sport-monster-cookie",
        name: "Muscle Sport Protein - Monster Cookie",
        shortDescription: "Monster cookie flavor protein",
        description: "Muscle Sport protein. Monster cookie flavor.",
        price: 4900,
        category: "protein",
        published: true,
    },
    {
        slug: "muscle-sport-white-choc-pb",
        name: "Muscle Sport Protein - White Chocolate PB",
        shortDescription: "White chocolate peanut butter protein",
        description: "Muscle Sport protein. White chocolate peanut butter flavor.",
        price: 4900,
        category: "protein",
        published: true,
    },
    {
        slug: "muscle-sport-dubai-choc",
        name: "Muscle Sport Protein - Dubai Chocolate",
        shortDescription: "Dubai chocolate flavor protein",
        description: "Muscle Sport protein. Dubai chocolate flavor.",
        price: 4900,
        category: "protein",
        published: true,
    },
    {
        slug: "muscle-sport-fluffer-nutter",
        name: "Muscle Sport Protein - Fluffer Nutter",
        shortDescription: "Fluffer nutter flavor protein",
        description: "Muscle Sport protein. Fluffer nutter flavor.",
        price: 4900,
        category: "protein",
        published: true,
    },
    {
        slug: "muscle-sport-carrot-cake",
        name: "Muscle Sport Protein - Carrot Cake",
        shortDescription: "Carrot cake flavor protein",
        description: "Muscle Sport protein. Carrot cake flavor.",
        price: 4900,
        category: "protein",
        published: true,
    },
    // Pre-Workout Stim – $39
    {
        slug: "afterdark-snowcone",
        name: "Afterdark Pre-Workout - Snowcone",
        shortDescription: "Stimulant pre-workout, snowcone flavor",
        description: "Afterdark pre-workout with caffeine. Snowcone flavor.",
        price: 3900,
        category: "pre-workout",
        published: true,
        featured: true,
    },
    // Pre-Workout Non-Stim – $39
    {
        slug: "pump-sauce-gummy-worm",
        name: "Pump Sauce - Gummy Worm",
        shortDescription: "Non-stim pump formula",
        description: "Pump Sauce non-stimulant pre-workout. Gummy worm flavor.",
        price: 3900,
        category: "pre-workout",
        published: true,
    },
    {
        slug: "pump-sauce-clappin-peach",
        name: "Pump Sauce - Clappin Peach",
        shortDescription: "Non-stim pump formula",
        description: "Pump Sauce non-stimulant pre-workout. Clappin peach flavor.",
        price: 3900,
        category: "pre-workout",
        published: true,
    },
    {
        slug: "pump-sauce-gummy-shark",
        name: "Pump Sauce - Gummy Shark",
        shortDescription: "Non-stim pump formula",
        description: "Pump Sauce non-stimulant pre-workout. Gummy shark flavor.",
        price: 3900,
        category: "pre-workout",
        published: true,
    },
    // Cream of Rice – $25
    {
        slug: "elev8-peanut-butter",
        name: "Elev8 Cream of Rice - Peanut Butter",
        shortDescription: "Fast-digesting carb, peanut butter",
        description: "Elev8 cream of rice. Peanut butter flavor. Ideal pre-workout carb.",
        price: 2500,
        category: "carbs",
        published: true,
    },
    {
        slug: "elev8-carrot-cake",
        name: "Elev8 Cream of Rice - Carrot Cake",
        shortDescription: "Fast-digesting carb, carrot cake",
        description: "Elev8 cream of rice. Carrot cake flavor. Ideal pre-workout carb.",
        price: 2500,
        category: "carbs",
        published: true,
    },
    {
        slug: "elev8-cookie-butter",
        name: "Elev8 Cream of Rice - Cookie Butter",
        shortDescription: "Fast-digesting carb, cookie butter",
        description: "Elev8 cream of rice. Cookie butter flavor. Ideal pre-workout carb.",
        price: 2500,
        category: "carbs",
        published: true,
    },
    // Vitamins
    {
        slug: "liver-organ-defender",
        name: "Liver and Organ Defender",
        shortDescription: "Organ support supplement",
        description: "Liver and organ support supplement.",
        price: 3900,
        category: "vitamins",
        published: true,
    },
    {
        slug: "liver-kidney-revolution",
        name: "Liver and Kidney Revolution (60 caps)",
        shortDescription: "Liver and kidney support",
        description: "Liver and kidney support. 60 capsules.",
        price: 2000,
        category: "vitamins",
        published: true,
    },
    {
        slug: "digestive-enzymes-revolution",
        name: "Digestive Enzymes Revolution 60 ct",
        shortDescription: "Digestive enzyme support",
        description: "Digestive enzymes. 60 count.",
        price: 2000,
        category: "vitamins",
        published: true,
    },
    // Bars – $4
    {
        slug: "anabar-fluff-n-butter",
        name: "Anabar - Fluff n Butter",
        shortDescription: "Protein bar, fluff n butter",
        description: "Anabar protein bar. Fluff n butter flavor.",
        price: 400,
        category: "bars",
        published: true,
    },
    // Aminos – $29
    {
        slug: "amino-hydration-patriot-pop",
        name: "Amino+Hydration - Patriot Pop",
        shortDescription: "Amino acids with hydration",
        description: "Amino acids with hydration support. Patriot pop flavor.",
        price: 2900,
        category: "bcaas",
        published: true,
    },
    {
        slug: "amino-hydration-italian-ice",
        name: "Amino+Hydration - Italian Ice",
        shortDescription: "Amino acids with hydration",
        description: "Amino acids with hydration support. Italian ice flavor.",
        price: 2900,
        category: "bcaas",
        published: true,
    },
    // Creatine – $29
    {
        slug: "creatine-hydration-blueberry-lemon",
        name: "Creatine+Hydration - Blueberry Lemon",
        shortDescription: "Creatine with hydration",
        description: "Creatine with hydration. Blueberry lemon flavor.",
        price: 2900,
        category: "creatine",
        published: true,
        featured: true,
    },
    {
        slug: "creatine-hydration-italian-lemon-ice",
        name: "Creatine+Hydration - Italian Lemon Ice",
        shortDescription: "Creatine with hydration",
        description: "Creatine with hydration. Italian lemon ice flavor.",
        price: 2900,
        category: "creatine",
        published: true,
    },
    // Carb Powder – $39
    {
        slug: "karbolyn-unflavored",
        name: "Karbolyn Carb Powder - Unflavored",
        shortDescription: "Fast-digesting carb powder",
        description: "Karbolyn fast-digesting carb powder. Unflavored.",
        price: 3900,
        category: "carbs",
        published: true,
    },
    // L-Carnitine – $29
    {
        slug: "l-carnitine-miami-sunrise",
        name: "L-Carnitine - Miami Sunrise",
        shortDescription: "L-Carnitine performance support",
        description: "L-Carnitine. Miami sunrise flavor.",
        price: 2900,
        category: "fat-burners",
        published: true,
    },
    {
        slug: "l-carnitine-patriot-pop",
        name: "L-Carnitine - Patriot Pop",
        shortDescription: "L-Carnitine performance support",
        description: "L-Carnitine. Patriot pop flavor.",
        price: 2900,
        category: "fat-burners",
        published: true,
    },
];

async function seed() {
    console.log("Seeding testimonials from site-config...");
    const existingCount = await db.select().from(testimonials).limit(1);
    if (existingCount.length === 0) {
        for (let i = 0; i < siteConfig.testimonials.length; i++) {
            const t = siteConfig.testimonials[i];
            await db.insert(testimonials).values({
                name: t.name,
                role: t.role,
                quote: t.quote,
                avatar: t.avatar,
                rating: t.rating,
                sortOrder: i,
                published: true,
            });
        }
        console.log(`Seeded ${siteConfig.testimonials.length} testimonials.`);
    } else {
        console.log("Testimonials already exist, skipping.");
    }

    console.log("Seeding products from Sierra Strength Inventory...");
    for (const p of INVENTORY_PRODUCTS) {
        try {
            const image = `/images/store/${p.slug}.jpg`;
            await db
                .insert(products)
                .values({
                    ...p,
                    image,
                    inStock: true,
                    stockQuantity: 10,
                    lowStockThreshold: 2,
                    status: "active",
                })
                .onConflictDoUpdate({
                    target: products.slug,
                    set: {
                        name: p.name,
                        shortDescription: p.shortDescription,
                        description: p.description,
                        price: p.price,
                        category: p.category,
                        image,
                        published: p.published,
                        featured: p.featured,
                        inStock: true,
                        stockQuantity: 10,
                        lowStockThreshold: 2,
                        status: "active",
                        updatedAt: new Date(),
                    },
                });
        } catch (e) {
            console.error(`Failed to seed ${p.slug}:`, e);
        }
    }
    console.log(`Seeded ${INVENTORY_PRODUCTS.length} products.`);
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
