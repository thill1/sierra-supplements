export function resolveSafeAuthRedirect(url: string, baseUrl: string): string {
    if (url.startsWith("/")) {
        return new URL(url, baseUrl).toString();
    }

    try {
        const target = new URL(url);
        const base = new URL(baseUrl);
        if (target.origin === base.origin) {
            return target.toString();
        }
    } catch {
        return baseUrl;
    }

    return baseUrl;
}
