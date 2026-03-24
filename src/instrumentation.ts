export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    const { loadPlaywrightRuntimeEnvFile } = await import(
        "@/lib/load-playwright-runtime-env"
    );
    loadPlaywrightRuntimeEnvFile();

    const { assertProductionEnv } = await import("@/lib/production-env");
    assertProductionEnv();
}
