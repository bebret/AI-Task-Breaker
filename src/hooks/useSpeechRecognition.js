import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook input suara memakai Web Speech API (Chrome/Edge).
 * Jika browser tidak mendukung, `supported` bernilai false dan tombol mic
 * bisa disembunyikan / dinonaktifkan.
 */
export function useSpeechRecognition({ lang = 'id-ID', onResult } = {}) {
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;

  const supported = Boolean(SpeechRecognition);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (!supported) return undefined;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const said = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ');
      onResultRef.current?.(said.trim());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        /* noop */
      }
    };
  }, [SpeechRecognition, supported, lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}
