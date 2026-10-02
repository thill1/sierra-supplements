import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_HOMEPAGE_CACHE_SECONDS = 300;

/** Call only after the content write or transaction has committed. */
export function revalidatePublicHomepage(
    tag: "homepage-content" | "testimonials",
): void {
    // Route handlers must expire data immediately so the next render sees the save.
    revalidateTag(tag, { expire: 0 });
    revalidatePath("/", "page");
}
