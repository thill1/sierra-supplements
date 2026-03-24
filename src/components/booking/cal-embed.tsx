"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

declare global {
    interface Window {
        // Cal.com bootstrap assigns a callable with queue hooks; typed loosely below.
        Cal?: CalBootstrap;
    }
}

type CalBootstrap = ((...args: unknown[]) => void) & {
    q?: unknown[][];
    loaded?: boolean;
    ns?: Record<string, { (...args: unknown[]): void; q?: unknown[][] }>;
};

export function CalEmbed() {
    useEffect(() => {
        /* eslint-disable @typescript-eslint/no-explicit-any -- Cal.com third-party embed snippet */
        (function (C: any, A: string, L: string) {
            const p = function (a: any, ar: unknown[]) {
                a.q = a.q || [];
                a.q.push(ar);
            };
            const d = C.document;
            C.Cal =
                C.Cal ||
                function (...callArgs: unknown[]) {
                    const cal = C.Cal;
                    if (!cal.loaded) {
                        cal.q = cal.q || [];
                        cal.loaded = true;
                    }
                    if (callArgs[0] === L) {
                        const api: any = function (...inner: unknown[]) {
                            p(api, inner);
                        };
                        const namespace = callArgs[1];
                        api.q = api.q || [];
                        if (typeof namespace === "string") {
                            cal.ns = cal.ns || {};
                            cal.ns[namespace] = cal.ns[namespace] || api;
                            p(cal.ns[namespace], callArgs);
                            p(cal, ["initNamespace", namespace]);
                        } else p(cal, callArgs);
                        return;
                    }
                    p(cal, callArgs);
                };
            const j = d.createElement("script");
            j.src = A;
            j.async = true;
            const c = d.getElementsByTagName("script")[0];
            if (c && c.parentNode) {
                c.parentNode.insertBefore(j, c);
            } else {
                d.head.appendChild(j);
            }
        })(window, "https://app.cal.com/embed/embed.js", "init");
        /* eslint-enable @typescript-eslint/no-explicit-any */

        const Cal = window.Cal;
        if (Cal) {
            Cal("init", "supplement-consultation", { origin: "https://cal.com" });

            if (Cal.ns && Cal.ns["supplement-consultation"]) {
                Cal.ns["supplement-consultation"]("inline", {
                    elementOrSelector: "#my-cal-inline",
                    config: { layout: "month_view" },
                    calLink: siteConfig.calLink,
                });

                Cal.ns["supplement-consultation"]("ui", {
                    theme: siteConfig.calEmbedConfig.theme,
                    styles: { branding: { brandColor: "#F59E0B" } },
                    hideEventTypeDetails: siteConfig.calEmbedConfig.hideEventTypeDetails,
                    layout: "month_view",
                });
            }
        }
    }, []);

    return (
        <div
            style={{ width: "100%", height: "100%", overflow: "scroll" }}
            id="my-cal-inline"
            data-cal-link={siteConfig.calLink}
            data-cal-namespace="supplement-consultation"
            data-cal-config='{"layout":"month_view"}'
        ></div>
    );
}
