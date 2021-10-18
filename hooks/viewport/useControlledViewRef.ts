import { MutableRefObject, useRef } from 'react';
import { Limits } from '../../src/viewport/types';
import createView, { View } from '../../src/viewport/view/view';
import controlView from '../../src/viewport/view/controlView';
import useControllerRef from './useControllerRef';

// some default settings
const viewMaxLimit = 32000;
const viewLimits: Limits = {
  minx: -viewMaxLimit,
  maxx: viewMaxLimit,
  miny: -viewMaxLimit,
  maxy: viewMaxLimit,
};

/**
 * Simple hook creating and controlling a view.
 * @returns {[MutableRefObject<View>, (ref: HTMLDivElement | null) => void]} view ref, controller ref set pair
 */
const useControlledViewRef = (): [
  MutableRefObject<View>,
  (ref: HTMLDivElement | null) => void
] => {
  const viewRef = useRef<View>(
    createView(
      () => ({
        width:
          typeof window !== 'undefined'
            ? window.innerWidth / window.devicePixelRatio
            : 600,
        height:
          typeof window !== 'undefined'
            ? window.innerHeight / window.devicePixelRatio
            : 600,
      }),
      viewLimits,
      { x: 0, y: 0 },
      1
    )
  );
  const [, onControllerElementRefSet] = useControllerRef((controller) =>
    controlView(controller, viewRef.current, () => true)
  );
  return [viewRef, onControllerElementRefSet];
};

export default useControlledViewRef;
