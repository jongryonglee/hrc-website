"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AstroidFlashProvider,
  AstroidRevealCell,
  useFlashReplay,
} from "@/app/components/AstroidFlash";
import {
  DEFAULT_FLASH_CELL_MODE,
  type FlashCellMode,
} from "@/app/lib/flashCellMode";
import styles from "./crt-flash.module.css";

const SAMPLE_SRC = "/favicon.png";

function FlashTestInner() {
  const replay = useFlashReplay();

  return (
    <>
      <div className={styles.wrapper}>
        <AstroidRevealCell>
          <div className={styles.imageWrap}>
            <Image
              className={styles.image}
              src={SAMPLE_SRC}
              alt=""
              fill
              priority
              sizes="(max-width: 520px) 90vw, 520px"
            />
          </div>
        </AstroidRevealCell>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={() => replay?.()}
        >
          フラッシュを再生
        </button>
      </div>
    </>
  );
}

export function CrtFlashTestClient() {
  const [mode, setMode] = useState<FlashCellMode>("crt");

  return (
    <div>
      <div className={styles.modeRow}>
        <span className={styles.modeLabel}>パターン:</span>
        <label className={styles.modeOption}>
          <input
            type="radio"
            name="flash-cell-mode"
            checked={mode === "astroid"}
            onChange={() => setMode("astroid")}
          />
          astroid（従来）
        </label>
        <label className={styles.modeOption}>
          <input
            type="radio"
            name="flash-cell-mode"
            checked={mode === "crt"}
            onChange={() => setMode("crt")}
          />
          crt（白・中央+横線）
        </label>
      </div>

      <AstroidFlashProvider key={mode} mode={mode}>
        <FlashTestInner />
      </AstroidFlashProvider>

      <p className={styles.note}>
        ロジックは <code>AstroidFlashProvider</code> /{" "}
        <code>AstroidRevealCell</code> と共通です。トップの既定は{" "}
        <code>{DEFAULT_FLASH_CELL_MODE}</code>（
        <code>app/lib/flashCellMode.ts</code>
        ）。砂嵐のみの試験は <code>/test-sandstorm</code>。
      </p>
    </div>
  );
}
