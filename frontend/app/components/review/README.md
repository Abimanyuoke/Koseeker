# Review Component Documentation

Komponen review yang lengkap untuk menampilkan dan mengelola review kos berdasarkan data dari database.

## Features

- ✅ Menampilkan daftar review dari database
- ✅ Form untuk menambah review baru
- ✅ Validasi user authentication
- ✅ Cek apakah user sudah pernah review
- ✅ Loading states dan error handling
- ✅ Responsive design
- ✅ Integration dengan backend API
- ✅ Balasan dari pemilik kos (demo)

## Components

### 1. ReviewContainer (Main Component)
Komponen utama yang menggabungkan semua functionality review.

```tsx
import ReviewContainer from '@/app/components/review/ReviewContainer';

<ReviewContainer 
    kosId={1}           // Required: ID kos
    userId={userId}     // Optional: ID user yang login
    showForm={false}    // Optional: Show form by default
/>
```

### 2. ReviewComponent
Komponen untuk menampilkan daftar review.

```tsx
import { ReviewComponent } from '@/app/components/review';

<ReviewComponent 
    reviews={reviews}   // Array of IReview
    kosId={kosId}      // Optional: ID kos
/>
```

### 3. ReviewForm
Form untuk menambah review baru.

```tsx
import { ReviewForm } from '@/app/components/review';

<ReviewForm 
    kosId={kosId}
    userId={userId}
    onSubmit={(data) => console.log(data)}
    onCancel={() => setShowForm(false)}
/>
```

### 4. useReviews Hook
Custom hook untuk mengelola state review.

```tsx
import { useReviews } from '@/app/components/review';

const { 
    reviews, 
    loading, 
    error, 
    userHasReviewed,
    createReview,
    updateReview,
    deleteReview 
} = useReviews({ kosId, userId });
```

## Database Schema

Komponen ini menggunakan tabel `Review` dengan struktur:

```sql
CREATE TABLE Review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) UNIQUE,
    kosId INT,
    userId INT,
    comment TEXT,
    createdAt DATETIME,
    updatedAt DATETIME,
    FOREIGN KEY (kosId) REFERENCES Kos(id),
    FOREIGN KEY (userId) REFERENCES User(id)
);
```

## API Endpoints

### GET /review/kos/:kosId
Mengambil semua review untuk kos tertentu.

**Response:**
```json
{
    "status": true,
    "data": {
        "reviews": [
            {
                "id": 1,
                "uuid": "...",
                "kosId": 1,
                "userId": 1,
                "comment": "Review comment",
                "createdAt": "2024-01-01T00:00:00.000Z",
                "updatedAt": "2024-01-01T00:00:00.000Z",
                "user": {
                    "id": 1,
                    "name": "User Name",
                    "profile_picture": "profile.jpg"
                }
            }
        ],
        "count": 1
    }
}
```

### POST /review
Membuat review baru.

**Request Body:**
```json
{
    "kosId": 1,
    "userId": 1,
    "comment": "Review comment"
}
```

### PUT /review/:id
Update review existing.

**Request Body:**
```json
{
    "comment": "Updated comment"
}
```

### DELETE /review/:id
Hapus review.

### GET /review/check/:kosId/:userId
Cek apakah user sudah pernah review kos.

## Usage Examples

### Basic Usage
```tsx
// Di halaman detail kos
import ReviewContainer from '@/app/components/review/ReviewContainer';

const KosDetailPage = ({ kosId, userId }) => {
    return (
        <div>
            {/* Kos information */}
            <div>...</div>
            
            {/* Reviews section */}
            <ReviewContainer 
                kosId={kosId}
                userId={userId}
            />
        </div>
    );
};
```

### Advanced Usage with Custom Hook
```tsx
import { useReviews } from '@/app/components/review';

const CustomReviewComponent = ({ kosId, userId }) => {
    const { 
        reviews, 
        loading, 
        createReview 
    } = useReviews({ kosId, userId });

    const handleSubmit = async (comment) => {
        try {
            await createReview({ kosId, userId, comment });
            alert('Review added!');
        } catch (error) {
            alert('Error adding review');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {reviews.map(review => (
                <div key={review.id}>{review.comment}</div>
            ))}
        </div>
    );
};
```

## Styling

Komponen menggunakan Tailwind CSS dengan design system yang konsisten:
- Primary color: Green (#1baa56)
- Background: White
- Text: Gray variants
- Responsive breakpoints: sm, md, lg, xl

## Error Handling

- Network errors
- API errors
- Authentication errors
- Validation errors
- Loading states

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader friendly
- Focus management

## Performance

- Lazy loading
- Efficient re-renders
- Optimistic updates
- Error boundaries
- Memory leak prevention
