import { useLayoutEffect, useRef, type RefObject } from "react";

type NoticeScrollbarProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  interactive: boolean;
};

export default function NoticeScrollbar({ scrollRef, contentRef, interactive }: NoticeScrollbarProps) {
  const visualRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const content = contentRef.current;
    const visual = visualRef.current;
    const thumb = thumbRef.current;
    if (!scroll || !content || !visual || !thumb || typeof ResizeObserver === "undefined") return;

    // Preserve only the space Home's former native scrollbar actually occupied.
    // Measure before paint; overlay scrollbars naturally require no compensation.
    if (!interactive) {
      const previous = scroll.style.scrollbarWidth;
      scroll.style.scrollbarWidth = "thin";
      const nativeWidth = scroll.clientWidth;
      scroll.style.scrollbarWidth = previous;
      const gutter = Math.max(scroll.clientWidth - nativeWidth, 0);
      scroll.style.setProperty("--notice-scrollbar-gutter", `${gutter}px`);
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const visibleHeight = scroll.clientHeight;
      const contentHeight = scroll.scrollHeight;
      // Computed height is local layout geometry, before Home's perspective transform.
      const trackHeight = Number.parseFloat(getComputedStyle(visual).height);
      const maxScroll = Math.max(contentHeight - visibleHeight, 0);
      const overflowing = maxScroll > 0 && visibleHeight > 0 && contentHeight > 0
        && Number.isFinite(trackHeight) && trackHeight > 0;
      visual.style.visibility = overflowing ? "visible" : "hidden";
      if (!overflowing) {
        thumb.style.height = "0px";
        thumb.style.transform = "translateY(0px)";
        return;
      }
      const height = Math.min(trackHeight, trackHeight * visibleHeight / contentHeight);
      const offset = Math.min(Math.max(scroll.scrollTop, 0), maxScroll);
      const progress = offset <= 0 ? 0
        : maxScroll - offset <= Math.min(1, maxScroll / 1000) ? 1 : offset / maxScroll;
      thumb.style.height = `${height}px`;
      thumb.style.transform = `translateY(${progress * (trackHeight - height)}px)`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(scroll);
    observer.observe(content);
    observer.observe(visual);
    scroll.addEventListener("scroll", schedule, { passive: true });
    update();
    return () => {
      scroll.removeEventListener("scroll", schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      scroll.style.removeProperty("--notice-scrollbar-gutter");
    };
  }, [scrollRef, contentRef, interactive]);

  return <div ref={visualRef} className="notice-scrollbar-visual" aria-hidden="true">
    <span ref={thumbRef} className="notice-scrollbar-thumb" />
  </div>;
}
