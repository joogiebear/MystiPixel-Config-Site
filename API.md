# ConfigHub API Documentation

Complete API reference for all endpoints in ConfigHub.

## Table of Contents

- [Authentication](#authentication)
- [Configs](#configs)
- [Categories](#categories)
- [Tags](#tags)
- [Ratings](#ratings)
- [Comments](#comments)
- [Favorites](#favorites)
- [Upload](#upload)

---

## Authentication

All endpoints marked with 🔒 require authentication. Currently using placeholder user IDs (`TEMP_USER_ID`). Replace with actual session data from NextAuth.

### Getting User Session

```typescript
import { getServerSession } from 'next-auth'
const session = await getServerSession()
const userId = session?.user?.id
```

---

## Configs

### GET `/api/configs`

Browse and search configs with filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 12) - Items per page
- `search` (string) - Search in title/description
- `category` (string) - Filter by category slug
- `modLoader` (string) - Filter by mod loader (FORGE, FABRIC, NEOFORGE, QUILT, VANILLA)
- `isPremium` (boolean) - Filter by premium status
- `sort` (string) - Sort by: `popular`, `recent`, `rating`, `downloads`

**Example:**
```bash
GET /api/configs?page=1&limit=12&category=performance&modLoader=FORGE&sort=popular
```

**Response:**
```json
{
  "configs": [
    {
      "id": "uuid",
      "title": "Config Title",
      "description": "Description...",
      "author": {
        "id": "uuid",
        "name": "Author Name",
        "image": "url"
      },
      "category": {
        "id": "uuid",
        "name": "Performance",
        "slug": "performance",
        "icon": "⚡"
      },
      "tags": [...],
      "modLoader": "FORGE",
      "mcVersion": "1.20.1",
      "isPremium": false,
      "price": null,
      "downloads": 1250,
      "views": 5000,
      "averageRating": 4.5,
      "totalRatings": 10,
      "downloadCount": 1250,
      "favoriteCount": 50,
      "commentCount": 25
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST `/api/configs` 🔒

Create a new config.

**Request Body:**
```json
{
  "title": "Config Title",
  "description": "Description...",
  "content": "Config content...",
  "categoryId": "uuid",
  "modLoader": "FORGE",
  "mcVersion": "1.20.1",
  "tagIds": ["uuid1", "uuid2"],
  "isPremium": false,
  "price": null,
  "fileUrl": "/uploads/configs/file.zip"
}
```

**Response:** Created config object (201)

### GET `/api/configs/[id]`

Get single config details.

**Response:**
```json
{
  "id": "uuid",
  "title": "Config Title",
  "description": "Description...",
  "content": "Full content...",
  "author": {
    "id": "uuid",
    "name": "Author",
    "image": "url",
    "bio": "Bio...",
    "_count": { "configs": 10 }
  },
  "category": {...},
  "tags": [...],
  "ratings": [...],
  "comments": [...],
  "averageRating": 4.5,
  "ratingDistribution": {
    "5": 50,
    "4": 30,
    "3": 10,
    "2": 5,
    "1": 5
  },
  "downloadCount": 1250
}
```

### PATCH `/api/configs/[id]` 🔒

Update a config.

**Request Body:** Partial config object

### DELETE `/api/configs/[id]` 🔒

Delete a config.

---

## Categories

### GET `/api/categories`

Get all categories.

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Performance",
      "slug": "performance",
      "description": "Boost your FPS",
      "icon": "⚡",
      "configCount": 45
    }
  ]
}
```

---

## Tags

### GET `/api/tags`

Get all tags.

**Response:**
```json
{
  "tags": [
    {
      "id": "uuid",
      "name": "optimization",
      "slug": "optimization",
      "configCount": 30
    }
  ]
}
```

---

## Ratings

### GET `/api/configs/[id]/ratings`

Get all ratings for a config.

**Response:**
```json
{
  "ratings": [
    {
      "id": "uuid",
      "rating": 5,
      "review": "Great config!",
      "user": {
        "id": "uuid",
        "name": "User",
        "image": "url"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "average": 4.5,
  "total": 100,
  "distribution": {
    "5": 50,
    "4": 30,
    "3": 10,
    "2": 5,
    "1": 5
  }
}
```

### POST `/api/configs/[id]/ratings` 🔒

Create or update a rating.

**Request Body:**
```json
{
  "rating": 5,
  "review": "Great config!"
}
```

**Response:** Created/updated rating (201)

### DELETE `/api/configs/[id]/ratings` 🔒

Delete your rating for a config.

---

## Comments

### GET `/api/configs/[id]/comments`

Get comments for a config.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Great config!",
      "user": {
        "id": "uuid",
        "name": "User",
        "image": "url"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST `/api/configs/[id]/comments` 🔒

Create a comment.

**Request Body:**
```json
{
  "content": "Great config!"
}
```

**Validation:**
- Content required
- Max 1000 characters

**Response:** Created comment (201)

### PATCH `/api/comments/[commentId]` 🔒

Update a comment.

**Request Body:**
```json
{
  "content": "Updated comment"
}
```

### DELETE `/api/comments/[commentId]` 🔒

Delete a comment.

---

## Favorites

### GET `/api/favorites` 🔒

Get user's favorite configs.

**Response:**
```json
{
  "favorites": [
    {
      "id": "uuid",
      "addedAt": "2024-01-01T00:00:00Z",
      "config": {
        "id": "uuid",
        "title": "Config Title",
        "author": {...},
        "category": {...}
      }
    }
  ]
}
```

### POST `/api/favorites` 🔒

Add a config to favorites.

**Request Body:**
```json
{
  "configId": "uuid"
}
```

**Response:** Created favorite (201)

### DELETE `/api/favorites?configId=uuid` 🔒

Remove a config from favorites.

**Query Parameters:**
- `configId` (required) - Config ID to unfavorite

### GET `/api/favorites/[configId]` 🔒

Check if a config is favorited.

**Response:**
```json
{
  "isFavorited": true,
  "favoriteId": "uuid"
}
```

---

## Upload

### POST `/api/upload` 🔒

Upload a config file.

**Request:** `multipart/form-data`
- `file` - File to upload

**Allowed Extensions:**
- `.zip`, `.cfg`, `.conf`, `.json`, `.toml`, `.txt`, `.yml`, `.yaml`

**Max Size:** 10MB

**Response:**
```json
{
  "success": true,
  "fileUrl": "/uploads/configs/timestamp-random-filename.zip",
  "fileName": "original-name.zip",
  "fileSize": 1024,
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

**Example (Client):**
```typescript
const formData = new FormData()
formData.append('file', fileInput.files[0])

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const data = await response.json()
console.log(data.fileUrl) // Use this URL when creating config
```

---

## Download

### POST `/api/configs/[id]/download`

Download a config file.

**Note:** Premium configs require purchase verification (TODO)

**Response:** File download (binary)

**Example (Client):**
```typescript
// Trigger download
window.location.href = `/api/configs/${configId}/download`

// Or fetch and create download link
const response = await fetch(`/api/configs/${configId}/download`, {
  method: 'POST'
})
const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'config.zip'
a.click()
```

### GET `/api/configs/[id]/download`

Get download info.

**Response:**
```json
{
  "downloadUrl": "/api/configs/uuid/download",
  "fileName": "Config Title",
  "isPremium": false
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication TODO

Currently all authenticated endpoints use `TEMP_USER_ID` placeholder. To implement:

1. **Add authentication check:**
```typescript
import { getServerSession } from 'next-auth'

const session = await getServerSession()
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const userId = session.user.id
```

2. **Add authorization check:**
```typescript
// For update/delete operations
const config = await prisma.config.findUnique({ where: { id } })
if (config.authorId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

3. **Update these files:**
- `app/api/configs/route.ts`
- `app/api/configs/[id]/route.ts`
- `app/api/configs/[id]/ratings/route.ts`
- `app/api/configs/[id]/comments/route.ts`
- `app/api/comments/[commentId]/route.ts`
- `app/api/favorites/route.ts`
- `app/api/favorites/[configId]/route.ts`
- `app/api/upload/route.ts`

---

## Testing with Postman/Thunder Client

1. **Start dev server:**
```bash
npm run dev
```

2. **Seed database:**
```bash
npm run db:seed
```

3. **Test endpoints:**
```bash
# Browse configs
GET http://localhost:3000/api/configs

# Search configs
GET http://localhost:3000/api/configs?search=performance&sort=popular

# Get single config
GET http://localhost:3000/api/configs/{id}

# Get categories
GET http://localhost:3000/api/categories
```

---

## Rate Limiting (TODO)

Consider adding rate limiting for production:

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

Apply to sensitive endpoints like upload, comment, rating creation.
