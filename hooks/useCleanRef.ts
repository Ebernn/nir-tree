import { MutableRefObject, useCallback, useRef } from 'react';

const useCleanRef = <T>(
  effect?: (ref: T) => (() => void) | void
): [MutableRefObject<T | undefined>, (ref: T | null) => void] => {
  const refRef = useRef<T>();
  const cleanRef = useRef<(() => void) | void>();
  const onElementRefSet = useCallback(
    (ref: T | null) => {
      if (ref === null) {
        refRef.current = undefined;
        if (cleanRef.current) cleanRef.current();
      } else {
        refRef.current = ref;
        cleanRef.current = effect ? effect(ref) : undefined;
      }
    },
    [effect]
  );
  return [refRef, onElementRefSet];
};

export default useCleanRef;
