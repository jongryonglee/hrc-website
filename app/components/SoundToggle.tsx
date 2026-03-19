"use client";

import { useState } from "react";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  return (
    <button
      onClick={() => setOn((prev) => !prev)}
      className="text-left text-[13px] md:text-[14px] cursor-pointer"
    >
      <p>Sound ON</p>
      <p className={`transition-opacity duration-200 ${on ? "opacity-30" : "opacity-0"}`}>
        Sound OFF
      </p>
    </button>
  );
}
