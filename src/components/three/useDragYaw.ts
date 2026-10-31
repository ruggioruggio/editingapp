"use client";

import { useRef, type PointerEvent } from "react";

export function useDragYaw() {
  const state = useRef({ yaw: 0, velocity: 0, dragging: false, lastX: 0 });

  const handlers = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      state.current.dragging = true;
      state.current.lastX = e.clientX;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const s = state.current;
      if (!s.dragging) return;
      const dx = (e.clientX - s.lastX) * 0.01;
      s.lastX = e.clientX;
      s.yaw += dx;
      s.velocity = dx;
    },
    onPointerUp: () => {
      state.current.dragging = false;
    },
    onPointerCancel: () => {
      state.current.dragging = false;
    },
  };

  const step = () => {
    const s = state.current;
    if (!s.dragging) {
      s.yaw += s.velocity;
      s.velocity *= 0.93;
    }
    return s.yaw;
  };

  return { handlers, step };
}
