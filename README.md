# 🏔️ Sierra Supplements – Marketing Website & Admin Dashboard

A production-ready, high-converting marketing website for local service businesses or agencies. Designed with a **Sierra Mountain** premium aesthetic.

## 🚀 Quick Start

### 1. Requirements
- Node.js 18+
- pnpm
- (Optional) Docker for Postgres — the app uses local SQLite by default

### 2. Installation
```bash
pnpm install
```

### 3. Environment Setup
Copy the example environment file and update your variables:
```bash
cp .env.example .env
```
Key variables to update:
- `DATABASE_URL`: Your Postgres connection string.
- `NEXTAUTH_SECRET`: Generate with `npx auth secret`.
- `RESEND_API_KEY`: For email notifications.
- `ADMIN_EMAIL`: Where you want lead notifications sent.

### 4. Database Setup (Local SQLite — no Docker required)
Create tables and seed placeholder products:
```bash
pnpm db:push
pnpm db:seed
```
The database file is saved to `data/sierra.db`.

### 5. Running the App
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## 🏗️ Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Animations**: Framer Motion
- **Database**: Postgres (local Docker) + Drizzle ORM
- **Auth**: Auth.js (NextAuth) with Email Magic Links & Google
- **Forms**: Server Actions + Zod
- **Email**: Resend
- **Testing**: Playwright

---

## 📂 Information Architecture
- **Home**: Hero, Social Proof, Services, Pricing, FAQ, Lead Magnet
- **Services**: Listing and individual detail pages
- **Pricing**: Comparison table & tier cards
- **Admin**: Dashboard, Lead Management, Content Blocks Editor
- **Booking**: Calendar integration via Cal.com
- **Landing Pages**: Minimal lead magnet offer pages

---

## 🛠️ Configuration
Most site-wide content (services, pricing, brand info) is managed in:
`src/lib/site-config.ts`

To customize for a different business:
1. Update `siteConfig` in that file.
2. Update CSS variables in `src/app/globals.css`.
3. Swap images in `public/images/`.

---

## 🧪 Testing
Run smoke tests for critical flows:
```bash
pnpm exec playwright test
```

## 🚀 Deployment

### Client preview (recommended)
Deploy a **public preview** for client feedback in one click:

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project** and import **thill1/sierra-supplements**.
3. Leave defaults and click **Deploy**. Vercel will build and give you a URL like `sierra-supplements-xxx.vercel.app`.
4. Share that URL with your client for feedback. Every push to `main` updates the preview.

### Docker
The repo is Docker-ready. Use the provided `Dockerfile` and `docker-compose.yml` for production deployments on platforms like Coolify, Railway, or VPS.

```bash
docker build -t sierra-supplements .
```
