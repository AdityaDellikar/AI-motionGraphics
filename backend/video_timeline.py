from __future__ import annotations

from typing import Dict, List

FPS = 30


def _frames(seconds: int) -> int:
    return seconds * FPS


def build_video_script(structured: Dict[str, object]) -> Dict[str, List[Dict[str, object]]]:
    architecture_steps = structured.get("architecture_steps", [])
    if not isinstance(architecture_steps, list):
        architecture_steps = []

    scenes = [
        {
            "type": "title",
            "text": str(structured.get("title", "Untitled Research")),
            "duration": _frames(3),
        },
        {
            "type": "problem",
            "text": str(structured.get("problem", "Problem statement unavailable.")),
            "duration": _frames(3),
        },
        {
            "type": "method",
            "text": str(structured.get("method", "Method summary unavailable.")),
            "duration": _frames(3),
        },
        {
            "type": "architecture",
            "text": "\n".join(str(step) for step in architecture_steps if str(step).strip())
            or "Architecture steps unavailable.",
            "steps": [str(step) for step in architecture_steps if str(step).strip()],
            "duration": _frames(5),
        },
        {
            "type": "result_impact",
            "text": (
                f"Result: {structured.get('result', 'Result unavailable.')}\n"
                f"Impact: {structured.get('impact', 'Impact unavailable.')}"
            ),
            "result": str(structured.get("result", "Result unavailable.")),
            "impact": str(structured.get("impact", "Impact unavailable.")),
            "duration": _frames(4),
        },
    ]

    return {"scenes": scenes}
