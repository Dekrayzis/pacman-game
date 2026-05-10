import { useState, useCallback, useRef } from 'react';

// ─── Toast message hook ──────────────────────────────────────────────

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastResult {
  message: ToastMessage | null;
  show: (text: string, type?: ToastMessage['type']) => void;
}

export function useToastMessage(duration: number = 3000): ToastResult {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage({ text, type });
    timerRef.current = setTimeout(() => setMessage(null), duration);
  }, [duration]);

  return { message, show };
}
