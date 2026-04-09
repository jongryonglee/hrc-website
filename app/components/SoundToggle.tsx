"use client";

import { useState } from "react";

export function SoundToggle() {
  const [soundOn, setSoundOn] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setSoundOn((prev) => !prev)}
      className="text-left text-[14px] leading-[1.1] md:text-[15px] cursor-pointer"
    >
      <p className={`transition-opacity duration-200 ${soundOn ? "opacity-30" : "opacity-100"}`}>
        Sound ON
      </p>
      <p className={`transition-opacity duration-200 ${soundOn ? "opacity-100" : "opacity-30"}`}>
        Sound OFF
      </p>
    </button>
  );
}
