/**
 * Hooks for tool islands that take a picture and wait for a slow answer
 * (Vastu checker, AI design studio).
 */
import { useEffect, useRef, useState } from 'react';
import { checkFile, fill, MAX_MB } from './vastu/logic';

/**
 * One picked image: the file, an object URL for the preview, and the error
 * text. `s` reads the island strings (`validationFileType`, `validationFileSize`).
 * The object URL is revoked when the image changes and on unmount.
 */
export function useImagePick(s: (key: string) => string) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const url = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );

  const show = (next: string | null) => {
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = next;
    setPreview(next);
  };

  const pick = (f: File | undefined) => {
    if (!f) return;
    const bad = checkFile(f);
    if (bad) {
      setError(bad === 'type' ? s('validationFileType') : fill(s('validationFileSize'), { max: MAX_MB }));
      return;
    }
    show(URL.createObjectURL(f));
    setFile(f);
    setError(null);
  };

  const clear = () => {
    show(null);
    setFile(null);
  };

  return { file, preview, error, setError, pick, clear };
}

/** Seconds since `since` (a `Date.now()` value), ticking every second. 0 while `since` is null. */
export function useElapsed(since: number | null) {
  const [now, setNow] = useState(0);
  const active = since !== null;
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  // A stale `now` from an earlier wait is older than `since`, so it reads as 0.
  return since === null ? 0 : Math.max(0, (now - since) / 1000);
}
