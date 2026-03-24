# Fix Google “org_internal” / “Yumi” / organization-only sign-in

Your error means the **OAuth consent screen** for the Google Cloud project behind your **Client ID** is set to **Internal** (Workspace only). Personal Gmail accounts are blocked.

You **cannot** fix that from this repo — only in [Google Cloud Console](https://console.cloud.google.com/).

---

## Path A — Sign in today without Google (fastest)

If **`RESEND_API_KEY`** is set on Vercel, use **Sign in with Email** on `/auth/signin`. You get a magic link; same admin rules (`admin_users` + `ADMIN_EMAILS`) apply.

1. **Vercel** → your project → **Environment Variables** → confirm **`RESEND_API_KEY`** exists for **Production**.
2. **[Resend](https://resend.com)** → **Domains** → your sending domain is verified (SPF/DKIM).
3. **`ADMIN_EMAILS`** includes the exact email you type in the form.
4. **`admin_users`** has that email (`pnpm db:seed-admins` or Supabase SQL).

Redeploy if you add `RESEND_API_KEY`. Open:

`https://sierra-supplements.vercel.app/auth/signin` → **Sign in with Email**.

---

## Path B — Fix Google for `@gmail.com` (clean setup)

Use a **dedicated** Google Cloud project for Sierra so it is not tied to “Yumi” or an Internal-only app.

### 1. New project

1. Open <https://console.cloud.google.com/projectcreate>
2. **Project name:** e.g. `Sierra Strength Auth`
3. **Create**

### 2. OAuth consent screen (must be **External**)

1. Select the **new** project (top bar).
2. **APIs & Services** → **OAuth consent screen**
3. **User type:** **External** → **Create**
4. **App name:** e.g. `Sierra Strength Admin`
5. **User support email** + **Developer contact:** your email
6. **Scopes:** **Save and Continue** (defaults are OK for sign-in).
7. **Test users** → **Add users** → add every admin Gmail you use (e.g. `tghill@gmail.com`) → **Save**  
   (While the app is in **Testing**, only test users can sign in.)
8. Finish the wizard.

### 3. OAuth client (Web)

1. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**
2. Type: **Web application**
3. **Authorized JavaScript origins:**
   - `https://sierra-supplements.vercel.app`
4. **Authorized redirect URIs:**
   - `https://sierra-supplements.vercel.app/api/auth/callback/google`
5. **Create** → copy **Client ID** and **Client secret**

### 4. Vercel

1. **Settings** → **Environment Variables** → **Production**
2. Set **`GOOGLE_CLIENT_ID`** = new Client ID  
3. Set **`GOOGLE_CLIENT_SECRET`** = new Client secret  
4. **Redeploy** production.

### 5. Try again

Incognito → `https://sierra-supplements.vercel.app/auth/signin` → **Sign in with Google**.

---

## If you stay on the old project (Yumi)

You would need a **Google Workspace admin** to either:

- Change the OAuth app to **External** (not always allowed on the same consent screen), or  
- Only sign in with a **@yourcompany.com** account that is in that organization.

That is why **Path B** (new External project) is usually simpler for personal Gmail admins.

---

## Links

- Production sign-in: `https://sierra-supplements.vercel.app/auth/signin`
- Open credentials for the *old* project (reference only): run `pnpm google:oauth-console` from the repo
