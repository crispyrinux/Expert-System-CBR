# Sistem Pakar Diagnosis Hama dan Penyakit Tanaman Padi Menggunakan CBR

Struktur awal project sudah dipisah antara backend dan frontend.

## Struktur

```text
backend/
frontend/
json/
README.md
```

## Package utama

Backend: `express`, `cors`, `dotenv`, `zod`, `prisma`, `@prisma/client`, `tsx`, `typescript`

Frontend: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`

## File inti

- `backend/prisma/schema.prisma`
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/config/prisma.ts`
- `backend/src/routes/health.route.ts`
- `backend/src/controllers/health.controller.ts`

## Jalankan backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

## Jalankan frontend

```bash
cd frontend
npm install
npm run dev
```

## Prisma migrate ke Neon

```bash
cd backend
npx prisma migrate dev --name init
```
