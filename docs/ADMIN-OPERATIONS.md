# Admin operations (novice-friendly)

## Day-to-day

- **Dashboard** (`/admin`): counts, alerts (no photo, low stock, drafts), recent audit activity.
- **Products**: search and filter; **Archive** hides a product from the store (soft delete). **Duplicate** creates a draft copy.
- **Inventory** (`/admin/inventory`):
  - **In-store sale**: pick product, quantity, optional payment method — reduces stock and logs a movement.
  - **Quick adjustment**: positive or negative delta for corrections.
  - **Shipment / restock**: add units when new stock arrives.
- **Orders**: open an order to see line items; **Save changes** updates fulfillment **status**, **internal notes**, and **shipping / customer contact** fields.

## Photos

- Uploads accept **JPEG, PNG, HEIC/HEIF** (iPhone-friendly). Max **6 MB** per file.
- The server converts HEIC to JPEG, normalizes orientation, strips EXIF, and stores optimized **main + thumbnail** on **Vercel Blob**.
- Use labeled slots (front, facts, label) plus **gallery**; star an image to set **primary** (store preview).

## Online vs offline checkout

- **Place order (pay offline)** on `/store/checkout` still creates a **pending** intake order (email flow). It does **not** reduce inventory.
- **Pay with card** uses **Valor Hosted Page Sale** when the Valor environment variables are set. The app creates a `pending_payment` order and sends the customer to Valor. After confirming payment in Valor, manually update the order and adjust inventory.

## Customer emails

- **Offline order received**: customer gets a branded order-received email; `ADMIN_EMAIL` gets an alert.
- **Valor checkout started**: customer gets a pending-payment email; `ADMIN_EMAIL` gets a reconciliation alert with the Valor session id.
- **Admin status changes**: moving an order to `paid`, `packed`, `fulfilled`, `cancelled`, or `refunded` sends the matching customer update and an admin alert.
- **Feedback loop**: the `fulfilled` email asks the customer to reply with feedback, goals, and product questions so future follow-up can be more relevant.
