/**
 * トップ起動時のスイッチ点滅（globals.css の `.switch-off-blink` / `@keyframes switch-off-blink`）の duration と一致させる。
 * 旧 3000ms 時の 0〜77.778%（3 回点灯のあとの暗転まで）。4 回目の点灯はせず、その直後に ON。
 */
export const SWITCH_BOOT_ANIMATION_MS = 2333;
