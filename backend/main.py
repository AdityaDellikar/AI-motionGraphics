from __future__ import annotations

import json
import logging
import os
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List

import pdfplumber
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError, field_validator

from video_timeline import build_video_script

load_dotenv()

app = FastAPI(title="Research Visualizer API", version="1.0.0")
logger = logging.getLogger("research_visualizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VIDEO_DATA_PATH = Path(__file__).resolve().parents[1] / "video" / "src" / "data.json"
DEFAULT_OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")


class StructuredScript(BaseModel):
    title: str = Field(min_length=1)
    problem: str = Field(min_length=1)
    method: str = Field(min_length=1)
    architecture_steps: List[str] = Field(min_length=3, max_length=6)
    result: str = Field(min_length=1)
    impact: str = Field(min_length=1)

    @field_validator("title", "problem", "method", "result", "impact")
    @classmethod
    def normalize_sentences(cls, value: str) -> str:
        return " ".join(value.split())

    @field_validator("architecture_steps")
    @classmethod
    def normalize_steps(cls, value: List[str]) -> List[str]:
        cleaned = [" ".join(step.split()) for step in value if step and step.strip()]
        if len(cleaned) < 3:
            raise ValueError("architecture_steps must contain at least 3 concise steps")
        return cleaned[:6]


class VideoPayload(BaseModel):
    scenes: List[Dict[str, Any]]


class UploadResponse(BaseModel):
    structured_script: StructuredScript
    video_script: Dict[str, Any]
    source: str
    message: str


def fallback_script() -> StructuredScript:
    # Offline-safe demo payload used when API key is not configured or extraction fails.
    return StructuredScript(
        title="Neural Sequence Compression for Scientific Corpora",
        problem="Scientific PDFs are long and hard to communicate quickly in conference demos.",
        method="The paper proposes a compression-aware encoder and decoder for concise scientific summarization.",
        architecture_steps=[
            "Encode document sections into compact latent vectors.",
            "Apply cross-section attention to preserve causal links.",
            "Decode structured highlights for downstream visualization.",
        ],
        result="The model improves summary fidelity and reduces inference cost across benchmark papers.",
        impact="Researchers can rapidly present core contributions with consistent narrative quality.",
    )


def extract_pdf_text(file_bytes: bytes) -> str:
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty PDF file.")

    text_parts: List[str] = []
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text.strip())

    full_text = "\n\n".join(text_parts).strip()
    if not full_text:
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF.")

    return full_text


def build_prompt(pdf_text: str) -> str:
    # Keep prompt context bounded for predictable latency and token usage.
    clipped_text = pdf_text[:25000]
    return (
        "You are extracting a compact script for a 15-20 second academic motion graphic. "
        "Return strict JSON only with keys: title, problem, method, architecture_steps, result, impact. "
        "Rules: each field must be 1-2 concise sentences; architecture_steps must be an array of 3 to 5 concise steps. "
        "Ignore raw code snippets, import statements, and citations; summarize conceptual research content only. "
        "No markdown, no extra keys, no explanation.\n\n"
        f"Paper text:\n{clipped_text}"
    )


def extract_structured_with_openai(pdf_text: str) -> StructuredScript:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return fallback_script()

    client = OpenAI(api_key=api_key)
    prompt = build_prompt(pdf_text)

    response = client.chat.completions.create(
        model=DEFAULT_OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You output strict JSON only."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise RuntimeError("OpenAI response was empty.")

    try:
        parsed = json.loads(content)
        return StructuredScript.model_validate(parsed)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise RuntimeError(f"Invalid structured extraction response: {exc}") from exc


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()

    try:
        pdf_text = extract_pdf_text(file_bytes)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=400, detail=f"Could not process PDF: {exc}") from exc

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    source = "openai"
    message = "Generated with OpenAI."
    if not api_key:
        structured_script = fallback_script()
        source = "fallback"
        message = "OPENAI_API_KEY missing. Using built-in demo fallback."
    else:
        try:
            structured_script = extract_structured_with_openai(pdf_text)
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("OpenAI extraction failed. Falling back.")
            structured_script = fallback_script()
            source = "fallback"
            message = f"OpenAI call failed: {exc}. Using built-in demo fallback."

    # Convert structured script into fixed-duration timeline scenes for Remotion.
    video_script = build_video_script(structured_script.model_dump())

    return UploadResponse(
        structured_script=structured_script,
        video_script=video_script,
        source=source,
        message=message,
    )


@app.post("/video-json")
def save_video_json(payload: VideoPayload) -> Dict[str, str]:
    VIDEO_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    VIDEO_DATA_PATH.write_text(json.dumps(payload.model_dump(), indent=2), encoding="utf-8")
    return {"status": "saved", "path": str(VIDEO_DATA_PATH)}
