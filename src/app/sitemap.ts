import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url;

    // Static routes
    const routes = ["", "/services", "/pricing", "/about", "/contact", "/blog", "/case-studies", "/book", "/offer"].map(
        (route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: route === "" ? 1 : 0.8,
        })
    );

    // Dynamic service routes
    const serviceRoutes = siteConfig.services.map((s) => ({
        url: `${baseUrl}/services/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [...routes, ...serviceRoutes];
}
