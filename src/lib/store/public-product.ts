type PublicProduct = {
    id: number;
    slug: string;
    name: string;
    shortDescription: string | null;
    description: string;
    price: number;
    compareAtPrice: number | null;
    category: string;
    image: string | null;
    inStock: boolean | null;
    featured: boolean | null;
    primaryImageUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
};

export function toPublicProduct(row: PublicProduct): PublicProduct {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        shortDescription: row.shortDescription,
        description: row.description,
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        category: row.category,
        image: row.image,
        inStock: row.inStock,
        featured: row.featured,
        primaryImageUrl: row.primaryImageUrl,
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
    };
}
