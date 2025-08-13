"use client";

import { useEffect, useState } from 'react';

const mouseOffset = 10;

/** Component to render the current Mouse Position */
function MousePosition() {
  const [mousePos, setMousePos] = useState({ left: 0, top: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    setScrollPos({ x: window.scrollX, y: window.scrollY });
    setMousePos({ left: e.clientX, top: e.clientY });
  };
  const handleScroll = () => {
    setScrollPos({ x: window.scrollX, y: window.scrollY });
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="absolute select-none flex flex-wrap gap-x-1 print:hidden z-50 text-shadow-2xs"
      style={{ left: mousePos.left + scrollPos.x + mouseOffset, top: mousePos.top + scrollPos.y + mouseOffset }}
    >
      <span className="whitespace-nowrap">Mouse X: {mousePos.left},</span>
      <span className="whitespace-nowrap">Mouse Y: {mousePos.top},</span>
      <span className="whitespace-nowrap">Scroll X: {scrollPos.x},</span>
      <span className="whitespace-nowrap">Scroll Y: {scrollPos.y},</span>
      <span className="whitespace-nowrap">Total X: {mousePos.left + scrollPos.x},</span>
      <span className="whitespace-nowrap">Total Y: {mousePos.top + scrollPos.y}</span>
    </div>
  );
}

export default MousePosition;
