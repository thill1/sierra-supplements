import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { homepageContent } from "@/db/schema";
import { PUBLIC_HOMEPAGE_CACHE_SECONDS } from "@/lib/public-homepage-cache";
import {
    defaultHomepageContent,
    mergeHomepageContent,
    type HomepageContentStored,
} from "@/lib/homepage-defaults";

async function loadHomepageContent(): Promise<HomepageContentStored> {
    const [row] = await db
        .select()
        .from(homepageContent)
        .where(eq(homepageContent.id, 1))
        .limit(1);
    if (!row?.data) {
        return defaultHomepageContent();
    }
    // Let ISR retain the last successful page if the database fails during refresh.
    return mergeHomepageContent(row.data);
}

export function getHomepageContent(): Promise<HomepageContentStored> {
    return unstable_cache(
        async () => loadHomepageContent(),
        ["homepage-content-v1"],
        {
            revalidate: PUBLIC_HOMEPAGE_CACHE_SECONDS,
            tags: ["homepage-content"],
        },
    )();
}
