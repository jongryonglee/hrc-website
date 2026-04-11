"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** 設定時は Sound ON でこの URL を再生（未設定は従来どおり表示のみ） */
  audioSrc?: string | null;
  /** Mux 動画の mute/unmute を外部から制御するためのコールバック */
  onSoundChange?: (soundOn: boolean) => void;
};

export function SoundToggle({ audioSrc, onSoundChange }: Props) {
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioSrc) {
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    a.load();
    return () => {
      a.pause();
    };
  }, [audioSrc]);

  useEffect(() => {
    if (!audioSrc) {
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (soundOn) {
      void a.play().catch(() => {});
    } else {
      a.pause();
    }
  }, [audioSrc, soundOn]);

  useEffect(() => {
    if (!audioSrc) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 作品・音源切り替え時に再生状態をリセット
    setSoundOn(false);
  }, [audioSrc]);

  useEffect(() => {
    onSoundChange?.(soundOn);
  }, [soundOn, onSoundChange]);

  return (
    <>
      {audioSrc ? (
        <audio
          ref={audioRef}
          src={audioSrc}
          loop
          preload="metadata"
          className="sr-only"
          aria-hidden
        />
      ) : null}
      <button
        type="button"
        onClick={() => setSoundOn((prev) => !prev)}
        className="text-left text-[14px] leading-[1.1] md:text-[15px] cursor-pointer"
        aria-pressed={audioSrc || onSoundChange ? soundOn : undefined}
      >
        <p className={`transition-opacity duration-200 ${soundOn ? "opacity-30" : "opacity-100"}`}>
          Sound ON
        </p>
        <p className={`transition-opacity duration-200 ${soundOn ? "opacity-100" : "opacity-30"}`}>
          Sound OFF
        </p>
      </button>
    </>
  );
}
