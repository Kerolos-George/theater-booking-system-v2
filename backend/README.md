# Premier Theater — Backend (User Module)

NestJS + Prisma + Supabase PostgreSQL + Supabase Storage.

## Setup

1. Copy `.env.example` → `.env` and fill in values (see below).
2. Create a **public** storage bucket in Supabase named `payment-proofs` (or match `SUPABASE_STORAGE_BUCKET`).
3. Run migrations and seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start API:

```bash
npm run start:dev
```

5. Open Swagger: **http://localhost:3000/api/docs**

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase **direct** connection (port **5432**, IPv4). Use “Direct connection” in Supabase dashboard — not the transaction pooler (6543) |
| `SUPABASE_URL` | Project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only, for storage uploads) |
| `SUPABASE_STORAGE_BUCKET` | Bucket name for payment screenshots (default: `payment-proofs`) |
| `JWT_SECRET` | Secret to sign user access tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default: `7d`) |
| `PORT` | API port (default: `3000`) |
| `CORS_ORIGIN` | Frontend origin(s), comma-separated |

## User API overview

All protected routes require header: `Authorization: Bearer <accessToken>`

### Auth — `/user/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Register (name, mobile, password, confirmPassword) |
| POST | `/login` | Login → returns JWT |
| GET | `/me` | Current user profile |

### Sections — `/user/sections`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List ground & balcony (`visible` controls if bookable) |
| GET | `/:sectionId/seats` | Seat map with `rows[]` (each row block has `visible`) + `seats[]` (`available` / `booked` / `hidden`) |

### Bookings — `/user/bookings`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create booking (transaction + row lock, max 5 seats, 1 active booking per user) |
| GET | `/` | List my bookings |
| GET | `/:id` | Get one booking |
| POST | `/:id/payment` | Upload InstaPay screenshot (`multipart/form-data`, field `file`) → status `PENDING` |

### Booking statuses

| Status | Meaning |
|--------|---------|
| `UNPAID` | Seats reserved, payment not uploaded |
| `PENDING` | Payment uploaded, waiting for admin |
| `CONFIRMED` | Admin confirmed; `entryCode` sent via WhatsApp |
| `CANCELED` | Cancelled (admin only — users cannot cancel) |

### Create booking body example

```json
{
  "sectionId": "uuid-of-section",
  "contactName": "أحمد محمد",
  "whatsapp": "01012345678",
  "seats": [
    { "label": "AL3", "attendeeName": "أحمد" },
    { "label": "AL4", "attendeeName": "سارة" }
  ]
}
```

If seats are taken concurrently, API returns **409** with:

```json
{
  "message": "بعض المقاعد محجوزة بالفعل",
  "bookedSeats": ["AL3"]
}
```

## Seat layouts

- **Ground** — rows P→A with `PL/PR`, `OL/OR`, … `AL/AR` (different seat ranges per row, e.g. `PR` starts at 4)
- **Balcony** — rows A→M with the original balcony map

Each **row block** (`PL`, `PR`, `AL`, …) has its own `visible` flag in `theater_rows`. Hidden rows return seat status `hidden` and cannot be booked.

After schema changes, run:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Booking creation uses `SERIALIZABLE` transaction + `SELECT … FOR UPDATE` on seats, then sets `heldByBookingId` only if still free. Two simultaneous requests for the same seat — only one succeeds.

## Admin module

Placeholder at `src/admin/` — confirm/cancel bookings will be added next.
