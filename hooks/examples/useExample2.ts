import useControllerRef from '../viewport/useControllerRef';
import { splitNode, Node } from '../../src/tree/nirTree';
import { buildExampleTree } from '../../src/tree/misc/buildTree';
import { scaleFactor } from '../../src/tree/misc/drawTree';
import { MutableRefObject } from 'react';
import { View } from '../../src/viewport/view/view';

/**
 * Example 2. Move the cursor around, see how the tree get split.
 * @param nirTreeRef
 * @param viewRef
 * @param renderRef
 * @returns
 */
const useExample2 = (
  nirTreeRef: MutableRefObject<Node<2>>,
  viewRef: MutableRefObject<View>,
  renderRef: MutableRefObject<(() => void) | undefined>
): [(ref: HTMLDivElement | null) => void] => {
  const [, onTreeControllerElementRefSet] = useControllerRef((controller) => {
    const onDocMouseMove = (e: MouseEvent) => {
      let { x } = viewRef.current.mousePosToViewPos(e.clientX, e.clientY);
      x /= scaleFactor;
      nirTreeRef.current = {
        parent: undefined,
        branches: [],
      };
      const [bL, bR] = splitNode(buildExampleTree(), x, 0);
      nirTreeRef.current.branches = [bL, bR];
      bL.child.parent = nirTreeRef.current;
      bR.child.parent = nirTreeRef.current;
      if (renderRef.current) renderRef.current();
    };
    controller.on('docmousemove', onDocMouseMove);
    return () => {
      controller.off('docmousemove', onDocMouseMove);
    };
  });
  return [onTreeControllerElementRefSet];
};

export default useExample2;
