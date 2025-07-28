"use client";

import type { ComponentProps } from "react";
import Image from "next/image";

export function ImageWithoutDrag(props: ComponentProps<typeof Image>) {
  return (
    <Image onDragStart={(e) => e.preventDefault()} {...props} />
  );
}

export default ImageWithoutDrag;
