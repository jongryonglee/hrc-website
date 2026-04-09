"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  videoId: string;
  title?: string;
  className?: string;
};

const THUMB_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
};

const PLAY_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: 68,
  height: 48,
  transform: "translate(-50%, -50%)",
  opacity: 0.85,
};

const BTN_STYLE: React.CSSProperties = {
  padding: 0,
  cursor: "pointer",
  overflow: "hidden",
  background: "#000",
};

/**
 * Facade pattern: render a lightweight thumbnail + play button first,
 * then swap in the real YouTube iframe only after user interaction.
 * Saves ~500 KB+ of JS/CSS on initial page load.
 */
export function LiteYouTubeEmbed({ videoId, title, className }: Props) {
  const [activated, setActivated] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const activate = useCallback(() => setActivated(true), []);

  const handleThumbError = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    if (!img.src.endsWith("/hqdefault.jpg")) {
      img.src = fallback;
    }
  }, [videoId]);

  if (activated) {
    return (
      <iframe
        title={title ? `${title} — YouTube` : "YouTube video"}
        className={className}
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=0&controls=1&autoplay=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={BTN_STYLE}
      onClick={activate}
      aria-label={title ? `Play ${title}` : "Play video"}
    >
      <picture>
        <source
          type="image/webp"
          srcSet={`https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`}
        />
        <img
          ref={imgRef}
          src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
          alt=""
          style={THUMB_STYLE}
          loading="eager"
          onError={handleThumbError}
        />
      </picture>
      <svg viewBox="0 0 68 48" aria-hidden="true" style={PLAY_STYLE}>
        <path
          d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
          fill="#212121"
          fillOpacity="0.8"
        />
        <path d="M45 24 27 14v20" fill="#fff" />
      </svg>
    </button>
  );
}
