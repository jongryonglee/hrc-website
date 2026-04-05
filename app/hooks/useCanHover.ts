import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** 実ホバー可能な入力（主にポインタ）のときだけ true。タッチ主体では false */
export function useCanHover() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
