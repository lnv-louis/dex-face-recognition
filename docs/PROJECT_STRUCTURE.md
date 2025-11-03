# Dex - Project Structure

## Overview
Real-time face recognition app for networking at hackathon events. Built with Next.js, Convex, and Python face recognition.

## Directory Structure

```
/dex
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout with Convex provider
│   ├── page.tsx               # Main dashboard (camera + profile display)
│   ├── providers.tsx          # Convex client provider
│   ├── globals.css            # Dark theme styles
│   └── upload/                # Admin upload page
│       └── page.tsx           # Upload Apify JSON
│
├── components/                 # React components
│   ├── LiveCamera.tsx         # Continuous video feed with auto-capture
│   └── ProfileCard.tsx        # Animated profile display
│
├── convex/                     # Convex backend
│   ├── schema.ts              # Database schema (attendees, faceEmbeddings)
│   ├── attendees.ts           # CRUD functions for profiles
│   └── _generated/            # Auto-generated Convex files
│
├── lib/                        # Utilities (to be created)
│   ├── types.ts               # TypeScript interfaces
│   └── utils.ts               # Helper functions
│
├── python-service/            # Face recognition microservice (to be created)
│   ├── app.py                 # Flask API server
│   ├── embeddings.py          # Face embedding computation
│   └── requirements.txt       # Python dependencies
│
├── docs/                       # Documentation
│   ├── PROJECT_STRUCTURE.md   # This file
│   ├── CHANGELOG.md           # Development progress
│   └── SETUP.md               # Setup instructions (to be created)
│
└── public/                     # Static assets
```

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling (dark theme: black & white only)
- **Framer Motion** - Profile card animations
- **GSAP** - Camera scanning effects
- **Lucide React** - Icons

### Backend
- **Convex** - Real-time database and serverless functions
  - `attendees` table: Stores LinkedIn profiles from Apify
  - `faceEmbeddings` table: Pre-computed face embeddings for fast matching
  - Real-time subscriptions for instant updates

### Face Recognition
- **Python Flask** - Face recognition microservice
- **DeepFace** - Face recognition library
- **Facenet512** - Fast and accurate face model
- **OpenCV** - Image processing

## Data Flow

1. **Setup Phase**:
   ```
   Apify LinkedIn Scraper (50 profiles)
   → output.json
   → Upload page (paste JSON)
   → Convex attendees table
   → Python service computes face embeddings
   → Convex faceEmbeddings table
   ```

2. **Recognition Phase**:
   ```
   Live Camera Feed (auto-capture every 3s)
   → Base64 image
   → Python Flask API (/match-face)
   → Compare with stored embeddings
   → Return matched profile (<5s)
   → Display in ProfileCard component
   ```

## Key Features

### 1. Live Camera Feed
- Continuous video stream from MacBook camera
- Auto-capture frame every 3 seconds when scanning enabled
- Visual scanning overlay with animated effects
- Handles camera permissions and errors gracefully

### 2. Face Recognition
- Pre-computed embeddings for all 50 attendees
- Fast vector similarity search (<5s target)
- Facenet512 model for balance of speed/accuracy
- Confidence threshold filtering

### 3. Profile Display
- Animated slide-in from right (Framer Motion)
- Sections: Photo, Headline, About, Experience, Education, Skills, Awards
- Smooth scrolling for long profiles
- High-quality profile images from LinkedIn

### 4. Dark Theme
- Pure black (#000) background
- White (#FFF) text
- Gray borders (#333, #666, #999)
- No accent colors
- High contrast for readability

## Database Schema

### attendees
```typescript
{
  linkedinUrl: string
  fullName: string
  publicIdentifier: string  // Indexed
  headline?: string
  profilePic?: string
  profilePicHighQuality?: string
  about?: string
  connections?: number
  // ... other fields
  rawProfile: string  // Full Apify JSON
}
```

### faceEmbeddings
```typescript
{
  attendeeId: Id<"attendees">
  publicIdentifier: string  // Indexed
  embedding: string  // JSON array of floats
  imageUrl: string
  computedAt: number
}
```

## API Endpoints

### Convex Functions
- `uploadAttendees(profiles)` - Bulk upload from Apify
- `getAllAttendees()` - Get all profiles
- `getAttendeeByIdentifier(id)` - Get single profile
- `getAttendeeCount()` - Count total profiles

### Python Flask API (Port 5000)
- `POST /match-face` - Match face from image
  - Input: `{ imageData: base64 }`
  - Output: `{ matched_profile, confidence, match_time }`
- `POST /compute-embeddings` - Pre-compute embeddings
  - Input: `{ profiles: [...] }`
  - Output: `{ computed: number, failed: number }`

## Development Status

✅ Completed:
- Convex schema and backend functions
- Upload page for Apify data
- LiveCamera component with auto-capture
- ProfileCard component with animations
- Dark theme styling
- Project structure

🚧 In Progress:
- Python face recognition service
- Main dashboard integration
- Convex login and deployment

⏳ Todo:
- Face embedding computation
- Face matching logic
- End-to-end testing
- Performance optimization

