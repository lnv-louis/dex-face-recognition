# Dex - Development Changelog

## 2025-01-XX - Initial Development

### Phase 0: Data Extraction ✅
- Modified `opp_trace/extension/content.js` to extract LinkedIn URLs from Luma event
- Disabled API calls to old LumedIn dashboard
- Generated clean JSON output for Apify scraper
- Extracted 72 LinkedIn URLs from Cursor hackathon attendees
- Ran Apify Mass LinkedIn Profile Scraper on first 10 batches (50 profiles)
- Created `output.json` with 50 enriched LinkedIn profiles

### Phase 1: Project Setup ✅
**Dependencies Installed:**
- `convex` - Real-time database and backend
- `framer-motion` - Animation library
- `gsap` - Animation effects
- `lucide-react` - Icon library

**Project Structure:**
```
/dex
  /app          - Next.js pages
  /components   - React components
  /convex       - Backend functions
  /docs         - Documentation
  /lib          - Utilities (pending)
  /python-service - Face recognition (pending)
```

### Phase 2: Convex Backend ✅
**Created Files:**
- `convex/schema.ts` - Database schema
  - `attendees` table with indexes
  - `faceEmbeddings` table for fast matching
- `convex/attendees.ts` - Backend functions
  - `uploadAttendees()` - Bulk upload profiles
  - `getAllAttendees()` - Query all profiles
  - `getAttendeeByIdentifier()` - Query by ID
  - `getAttendeeCount()` - Count profiles
  - `clearAllAttendees()` - Admin function

**Schema Design:**
- Stores full Apify profile as `rawProfile` (JSON string)
- Indexed by `publicIdentifier` and `linkedinUrl`
- Separate table for face embeddings

### Phase 3: Frontend Components ✅
**1. Layout & Styling:**
- Updated `app/layout.tsx` with Convex provider
- Created `app/providers.tsx` for Convex client
- Updated `app/globals.css` with dark theme
  - Pure black background (#000)
  - White text (#FFF)
  - Gray borders and accents
  - Custom scrollbar styling

**2. Upload Page:**
- Created `app/upload/page.tsx`
- Features:
  - Paste Apify JSON output
  - Validate JSON structure
  - Upload to Convex
  - Display stats (count, inserted, skipped)
  - Clear all function for testing
  - Instructions and navigation

**3. LiveCamera Component:**
- Created `components/LiveCamera.tsx`
- Features:
  - Continuous video stream from webcam
  - Auto-capture every 3 seconds when scanning
  - Camera permission handling
  - Error states with retry
  - Scanning overlay with animations
  - Corner brackets and status text

**4. ProfileCard Component:**
- Created `components/ProfileCard.tsx`
- Features:
  - Framer Motion slide-in animation
  - Profile photo and header
  - About section
  - Experience with company logos
  - Education with school logos
  - Skills tags
  - Honors & Awards
  - Responsive scrolling
  - Dark theme styling

### Phase 4: Documentation ✅
**Created Files:**
- `docs/PROJECT_STRUCTURE.md` - Full project architecture
- `docs/CHANGELOG.md` - This file

### Phase 5: Convex Login & Setup ✅
**Completed:**
- Ran `npx convex dev` successfully
- Logged in with GitHub/Google account
- Created project: `dex-44d33`
- Generated `.env.local` with `NEXT_PUBLIC_CONVEX_URL`
- Created `convex/_generated/` folder
- All database tables and indexes created:
  - `attendees.by_linkedinUrl`
  - `attendees.by_publicIdentifier`
  - `faceEmbeddings.by_attendeeId`
  - `faceEmbeddings.by_publicIdentifier`

### Phase 6: Main Dashboard ✅
**Created:** `app/page.tsx`
**Features:**
- Split-screen layout (40% camera, 60% profile)
- Header with attendee count and upload link
- "Start/Stop Scanning" button
- LiveCamera component integration
- ProfileCard component with animations
- Status indicators (matching, errors, instructions)
- Empty state when no profile matched
- Real-time Convex query for attendee count

### Phase 7: Python Face Recognition Service ✅
**Created Files:**
- `python-service/app.py` - Flask server with face recognition
- `python-service/requirements.txt` - Python dependencies
- `python-service/load_profiles.py` - Helper script to load profiles

**Endpoints:**
- `GET /health` - Health check
- `POST /load-profiles` - Pre-compute embeddings for all profiles
- `POST /match-face` - Match face from camera capture

**Features:**
- Facenet512 model (fast & accurate)
- Cosine distance matching
- In-memory embedding storage for speed
- Confidence threshold: 0.40
- Downloads profile images and computes embeddings
- Returns matched profile with confidence score

### Phase 8: Documentation ✅
**Created Files:**
- `docs/PROJECT_STRUCTURE.md` - Complete architecture
- `docs/CHANGELOG.md` - This file
- `docs/SETUP.md` - Detailed setup instructions
- `docs/QUICKSTART.md` - Quick start guide for hackathon

## Next Steps (Final Integration)

### Immediate:
1. **Start Services:**
   - Terminal Tab 2: `npm run dev` (Next.js)
   - Terminal Tab 3: Python virtual environment + Flask server

2. **Upload Data:**
   - Go to `/upload` page
   - Paste `output.json` content (50 profiles)
   - Upload to Convex

3. **Load Face Embeddings:**
   - Run `python load_profiles.py ../../output.json`
   - Wait 2-5 minutes for all embeddings to compute

4. **Test Recognition:**
   - Open dashboard
   - Start scanning
   - Test with photos/yourself

### Optimization (If Time Permits):
- Pre-compute embeddings during upload
- Cache recent matches
- Optimize image compression
- Add confidence threshold UI
- Performance monitoring

### Testing:
- Upload 50 profiles to Convex
- Compute face embeddings
- Test live recognition with attendee photos
- Measure recognition speed (<5s target)
- Test error handling

## Known Issues
- None yet (just started!)

## Performance Targets
- Face recognition: <5 seconds
- Camera auto-capture: Every 3 seconds
- Profile animation: Smooth 60fps
- Upload: Handle 50 profiles in <10 seconds

## Tech Decisions Made
1. **Convex over Supabase**: Real-time subscriptions, simpler setup
2. **Facenet512 over VGG-Face**: Better speed/accuracy balance
3. **Pre-computed embeddings**: Much faster than on-demand computation
4. **Flask over FastAPI**: Simpler for quick deployment
5. **Dark theme only**: Faster to build, looks professional
6. **No logo**: Saves time, minimalist aesthetic

