import useControllerRef from '../viewport/useControllerRef';
import { chooseLeaf, Node } from '../../src/tree/nirTree';
import { buildExampleTree } from '../../src/tree/misc/buildTree';
import { scaleFactor } from '../../src/tree/misc/drawTree';
import { MutableRefObject } from 'react';
import { View } from '../../src/viewport/view/view';

/**
 * Example 1. Move the cursor around, see which polygons should expand.
 * @param nirTreeRef
 * @param viewRef
 * @param renderRef
 * @returns
 */
const useExample1 = (
  nirTreeRef: MutableRefObject<Node<2>>,
  viewRef: MutableRefObject<View>,
  renderRef: MutableRefObject<(() => void) | undefined>
): [(ref: HTMLDivElement | null) => void] => {
  const [, onTreeControllerElementRefSet] = useControllerRef((controller) => {
    const onDocMouseMove = (e: MouseEvent) => {
      let { x, y } = viewRef.current.mousePosToViewPos(e.clientX, e.clientY);
      x /= scaleFactor;
      y /= -scaleFactor;
      nirTreeRef.current = buildExampleTree();
      chooseLeaf(nirTreeRef.current, [x, y]);
      if (renderRef.current) renderRef.current();
    };
    controller.on('docmousemove', onDocMouseMove);
    return () => {
      controller.off('docmousemove', onDocMouseMove);
    };
  });
  return [onTreeControllerElementRefSet];
};

export default useExample1;
