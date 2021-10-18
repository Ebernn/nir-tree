import { MutableRefObject, useRef } from 'react';
import createController, { Controller } from '../../src/viewport/controller';
import useCleanRef from '../useCleanRef';

/**
 * Simple hook creating a controller.
 * @param onController controller creation callback
 * @returns {[MutableRefObject<Controller | undefined>, (ref: HTMLDivElement | null) => void]} controller ref, controller ref set pair
 */
const useControllerRef = (
  effect?: (controller: Controller) => (() => void) | void
): [
  MutableRefObject<Controller | undefined>,
  (ref: HTMLDivElement | null) => void
] => {
  const controllerRef = useRef<Controller>();
  const [, onControllerElementRefSet] = useCleanRef<HTMLDivElement>((ref) => {
    const controller = createController(ref);
    controllerRef.current = controller;
    const removeExtraListeners = effect ? effect(controller) : undefined;
    return () => {
      if (removeExtraListeners) removeExtraListeners();
      controller.removeListeners();
      controllerRef.current = undefined;
    };
  });
  return [controllerRef, onControllerElementRefSet];
};

export default useControllerRef;
