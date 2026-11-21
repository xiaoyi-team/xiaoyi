import { useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { SpinePlayer } from "@esotericsoftware/spine-player";
import "@esotericsoftware/spine-player/dist/spine-player.css";
import {
  birthdayAnimation,
  randomAnimations,
  shouldPlayBirthdayAnimation,
} from "./xiaoYiCharacterActions";

const assetRoot = `${import.meta.env.BASE_URL}spine/xiaoyi`;
const idleAnimation = "idle";
const dragAnimation = "idle_linqi";
const dragThreshold = 8;
const longPressDelay = 280;
const upperBodyRatio = 0.48;
const positionStorageKey = "xiaoyi-character-position-v1";

function readSavedPosition(): { x: number; y: number } {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(positionStorageKey) ?? "null");
    if (saved && typeof saved === "object" && "x" in saved && "y" in saved
      && typeof saved.x === "number" && typeof saved.y === "number"
      && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
      // Match the 63% left, 3% bottom, 26% x 66% frame in the scene CSS.
      return {
        x: Math.max(-63 / 26, Math.min(11 / 26, saved.x)),
        y: Math.max(-31 / 66, Math.min(3 / 66, saved.y)),
      };
    }
  } catch {
    // Storage may be unavailable; dragging still works for the current visit.
  }
  return { x: 0, y: 0 };
}

type DragGesture = {
  pointerId: number;
  x: number;
  y: number;
  eligible: boolean;
  moved: boolean;
  active: boolean;
  latestX: number;
  latestY: number;
  origin: { x: number; y: number };
  width: number;
  height: number;
  limits: { left: number; right: number; top: number; bottom: number };
};

export default function XiaoYiCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<SpinePlayer | null>(null);
  const playingRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const gestureRef = useRef<DragGesture | null>(null);
  const suppressClickRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Fractions of the character frame keep the same scene position at any size.
  const [position, setPosition] = useState(readSavedPosition);
  const positionRef = useRef(position);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);

  function hitCharacter(clientX: number, clientY: number, upperBodyOnly = false) {
    const player = playerRef.current;
    const canvas = player?.canvas;
    const gl = player?.context?.gl;
    if (!canvas || !gl || gl.isContextLost()) return false;

    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;
    const x = Math.floor((clientX - bounds.left) * canvas.width / bounds.width);
    const y = canvas.height - 1
      - Math.floor((clientY - bounds.top) * canvas.height / bounds.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return false;

    // Sample the visible animation, excluding transparent atlas padding.
    const pixel = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    if (pixel[3] <= 25) return false;
    if (!upperBodyOnly) return true;

    // Measure the rendered silhouette, so padding and responsive scaling do not
    // shift the chest cutoff. WebGL rows run from the feet toward the head.
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let bottom = canvas.height;
    let top = -1;
    for (let row = 0; row < canvas.height; row++) {
      for (let column = 0; column < canvas.width; column++) {
        if (pixels[(row * canvas.width + column) * 4 + 3] > 25) {
          bottom = Math.min(bottom, row);
          top = row;
          break;
        }
      }
    }
    return top >= bottom && y >= top - (top - bottom) * upperBodyRatio;
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (suppressClickRef.current && event.detail !== 0) {
      suppressClickRef.current = false;
      return;
    }
    if (event.detail === 0 || hitCharacter(event.clientX, event.clientY)) interact();
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0 || gestureRef.current) return;
    suppressClickRef.current = false;
    const button = event.currentTarget;
    const bounds = button.getBoundingClientRect();
    const sceneBounds = button.parentElement?.getBoundingClientRect();
    if (!sceneBounds || !bounds.width || !bounds.height) return;
    const gesture: DragGesture = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      eligible: !playingRef.current && hitCharacter(event.clientX, event.clientY, true),
      moved: false,
      active: false,
      latestX: event.clientX,
      latestY: event.clientY,
      origin: { ...positionRef.current },
      width: bounds.width,
      height: bounds.height,
      limits: {
        left: sceneBounds.left - bounds.left,
        right: sceneBounds.right - bounds.right,
        top: sceneBounds.top - bounds.top,
        bottom: sceneBounds.bottom - bounds.bottom,
      },
    };
    gestureRef.current = gesture;
    button.setPointerCapture(event.pointerId);
    if (gesture.eligible) {
      holdTimerRef.current = setTimeout(() => {
        holdTimerRef.current = null;
        if (gestureRef.current !== gesture) return;
        gesture.active = true;
        suppressClickRef.current = true;
        playingRef.current = true;
        const player = playerRef.current;
        if (player?.skeleton?.data.findAnimation(dragAnimation)) {
          player.animationState?.setAnimation(0, dragAnimation, true);
          player.play();
        }
        setDragging(true);
        moveCharacter(gesture);
      }, longPressDelay);
    }
  }

  function moveCharacter(gesture: DragGesture) {
    const dx = Math.max(gesture.limits.left, Math.min(gesture.limits.right, gesture.latestX - gesture.x));
    const dy = Math.max(gesture.limits.top, Math.min(gesture.limits.bottom, gesture.latestY - gesture.y));
    const next = {
      x: gesture.origin.x + dx / gesture.width,
      y: gesture.origin.y + dy / gesture.height,
    };
    positionRef.current = next;
    setPosition(next);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gesture.latestX = event.clientX;
    gesture.latestY = event.clientY;
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) >= dragThreshold) {
      gesture.moved = true;
      suppressClickRef.current = true;
    }
    if (gesture.active) moveCharacter(gesture);
  }

  function handlePointerEnd(event: PointerEvent<HTMLButtonElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    gestureRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (gesture.active) {
      try {
        localStorage.setItem(positionStorageKey, JSON.stringify(positionRef.current));
      } catch {
        // Do not interrupt interaction when browser storage is blocked or full.
      }
      playingRef.current = false;
      playerRef.current?.animationState?.setAnimation(0, idleAnimation, true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) playerRef.current?.pause();
    }
    setDragging(false);
  }

  function interact() {
    const player = playerRef.current;
    const skeleton = player?.skeleton;
    if (!player || !skeleton || !player.animationState || playingRef.current) return;

    const birthday = !hasInteractedRef.current && shouldPlayBirthdayAnimation()
      && skeleton.data.findAnimation(birthdayAnimation) !== null;
    const pool = randomAnimations.filter(name => skeleton.data.findAnimation(name));
    const name = birthday ? birthdayAnimation : pool[Math.floor(Math.random() * pool.length)];
    if (!name) return;

    playingRef.current = true;
    // SpinePlayer.setAnimation also resamples the skeleton and reframes the
    // camera. Change only the track so every action keeps the idle framing.
    const entry = player.animationState.setAnimation(0, name, false);
    hasInteractedRef.current = true;
    entry.listener = {
      complete() {
        playingRef.current = false;
        player.animationState?.setAnimation(0, idleAnimation, true);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) player.pause();
      },
    };
    player.play();
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.hidden = false;

    let player: SpinePlayer;
    try {
      player = new SpinePlayer(container, {
        skeleton: `${assetRoot}/xiaoyi.skel`,
        atlas: `${assetRoot}/xiaoyi.atlas`,
        alpha: true,
        premultipliedAlpha: false,
        backgroundColor: "#00000000",
        preserveDrawingBuffer: true,
        showControls: false,
        showLoading: false,
        interactive: false,
        success(loadedPlayer) {
          playerRef.current = loadedPlayer;
          setReady(true);
          const animations = loadedPlayer.skeleton?.data.animations ?? [];
          const idle = animations.find(animation => animation.name === idleAnimation)
            ?? animations.find(animation => animation.name.startsWith("idle"));
          if (idle) loadedPlayer.setAnimation(idle.name, true);
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            loadedPlayer.pause();
          }
        },
        error(_player, message) {
          playerRef.current = null;
          setReady(false);
          container.hidden = true;
          console.warn("萧逸人物动画加载失败", message);
        },
      });
    } catch (error) {
      container.hidden = true;
      console.warn("萧逸人物动画初始化失败", error);
      return;
    }

    return () => {
      playerRef.current = null;
      playingRef.current = false;
      gestureRef.current = null;
      if (holdTimerRef.current !== null) clearTimeout(holdTimerRef.current);
      player.dispose();
    };
  }, []);

  return (
    <button type="button" className="xiao-yi-page__character" aria-label="与萧逸互动"
      disabled={!ready} onClick={handleClick}
      data-dragging={dragging || undefined}
      style={{ transform: `translate(${position.x * 100}%, ${position.y * 100}%)` }}
      onContextMenu={event => event.preventDefault()}
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}>
      <div ref={containerRef} className="xiao-yi-page__character-player" />
    </button>
  );
}
