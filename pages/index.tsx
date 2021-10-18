import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import useControllerRef from '../hooks/viewport/useControllerRef';
import useControlledCanvasViewRef from '../hooks/viewport/useControlledCanvasViewRef';
import { chooseLeaf, Node } from '../src/tree/nirTree';
import { buildExampleTree } from '../src/tree/misc/buildTree';
import drawTree, { scaleFactor } from '../src/tree/misc/drawTree';
import { MutableRefObject, useRef } from 'react';
import { View } from '../src/viewport/view/view';

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
) => {
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

const ControlledView = () => {
  const nirTreeRef = useRef<Node<2>>(buildExampleTree());
  const [
    viewRef,
    renderRef,
    onViewControllerElementRefSet,
    onCanvasElementRefSet,
  ] = useControlledCanvasViewRef((context) => {
    drawTree(context, nirTreeRef.current);
  });
  const [onTreeControllerElementRefSet] = useExample1(
    nirTreeRef,
    viewRef,
    renderRef
  );
  return (
    <div
      ref={(ref) => {
        onViewControllerElementRefSet(ref);
        onTreeControllerElementRefSet(ref);
      }}
    >
      <div className={styles.controller}></div>
      <canvas ref={onCanvasElementRefSet}></canvas>
    </div>
  );
};

const Home: NextPage = () => {
  return <ControlledView />;
};

export default Home;
