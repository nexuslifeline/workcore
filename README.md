# Workcore

Workspace shell for organizations, users, roles, permissions, and employees.

Built with Next.js, Supabase Auth, Drizzle, and the shared UI components from the platform shell.

## Setup

1. Create a new Supabase project. Do not reuse another app's project.
2. Copy `.env.example` to `.env` and fill in that project's URL, keys, and database URL.
3. Apply the files in `supabase/migrations` to the new project, in timestamp order.
4. Install and start:

```bash
npm install
npm run dev
```
