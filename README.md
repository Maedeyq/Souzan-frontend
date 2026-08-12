# Souzan Frontend

Frontend for the Souzan marketplace platform (customers ↔ tailors), built with Next.js.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Connects to the [Souzan-Backend](https://github.com/Maedeyq/Souzan-Backend) Django REST API

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Make sure the backend is running locally at the URL set in `NEXT_PUBLIC_API_BASE_URL`
(default: `http://localhost:8000/api`).

## Project structure

```
src/
  app/        Next.js routes (App Router)
  lib/
    api.ts    Fetch wrapper with JWT access/refresh handling
    auth.ts   Login and registration API calls
  types/      TypeScript types mirroring backend models
```
