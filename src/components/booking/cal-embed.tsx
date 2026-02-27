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
                        const namespace = ar[1];
                        api.q = api.q || [];
                        if (typeof namespace === "string") {
                            cal.ns = cal.ns || {};
                            cal.ns[namespace] = cal.ns[namespace] || api;
                            p(cal.ns[namespace], ar);
                            p(cal, ["initNamespace", namespace]);
                        } else p(cal, ar);
                        return;
                    }
                    p(cal, ar);
                };
            let j = d.createElement("script");
            j.src = A;
            j.async = true;
            let c = d.getElementsByTagName("script")[0];
            if (c && c.parentNode) {
                c.parentNode.insertBefore(j, c);
            } else {
                d.head.appendChild(j);
            }
        })(window, "https://app.cal.com/embed/embed.js", "init");

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
