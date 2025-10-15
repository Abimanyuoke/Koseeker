# AreaKosPage Component

Komponen reusable LENGKAP untuk menampilkan daftar kos berdasarkan area/kota dengan semua fitur advanced!

## 🎯 Fitur Lengkap

✅ **Multiple Filters**
- Filter Kalender (minggu/bulan/tahun)
- Filter Gender (Putra/Putri/Campur)
- Filter Harga (5 range harga)
- Filter Kampus (dynamic dari database)

✅ **Search Integration**
- Support search query dari URL
- Search berdasarkan nama, alamat, kampus

✅ **Advanced Display**
- PromoSection untuk setiap kota
- PriceDisplay dengan discount
- Results count
- Dynamic kampus options

✅ **Responsive & UX**
- Loading state dengan spinner
- Error handling
- Empty state
- 4-column responsive grid

## Penggunaan

### Import Component
```tsx
import AreaKosPage from "../../components/area_kos/index";
```

### Contoh Implementasi

#### 1. Basic Usage (hanya kota)
```tsx
const BandungKosPage = () => {
    return <AreaKosPage kota="Bandung" />;
};
```

#### 2. With Custom Title & Description
```tsx
const JakartaKosPage = () => {
    return (
        <AreaKosPage 
            kota="Jakarta"
            title="Kos di Jakarta"
            description="Temukan kos terbaik di area Jakarta sesuai kebutuhan Anda"
        />
    );
};
```

#### 3. Multiple Cities
```tsx
// Surabaya
const SurabayaKosPage = () => {
    return (
        <AreaKosPage 
            kota="Surabaya"
            title="Kos di Surabaya"
            description="Temukan kos terbaik di area Surabaya sesuai kebutuhan Anda"
        />
    );
};

// Yogyakarta
const YogyakartaKosPage = () => {
    return (
        <AreaKosPage 
            kota="Yogyakarta"
            title="Kos di Yogyakarta"
            description="Temukan kos terbaik di area Yogyakarta sesuai kebutuhan Anda"
        />
    );
};

// Malang
const MalangKosPage = () => {
    return (
        <AreaKosPage 
            kota="Malang"
            title="Kos di Malang"
            description="Temukan kos terbaik di area Malang sesuai kebutuhan Anda"
        />
    );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `kota` | `string` | ✅ Yes | Nama kota yang akan ditampilkan kosnya |
| `title` | `string` | ❌ No | Judul halaman (default: "Kos di {kota}") |
| `description` | `string` | ❌ No | Deskripsi halaman (default: "Temukan kos terbaik di area {kota} sesuai kebutuhan Anda") |

## Features (SAMA dengan Jakarta!)

✅ **Multiple Filters**
- Filter Kalender (minggu/bulan/tahun)
- Filter Gender (Putra/Putri/Campur)
- Filter Harga (5 range: <500k, 500k-1jt, 1jt-2jt, 2jt-3jt, >3jt)
- Filter Kampus (dynamic, auto-populate dari data)

✅ **Search & Navigation**
- URL search params support (?search=...)
- Search berdasarkan: nama kos, alamat, kampus
- Results count dengan filter info

✅ **Advanced Display**
- **PromoSection** component (full-width banner)
- **PriceDisplay** component (with discount & strike-through)
- Dynamic kampus dropdown
- Filter status indicator

✅ **UX & Design**
- Responsive grid (1-4 columns)
- Loading spinner dengan text
- Error handling dengan red alert
- Empty state dengan emoji & message
- Hover effects & transitions
- Badge info (kalender, gender, kampus)

✅ **Data Management**
- Frontend price filtering
- Frontend search filtering
- Backend API filtering (kalender, gender, kampus)
- Auto-update kampus options
- Smart data aggregation

## Struktur File

```
frontend/
  app/
    components/
      area_kos/
        index.tsx            ← Component utama (FULL FEATURED!)
      price/
        PriceDisplay.tsx     ← Component harga dengan discount
      promo/
        PromoSection.tsx     ← Component promo banner
      select.tsx             ← Component select/dropdown
    area/
      bandung/
        page.tsx             ← 10 lines aja! (uses component)
      jakarta/
        page.tsx             ← Custom implementation (reference)
      surabaya/
        page.tsx             ← Bisa update pakai component
      yogyakarta/
        page.tsx             ← Bisa update pakai component
      malang/
        page.tsx             ← Bisa update pakai component
```

## API Integration

Component ini menggunakan endpoint:
```
GET /kos?kota={kotaName}&kalender={kalenderValue}
```

## Styling

Component menggunakan Tailwind CSS dengan tema:
- Background: `bg-gray-50`
- Card: `bg-white` dengan `shadow-sm` dan `hover:shadow-md`
- Primary Color: `blue-600`
- Grid: Responsive dari 1 kolom (mobile) hingga 4 kolom (xl)

## Keuntungan Menggunakan Component Ini

1. **DRY (Don't Repeat Yourself)** - Tidak perlu menulis kode yang sama berulang kali
2. **Maintainability** - Perubahan di satu tempat akan berlaku untuk semua area
3. **Consistency** - Tampilan dan behavior konsisten di semua area
4. **Scalability** - Mudah menambahkan area baru hanya dengan 1 file kecil
5. **Type Safety** - Full TypeScript support dengan props validation

## Menambahkan Area Baru

Untuk menambahkan area baru, cukup buat file baru di folder `app/area/{nama-kota}/page.tsx`:

```tsx
import AreaKosPage from "../../components/AreaKosPage";

const SemanragKosPage = () => {
    return (
        <AreaKosPage 
            kota="Semarang"
            title="Kos di Semarang"
            description="Temukan kos terbaik di area Semarang sesuai kebutuhan Anda"
        />
    );
};

export default SemarangKosPage;
```

Selesai! 🎉
