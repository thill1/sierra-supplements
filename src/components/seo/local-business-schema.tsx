import { siteConfig } from "@/lib/site-config";

export function LocalBusinessSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "HealthAndBeautyBusiness",
        "name": siteConfig.name,
        "description": siteConfig.description,
        "image": `${siteConfig.url}${siteConfig.logoPath}`,
        "telePhone": siteConfig.phone,
        "email": siteConfig.email,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": siteConfig.address.street,
            "addressLocality": siteConfig.address.city,
            "addressRegion": siteConfig.address.state,
            "postalCode": siteConfig.address.zip,
            "addressCountry": "US"
        },
        "url": siteConfig.url,
        "openingHoursSpecification": siteConfig.hours.map(h => ({
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": h.day.includes("–") ? h.day.split(" – ").join(",") : h.day,
            "opens": h.time.split(" – ")[0],
            "closes": h.time.split(" – ")[1]
        })),
        "priceRange": "$$",
        "areaServed": {
            "@type": "City",
            "name": "Auburn, CA"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
