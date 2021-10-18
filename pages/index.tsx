import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import useControllerRef from '../hooks/viewport/useControllerRef';
import useControlledCanvasViewRef from '../hooks/viewport/useControlledCanvasViewRef';
// import { buildExampleTree } from '../src/tree/misc/buildTree';

// const tree = buildExampleTree();

const ControlledView = () => {
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
      context.beginPath();
      context.rect(20, 20, 150, 100);
      context.stroke();
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
