import { useLayoutEffect, useRef } from "react";

export const WISH_BOX_TOUCH_MEDIA = "(max-width: 1024px)";
const PC_CANVAS = { width: 1920, height: 1080 };
const TOUCH_CANVAS = { width: 667, height: 375 };

export function useWishBoxViewport() {
  const viewportRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const media = window.matchMedia(WISH_BOX_TOUCH_MEDIA);
    const updateLayout = (width: number, height: number) => {
      const canvas = media.matches ? TOUCH_CANVAS : PC_CANVAS;
      const scale = Math.min(width / canvas.width, height / canvas.height);
      const slotWidth = canvas.width * scale;
      const slotHeight = canvas.height * scale;
      viewport.style.setProperty("--wish-box-canvas-width", `${canvas.width}px`);
      viewport.style.setProperty("--wish-box-canvas-height", `${canvas.height}px`);
      viewport.style.setProperty("--wish-box-canvas-scale", `${scale}`);
      viewport.style.setProperty("--wish-box-slot-width", `${slotWidth}px`);
      viewport.style.setProperty("--wish-box-slot-height", `${slotHeight}px`);
      viewport.style.setProperty("--wish-box-slot-left", `${(width - slotWidth) / 2}px`);
      viewport.style.setProperty("--wish-box-slot-top", `${(height - slotHeight) / 2}px`);
    };
    const measure = () => {
      const { width, height } = viewport.getBoundingClientRect();
      updateLayout(width, height);
    };

    measure();
    const observer = new ResizeObserver(([entry]) => {
      updateLayout(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(viewport);
    media.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", measure);
    };
  }, []);

  return viewportRef;
}
