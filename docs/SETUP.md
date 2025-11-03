# Dex - Setup Guide

## Prerequisites
- Node.js 18+ installed
- Python 3.9+ installed
- Webcam/camera access
- Terminal access

## Step 1: Convex Setup (REQUIRED - Do This First!)

Convex needs you to login through the terminal to create your backend.

### 1.1 Login to Convex
```bash
cd /Users/louiss/Programming/Projects/hackathons/agent-verse-hackathon/dex
npx convex dev
```

**What happens:**
1. Terminal will prompt: "Would you like to login to your account?"
2. Press `y` (yes)
3. Browser will open to Convex login page
4. Login with your GitHub/Google account
5. Authorize the application
6. Return to terminal

### 1.2 Create New Project
After login, Convex will ask:
- "Create a new project?" → Press `y`
- "Project name?" → Type `dex` or `dex-hackathon`
- Convex will:
  - Create the project in your account
  - Generate `convex/_generated/` folder
  - Create `.env.local` with `NEXT_PUBLIC_CONVEX_URL`
  - Start development server

### 1.3 Keep Convex Running
The `npx convex dev` command needs to stay running. It:
- Watches for changes to `convex/` files
- Syncs schema to the cloud
- Provides real-time updates

**Leave this terminal tab open!**

## Step 2: Start Next.js Dev Server

In a NEW terminal tab:
```bash
cd /Users/louiss/Programming/Projects/hackathons/agent-verse-hackathon/dex
npm run dev
```

Your app will be at: `http://localhost:3000`

## Step 3: Upload Attendee Profiles

1. Open `http://localhost:3000/upload`
2. Copy **entire contents** of `/output.json` (all 50 LinkedIn profiles)
   - ✅ The file is already formatted as a single JSON array: `[{...}, {...}, ...]`
   - ✅ Contains all 50 profiles in one array (not 10 separate objects)
   - Just copy everything from start `[` to end `]`
3. Paste into textarea
4. Click "Upload Profiles"
5. Wait for success message showing "Inserted: 50"
6. Verify count shows "50 attendees"

**Important:** Upload all 50 profiles at once - the file is already properly formatted!

## Step 4: Python Face Recognition Service

### 4.1 Create Virtual Environment
```bash
cd /Users/louiss/Programming/Projects/hackathons/agent-verse-hackathon/dex
python3 -m venv venv
source venv/bin/activate
```

### 4.2 Install Dependencies
```bash
pip install deepface tf-keras opencv-python pillow numpy flask flask-cors
```

### 4.3 Start Flask Server
```bash
cd python-service
python app.py
```

Server will run on: `http://localhost:5000`

## Step 5: Load Face Embeddings

After uploading profiles to Convex, you need to compute face embeddings:

```bash
# In Terminal Tab 3 (Python environment should be activated)
cd python-service
python load_profiles.py ../../output.json
```

**What this does:**
- Downloads all 50 profile images from LinkedIn
- Computes face embeddings using Facenet512 model
- Stores embeddings in memory for fast matching
- Takes 2-5 minutes to complete

**Expected output:**
```
✓ Computed embedding for: Vu Le
✓ Computed embedding for: [other names...]
✓ Profile loading complete!
  Computed: 45
  Failed: 5
  Total: 50
```

Some profiles may fail if their images are inaccessible or don't contain clear faces. That's okay!

## Step 6: Test the App

1. Go to `http://localhost:3000` (main dashboard)
2. Allow camera permissions when prompted
3. Click "Start Scanning"
4. Point camera at:
   - Yourself
   - LinkedIn profile photos on phone screen
   - Printed photos of attendees
5. Profile should appear within 3-5 seconds!

## Testing Tips

Since you're at the hackathon:
1. Open attendee LinkedIn profiles on your phone
2. Point MacBook camera at the phone screen
3. Dex should recognize them from their profile pic!

Or download profile pictures and display them on a second screen.

## Environment Variables

After Convex setup, your `.env.local` should contain:
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

## Troubleshooting

### Convex Issues
**"Cannot find module '@/convex/_generated/api'"**
- Solution: Make sure `npx convex dev` is running
- It generates the `_generated/` folder automatically

**"Unauthorized" errors**
- Solution: Run `npx convex dev` again to re-authenticate

### Camera Issues
**"Camera access denied"**
- Solution: Go to System Settings → Privacy & Security → Camera
- Enable camera access for your browser

**"No camera found"**
- Solution: Make sure MacBook lid is open and camera is working
- Test in Photo Booth app first

### Python / Face Recognition Issues

**"Failed to fetch" or "TypeError: Failed to fetch"** ⚠️ MOST COMMON ERROR
- **Cause:** Flask server isn't running
- **Solution:** Start Python service (Terminal Tab 3):
  ```bash
  cd dex/python-service
  source ../venv/bin/activate
  python app.py
  ```
- You should see: "Starting server on http://localhost:5000"
- Browser console shows: "Python service not running"

**"ModuleNotFoundError: No module named 'deepface'"**
- Solution: Make sure virtual environment is activated
- Re-run `pip install -r python-service/requirements.txt`

**"Port 5000 already in use"**
- Solution: Kill existing process: `lsof -ti:5000 | xargs kill -9`
- Or use different port in `app.py`

**"No profiles loaded"**
- Solution: Run `python load_profiles.py ../../output.json` first
- This pre-computes face embeddings (takes 2-5 minutes)

## Quick Start Commands

Terminal Tab 1 (Convex):
```bash
cd dex && npx convex dev
```

Terminal Tab 2 (Next.js):
```bash
cd dex && npm run dev
```

Terminal Tab 3 (Python):
```bash
cd dex && source venv/bin/activate && cd python-service && python app.py
```

## Complete Workflow Summary

1. **Terminal Tab 1:** `npx convex dev` (✅ Already running)
2. **Terminal Tab 2:** `npm run dev` → `http://localhost:3000`
3. **Terminal Tab 3:** Activate venv → `python app.py` → `http://localhost:5000`
4. **Upload:** Go to `/upload`, paste `output.json`, click Upload
5. **Embeddings:** Run `python load_profiles.py ../../output.json` (2-5 min)
6. **Test:** Go to dashboard, Start Scanning, point camera at photos

## Development Tips

- **Check Logs:** All 3 terminal tabs show useful debug info
- **Reload Profiles:** Restart Flask server to reload embeddings
- **Test Images:** Use phone to display LinkedIn profile pics
- **Camera Issues:** Close Zoom/Teams, restart browser if needed

## For Hackathon Demo

**Pre-Demo Checklist:**
- [ ] All 3 services running
- [ ] 50 profiles uploaded to Convex
- [ ] Face embeddings computed (check Flask logs)
- [ ] Camera permissions granted
- [ ] Test with 2-3 sample photos first
- [ ] Close resource-heavy apps
- [ ] Internet connection stable (Convex needs it)

**Demo Flow:**
1. Show dashboard with "50 attendees" in header
2. Click "Start Scanning"
3. Point camera at attendee photo on phone
4. Profile appears with animations (<5s)
5. Scroll through their experience, education, skills
6. Test with 2-3 different people to show accuracy

## Project Structure Reminder

```
Terminal Tab 1: Convex Backend (npx convex dev) ← Keep running!
Terminal Tab 2: Next.js Frontend (npm run dev)
Terminal Tab 3: Python Face Recognition (python app.py)
```

All three must be running for Dex to work!

