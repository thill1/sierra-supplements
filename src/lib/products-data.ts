/**
 * Hardcoded product catalog (Sierra Strength Inventory).
 * Used only when `allowHardcodedCatalogFallback()` is true (local dev by default;
 * production uses DB only unless `ALLOW_HARDCODED_CATALOG=true`).
 */

import type { Product } from "@/types/store";

/** @deprecated Use Product from @/types/store */
export type HardcodedProduct = Product;

// Sierra Strength Inventory – retail prices in cents
// Image path derived from slug: /images/store/{slug}.jpg
const RAW_PRODUCTS = [
    { slug: "allmax-pb-choc", name: "Allmax Protein - PB Chocolate", shortDescription: "Peanut butter chocolate protein", description: "Premium protein from Allmax. Peanut butter chocolate flavor.", price: 4900, compareAtPrice: null as number | null, category: "protein", published: true, featured: true },
    { slug: "allmax-choc-mint", name: "Allmax Protein - Chocolate Mint", shortDescription: "Chocolate mint protein", description: "Premium protein from Allmax. Chocolate mint flavor.", price: 4900, compareAtPrice: null, category: "protein", published: true, featured: false },
    { slug: "muscle-sport-monster-cookie", name: "Muscle Sport Protein - Monster Cookie", shortDescription: "Monster cookie flavor protein", description: "Muscle Sport protein. Monster cookie flavor.", price: 4900, compareAtPrice: null, category: "protein", published: true, featured: false },
    { slug: "muscle-sport-white-choc-pb", name: "Muscle Sport Protein - White Chocolate PB", shortDescription: "White chocolate peanut butter protein", description: "Muscle Sport protein. White chocolate peanut butter flavor.", price: 4900, compareAtPrice: null, category: "protein", published: true, featured: false },
    { slug: "muscle-sport-dubai-choc", name: "Muscle Sport Protein - Dubai Chocolate", shortDescription: "Dubai chocolate flavor protein", description: "Muscle Sport protein. Dubai chocolate flavor.", price: 4900, compareAtPrice: null, category: "protein", published: true, featured: false },
    { slug: "muscle-sport-fluffer-nutter", name: "Muscle Sport Protein - Fluffer Nutter", shortDescription: "Fluffer nutter flavor protein", description: "Muscle Sport protein. Fluffer nutter flavor.", price: 4900, compareAtPrice: null, category: "protein", published: true, featured: false },
    { slug: "muscle-sport-carrot-cake", name: "Muscle Sport Protein - Carrot Cake", shortDescription: "Carrot cake flavor protein", description: "Muscle Sport protein. Carrot cake flavor.", price: 4900, compareAtPrice: null, category: "protein", published: true, featured: false },
    { slug: "afterdark-snowcone", name: "Afterdark Pre-Workout - Snowcone", shortDescription: "Stimulant pre-workout, snowcone flavor", description: "Afterdark pre-workout with caffeine. Snowcone flavor.", price: 3900, compareAtPrice: null, category: "pre-workout", published: true, featured: true },
    { slug: "pump-sauce-gummy-worm", name: "Pump Sauce - Gummy Worm", shortDescription: "Non-stim pump formula", description: "Pump Sauce non-stimulant pre-workout. Gummy worm flavor.", price: 3900, compareAtPrice: null, category: "pre-workout", published: true, featured: false },
    { slug: "pump-sauce-clappin-peach", name: "Pump Sauce - Clappin Peach", shortDescription: "Non-stim pump formula", description: "Pump Sauce non-stimulant pre-workout. Clappin peach flavor.", price: 3900, compareAtPrice: null, category: "pre-workout", published: true, featured: false },
    { slug: "pump-sauce-gummy-shark", name: "Pump Sauce - Gummy Shark", shortDescription: "Non-stim pump formula", description: "Pump Sauce non-stimulant pre-workout. Gummy shark flavor.", price: 3900, compareAtPrice: null, category: "pre-workout", published: true, featured: false },
    { slug: "elev8-peanut-butter", name: "Elev8 Cream of Rice - Peanut Butter", shortDescription: "Fast-digesting carb, peanut butter", description: "Elev8 cream of rice. Peanut butter flavor. Ideal pre-workout carb.", price: 2500, compareAtPrice: null, category: "carbs", published: true, featured: false },
    { slug: "elev8-carrot-cake", name: "Elev8 Cream of Rice - Carrot Cake", shortDescription: "Fast-digesting carb, carrot cake", description: "Elev8 cream of rice. Carrot cake flavor. Ideal pre-workout carb.", price: 2500, compareAtPrice: null, category: "carbs", published: true, featured: false },
    { slug: "elev8-cookie-butter", name: "Elev8 Cream of Rice - Cookie Butter", shortDescription: "Fast-digesting carb, cookie butter", description: "Elev8 cream of rice. Cookie butter flavor. Ideal pre-workout carb.", price: 2500, compareAtPrice: null, category: "carbs", published: true, featured: false },
    { slug: "liver-organ-defender", name: "Liver and Organ Defender", shortDescription: "Organ support supplement", description: "Liver and organ support supplement.", price: 3900, compareAtPrice: null, category: "vitamins", published: true, featured: false },
    { slug: "liver-kidney-revolution", name: "Liver and Kidney Revolution (60 caps)", shortDescription: "Liver and kidney support", description: "Liver and kidney support. 60 capsules.", price: 2000, compareAtPrice: null, category: "vitamins", published: true, featured: false },
    { slug: "digestive-enzymes-revolution", name: "Digestive Enzymes Revolution 60 ct", shortDescription: "Digestive enzyme support", description: "Digestive enzymes. 60 count.", price: 2000, compareAtPrice: null, category: "vitamins", published: true, featured: false },
    { slug: "anabar-fluff-n-butter", name: "Anabar - Fluff n Butter", shortDescription: "Protein bar, fluff n butter", description: "Anabar protein bar. Fluff n butter flavor.", price: 400, compareAtPrice: null, category: "bars", published: true, featured: false },
    { slug: "amino-hydration-patriot-pop", name: "Amino+Hydration - Patriot Pop", shortDescription: "Amino acids with hydration", description: "Amino acids with hydration support. Patriot pop flavor.", price: 2900, compareAtPrice: null, category: "bcaas", published: true, featured: false },
    { slug: "amino-hydration-italian-ice", name: "Amino+Hydration - Italian Ice", shortDescription: "Amino acids with hydration", description: "Amino acids with hydration support. Italian ice flavor.", price: 2900, compareAtPrice: null, category: "bcaas", published: true, featured: false },
    { slug: "creatine-hydration-blueberry-lemon", name: "Creatine+Hydration - Blueberry Lemon", shortDescription: "Creatine with hydration", description: "Creatine with hydration. Blueberry lemon flavor.", price: 2900, compareAtPrice: null, category: "creatine", published: true, featured: true },
    { slug: "creatine-hydration-italian-lemon-ice", name: "Creatine+Hydration - Italian Lemon Ice", shortDescription: "Creatine with hydration", description: "Creatine with hydration. Italian lemon ice flavor.", price: 2900, compareAtPrice: null, category: "creatine", published: true, featured: false },
    { slug: "karbolyn-unflavored", name: "Karbolyn Carb Powder - Unflavored", shortDescription: "Fast-digesting carb powder", description: "Karbolyn fast-digesting carb powder. Unflavored.", price: 3900, compareAtPrice: null, category: "carbs", published: true, featured: false },
    { slug: "l-carnitine-miami-sunrise", name: "L-Carnitine - Miami Sunrise", shortDescription: "L-Carnitine performance support", description: "L-Carnitine. Miami sunrise flavor.", price: 2900, compareAtPrice: null, category: "fat-burners", published: true, featured: false },
    { slug: "l-carnitine-patriot-pop", name: "L-Carnitine - Patriot Pop", shortDescription: "L-Carnitine performance support", description: "L-Carnitine. Patriot pop flavor.", price: 2900, compareAtPrice: null, category: "fat-burners", published: true, featured: false },
];

// Images: /images/store/{slug}.jpg (files named by slug in public/images/store)
export const HARDCODED_PRODUCTS: Product[] = RAW_PRODUCTS.map(
    (p, i) => ({
        id: i + 1,
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        category: p.category,
        image: `/images/store/${p.slug}.jpg`,
        featured: p.featured,
    }),
);

export function getHardcodedProducts(category?: string | null): Product[] {
    let list = HARDCODED_PRODUCTS;
    if (category) {
        list = list.filter((p) => p.category === category);
    }
    return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
}

export function getHardcodedProductBySlug(slug: string): Product | null {
    return HARDCODED_PRODUCTS.find((p) => p.slug === slug) ?? null;
}
