"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Something went wrong</h1>
                <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                    We encountered an unexpected error. Please try again.
                </p>
                <button
                    onClick={reset}
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#D97706",
                        color: "white",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                    }}
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
