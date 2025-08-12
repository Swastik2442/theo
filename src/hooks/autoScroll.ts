"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Hook to scroll automatically in a particular direction
 * @param scrollSpeed Speed of Automatic Scrolling. Defaults to 5.
 */
export function useAutoScroll(scrollSpeed: number = 5) {
  const hScrollFrameRef = useRef<number | null>(null);
  const vScrollFrameRef = useRef<number | null>(null);

  const stopHorizontalScrolling = useCallback(() => {
    if (hScrollFrameRef.current) {
      cancelAnimationFrame(hScrollFrameRef.current);
      hScrollFrameRef.current = null;
    }
  }, []);
  const stopVerticalScrolling = useCallback(() => {
    if (vScrollFrameRef.current) {
      cancelAnimationFrame(vScrollFrameRef.current);
      vScrollFrameRef.current = null;
    }
  }, []);
  const stopScrolling = useCallback(() => {
    stopHorizontalScrolling();
    stopVerticalScrolling();
  }, [stopHorizontalScrolling, stopVerticalScrolling]);

  const autoScrollDown = useCallback(() => {
    window.scrollBy(0, scrollSpeed);

    // Stop if cancelled
    if (vScrollFrameRef.current == null) return;
    // Stop if at bottom of page
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
      stopHorizontalScrolling();
      return;
    }
    // Keep looping
    vScrollFrameRef.current = requestAnimationFrame(autoScrollDown);
  }, [scrollSpeed]);
  const autoScrollUp = useCallback(() => {
    window.scrollBy(0, -scrollSpeed);

    // Stop if cancelled
    if (vScrollFrameRef.current == null) return;
    // Stop if at top of page
    if (window.scrollY <= 0) {
      stopHorizontalScrolling();
      return;
    }
    // Keep looping
    vScrollFrameRef.current = requestAnimationFrame(autoScrollUp);
  }, [scrollSpeed]);
  const autoScrollRight = useCallback(() => {
    window.scrollBy(scrollSpeed, 0);

    // Stop if cancelled
    if (hScrollFrameRef.current == null) return;
    // Stop if at end of page
    if (window.innerWidth + window.scrollX >= document.body.scrollWidth) {
      stopVerticalScrolling();
      return;
    }
    // Keep looping
    hScrollFrameRef.current = requestAnimationFrame(autoScrollRight);
  }, [scrollSpeed]);
  const autoScrollLeft = useCallback(() => {
    window.scrollBy(-scrollSpeed, 0);

    // Stop if cancelled
    if (hScrollFrameRef.current == null) return;
    // Stop if at start of page
    if (window.scrollX <= 0) {
      stopVerticalScrolling();
      return;
    }
    // Keep looping
    hScrollFrameRef.current = requestAnimationFrame(autoScrollLeft);
  }, [scrollSpeed]);

  const startScrollingDown = useCallback(() => {
    stopHorizontalScrolling();
    vScrollFrameRef.current = requestAnimationFrame(autoScrollDown);
  }, [stopHorizontalScrolling, autoScrollDown]);
  const startScrollingUp = useCallback(() => {
    stopHorizontalScrolling();
    vScrollFrameRef.current = requestAnimationFrame(autoScrollUp);
  }, [stopHorizontalScrolling, autoScrollUp]);
  const startScrollingRight = useCallback(() => {
    stopVerticalScrolling();
    hScrollFrameRef.current = requestAnimationFrame(autoScrollRight);
  }, [stopVerticalScrolling, autoScrollRight]);
  const startScrollingLeft = useCallback(() => {
    stopVerticalScrolling();
    hScrollFrameRef.current = requestAnimationFrame(autoScrollLeft);
  }, [stopVerticalScrolling, autoScrollLeft]);

  useEffect(() => {
    document.addEventListener("blur", stopScrolling, true);
    return () => document.removeEventListener("blur", stopScrolling, true);
  }, [stopScrolling]);

  return {
    startScrollingUp,
    startScrollingDown,
    startScrollingLeft,
    startScrollingRight,
    stopVerticalScrolling,
    stopHorizontalScrolling,
    stopScrolling
  };
}

export default useAutoScroll;
