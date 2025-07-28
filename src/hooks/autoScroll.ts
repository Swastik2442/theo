"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAutoScroll(scrollSpeed: number = 5) {
  const scrollFrameRef = useRef<number | null>(null);

  const stopScrolling = useCallback(() => {
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
  }, []);

  const autoScrollDown = useCallback(() => {
    window.scrollBy(0, scrollSpeed);

    // Stop if cancelled
    if (scrollFrameRef.current == null) return;
    // Stop if at bottom of page
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
      stopScrolling();
      return;
    }
    // Keep looping
    scrollFrameRef.current = requestAnimationFrame(autoScrollDown);
  }, [scrollSpeed]);
  const autoScrollUp = useCallback(() => {
    window.scrollBy(0, -scrollSpeed);

    // Stop if cancelled
    if (scrollFrameRef.current == null) return;
    // Stop if at top of page
    if (window.scrollY <= 0) {
      stopScrolling();
      return;
    }
    // Keep looping
    scrollFrameRef.current = requestAnimationFrame(autoScrollUp);
  }, [scrollSpeed]);

  const startScrollingDown = useCallback(() => {
    stopScrolling();
    scrollFrameRef.current = requestAnimationFrame(autoScrollDown);
  }, [stopScrolling, autoScrollDown]);
  const startScrollingUp = useCallback(() => {
    stopScrolling();
    scrollFrameRef.current = requestAnimationFrame(autoScrollUp);
  }, [stopScrolling, autoScrollUp]);

  useEffect(() => {
    document.addEventListener("blur", stopScrolling, true);
    return () => document.removeEventListener("blur", stopScrolling, true);
  }, [stopScrolling]);

  return { startScrollingUp, startScrollingDown, stopScrolling };
}

export default useAutoScroll;
