import { useEffect, useState } from 'react';

const frame = (name, n) => `/sprites/otter_${name}_${n}.png`;
const range = (name, count) =>
  Array.from({ length: count }, (_, i) => frame(name, i + 1));

export const OTTER = {
  idle: range('idle', 4),
  jump: range('jump', 4),
  run: range('run', 3),
  sleep: range('sleep', 6),
  spin: range('spin', 3),
};

/**
 * Cycles through pixel-art frames like a flipbook. Respects
 * prefers-reduced-motion by holding the first frame.
 */
export default function OtterSprite({ frames, fps = 6, size = 96, alt = '' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Warm the cache so the first loop doesn't flicker.
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduced?.matches || frames.length < 2) return undefined;

    const id = setInterval(
      () => setIndex((i) => (i + 1) % frames.length),
      1000 / fps
    );
    return () => clearInterval(id);
  }, [frames, fps]);

  return (
    <img
      className="otter-sprite"
      src={frames[index % frames.length]}
      width={size}
      height={size}
      alt={alt}
      draggable={false}
    />
  );
}
