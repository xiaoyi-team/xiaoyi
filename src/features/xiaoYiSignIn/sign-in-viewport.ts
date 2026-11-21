export const BOARD_WIDTH = 1765;
export const BOARD_HEIGHT = 909;
const VIEWPORT_MARGIN = 16;

export function subscribeToViewport(onResize: () => void) {
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}

export function readBoardScale() {
  // Existing local module boundary and PC R1 calculation, shared by both dialogs.
  if (window.innerWidth <= 1024) return null;

  return Math.min(
    1,
    Math.max(0, document.documentElement.clientWidth - VIEWPORT_MARGIN * 2) /
      BOARD_WIDTH,
    Math.max(0, window.innerHeight - VIEWPORT_MARGIN * 2) / BOARD_HEIGHT,
  );
}
