# Research Paper Visualizer

Minimal local conference demo that converts a research PDF into a 15-20 second black-and-white 2D motion graphics video.

## Stack

- Backend: FastAPI + pdfplumber + OpenAI Python SDK
- Frontend: Next.js App Router + TailwindCSS
- Video: Remotion (1080x1080, 30fps, no assets/audio)

## Project Structure

```text
research-visualizer/
  backend/
  frontend/
  video/
  package.json
  README.md
```

## 1) Backend Setup

```bash
cd research-visualizer/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `OPENAI_API_KEY` in `backend/.env` to use online extraction.

Run backend:

```bash
uvicorn main:app --reload
```

API runs on `http://localhost:8000`.

### Backend Endpoints

- `POST /upload`
  - Accepts `multipart/form-data` PDF file
  - Extracts text from PDF
  - Uses OpenAI for structured extraction (or fallback script when key missing)
  - Returns:

```json
{
  "structured_script": {
    "title": "",
    "problem": "",
    "method": "",
    "architecture_steps": ["", "", ""],
    "result": "",
    "impact": ""
  },
  "video_script": {
    "scenes": [
      { "type": "title", "text": "...", "duration": 90 }
    ]
  },
  "source": "openai"
}
```

- `POST /video-json`
  - Accepts `video_script` payload (`{ "scenes": [...] }`)
  - Saves to `video/src/data.json`

## 2) Frontend Setup

```bash
cd research-visualizer/frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`.

UI flow:

1. Upload PDF
2. Click **Generate Script**
3. Review structured JSON + scene JSON
4. Click **Generate Video** to write `video/src/data.json`

## 3) Video Setup and Render

```bash
cd research-visualizer/video
npm install
npm run render
```

Render command:

```bash
remotion render src/index.ts ResearchVideo out/video.mp4
```

Output file: `video/out/video.mp4`

## Timing and Scene Mapping

Scene timing is fixed at 30fps:

- Title: 3s (90 frames)
- Problem: 3s (90 frames)
- Method: 3s (90 frames)
- Architecture: 5s (150 frames)
- Result/Impact: 4s (120 frames)

Total: 18s (540 frames)

## Conference Demo Fallback Mode

If `OPENAI_API_KEY` is missing, backend returns a built-in dummy script so the full render flow still works offline.

## Example End-to-End Demo Flow

1. Start backend (`uvicorn main:app --reload`)
2. Start frontend (`npm run dev` in `frontend`)
3. Open `http://localhost:3000`
4. Upload any research PDF and click **Generate Script**
5. Click **Generate Video** (writes `video/src/data.json`)
6. In a separate terminal: `cd video && npm run render`
7. Play `video/out/video.mp4`

## Root Convenience Commands

From `research-visualizer/`:

```bash
npm run dev:frontend
npm run render
```

## Notes for Mac M1

- Runs locally with no Docker and no cloud storage.
- Uses only local filesystem output.
- Remotion rendering works on Apple Silicon with Node 18+ or Node 20+.
