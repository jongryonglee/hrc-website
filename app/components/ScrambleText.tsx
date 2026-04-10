"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

type ScrambleTextProps = {
  text: string | null | undefined;
  className?: string;
  durationMs?: number;
  speedMs?: number;
  chars?: string;
  mode?: "scramble" | "lap";
  active?: boolean;
};

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const ScrambleText = ({
  text,
  className,
  durationMs = 600,
  speedMs = 30,
  chars = DEFAULT_CHARS,
  mode = "scramble",
  active,
}: ScrambleTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const timersRef = useRef<number[]>([]);
  const safeText = useMemo(() => text ?? "", [text]);
  const words = useMemo(() => safeText.split(" "), [safeText]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearInterval(timerId));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleMouseEnter = useCallback(() => {
    if (!textRef.current) return;
    clearTimers();

    if (mode === "lap") {
      const wordSpans = textRef.current.querySelectorAll<HTMLSpanElement>(
        "[data-scramble-word]"
      );

      wordSpans.forEach((span) => {
        const word = span.dataset.scrambleWord || "";
        if (!word) return;
        let index = 0;

        const timerId = window.setInterval(() => {
          if (!word.length) return;

          const characters = word.split("");
          const replaceIndex = index % characters.length;
          const randomChar = chars[Math.floor(Math.random() * chars.length)];
          characters[replaceIndex] = randomChar;
          span.textContent = characters.join("");

          index += 1;
          const cycles = characters.length === 1 ? 4 : characters.length;
          if (index >= cycles) {
            window.clearInterval(timerId);
            span.textContent = word;
          }
        }, speedMs);

        timersRef.current.push(timerId);
      });

      return;
    }

    const letters = safeText.split("");
    let revealIndex = 0;
    const steps = Math.max(1, Math.floor(durationMs / speedMs));
    const revealStep = Math.max(1, Math.ceil(letters.length / steps));

    const timerId = window.setInterval(() => {
      revealIndex = Math.min(letters.length, revealIndex + revealStep);

      const scrambled = letters
        .map((char, index) => {
          if (index < revealIndex || char === " ") return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      if (textRef.current) {
        textRef.current.textContent = scrambled;
      }

      if (revealIndex >= letters.length) {
        clearTimers();
      }
    }, speedMs);

    timersRef.current.push(timerId);
  }, [chars, clearTimers, durationMs, mode, safeText, speedMs]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    if (!textRef.current) return;

    if (mode === "lap") {
      const wordSpans = textRef.current.querySelectorAll<HTMLSpanElement>(
        "[data-scramble-word]"
      );
      wordSpans.forEach((span) => {
        span.textContent = span.dataset.scrambleWord || "";
      });
      return;
    }

    textRef.current.textContent = safeText;
  }, [clearTimers, mode, safeText]);

  useEffect(() => {
    if (active === undefined) return;
    if (active) {
      handleMouseEnter();
    } else {
      handleMouseLeave();
    }
  }, [active, handleMouseEnter, handleMouseLeave]);

  return (
    <span
      ref={textRef}
      className={className}
      onMouseEnter={active === undefined ? handleMouseEnter : undefined}
      onMouseLeave={active === undefined ? handleMouseLeave : undefined}
    >
      {mode === "lap"
        ? words.map((word, index) => (
            <span key={`${word}-${index}`}>
              <span data-scramble-word={word}>{word}</span>
              {index < words.length - 1 ? " " : ""}
            </span>
          ))
        : safeText}
    </span>
  );
};
