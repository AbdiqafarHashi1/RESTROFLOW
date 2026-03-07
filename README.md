# Beirut Express (Beirut Restaurant)

Production-ready MVP template for a restaurant ordering web app built with Next.js + Supabase, tuned for fast one-page conversion ordering.

## Features
- Mobile-first public ordering flow with a high-converting one-page home ordering experience, plus menu, cart, checkout, and order success + WhatsApp confirm.
- Admin dashboard: auth, order list/detail, status management scaffolds, menu/category/customer/settings sections.
- Supabase schema with RLS + seed data for Beirut Restaurant.
- Reusable restaurant settings model for easy rebranding and rollout to future restaurants.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Storage)
- React Hook Form + Zod
- lucide-react icons

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy envs:
   ```bash
   cp .env.example .env.local
   ```
3. Fill `.env.local` with Supabase project values.
4. Run dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## Supabase setup
1. Create a new Supabase project.
2. Run schema migration from `supabase/migrations/0001_schema.sql` in SQL Editor.
3. Run seed script `supabase/seed.sql`.
4. In Auth, create at least one admin user (email/password).
5. Insert corresponding `admin_profiles` row with the admin user id.

## Deployment (Vercel)
1. Push repository to GitHub.
2. Import project into Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.
5. Ensure Supabase URL allowlist includes Vercel domain if required.

## Branding asset placement
- Upload brand logo and hero/media to Supabase Storage.
- Save generated URLs in `restaurants.logo_url` and `restaurants.hero_image_url`.
- Menu images are stored per `menu_items.image_url`.

## Rebrand for another restaurant
1. Create a new restaurant row and update slug.
2. Replace categories + menu items via admin/menu SQL.
3. Update settings fields (name, WhatsApp, delivery fee, hours, service area).
4. Swap theme colors in `tailwind.config.ts` if needed.
5. Keep all ordering/admin logic unchanged for fast rollout.

## Notes
- v1 payment methods: `cash_on_delivery` and `pay_on_pickup`.
- No online payment gateway in this release.
- Architecture is ready to extend with coupons, rider tracking, and customer accounts later.
