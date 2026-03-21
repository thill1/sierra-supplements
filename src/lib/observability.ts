type LogPayload = Record<string, unknown>;

function emit(level: "error" | "warn" | "info", payload: LogPayload) {
    const line = JSON.stringify({
        ts: new Date().toISOString(),
        level,
        service: "sierra-supplements",
        ...payload,
    });
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.info(line);
}

export function logServerError(context: string, err: unknown, extra?: LogPayload) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    emit("error", { context, message, stack, ...extra });
}

export function logAdminFailure(context: string, err: unknown, extra?: LogPayload) {
    logServerError(`admin:${context}`, err, { ...extra, area: "admin" });
}

export function logAdminAuthzFailure(context: string, email: string) {
    emit("warn", {
        context,
        area: "admin",
        event: "authz_denied",
        email,
    });
}

/**
 * Hook for a future Sentry (or similar) SDK: call from instrumentation or error boundaries.
 */
export function captureException(err: unknown, context?: string) {
    logServerError(context ?? "capture", err);
}
