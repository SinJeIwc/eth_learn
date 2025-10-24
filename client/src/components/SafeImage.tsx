"use client";

import { useState } from "react";
import Image from "next/image";
import { isValidImagePath } from "@/lib/utils";

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackText?: string;
}

/**
 * SafeImage - Image component with error handling and fallback support
 * Validates URLs before rendering and shows fallback on error
 */
export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackText = "❓",
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const isValid = isValidImagePath(currentSrc);

  const handleError = () => {
    // Try alternative format only once
    if (currentSrc === src) {
      const alternativeSrc = src.endsWith(".png")
        ? src.replace(".png", ".jpg")
        : src.replace(".jpg", ".png");

      setCurrentSrc(alternativeSrc);
      return;
    }

    // Show fallback after trying alternative
    setHasError(true);
  };

  // Show fallback if invalid URL or loading error
  if (!isValid || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-700 text-white text-sm font-bold ${className}`}
        style={{ width, height }}
        title={`Failed to load: ${src}`}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
}
