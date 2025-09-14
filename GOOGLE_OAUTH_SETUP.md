# Setup Google OAuth untuk Login

## Error: Cannot destructure property 'GET' - FIXED ✅

Error ini sudah diperbaiki dengan konfigurasi NextAuth v4 yang benar.

## Langkah-langkah Setup Google OAuth:

### 1. Google Cloud Console Setup
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan **Google+ API** dan **Google OAuth2 API**
4. Pergi ke **"Credentials"** di menu APIs & Services
5. Klik **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
6. Pilih **"Web application"**
7. Set name: "Koseeker Web App"
8. Tambahkan **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
9. **Simpan** dan copy **Client ID** dan **Client Secret**

### 2. Environment Variables Setup
Edit file `frontend/.env.local` dan ganti nilai placeholder:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=generate-random-32-char-string-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration (dari Google Console)
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here

# API Configuration
NEXT_PUBLIC_BASE_API_URL=http://localhost:5000
```

### 3. Generate NEXTAUTH_SECRET
Jalankan command ini untuk generate secret:
```bash
openssl rand -base64 32
```
Atau gunakan online generator: https://generate-secret.vercel.app/32

### 4. Testing
1. **Start backend**: `cd backend && npm run dev`
2. **Start frontend**: `cd frontend && npm run dev`
3. Buka `http://localhost:3000/auth/login`
4. Klik tombol **"Continue with Google"**

## Troubleshooting

### Error: Cannot destructure property 'GET'
✅ **FIXED** - Updated to NextAuth v4 configuration

### Error: Invalid client_id
- Pastikan `GOOGLE_CLIENT_ID` sudah benar
- Pastikan tidak ada extra spaces di environment variables

### Error: redirect_uri_mismatch
- Pastikan redirect URI di Google Console: `http://localhost:3000/api/auth/callback/google`
- Pastikan tidak ada trailing slash

### Error: Backend connection
- Pastikan backend berjalan di `http://localhost:5000`
- Cek endpoint `/user/google-auth` tersedia

## File Structure yang Diupdate:
```
frontend/
├── lib/nextauth.ts (NextAuth configuration)
├── app/api/auth/[...nextauth]/route.ts (API routes)
├── app/providers.tsx (Session provider)
├── app/layout.tsx (Provider wrapper)
└── .env.local (Environment variables)

backend/
├── src/controllers/userController.ts (Added googleAuthentication)
└── src/routers/userRoute.ts (Added /google-auth route)
```