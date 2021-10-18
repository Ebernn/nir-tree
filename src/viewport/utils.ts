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
