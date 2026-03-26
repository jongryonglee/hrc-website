"use client";

import { useState } from "react";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  return (
    <button
      onClick={() => setOn((prev) => !prev)}
      className="text-left text-[13px] md:text-[14px] cursor-pointer"
    >
      <p className={`transition-opacity duration-200 ${on ? "opacity-100" : "opacity-30"}`}>
        Sound ON
      </p>
      <p className={`transition-opacity duration-200 ${on ? "opacity-30" : "opacity-100"}`}>
        Sound OFF
      </p>
    </button>
  );
}
