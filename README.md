# Sistem Pakar Diagnosis Hama dan Penyakit Tanaman Padi Menggunakan CBR

Sistem ini adalah aplikasi sistem pakar untuk diagnosis hama dan penyakit tanaman padi menggunakan metode Case-Based Reasoning (CBR). Project dipisah menjadi backend dan frontend.

Backend berjalan lokal dengan Node.js, Express, TypeScript, Prisma, dan database PostgreSQL Neon. Frontend berjalan lokal dengan React, Vite, TypeScript, Tailwind CSS, dan TanStack Router.

Login/authentication belum digunakan. Role admin pada frontend masih berupa simulasi untuk kebutuhan validasi kandidat kasus.

## Struktur Project

```text
sistem-pakar-padi-cbr/
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- src/
|   |   |-- app.ts
|   |   |-- server.ts
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- validators/
|   |   `-- utils/
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- lib/
|   |   `-- routes/
|   |-- .env.example
|   `-- package.json
|-- json/
`-- README.md
```

## Tech Stack

Backend:

- Node.js
- Express.js
- TypeScript
- Prisma ORM 6
- PostgreSQL Neon
- dotenv
- cors
- zod
- tsx

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Router
- Lucide React
- Radix UI

## Prasyarat

Pastikan sudah tersedia:

- Node.js versi 18 atau lebih baru
- npm
- Database PostgreSQL Neon
- File environment lokal:
  - `backend/.env`
  - `frontend/.env`

Jangan commit file `.env` karena berisi credential database atau konfigurasi sensitif.

## Konfigurasi Environment

### Backend

Buat file `backend/.env` dari `backend/.env.example`.

Contoh isi aman:

```env
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>/<DB_NAME>?sslmode=require"
DIRECT_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>/<DB_NAME>?sslmode=require"
PORT=5000
```

Keterangan:

- `DATABASE_URL`: koneksi PostgreSQL Neon untuk Prisma.
- `DIRECT_URL`: koneksi langsung PostgreSQL Neon jika dipakai oleh Prisma migration.
- `PORT`: port backend lokal. Default dari kode adalah `5000` jika variabel ini tidak diset.

### Frontend

Buat file `frontend/.env` dari `frontend/.env.example`.

Contoh jika backend berjalan di port `5000`:

```env
VITE_API_URL="http://localhost:5000/api"
```

Jika backend kamu berjalan di port lain, misalnya `3000`, maka sesuaikan:

```env
VITE_API_URL="http://localhost:3000/api"
```

Frontend membaca API base URL dari `VITE_API_URL`. Jika tidak diset, fallback di kode frontend adalah `http://localhost:5000/api`.

## Instalasi

Jalankan dari root project.

### Install Backend

```bash
cd backend
npm install
npx prisma generate
```

### Install Frontend

```bash
cd frontend
npm install
```

## Setup Database Neon

Pastikan `backend/.env` sudah berisi `DATABASE_URL` dan `DIRECT_URL` yang benar.

Jalankan migration:

```bash
cd backend
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Seed data awal:

```bash
npm run db:seed
```

Buka Prisma Studio untuk melihat data:

```bash
npm run prisma:studio
```

Prisma Studio biasanya berjalan di:

```text
http://localhost:5555
```

## Cara Menjalankan Sistem Full

Jalankan backend dan frontend di dua terminal berbeda.

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Backend akan berjalan di port sesuai `backend/.env`.

Contoh jika `PORT=5000`:

```text
http://localhost:5000
```

Base API:

```text
http://localhost:5000/api
```

Contoh jika `PORT=3000`:

```text
http://localhost:3000
http://localhost:3000/api
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Frontend Vite biasanya berjalan di:

```text
http://127.0.0.1:5173
```

atau:

```text
http://localhost:5173
```

Keduanya mengarah ke mesin lokal. Buka frontend untuk memakai sistem full:

```text
http://127.0.0.1:5173
```

Backend tidak dibuka langsung untuk memakai aplikasi, karena backend hanya menyediakan API.

## Alur Penggunaan Aplikasi

1. Buka frontend di `http://127.0.0.1:5173`.
2. Masuk ke halaman `Diagnosa`.
3. Pilih gejala padi yang terlihat.
4. Klik `Hitung Diagnosa`.
5. Sistem membuat konsultasi, menyimpan gejala, lalu menjalankan CBR engine.
6. Halaman hasil menampilkan diagnosis, skor similarity, status diagnosis, dan kandidat kasus lain.
7. Jika hasil sesuai, klik `Konfirmasi Diagnosa` untuk fase retain.
8. Masuk sebagai simulasi `Admin` melalui tombol role di navbar.
9. Buka halaman `Admin` untuk approve atau reject kandidat kasus.
10. Kandidat yang di-approve akan masuk menjadi `CaseBase` baru.

## Halaman Frontend

Base frontend:

```text
http://127.0.0.1:5173
```

| Route | Halaman | Keterangan |
| --- | --- | --- |
| `/` | Beranda | Ringkasan sistem dan status backend. |
| `/diagnosa` | Input Gejala | User memilih gejala tanaman padi. |
| `/proses` | Proses Diagnosa | Menampilkan proses sebelum menuju hasil. |
| `/hasil` | Hasil Diagnosa | Menampilkan hasil CBR, similarity, dan retain action. |
| `/riwayat` | Riwayat | Menampilkan riwayat diagnosis lokal frontend. |
| `/admin` | Admin/Pakar | Review kandidat kasus hasil retain. |
| `/validasi` | Validasi | Halaman validasi/retain tambahan jika digunakan. |

## Endpoint Backend

Base URL backend mengikuti `PORT` di `backend/.env`.

Jika `PORT=5000`:

```text
http://localhost:5000/api
```

Jika `PORT=3000`:

```text
http://localhost:3000/api
```

### Health

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/health` | Mengecek apakah backend berjalan. |

Response:

```json
{
  "status": "ok",
  "message": "Backend Sistem Pakar Padi CBR berjalan"
}
```

### Master Data

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/master/symptoms` | Mengambil daftar gejala dari database. |

Contoh response:

```json
[
  {
    "id": "symptom-id",
    "code": "G01",
    "description": "Deskripsi gejala"
  }
]
```

Field aktual bisa lebih lengkap sesuai schema Prisma.

### Consultation

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `POST` | `/api/consultations` | Membuat sesi konsultasi baru. |
| `POST` | `/api/consultations/:id/symptoms` | Menyimpan gejala yang dipilih user. |
| `GET` | `/api/consultations/:id/diagnose` | Menjalankan CBR engine untuk konsultasi. |
| `POST` | `/api/consultations/:id/confirm` | Mengonfirmasi hasil diagnosis dan membuat kandidat kasus. |

#### POST `/api/consultations`

Request body: kosong.

Contoh response:

```json
{
  "consultationId": "consultation-id",
  "status": "DRAFT"
}
```

#### POST `/api/consultations/:id/symptoms`

Request body:

```json
{
  "symptoms": ["symptom-id-1", "symptom-id-2"]
}
```

Catatan:

- Gunakan `id` gejala dari endpoint `/api/master/symptoms`, bukan kode gejala.
- Minimal 1 gejala.
- Tidak boleh ada duplikasi ID gejala.

Contoh response:

```json
{
  "message": "Symptoms saved successfully"
}
```

#### GET `/api/consultations/:id/diagnose`

Contoh response:

```json
{
  "consultationId": "consultation-id",
  "status": "COMPLETED",
  "diagnosis": {
    "disease": {
      "id": "disease-id",
      "code": "HP01",
      "name": "Nama penyakit"
    },
    "case": {
      "id": "casebase-id",
      "code": "K01",
      "title": "Nama case",
      "description": null,
      "solutions": [
        "Contoh rekomendasi pengendalian"
      ]
    },
    "similarity": 85,
    "status": "STRONG_DIAGNOSIS",
    "ambiguous": false
  },
  "topMatches": [
    {
      "caseCode": "K01",
      "diseaseName": "Nama penyakit",
      "similarity": 85
    }
  ]
}
```

Status diagnosis yang mungkin digunakan oleh engine:

- `STRONG_DIAGNOSIS`
- `POSSIBLE_DIAGNOSIS`
- `NO_DIAGNOSIS`
- status lain sesuai implementasi service CBR jika ditambahkan.

#### POST `/api/consultations/:id/confirm`

Request body: kosong.

Endpoint ini hanya bisa dipakai setelah konsultasi berstatus `COMPLETED` dan sudah memiliki diagnosis.

Contoh response:

```json
{
  "message": "Diagnosis confirmed and saved as candidate case",
  "candidateId": "candidate-id",
  "status": "UNDER_REVIEW"
}
```

Jika konsultasi sudah pernah dikonfirmasi, backend mengembalikan status `409`.

### Admin/Pakar

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/admin/candidates` | Mengambil daftar kandidat kasus. |
| `GET` | `/api/admin/candidates/:id` | Mengambil detail kandidat kasus. |
| `POST` | `/api/admin/candidates/:id/approve` | Menyetujui kandidat menjadi `CaseBase`. |
| `POST` | `/api/admin/candidates/:id/reject` | Menolak kandidat kasus. |

#### GET `/api/admin/candidates`

Contoh response:

```json
[
  {
    "id": "candidate-id",
    "code": "CC-0001",
    "disease": "HP01 - Nama penyakit",
    "symptomCount": 5,
    "status": "UNDER_REVIEW",
    "createdAt": "2026-06-05T00:00:00.000Z"
  }
]
```

#### GET `/api/admin/candidates/:id`

Mengembalikan detail kandidat, diagnosis terkait, konsultasi asal, dan gejala kandidat.

#### POST `/api/admin/candidates/:id/approve`

Request body: kosong.

Contoh response:

```json
{
  "message": "Candidate case approved and promoted to CaseBase",
  "caseId": "casebase-id",
  "code": "K14"
}
```

Catatan:

- Hanya kandidat berstatus `UNDER_REVIEW` yang bisa di-approve.
- Approval membuat data baru di `CaseBase`.
- Case baru mewarisi `solutions` dari case referensi penyakit yang sama jika tersedia.
- Status kandidat berubah menjadi `APPROVED`.

#### POST `/api/admin/candidates/:id/reject`

Request body: kosong.

Contoh response:

```json
{
  "message": "Candidate case rejected"
}
```

Catatan:

- Hanya kandidat berstatus `UNDER_REVIEW` yang bisa di-reject.
- Status kandidat berubah menjadi `REJECTED`.

## Endpoint yang Dipakai Frontend

Frontend memakai endpoint berikut melalui `frontend/src/lib/api-client.ts`:

| Fitur Frontend | Endpoint Backend |
| --- | --- |
| Status backend di beranda | `GET /api/health` |
| Daftar gejala di halaman diagnosa | `GET /api/master/symptoms` |
| Mulai konsultasi | `POST /api/consultations` |
| Simpan gejala | `POST /api/consultations/:id/symptoms` |
| Ambil hasil diagnosa | `GET /api/consultations/:id/diagnose` |
| Konfirmasi retain | `POST /api/consultations/:id/confirm` |
| Daftar kandidat admin | `GET /api/admin/candidates` |
| Detail kandidat admin | `GET /api/admin/candidates/:id` |
| Approve kandidat | `POST /api/admin/candidates/:id/approve` |
| Reject kandidat | `POST /api/admin/candidates/:id/reject` |

## Contoh Test API Manual

Ganti `<BASE_API>` sesuai port backend:

```text
<BASE_API> = http://localhost:5000/api
```

### 1. Cek backend

```bash
curl http://localhost:5000/api/health
```

### 2. Ambil daftar gejala

```bash
curl http://localhost:5000/api/master/symptoms
```

### 3. Buat konsultasi

```bash
curl -X POST http://localhost:5000/api/consultations
```

Ambil `consultationId` dari response.

### 4. Simpan gejala

```bash
curl -X POST http://localhost:5000/api/consultations/<consultationId>/symptoms \
  -H "Content-Type: application/json" \
  -d "{\"symptoms\":[\"symptom-id-1\",\"symptom-id-2\"]}"
```

### 5. Jalankan diagnosa

```bash
curl http://localhost:5000/api/consultations/<consultationId>/diagnose
```

### 6. Konfirmasi retain

```bash
curl -X POST http://localhost:5000/api/consultations/<consultationId>/confirm
```

### 7. Lihat kandidat admin

```bash
curl http://localhost:5000/api/admin/candidates
```

## Script yang Tersedia

### Backend

Jalankan di folder `backend`.

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan backend mode development dengan `tsx watch`. |
| `npm run build` | Compile TypeScript backend. |
| `npm run start` | Menjalankan hasil build dari `dist/server.js`. |
| `npm run prisma:generate` | Generate Prisma Client. |
| `npm run prisma:migrate` | Menjalankan `prisma migrate dev`. |
| `npm run prisma:studio` | Membuka Prisma Studio. |
| `npm run db:seed` | Menjalankan seed data awal. |

### Frontend

Jalankan di folder `frontend`.

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan frontend Vite development server. |
| `npm run build` | Build frontend production. |
| `npm run build:dev` | Build frontend mode development. |
| `npm run preview` | Preview hasil build frontend. |
| `npm run lint` | Menjalankan ESLint. |
| `npm run format` | Format kode dengan Prettier. |

## Troubleshooting

### Frontend terbuka, tetapi data gejala tidak muncul

Periksa:

1. Backend sudah berjalan.
2. `frontend/.env` memiliki `VITE_API_URL` yang sesuai dengan port backend.
3. Endpoint `GET /api/master/symptoms` bisa diakses.

Contoh:

```bash
curl http://localhost:5000/api/master/symptoms
```

Jika backend memakai port `3000`, gunakan:

```bash
curl http://localhost:3000/api/master/symptoms
```

### Health check gagal

Periksa backend:

```bash
cd backend
npm run dev
```

Lalu cek:

```bash
curl http://localhost:5000/api/health
```

Sesuaikan port jika `PORT` di `backend/.env` bukan `5000`.

### Prisma gagal connect ke Neon

Periksa:

- `DATABASE_URL` benar.
- `sslmode=require` ada di connection string Neon.
- IP/jaringan tidak memblokir koneksi keluar.
- Database Neon aktif.

Jangan menampilkan credential database saat meminta bantuan debugging. Ganti secret dengan `<REDACTED>`.

### Data kosong

Jalankan seed:

```bash
cd backend
npm run db:seed
```

Lalu cek dengan Prisma Studio:

```bash
npm run prisma:studio
```
