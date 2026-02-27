"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

declare global {
    interface Window {
        Cal?: any;
    }
}

export function CalEmbed() {
    useEffect(() => {
        (function (C: any, A: any, L: any) {
            let p = function (a: any, ar: any) {
                a.q.push(ar);
            };
            let d = C.document;
            C.Cal =
                C.Cal ||
                function () {
                    let cal = C.Cal;
                    let ar = arguments;
                    if (!cal.loaded) {
                        cal.q = cal.q || [];
                        cal.loaded = true;
                    }
                    if (ar[0] === L) {
                        const api: any = function () {
                            p(api, arguments);
                        };
                        const activeBag = ar[ar.length - 1];
                        if (activeBag.constructor === Object && activeBag.namespace) {
                            api.namespace = activeBag.namespace;
                        }
                        return api;
                    }
                    p(cal, ar);
                };
            // Add the actual script tag
            const s = d.createElement("script");
            s.src = A;
            s.async = true;
            const first = d.getElementsByTagName("script")[0];
            first.parentNode.insertBefore(s, first);
        })(window, "https://app.cal.com/embed/embed.js", "init");

        const cal = window.Cal;
        if (cal) {
            cal("init", "supplement-consultation", { origin: "https://cal.com" });
            cal.ns?.["supplement-consultation"]?.("ui", {
                theme: siteConfig.calEmbedConfig.theme,
                styles: { branding: { brandColor: "#F59E0B" } }, // Explicit amber
                hideEventTypeDetails: siteConfig.calEmbedConfig.hideEventTypeDetails,
                layout: "month_view",
            });
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
