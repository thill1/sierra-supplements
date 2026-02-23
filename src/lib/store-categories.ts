// Supplement store categories (matches schema)
export const STORE_CATEGORIES = [
    { slug: "pre-workout", label: "Pre-Workout" },
    { slug: "creatine", label: "Creatine" },
    { slug: "protein", label: "Protein" },
    { slug: "bcaas", label: "BCAAs" },
    { slug: "vitamins", label: "Vitamins" },
    { slug: "omega-3", label: "Omega-3" },
    { slug: "multivitamins", label: "Multivitamins" },
    { slug: "collagen", label: "Collagen" },
    { slug: "electrolytes", label: "Electrolytes" },
    { slug: "fat-burners", label: "Fat Burners" },
    { slug: "sleep-recovery", label: "Sleep & Recovery" },
    { slug: "joint-support", label: "Joint Support" },
] as const;

export type StoreCategorySlug = (typeof STORE_CATEGORIES)[number]["slug"];

export function formatCategory(slug: string): string {
    return STORE_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
