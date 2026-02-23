"use client";

import { useCallback, useEffect, useRef } from "react";

type EventType = "view" | "click" | "submit" | "book" | "purchase";

interface TrackEventParams {
    type: EventType;
    page?: string;
    element?: string;
    metadata?: Record<string, unknown>;
}

// Generate a session ID for the current browser session
function getSessionId(): string {
    if (typeof window === "undefined") return "";
    let sessionId = sessionStorage.getItem("sierra_session_id");
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("sierra_session_id", sessionId);
    }
    return sessionId;
}

export function useAnalytics() {
    const sessionId = useRef<string>("");

    useEffect(() => {
        sessionId.current = getSessionId();
    }, []);

    const track = useCallback(async (params: TrackEventParams) => {
        try {
            await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...params,
                    page: params.page || (typeof window !== "undefined" ? window.location.pathname : "/"),
                    sessionId: sessionId.current,
                }),
            });
        } catch {
            // Silently fail — analytics should never block UX
        }
    }, []);

    const trackPageView = useCallback(
        (page?: string) => {
            track({ type: "view", page });
        },
        [track]
    );

    const trackClick = useCallback(
        (element: string, metadata?: Record<string, unknown>) => {
            track({ type: "click", element, metadata });
        },
        [track]
    );

    const trackSubmit = useCallback(
        (element: string, metadata?: Record<string, unknown>) => {
            track({ type: "submit", element, metadata });
        },
        [track]
    );

    return { track, trackPageView, trackClick, trackSubmit };
}
