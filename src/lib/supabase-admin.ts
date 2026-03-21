import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with service role (bypasses RLS).
 * Used for admin image uploads to Storage.
 */
export function createSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        return null;
    }
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

export function getSupabaseStorageBucket(): string {
    return process.env.SUPABASE_STORAGE_BUCKET || "store-images";
}
