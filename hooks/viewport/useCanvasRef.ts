import { MutableRefObject } from 'react';
import useCleanRef from '../useCleanRef';

const useCanvasRef = (
  effect?: (ref: HTMLCanvasElement) => (() => void) | void
): [
  MutableRefObject<HTMLCanvasElement | undefined>,
  (ref: HTMLCanvasElement | null) => void
] => useCleanRef<HTMLCanvasElement>(effect);

export default useCanvasRef;
