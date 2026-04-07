import type { UploadResponse, VideoScript } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Upload failed: ${message}`);
  }

  return (await response.json()) as UploadResponse;
}

export async function saveVideoJson(videoScript: VideoScript): Promise<string> {
  const response = await fetch(`${API_BASE}/video-json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(videoScript),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Saving video JSON failed: ${message}`);
  }

  const payload = (await response.json()) as { path: string };
  return payload.path;
}
