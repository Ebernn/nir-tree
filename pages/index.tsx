import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import useControllerRef from '../hooks/viewport/useControllerRef';
import useControlledCanvasViewRef from '../hooks/viewport/useControlledCanvasViewRef';
import { Node } from '../src/tree/nirTree';
import { buildExampleTree } from '../src/tree/misc/buildTree';
import drawTree from '../src/tree/misc/drawTree';
import { useRef } from 'react';

// const tree = buildExampleTree();

const useNirTreeExampleRef = () => {
  const nirTreeRef = useRef<Node<2>>(buildExampleTree());
  return nirTreeRef;
};

const ControlledView = () => {
  const nirTreeRef = useNirTreeExampleRef();
  const setupListeners = () => {
    const controller = controllerRef.current;
    const render = renderRef.current;
    if (controller && render) {
      const onClick = () => {
        console.log('click');
      };
      controller.on('click', onClick);
      return () => {
        controller.off('click', onClick);
      };
    }
  };
  const [controllerRef, onTreeControllerElementRefSet] =
    useControllerRef(setupListeners);
  const [, renderRef, onViewControllerElementRefSet, onCanvasElementRefSet] =
    useControlledCanvasViewRef((context) => {
      drawTree(context, nirTreeRef.current);
    }, setupListeners);
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
