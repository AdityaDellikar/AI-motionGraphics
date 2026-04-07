'use client';

import { useMemo, useState } from 'react';
import { saveVideoJson, uploadPdf } from '../lib/api';
import type { UploadResponse } from '../lib/types';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [status, setStatus] = useState<string>('Idle');
  const [error, setError] = useState<string>('');
  const [savedPath, setSavedPath] = useState<string>('');

  const prettyStructured = useMemo(
    () => (result ? JSON.stringify(result.structured_script, null, 2) : ''),
    [result],
  );

  const prettyVideo = useMemo(
    () => (result ? JSON.stringify(result.video_script, null, 2) : ''),
    [result],
  );

  const onGenerateScript = async () => {
    if (!file) {
      setError('Select a PDF first.');
      return;
    }

    setError('');
    setSavedPath('');
    setStatus('Generating structured script...');

    try {
      const payload = await uploadPdf(file);
      setResult(payload);
      setStatus(`Script ready (${payload.source} mode): ${payload.message}`);
    } catch (err) {
      setResult(null);
      setStatus('Failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const onGenerateVideo = async () => {
    if (!result) {
      setError('Generate script first.');
      return;
    }

    setError('');
    setStatus('Saving Remotion data.json...');

    try {
      const path = await saveVideoJson(result.video_script);
      setSavedPath(path);
      setStatus('Video JSON saved. Run `npm run render` in /video.');
    } catch (err) {
      setStatus('Failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">Research Paper Visualizer</h1>
        <p className="text-sm text-neutral-300">
          Upload a PDF, generate structured research highlights, then export Remotion scene JSON.
        </p>

        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <label className="mb-3 block text-sm text-neutral-300">PDF Upload</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mb-4 block w-full text-sm file:mr-4 file:rounded-md file:border file:border-white file:bg-black file:px-3 file:py-1.5 file:text-white"
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onGenerateScript}
              className="rounded-md border border-white px-4 py-2 text-sm transition hover:bg-white hover:text-black"
            >
              Generate Script
            </button>
            <button
              onClick={onGenerateVideo}
              disabled={!result}
              className="rounded-md border border-white px-4 py-2 text-sm transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-neutral-700 disabled:text-neutral-500 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
            >
              Generate Video
            </button>
          </div>

          <p className="mt-4 text-xs text-neutral-400">Status: {status}</p>
          {savedPath ? <p className="mt-1 text-xs text-neutral-400">Saved: {savedPath}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="mb-3 text-lg font-medium">Structured Script</h2>
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words text-xs text-neutral-200">
              {prettyStructured || 'No data yet.'}
            </pre>
          </article>

          <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="mb-3 text-lg font-medium">Video JSON</h2>
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words text-xs text-neutral-200">
              {prettyVideo || 'No data yet.'}
            </pre>
          </article>
        </section>
      </div>
    </main>
  );
}
