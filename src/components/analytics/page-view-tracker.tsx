"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAnalytics } from "@/hooks/use-analytics";

export function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { trackPageView } = useAnalytics();

    useEffect(() => {
        const query = searchParams.toString();
        const page = query ? `${pathname}?${query}` : pathname;
        trackPageView(page);
    }, [pathname, searchParams, trackPageView]);

    return null;
}
