# Dex - Real-Time Face Recognition for Networking

**Built for the Cursor Evening Hackathon**

Dex is a real-time face recognition app that helps you network smarter at hackathon events. Point your MacBook camera at anyone, and instantly see their full LinkedIn profile, experience, education, skills, and more.

## 🎯 What It Does

- **Point your camera** at someone at a networking event
- **Get instant recognition** in under 2 seconds
- **See their full profile** - LinkedIn bio, work experience, education, skills, projects, publications, and more
- **Network smarter** - No more awkward name-forgetting moments

## ✨ Features

- **Live Camera Feed** - Continuous video stream with auto-capture every 3 seconds
- **Fast Face Recognition** - Sub-2-second identification using Facenet512 model
- **Rich Profiles** - Complete LinkedIn data including experience, education, skills, awards, projects, publications
- **72 Attendees** - Pre-loaded profiles from hackathon event
- **Modern UI** - Professional dark theme with smooth animations
- **Real-time Updates** - Powered by Convex for instant data sync
- **Activity Logs** - Terminal-style output showing recognition process in real-time

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Dark minimalist design (black & white only)
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icons

### Backend
- **Convex** - Real-time database with automatic reactivity
  - Zero-config backend
  - Real-time subscriptions
  - Type-safe queries and mutations
  - Stores full LinkedIn profiles with all data fields

### AI/ML
- **DeepFace** - Face recognition library
- **Facenet512** - 512-dimensional face embeddings
- **RetinaFace** - Accurate face detection
- **Python Flask** - Face recognition microservice
- **Cosine Similarity** - Fast vector matching

### Data Pipeline
- **Luma Event Scraper** - Extract attendee LinkedIn URLs
- **Apify** - Mass LinkedIn Profile Scraper
- **Convex Storage** - Real-time profile database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+ (3.10 or 3.11 recommended)
- Webcam access

### 1. Install Dependencies

```bash
cd dex
npm install
```

### 2. Setup Convex (REQUIRED)

```bash
npx convex dev
```

This will:
- Prompt you to login (use GitHub/Google)
- Create a new Convex project
- Generate `.env.local` with your Convex URL
- Start the development server

**Keep this terminal running!**

### 3. Start Next.js

In a new terminal:
```bash
cd dex
npm run dev
```

Open: `http://localhost:3000`

### 4. Setup Python Service

In a new terminal:
```bash
cd dex
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r python-service/requirements.txt
cd python-service
python app.py
```

**Keep this terminal running!**

### 5. Upload Profiles

1. Go to `http://localhost:3000/upload`
2. Copy contents from `output_merged.json` (all 72 profiles)
3. Paste into textarea
4. Click "Upload Profiles"
5. Wait for success message

### 6. Load Face Embeddings

In a new terminal:
```bash
cd dex
source venv/bin/activate
cd python-service
python load_profiles.py ../../output_merged.json
```

This will take 2-5 minutes to download images and compute embeddings.

### 7. Start Scanning!

1. Go to `http://localhost:3000`
2. Click "Start Scan"
3. Point camera at attendee photos
4. See their profile appear instantly!

## 📁 Project Structure

```
dex/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main dashboard
│   ├── upload/            # Admin upload page
│   └── providers.tsx      # Convex provider
├── components/
│   ├── LiveCamera.tsx     # Camera feed component
│   └── ProfileCard.tsx    # Profile display
├── convex/
│   ├── schema.ts          # Database schema
│   └── attendees.ts       # CRUD functions
├── python-service/
│   ├── app.py             # Flask API server
│   ├── load_profiles.py   # Profile loader script
│   └── requirements.txt   # Python dependencies
└── docs/
    ├── SETUP.md          # Detailed setup guide
    ├── SCRIPT.md         # Pitch script
    └── PROJECT_STRUCTURE.md
```

## 🔧 API Endpoints

### Convex Functions
- `uploadAttendees(profiles)` - Bulk upload LinkedIn profiles
- `getAllAttendees()` - Get all profiles
- `getAttendeeByIdentifier(id)` - Get single profile
- `getAttendeeCount()` - Count attendees

### Python Flask (Port 5001)
- `GET /health` - Health check
- `POST /load-profiles` - Compute face embeddings
- `POST /match-face` - Match face from camera image

## 🎨 How It Works

### Setup Phase
1. **Scrape Event** - Luma scraper extracts attendee LinkedIn URLs
2. **Enrich Data** - Apify scrapes full LinkedIn profiles
3. **Store in Convex** - Upload all profiles to real-time database
4. **Compute Embeddings** - Python service downloads profile images and computes 512-dim face embeddings
5. **Store in Memory** - Embeddings stored in Flask for fast matching

### Recognition Phase
1. **Camera Capture** - Auto-capture frame every 3 seconds
2. **Face Detection** - RetinaFace detects face in image
3. **Compute Embedding** - Facenet512 generates 512-dim vector
4. **Match** - Cosine similarity against all stored embeddings
5. **Return Profile** - Best match above 55% confidence threshold
6. **Display** - Show full LinkedIn profile with smooth animations

## 🚀 Why Convex Made This Better

**Convex was the perfect choice for this hackathon project:**

1. **Speed** - Zero backend setup. Just `npx convex dev` and you're running
2. **Real-time** - Profile count updates automatically when you upload data
3. **Type Safety** - TypeScript types generated automatically from schema
4. **Flexibility** - Stores full `rawProfile` JSON for all LinkedIn fields
5. **Reactivity** - UI updates automatically when data changes
6. **Scalability** - Handles 72 profiles now, can scale to thousands without code changes
7. **No API Routes** - Queries and mutations are just functions, no Express setup needed

**Without Convex, we'd need:**
- Database setup (PostgreSQL/MongoDB)
- API server (Express/FastAPI)
- Type definitions (manual)
- WebSocket setup for real-time
- Deployment configuration

**With Convex, we got all of this in minutes!**

## 📊 Performance

- **Face Recognition:** <2 seconds
- **Confidence Threshold:** 55% minimum (0.45 cosine distance)
- **Camera Auto-capture:** Every 3 seconds
- **Profile Upload:** ~10 seconds for 72 profiles
- **Embedding Computation:** 2-5 minutes (one-time setup)
- **Matching Speed:** <100ms (in-memory cosine similarity)

## 🎯 Model Details

### Face Recognition Model
- **Model:** Facenet512 (Facebook)
- **Embedding Dimension:** 512
- **Pre-trained on:** 3.3 million faces
- **Accuracy:** State-of-the-art

### Hyperparameters
- **Confidence Threshold:** 0.45 (55% minimum)
- **Distance Metric:** Cosine similarity
- **Detector Backend:** RetinaFace (live camera), OpenCV (profile loading)
- **Enforce Detection:** Enabled (rejects blurry images)

## 📝 Documentation

- [SETUP.md](docs/SETUP.md) - Detailed setup and troubleshooting
- [SCRIPT.md](docs/SCRIPT.md) - Pitch script for judges
- [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Architecture overview
- [CHANGELOG.md](docs/CHANGELOG.md) - Development progress

## 🔮 Future Improvements

### Dataset Enhancement
- **Instagram Integration** - Use recent photos for better accuracy
- **Twitter/X Photos** - Additional profile pictures
- **Multiple Photos Per Person** - Train on multiple angles
- **Event Registration Photos** - Direct uploads at registration
- **GitHub Profile Pictures** - Tech community connections

### Features
- **Multi-face Recognition** - Detect multiple people at once
- **Mobile App** - On-the-go networking
- **Conversation Prompts** - AI-generated icebreakers
- **Privacy Controls** - Opt-in/opt-out system
- **Integration APIs** - Connect with event platforms

## 🎬 Demo Tips

1. **Pre-load everything** - Profiles and embeddings before demo
2. **Test camera** - Ensure good lighting and angle
3. **Have photos ready** - Use phone to show attendee photos
4. **Show confidence scores** - Demonstrates accuracy
5. **Explain the tech** - Convex, Facenet512, real-time reactivity

## 📄 License

MIT

## 👨‍💻 Built By

**Louis Le** - Built in 2.5 hours for the Cursor Evening Hackathon

**Special Thanks:**
- Convex for the amazing real-time backend
- DeepFace for the face recognition library
- Apify for LinkedIn profile scraping

---

**Made with ❤️ using Cursor AI**
