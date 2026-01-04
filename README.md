# Sprout 

Support creators. Grow impact.

## Tech Stack
- Next.js 15 (App Router) + TailwindCSS 4
- Supabase (Auth + Postgres)
- Razorpay (Payments + Route for splits)
- SWR (Client-side data caching)
- Hosted on Vercel + Supabase Cloud

## Performance Optimizations
- SWR for automatic request deduplication & caching
- Minimal client components (Server Components where possible)
- Database indexes on frequently queried columns
- Edge-compatible where possible

## Getting Started
1. Copy .env.example to .env.local and fill values
2. npm install
3. npm run dev

## Webhook Setup (Optional - for saving donations to DB)

### Local Testing with ngrok:
1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. Copy the https URL (e.g., `https://abc123.ngrok-free.app`)
4. Razorpay Dashboard → Webhooks → Add:
   - URL: `https://abc123.ngrok-free.app/api/razorpay/webhook`
   - Event: `payment.captured`
   - Copy webhook secret → add to `.env.local` as `RAZORPAY_WEBHOOK_SECRET`
5. Test a donation → check `donations` table in Supabase

### Production:
After deploying to Vercel, use: `https://your-app.vercel.app/api/razorpay/webhook`

## Env Vars
Required in `.env.local`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe (Primary - for global payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay (Optional - for India)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## MVP Pages
- /: Landing + sign in
- /dashboard: Creator stats
- /[username]: Donation form

## SQL
Add Route account ID and creator details to users:

```sql
alter table public.users add column if not exists razorpay_account_id text;
create index if not exists idx_users_razorpay_acct on public.users(razorpay_account_id);

alter table public.users add column if not exists stripe_account_id text;
create index if not exists idx_users_stripe_acct on public.users(stripe_account_id);
alter table public.users add column if not exists payment_gateway text default 'stripe' check (payment_gateway in ('stripe', 'razorpay'));

-- Creator profile details for Razorpay KYC
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists legal_name text;
alter table public.users add column if not exists business_type text default 'individual';
alter table public.users add column if not exists street1 text;
alter table public.users add column if not exists street2 text;
alter table public.users add column if not exists city text;
alter table public.users add column if not exists state text;
alter table public.users add column if not exists postal_code text;
alter table public.users add column if not exists pan text;
alter table public.users add column if not exists gst text;

-- Public profile from OAuth
alter table public.users add column if not exists display_name text;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists bio text;
alter table public.users add column if not exists social_twitter text;
alter table public.users add column if not exists social_instagram text;
alter table public.users add column if not exists social_youtube text;
alter table public.users add column if not exists social_website text;
```

Manual UPI settlement:
```sql
-- store creator UPI ID
alter table public.users add column if not exists upi_id text;

-- queue manual payouts
create table if not exists public.payout_queue (
  id bigserial primary key,
  creator_id uuid not null references public.users(id) on delete cascade,
  donation_amount_cents integer not null check (donation_amount_cents > 0),
  upi_id text not null,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.payout_queue enable row level security;

-- only read your own rows (optional). For admin tools, use service role
drop policy if exists "Creator can read own payouts" on public.payout_queue;
create policy "Creator can read own payouts" on public.payout_queue
for select to authenticated using (creator_id = auth.uid());
```

