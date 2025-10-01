# Kos Image Upload API Documentation

API untuk mengelola gambar kos secara terpisah dari data kos utama.

## Base URL
```
http://localhost:5000/kos-images
```

## Endpoints

### 1. Get All Images for a Kos
**GET** `/kos/:kosId`

Mendapatkan semua gambar untuk kos tertentu.

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "uuid": "...",
      "kosId": 1,
      "file": "1234567890-image.jpg",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "message": "Kos images retrieved successfully"
}
```

### 2. Get Image by ID
**GET** `/:id`

Mendapatkan detail gambar berdasarkan ID.

**Response:**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "uuid": "...",
    "kosId": 1,
    "file": "1234567890-image.jpg",
    "kos": {
      "id": 1,
      "name": "Kos Mahasiswa Sejahtera",
      "uuid": "..."
    }
  },
  "message": "Image retrieved successfully"
}
```

### 3. Upload Single Image
**POST** `/upload`

Upload satu gambar ke kos.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `kosId`: number (required)
- `image`: file (required) - max 100MB, formats: jpg, jpeg, png

**Response:**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "uuid": "...",
    "kosId": 1,
    "file": "1234567890-image.jpg",
    "kos": {
      "id": 1,
      "name": "Kos Mahasiswa Sejahtera",
      "uuid": "..."
    }
  },
  "message": "Image uploaded successfully"
}
```

**Example using Postman:**
1. Method: POST
2. URL: `http://localhost:5000/kos-images/upload`
3. Headers: 
   - Authorization: Bearer YOUR_TOKEN
4. Body → form-data:
   - kosId: 1
   - image: [Select File]

### 4. Upload Multiple Images
**POST** `/upload-multiple`

Upload multiple gambar sekaligus (max 10 images).

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `kosId`: number (required)
- `images`: file[] (required) - max 10 files, each max 100MB

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "uuid": "...",
      "kosId": 1,
      "file": "1234567890-image1.jpg",
      "kos": {...}
    },
    {
      "id": 2,
      "uuid": "...",
      "kosId": 1,
      "file": "1234567891-image2.jpg",
      "kos": {...}
    }
  ],
  "message": "2 images uploaded successfully"
}
```

**Example using Postman:**
1. Method: POST
2. URL: `http://localhost:5000/kos-images/upload-multiple`
3. Headers: 
   - Authorization: Bearer YOUR_TOKEN
4. Body → form-data:
   - kosId: 1
   - images: [Select Multiple Files]

### 5. Delete Single Image
**DELETE** `/:id`

Hapus satu gambar berdasarkan ID.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "uuid": "...",
    "kosId": 1,
    "file": "1234567890-image.jpg"
  },
  "message": "Image deleted successfully"
}
```

### 6. Delete Multiple Images
**DELETE** `/kos/:kosId/multiple`

Hapus multiple gambar sekaligus untuk kos tertentu.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body (JSON):**
```json
{
  "imageIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "deletedCount": 3
  },
  "message": "3 images deleted successfully"
}
```

## Authorization

Semua endpoint upload dan delete memerlukan:
- Token JWT di header Authorization
- Role: `owner` atau `superadmin`

## Error Responses

### 400 Bad Request
```json
{
  "status": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "status": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "status": false,
  "message": "Kos not found / Image not found"
}
```

### 500 Internal Server Error
```json
{
  "status": false,
  "message": "There is an error: ..."
}
```

## Notes

- Gambar disimpan di folder: `backend/public/kos_picture/`
- Format file yang diperbolehkan: JPG, JPEG, PNG
- Ukuran maksimal file: 100MB
- Maksimal upload sekaligus: 10 gambar
- Gambar yang dihapus akan otomatis terhapus dari storage
- Jika kos dihapus, gambar akan otomatis terhapus (CASCADE)

## Image URL

Untuk menampilkan gambar di frontend:
```
http://localhost:5000/kos_picture/{filename}
```

Example:
```
http://localhost:5000/kos_picture/1234567890-image.jpg
```
