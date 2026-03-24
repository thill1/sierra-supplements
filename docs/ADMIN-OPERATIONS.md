# Admin operations (novice-friendly)

## Day-to-day

- **Dashboard** (`/admin`): counts, alerts (no photo, low stock, drafts), recent audit activity.
- **Products**: search and filter; **Archive** hides a product from the store (soft delete). **Duplicate** creates a draft copy.
- **Inventory** (`/admin/inventory`):
  - **In-store sale**: pick product, quantity, optional payment method — reduces stock and logs a movement.
  - **Quick adjustment**: positive or negative delta for corrections.
  - **Shipment / restock**: add units when new stock arrives.
- **Orders**: open an order to see line items; **Save changes** updates fulfillment **status**, **internal notes**, and **shipping / customer contact** fields (not line items or payment totals — those come from checkout and Stripe).

## Photos

- Uploads accept **JPEG, PNG, HEIC/HEIF** (iPhone-friendly). Max **6 MB** per file.
- The server converts HEIC to JPEG, normalizes orientation, strips EXIF, and stores optimized **main + thumbnail** on **Vercel Blob**.
- Use labeled slots (front, facts, label) plus **gallery**; star an image to set **primary** (store preview).

## Online vs offline checkout

- **Place order (pay offline)** on `/store/checkout` still creates a **pending** intake order (email flow). It does **not** reduce inventory.
- **Pay with card** uses **Stripe Checkout** when `STRIPE_SECRET_KEY` is set. After successful payment, the **webhook** creates a **paid** order, line items, and decrements stock in one transaction.
