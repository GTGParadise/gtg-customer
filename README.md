# GTG Paradise (React + Vite)

Migration of `index-3.html` to React. Backend is **Supabase** (the original had already moved off Firebase), so Firebase is not used.

## Run locally
```
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev
```
Variables (copy from the `SUPABASE_URL` / `SUPABASE_ANON` constants in the original file): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
Use only the publishable/anon key, never a service-role key. Security relies on your Supabase RLS policies.

## Deploy to Vercel
Push to Git, import in Vercel, add the two env vars (Project Settings > Environment Variables), deploy. `vercel.json` is included; no rewrites are needed because navigation uses in-page anchors.

## Supabase tables used (same as the original)
`profiles`, `orders`, `enquiry` (visit bookings, package requests and enquiries), `config` (rows `plants`, `materials`, `packages`, `contact`, `slots`; value in a `value` column) and `gallery` (row `items`). Writes use the original camelCase to snake_case mapping (`id` is stored as `client_id`).

## Not migrated yet
Admin panel and admin login, admin/customer message threads, unread badges, activity log, inline content editing, image upload to Supabase Storage, gallery video items, the order confirmation step and the 30-minute inactivity sign-out.
