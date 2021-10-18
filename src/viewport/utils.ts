const tolerance = 10;
export const resize = (canvas: HTMLCanvasElement): boolean => {
  // const { width, height } = canvas.getBoundingClientRect();
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (
    Math.abs(canvas.width - width) > tolerance ||
    Math.abs(canvas.height - height) > tolerance
  ) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
};

export const lerp = (a: number, b: number, t: number): number =>
  // eslint-disable-next-line no-nested-ternary
  a + (t > 1 ? 1 : t < 0 ? 0 : t) * (b - a);

export const clamp = (x: number, min: number, max: number): number =>
  Math.min(Math.max(x, min), max);

export const inPow = (x1: number, x2: number, p: number, t: number): number => {
  if (t < 0) {
    t = 0;
  }
  if (t > 1) {
    t = 1;
  }
  return x1 + t ** p * (x2 - x1);
};

export const outPow = (
  x1: number,
  x2: number,
  p: number,
  t: number
): number => {
  if (t < 0) {
    t = 0;
  }
  if (t > 1) {
    t = 1;
  }
  return x1 + (1 - (1 - t) ** p) * (x2 - x1);
};

export type AnimationInterval = {
  loop: () => void;
  clear: () => void;
};
export const setAnimationInterval = (
  callback: () => void
): AnimationInterval => {
  let isRunning = true;
  const loop = () => {
    callback();
    if (isRunning) requestAnimationFrame(loop);
  };
  const clear = () => {
    isRunning = false;
  };
  loop();
  return {
    loop,
    clear,
  };
};

// https://stackoverflow.com/a/44134328
export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
