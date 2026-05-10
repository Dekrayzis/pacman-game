import { useState, useCallback } from 'react';

// ─── Generic undo/redo hook ──────────────────────────────────────────

interface UndoRedoResult<T> {
  push: (current: T) => void;
  undo: (current: T) => T | null;
  redo: (current: T) => T | null;
  canUndo: boolean;
  canRedo: boolean;
}

export function useUndoRedo<T>(
  cloneFn: (value: T) => T,
  maxHistory: number = 20,
): UndoRedoResult<T> {
  const [undoStack, setUndoStack] = useState<T[]>([]);
  const [redoStack, setRedoStack] = useState<T[]>([]);

  const push = useCallback((current: T) => {
    setUndoStack(prev => [...prev.slice(-maxHistory), cloneFn(current)]);
    setRedoStack([]);
  }, [cloneFn, maxHistory]);

  const undo = useCallback((current: T): T | null => {
    if (undoStack.length === 0) return null;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, cloneFn(current)]);
    setUndoStack(u => u.slice(0, -1));
    return prev;
  }, [undoStack, cloneFn]);

  const redo = useCallback((current: T): T | null => {
    if (redoStack.length === 0) return null;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, cloneFn(current)]);
    setRedoStack(r => r.slice(0, -1));
    return next;
  }, [redoStack, cloneFn]);

  return {
    push,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
