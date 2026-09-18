# Mental Alchemy — Next.js + Supabase

Mental Alchemy is a Next.js App Router prototype with a Supabase backend for authentication, therapist discovery, appointments, mood check-ins, contact messages, and secure client/therapist conversations.

## Included routes

- `/` — home
- `/about`
- `/therapists`
- `/booking`
- `/contact`
- `/login`
- `/signup`
- `/dashboard` — requires authentication once Supabase is configured

## Backend features

- Email/password sign-up, confirmation, login, logout, and cookie-based sessions
- User profiles created automatically after sign-up
- Published therapist directory seeded with realistic sample data
- Authenticated and guest appointment booking with double-booking protection
- One mood check-in per user per day
- Contact form storage with a honeypot field
- Conversation and message tables for client/therapist messaging
- Row Level Security on every exposed table with least-privilege grants
- Demo fallback when Supabase environment variables are absent

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Connect Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/migrations/202609180001_initial_backend.sql`.
3. Open the project API settings and copy the project URL, publishable key, and service-role key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. In Supabase Authentication URL Configuration, set the production Site URL and add these redirect URLs:

```text
http://localhost:3000/auth/confirm
https://YOUR-VERCEL-DOMAIN.vercel.app/auth/confirm
```

5. Add the same three environment variables in Vercel under Project Settings → Environment Variables, then redeploy.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code or prefix it with `NEXT_PUBLIC_`.

## Validate

```bash
npm run lint
npm test
npm run build
npm start
```

## Deploy to Vercel

Push this folder to a GitHub repository, import the repository into Vercel, and deploy. Vercel detects the Next.js project automatically.

## Architecture

The supplied page markup remains in `legacy-html/` to preserve the original design. Next.js owns routing and API endpoints, `public/legacy.js` connects the UI to those endpoints, and `supabase/migrations/` owns the database schema and security policies.

See `SECURITY.md` before using real client information. This code provides technical safeguards, but it does not by itself establish HIPAA or other regulatory compliance.
