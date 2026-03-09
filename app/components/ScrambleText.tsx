"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

type ScrambleTextProps = {
  text: string;
  className?: string;
  durationMs?: number;
  speedMs?: number;
  chars?: string;
  mode?: "scramble" | "lap";
};

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const ScrambleText = ({
  text,
  className,
  durationMs = 600,
  speedMs = 30,
  chars = DEFAULT_CHARS,
  mode = "scramble",
}: ScrambleTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const timersRef = useRef<number[]>([]);
  const words = useMemo(() => text.split(" "), [text]);

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

    const letters = text.split("");
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
  }, [chars, clearTimers, durationMs, mode, speedMs, text]);

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

    textRef.current.textContent = text;
  }, [clearTimers, mode, text]);

  return (
    <span
      ref={textRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {mode === "lap"
        ? words.map((word, index) => (
            <span key={`${word}-${index}`}>
              <span data-scramble-word={word}>{word}</span>
              {index < words.length - 1 ? " " : ""}
            </span>
          ))
        : text}
    </span>
  );
};
