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
# Sistem Pakar Diagnosis Hama dan Penyakit Tanaman Padi (Metode CBR)

Sistem pakar ini dirancang untuk mendiagnosa hama dan penyakit pada tanaman padi menggunakan metode **Case-Based Reasoning (CBR)**. Sistem ini tidak hanya memberikan diagnosa berdasarkan kemiripan gejala, tetapi juga memiliki kemampuan untuk "belajar" dengan menyimpan kasus baru melalui validasi pakar.

## 🚀 Alur Kerja Sistem (Metodologi CBR)

Sistem mengimplementasikan siklus lengkap CBR:
1.  **Retrieve**: Mengambil seluruh basis kasus (`CaseBase`) dari database yang memiliki kemiripan gejala dengan input user.
2.  **Reuse**: Menghitung nilai kemiripan menggunakan algoritma **Weighted Similarity**.
3.  **Revise**: Memberikan klasifikasi diagnosa (*Strong*, *Possible*, atau *No Diagnosis*) dan mendeteksi ambiguitas jika skor antar peringkat terlalu dekat.
4.  **Retain**: Menyimpan hasil konsultasi yang dikonfirmasi user sebagai `CandidateCase`, yang kemudian dapat di-*Approve* oleh Pakar untuk menjadi basis pengetahuan baru permanen.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL.
- **Frontend**: React, TypeScript, Vite, TailwindCSS.
- **Inference Engine**: Custom CBR Engine (Weighted Similarity).

---

## 📡 Daftar API Endpoints

Base URL: `http://localhost:5000/api`

### Kelompok Konsultasi (User)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/consultations` | Membuat sesi konsultasi baru. |
| `POST` | `/consultations/:id/symptoms` | Menyimpan daftar ID Gejala yang dipilih user. |
| `GET` | `/consultations/:id/diagnose` | Menjalankan mesin CBR untuk hasil diagnosa. |
| `POST` | `/consultations/:id/confirm` | Konfirmasi diagnosa (Retain) -> Masuk ke antrean admin. |

### Kelompok Admin (Pakar)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/admin/candidates` | Melihat daftar kandidat kasus baru yang menunggu review. |
| `GET` | `/admin/candidates/:id` | Melihat detail gejala dan info konsultasi dari satu kandidat. |
| `POST` | `/admin/candidates/:id/approve` | Setujui kandidat -> Menjadi `CaseBase` permanen (Sistem Belajar). |
| `POST` | `/admin/candidates/:id/reject` | Tolak kandidat kasus. |

### Utility
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/health` | Cek status kesehatan server backend. |

---

## 🛡️ Fitur Integritas Data (Hardening)

- **Duplicate Protection**: Satu konsultasi hanya bisa dikonfirmasi satu kali untuk mencegah duplikasi pengetahuan.
- **Robust Code Generator**: Kode `C-xxxx` (Konsultasi), `CC-xxxx` (Kandidat), dan `Kxx` (Kasus Utama) di-generate menggunakan logika *Max+1* untuk menjamin keunikan.
- **Strict Status Transition**: Alur status kandidat yang kaku (`UNDER_REVIEW` -> `APPROVED`/`REJECTED`) untuk menjaga kualitas data.
- **Atomic Transactions**: Proses *Approval* dilakukan secara atomik; pembuatan basis kasus baru dan pembaruan status kandidat harus berhasil keduanya atau gagal keduanya.

---

## 🏃 Cara Menjalankan Sistem

### Prasyarat
- Node.js (v18+)
- PostgreSQL berjalan
- File `backend/.env` sudah terkonfigurasi (`DATABASE_URL`)

### Langkah-langkah
1. **Setup Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run dev
   ```
   *Server berjalan di port 5000.*

2. **Setup Database (Opsional)**:
   ```bash
   # Jalankan migrasi dan seeder awal
   npx prisma migrate dev
   npm run db:seed
   ```

3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🧪 Panduan Pengetesan API (Postman/Insomnia)

1. **Skenario Diagnosa**:
   - Panggil `POST /api/consultations` untuk dapat ID.
   - Panggil `POST /api/consultations/{id}/symptoms` dengan body `{"symptoms": ["uuid-1", "uuid-2"]}`.
   - Panggil `GET /api/consultations/{id}/diagnose` untuk melihat skor similarity.

2. **Skenario Retain (Sistem Belajar)**:
   - Panggil `POST /api/consultations/{id}/confirm`.
   - Cek `GET /api/admin/candidates` untuk melihat kandidat yang masuk.
   - Panggil `POST /api/admin/candidates/{candidateId}/approve`.
   - **Hasil**: Sistem sekarang memiliki kasus baru. Jika diagnosa dijalankan lagi dengan gejala yang sama, akurasi akan meningkat.

---

## 🔍 Visualisasi Database
Gunakan Prisma Studio untuk melihat data secara tabel:
```bash
cd backend
npx prisma studio
```
Akses melalui `http://localhost:5555`.
