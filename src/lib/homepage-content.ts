import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { homepageContent } from "@/db/schema";
import {
    defaultHomepageContent,
    mergeHomepageContent,
    type HomepageContentStored,
} from "@/lib/homepage-defaults";

async function loadHomepageContent(): Promise<HomepageContentStored> {
    try {
        const [row] = await db
            .select()
            .from(homepageContent)
            .where(eq(homepageContent.id, 1))
            .limit(1);
        if (!row?.data) {
            return defaultHomepageContent();
        }
        return mergeHomepageContent(row.data);
    } catch {
        return defaultHomepageContent();
    }
}

export function getHomepageContent(): Promise<HomepageContentStored> {
    return unstable_cache(
        async () => loadHomepageContent(),
        ["homepage-content-v1"],
        { revalidate: 60, tags: ["homepage-content"] },
    )();
}
