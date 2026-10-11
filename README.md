<<<<<<< HEAD
# THE EMBRIONE — Meet the Team

A dark cyber-tech visual system inspired by the supplied KODIKON poster: near-black/navy surfaces, cyan circuit accents, ivory typography, and the original Embrione wordmark. The poster is a visual reference only; its event and sponsor content is not reproduced.

React + Vite + Tailwind CSS + Supabase starter for the Embrione web development recruitment challenge.
=======
# The Embrione — Web Development Domain Recruitment Challenge Organization

- Organization: The Embrione, Department of Computer Science & Engineering, PES
University
- Challenge Window: 48 Hours
- Submission Form Release: At the 40th Hour
- Deployment Platform: Vercel
- Database & Storage: Supabase (PostgreSQL + Storage)

  React + Vite + Tailwind CSS + Supabase starter for the Embrione web development recruitment challenge.
>>>>>>> origin/main

## Requirements

- Node.js 20.19+ (or a version supported by the current Vite release)
- npm
- A Supabase project

<<<<<<< HEAD
## 1. Install and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The team directory uses sample preview profiles until Supabase is configured.

## 2. Set up Supabase

1. Create a project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor**, paste `supabase-setup.sql`, and run it.
3. In **Project Settings → API** (or Connect), copy the Project URL and publishable key (legacy anon key is also supported).
4. Paste them into `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

5. Restart Vite after changing environment variables.
6. In **Authentication → Users**, create the admin user with email `admin@embrione.pes.edu` and the challenge's specified password. If the dashboard supports setting the password directly, set it there; otherwise create the user using the dashboard's supported flow and set the password. Do not put the password in frontend code or commit it to Git.
7. Test registration, approval, and visibility on `/team`. The six seeded demo records are inserted with `status = 'approved'`, so find them in the Admin page under **All members** or **Approved** (not Pending). The dashboard queries all member records and provides All/Pending/Approved/Rejected filters. Admins can approve, reject, and delete records; deleting a record also attempts to remove its photo from the `member-photos` bucket. If you originally ran an older version of the SQL, run `admin-access-migration.sql` in Supabase SQL Editor to remove legacy broad policies and apply the current admin-only moderation policies.

The SQL script enables RLS, permits public inserts only when status is `pending`, permits public reads only for approved profiles, and restricts moderation to an authenticated JWT with the designated admin email. The public bucket accepts WebP uploads up to 10 MB.

## 3. Routes

- `/register` — form, live card preview, browser-side WebP conversion and submission
- `/admin` — Supabase Auth sign-in and moderation dashboard with All/Pending/Approved/Rejected filters and delete (bonus). Delete removes the member row and attempts to remove a photo stored in the `member-photos` bucket. The original Embrione logo is included in `public/embrione-logo.png`.
- `/team` — approved profiles with domain/position/search filters

## 4. Build check

```bash
npm run build
npm run preview
```

## 5. GitHub and Vercel deployment

1. Create a public GitHub repository and push this project (do not commit `.env.local`).
2. In Vercel, import the repository.
3. Set the framework preset to **Vite**, build command `npm run build`, and output directory `dist`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under Project Settings → Environment Variables for Production and Preview.
5. Deploy and test the live `/register`, `/admin`, and `/team` routes.
6. If client-side routes return 404 on refresh, add a `vercel.json` rewrite to send requests to `index.html` (this project includes it).

Vite embeds `VITE_` variables into browser code. Only use the Supabase publishable/anon key here; **never** use a service-role or secret key in a React frontend.

## Notes before submission

- The brief's universal admin credential should be configured in Supabase Auth, not hardcoded in JavaScript.
- Demo seed records use placeholder emails/SRNs and public avatar URLs. They are sample data, not real members.
- For a production system, consider adding rate limiting / CAPTCHA for public submissions and a server-side workflow to clean up orphaned uploads if an insert fails.
=======
## 1. Routes

- `/register` — form, live card preview, browser-side WebP conversion and submission
- `/admin` — Supabase Auth sign-in and moderation dashboard
- `/team` — approved profiles with domain/position/search filters


## Notes before submission

- The brief's universal admin credential is configured in Supabase Auth, not hardcoded in JavaScript.
- Demo seed records use placeholder emails/SRNs and public avatar URLs. They are sample data, not real members.
>>>>>>> origin/main
