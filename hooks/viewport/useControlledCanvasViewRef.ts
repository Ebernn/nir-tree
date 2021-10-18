import { MutableRefObject, useRef } from 'react';
import { resize } from '../../src/viewport/utils';
import { View } from '../../src/viewport/view/view';
import useCanvasRef from './useCanvasRef';
import useControlledViewRef from './useControlledViewRef';

const useControlledCanvasViewRef = (
  draw: (context: CanvasRenderingContext2D) => void,
  effect?: (render: () => void) => (() => void) | void
): [
  MutableRefObject<View>,
  MutableRefObject<(() => void) | undefined>,
  (ref: HTMLDivElement | null) => void,
  (ref: HTMLCanvasElement) => void
] => {
  const renderRef = useRef<() => void>();
  const [viewRef, onControllerElementRefSet] = useControlledViewRef();
  const [, onCanvasElementRefSet] = useCanvasRef((canvas) => {
    const context = canvas.getContext('2d');
    if (context === null) throw new Error('No context found on that canvas.');

    const view = viewRef.current;

    const render = () => {
      resize(canvas);
      context.save();
      const { devicePixelRatio: ratio = 1 } = window;
      context.scale(ratio, ratio);
      context.fillStyle = '#080808';
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      view.applyToContext(context);
      draw(context);
      context.restore();
    };
    renderRef.current = render;

    const clean = effect ? effect(render) : undefined;
    view.on('move', render);
    view.on('zoom', render);

    render();

    return () => {
      renderRef.current = undefined;
      if (clean) clean();
      view.off('move', render);
      view.off('zoom', render);
    };
  });
  return [viewRef, renderRef, onControllerElementRefSet, onCanvasElementRefSet];
};

export default useControlledCanvasViewRef;
