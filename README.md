# Research Paper Visualizer

Turn a research PDF into a short, black-and-white motion graphics explainer video (15-20 seconds), fully local on Mac.

This project is designed for conference demos: quick upload, structured extraction, timeline generation, and Remotion rendering into MP4.

## What This Repo Does

- Uploads a PDF from the frontend.
- Extracts full document text in backend.
- Uses an LLM to convert the paper into a structured script.
- Converts that script into timed scene JSON (frame-accurate at 30fps).
- Writes video scene data to `video/src/data.json`.
- Renders a 1080x1080 black-and-white motion graphics video to `video/out/video.mp4`.

## Tech Stack

- Backend: FastAPI, pdfplumber, Pydantic, OpenAI Python SDK
- Frontend: Next.js (App Router), TailwindCSS
- Video Engine: Remotion (React-based video composition)

## Repository Layout

```text
research-visualizer/
  backend/
    main.py
    video_timeline.py
    requirements.txt
    .env.example
  frontend/
    app/
    lib/
    .env.local.example
    package.json
  video/
    src/
      data.json
      scenes/
    package.json
  package.json
  README.md
```

## End-to-End Pipeline

### 1) PDF Processing

Flow starts at `POST /upload` in `backend/main.py`.

- Accepts PDF as multipart upload.
- Extracts text from all pages with `pdfplumber`.
- Merges extracted text into one string.
- Rejects empty or non-text-extractable PDFs with clear API errors.

### 2) Insight / Keyword-Style Extraction

The backend sends extracted content to the LLM with strict output constraints.

Target schema:

```json
{
  "title": "",
  "problem": "",
  "method": "",
  "architecture_steps": ["", "", ""],
  "result": "",
  "impact": ""
}
```

How keyword-style concepts are derived:
- The model compresses core paper content into short, high-signal fields.
- `architecture_steps` acts as structured key-contribution points (3-5 concise steps).
- Prompt explicitly asks to ignore raw code/import snippets and return conceptual research content.

Fallback behavior:
- If `OPENAI_API_KEY` is missing, backend uses built-in demo script.
- If OpenAI call fails, backend falls back and returns a message explaining why.

### 3) Script-to-Scene Generation

`backend/video_timeline.py` maps structured output to timed scenes at 30fps.

Scene plan:
- Title: 3s (90 frames)
- Problem: 3s (90 frames)
- Method: 3s (90 frames)
- Architecture: 5s (150 frames)
- Result/Impact: 4s (120 frames)

Total: 18s (540 frames)

Returned payload includes:
- `structured_script`
- `video_script` (`scenes` array with text + duration)
- `source` (`openai` or `fallback`)
- `message` (reason/status for observability)

### 4) Frontend Orchestration

In `frontend/app/page.tsx`:

- Upload PDF
- Click **Generate Script**
  - Calls backend `/upload`
  - Displays structured JSON and scene JSON
- Click **Generate Video**
  - Calls backend `/video-json`
  - Saves generated timeline to `video/src/data.json`

### 5) Motion Graphics Rendering

In `video/`:

- Remotion reads `src/data.json`.
- Composition `ResearchVideo` renders scene sequence.
- Uses black background, white text, white lines only.
- Architecture scene uses 2D node-and-arrow mind-map style animation.

Final render output:

- `video/out/video.mp4`

## API Contract

### `POST /upload`

Request:
- `multipart/form-data`
- field: `file` (PDF)

Response (example):

```json
{
  "structured_script": {
    "title": "Adaptive Sparse Attention for Efficient Vision-Language Models",
    "problem": "Large multimodal models are expensive to deploy in real-time settings.",
    "method": "The paper introduces adaptive token pruning with cross-modal routing.",
    "architecture_steps": [
      "Encode visual and text tokens into shared latent space.",
      "Score token saliency and prune low-value tokens.",
      "Route retained tokens through sparse cross-modal attention."
    ],
    "result": "Inference latency decreases while preserving benchmark accuracy.",
    "impact": "Enables practical on-device multimodal systems."
  },
  "video_script": {
    "scenes": [
      {"type": "title", "text": "...", "duration": 90}
    ]
  },
  "source": "openai",
  "message": "Generated with OpenAI."
}
```

### `POST /video-json`

Request body:

```json
{
  "scenes": [
    {"type": "title", "text": "...", "duration": 90}
  ]
}
```

Effect:
- Writes to `video/src/data.json`

## Local Setup

## 1) Backend

```bash
cd research-visualizer/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Run API:

```bash
uvicorn main:app --reload --reload-exclude ".venv/*"
```

Backend URL: `http://localhost:8000`

## 2) Frontend

```bash
cd research-visualizer/frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Set `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Frontend URL: `http://localhost:3000`

## 3) Video Renderer

```bash
cd research-visualizer/video
npm install
npm run render
```

Render command used:

```bash
remotion render src/index.ts ResearchVideo out/video.mp4
```

## How to Run for Demo

1. Start backend
2. Start frontend
3. Upload PDF from UI
4. Click **Generate Script**
5. Click **Generate Video** (writes `video/src/data.json`)
6. Run render in `video/`
7. Play `video/out/video.mp4`

## Example Test Input

Use provided sample PDF:

- `sample_pdfs/sample_research_paper.pdf`

## Troubleshooting

- If UI shows fallback mode:
  - Check `backend/.env` key format (`OPENAI_API_KEY=...`)
  - Restart backend after env changes
  - Check backend status message returned by `/upload`
- If usage appears zero in OpenAI dashboard:
  - Verify you are viewing the correct project/date range
  - Verify request source is `openai` (not `fallback`)
- If `uvicorn --reload` loops:
  - Run with `--reload-exclude ".venv/*"`
- If Remotion render fails:
  - Ensure `@remotion/cli` is installed in `video` workspace

## Security Notes

- Never commit real API keys.
- Keep `backend/.env` and `frontend/.env.local` out of Git.
- If a key is exposed, rotate it immediately.

## License

Add your preferred license before publishing to GitHub (MIT is a common choice).
