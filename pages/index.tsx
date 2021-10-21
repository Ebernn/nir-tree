import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import useControlledCanvasViewRef from '../hooks/viewport/useControlledCanvasViewRef';
import useExample2 from '../hooks/examples/useExample2';
import { Node } from '../src/tree/nirTree';
import { buildExampleTree } from '../src/tree/misc/buildTree';
import drawTree from '../src/tree/misc/drawTree';
import { useRef } from 'react';

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
  const [onTreeControllerElementRefSet] = useExample2(
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
