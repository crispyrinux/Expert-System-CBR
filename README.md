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


## How to run
 1. Persiapan Awal (Prasyarat)
  Pastikan hal-hal berikut sudah berjalan di komputer Anda:
   * Node.js (versi 18 atau ke atas).
   * PostgreSQL (pastikan service database sedang berjalan).
   * File .env di dalam folder backend sudah berisi konfigurasi DATABASE_URL yang benar (berdasarkan informasi sebelumnya, database Anda sudah terkoneksi).

  2. Langkah-langkah Menjalankan Server

  Silakan buka Terminal atau Command Prompt, lalu ikuti perintah ini:

  Langkah 1: Masuk ke direktori backend

   1 cd C:\Kuliah\00sem4\pakar\projekcbr\backend

  Langkah 2: Install dependensi (Jika belum)

   1 npm install

  Langkah 3: Sinkronisasi Prisma (Opsional - Karena sebelumnya Anda sudah migrasi & seeding)
  Jika Anda membutuhkan reset atau me- load ulang schema terbaru, Anda bisa menjalankan:
   1 npm run prisma:generate

  Langkah 4: Jalankan Server (Mode Development)
  Gunakan script dev yang sudah disiapkan di package.json yang akan menjalankan server menggunakan tsx (TypeScript Execute) dengan mode watch (otomatis restart saat ada perubahan file).
   1 npm run dev

  Jika berhasil, Anda akan melihat pesan di terminal seperti ini:
  > Backend Sistem Pakar Padi CBR berjalan di port 5000

  ---

  3. Cara Menguji (Testing) API yang Sudah Berjalan

  Secara default, server berjalan di http://localhost:5000. Anda bisa mengujinya menggunakan browser atau aplikasi seperti Postman / Insomnia.

  A. Cek Status Server (Health Check)
  Buka browser dan akses:
  http://localhost:5000/api/health
  (Ini akan merespons dengan status server yang menandakan aplikasi berjalan normal).

  B. Menguji Consultation API (Melalui Postman)
   1. Buat Konsultasi:
       * Method: POST
       * URL: http://localhost:5000/api/consultations
       * Anda akan mendapatkan ID Konsultasi.
   2. Kirim Gejala:
       * Method: POST
       * URL: http://localhost:5000/api/consultations/<ID_KONSULTASI_DARI_LANGKAH_1>/symptoms
       * Body (JSON): {"symptoms": ["id-gejala-1", "id-gejala-2"]} (Pastikan ID gejala diambil dari ID database, bukan kodenya seperti G01).
   3. Dapatkan Diagnosa (CBR Engine Berjalan):
       * Method: GET
       * URL: http://localhost:5000/api/consultations/<ID_KONSULTASI_DARI_LANGKAH_1>/diagnose
       * Anda akan melihat hasil output JSON yang berisi Penyakit, Similarity (%), dan Status Diagnosa.

  4. Melihat Data Database Secara Visual (Bonus)
  Jika Anda ingin melihat data Gejala (untuk mengambil ID) atau melihat data Kasus, Anda dapat menggunakan Prisma Studio. Buka terminal baru di folder backend, lalu ketik:

   1 npm run prisma:studio
  Prisma Studio akan otomatis terbuka di browser Anda (biasanya di http://localhost:5555), menampilkan antarmuka tabel interaktif untuk database PostgreSQL Anda.
