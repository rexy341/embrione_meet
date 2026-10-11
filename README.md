# The Embrione — Web Development Domain Recruitment Challenge Organization

- Organization: The Embrione, Department of Computer Science & Engineering, PES
University
- Challenge Window: 48 Hours
- Submission Form Release: At the 40th Hour
- Deployment Platform: Vercel
- Database & Storage: Supabase (PostgreSQL + Storage)

  React + Vite + Tailwind CSS + Supabase starter for the Embrione web development recruitment challenge.

## Requirements

- Node.js 20.19+ (or a version supported by the current Vite release)
- npm
- A Supabase project

## 1. Routes

- `/register` — form, live card preview, browser-side WebP conversion and submission
- `/admin` — Supabase Auth sign-in and moderation dashboard
- `/team` — approved profiles with domain/position/search filters


## Notes before submission

- The brief's universal admin credential is configured in Supabase Auth, not hardcoded in JavaScript.
- Demo seed records use placeholder emails/SRNs and public avatar URLs. They are sample data, not real members.
