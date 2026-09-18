# Mental Alchemy — Next.js migration

This project migrates the supplied Mental Alchemy HTML/CSS/JavaScript frontend to the Next.js App Router while preserving its pages, styling, assets, and demo interactions.

## Included routes

- `/` — home
- `/about`
- `/therapists`
- `/booking`
- `/contact`
- `/login`
- `/signup`
- `/dashboard`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate a production build

```bash
npm run build
npm start
```

## Deploy to Vercel

Push this folder to a GitHub repository, import the repository into Vercel, and deploy. Vercel detects the Next.js project automatically.

## Architecture note

The original page markup is retained in `legacy-html/` so the visual migration stays faithful. Next.js owns routing, metadata, static generation, and production bundling. The original interactive behaviors are loaded from `public/legacy.js` and continue to provide therapist filtering, booking steps, form feedback, dashboard mood tracking, mobile navigation, and local demo persistence.

This is still a frontend prototype. Authentication, appointments, messages, and forms require a secure backend before production use.
