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
      stopVerticalScrolling();
      return;
    }
    // Keep looping
    vScrollFrameRef.current = requestAnimationFrame(autoScrollDown);
  }, [scrollSpeed, stopVerticalScrolling]);
  const autoScrollUp = useCallback(() => {
    window.scrollBy(0, -scrollSpeed);

    // Stop if cancelled
    if (vScrollFrameRef.current == null) return;
    // Stop if at top of page
    if (window.scrollY <= 0) {
      stopVerticalScrolling();
      return;
    }
    // Keep looping
    vScrollFrameRef.current = requestAnimationFrame(autoScrollUp);
  }, [scrollSpeed, stopVerticalScrolling]);
  const autoScrollRight = useCallback(() => {
    window.scrollBy(scrollSpeed, 0);

    // Stop if cancelled
    if (hScrollFrameRef.current == null) return;
    // Stop if at end of page
    if (window.innerWidth + window.scrollX >= document.body.scrollWidth) {
      stopHorizontalScrolling();
      return;
    }
    // Keep looping
    hScrollFrameRef.current = requestAnimationFrame(autoScrollRight);
  }, [scrollSpeed, stopHorizontalScrolling]);
  const autoScrollLeft = useCallback(() => {
    window.scrollBy(-scrollSpeed, 0);

    // Stop if cancelled
    if (hScrollFrameRef.current == null) return;
    // Stop if at start of page
    if (window.scrollX <= 0) {
      stopHorizontalScrolling();
      return;
    }
    // Keep looping
    hScrollFrameRef.current = requestAnimationFrame(autoScrollLeft);
  }, [scrollSpeed, stopHorizontalScrolling]);

  const startScrollingDown = useCallback(() => {
    stopVerticalScrolling();
    vScrollFrameRef.current = requestAnimationFrame(autoScrollDown);
  }, [stopVerticalScrolling, autoScrollDown]);
  const startScrollingUp = useCallback(() => {
    stopVerticalScrolling();
    vScrollFrameRef.current = requestAnimationFrame(autoScrollUp);
  }, [stopVerticalScrolling, autoScrollUp]);
  const startScrollingRight = useCallback(() => {
    stopHorizontalScrolling();
    hScrollFrameRef.current = requestAnimationFrame(autoScrollRight);
  }, [stopHorizontalScrolling, autoScrollRight]);
  const startScrollingLeft = useCallback(() => {
    stopHorizontalScrolling();
    hScrollFrameRef.current = requestAnimationFrame(autoScrollLeft);
  }, [stopHorizontalScrolling, autoScrollLeft]);

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
