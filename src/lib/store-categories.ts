import { productCategories } from "@/db/schema";

const CATEGORY_LABELS: Record<(typeof productCategories)[number], string> = {
    "pre-workout": "Pre-Workout",
    creatine: "Creatine",
    protein: "Protein",
    bcaas: "BCAAs",
    vitamins: "Vitamins",
    "omega-3": "Omega-3",
    multivitamins: "Multivitamins",
    collagen: "Collagen",
    electrolytes: "Electrolytes",
    "fat-burners": "Fat Burners",
    "sleep-recovery": "Sleep & Recovery",
    "joint-support": "Joint Support",
    bars: "Bars",
    carbs: "Carbs",
};

/** All valid product categories (admin, validation, labels). */
export const STORE_CATEGORIES = productCategories.map((slug) => ({
    slug,
    label: CATEGORY_LABELS[slug] ?? slug,
}));

/**
 * Store sidebar filters: only categories that currently have products in the
 * seeded / hardcoded catalog so links are not dead-empty.
 */
export const STORE_SIDEBAR_CATEGORIES = [
    { slug: "protein" as const, label: "Protein" },
    { slug: "pre-workout" as const, label: "Pre-Workout" },
    { slug: "creatine" as const, label: "Creatine" },
    { slug: "bcaas" as const, label: "BCAAs" },
    { slug: "vitamins" as const, label: "Vitamins" },
    { slug: "bars" as const, label: "Bars" },
    { slug: "carbs" as const, label: "Carbs" },
    { slug: "fat-burners" as const, label: "Fat Burners" },
];

export type StoreCategorySlug = (typeof productCategories)[number];

export function formatCategory(slug: string): string {
    return STORE_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
