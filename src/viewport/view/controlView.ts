import { Controller } from '../controller';
import { Coords } from '../types';
import { View } from './view';

/**
 * Attach a view controller to an HTML element and control it.
 * @param controller Controller where listeners will be bounded to
 * @param view The view controlled by the view controller
 * @param smoothZoom Should the view zoom smoothly ?
 * @returns {Controller} The view controller.
 */
const controlView = (
  controller: Controller,
  view: View,
  smoothZoom: () => boolean
): (() => void) => {
  const { el, on, off } = controller;
  const velVec: Coords = { x: 0, y: 0 };
  let lastVelDate = Date.now();
  let lastZoom = view.getZoom();
  const boundingClientRect: DOMRect = el.getBoundingClientRect();

  // controller
  const onDbClick = (
    event: MouseEvent & { lastMouseX: number; lastMouseY: number }
  ) => {
    if (event === undefined) return;
    if (lastZoom <= 2) {
      lastZoom = 16;
    }
    view.smoothZoom(
      event.lastMouseX - boundingClientRect.x,
      event.lastMouseY - boundingClientRect.y,
      lastZoom
    );
  };

  const onDragStart = () => {
    velVec.x = 0;
    velVec.y = 0;
    lastVelDate = Date.now();
    document.body.style.cursor = 'move';
  };

  const onDragMove = (
    event: ((MouseEvent | TouchEvent) & { dx: number; dy: number }) | undefined
  ) => {
    if (event === undefined) return;
    // event.preventDefault();
    velVec.x = (event.dx + 4 * velVec.x) / 5;
    velVec.y = (event.dy + 4 * velVec.y) / 5;
    lastVelDate = Date.now();
    view.executeMove(event.dx, event.dy, true);
  };

  const isSliding = () =>
    smoothZoom() &&
    velVec.x * velVec.x + velVec.y * velVec.y > 10 &&
    Date.now() - lastVelDate < 50;

  const onDragEnd = () => {
    const slide = isSliding();
    if (slide) view.smoothMove(velVec.x / 2, velVec.y / 2);
    document.body.style.cursor = 'auto';
    return slide;
  };

  const onTouchScaleStart = () => (lastZoom = view.getZoom());

  const onTouchScaleMove = (
    event: (TouchEvent & { ratio: number; mid: Coords }) | undefined
  ) => {
    if (event === undefined) return;
    const dz = event.ratio * lastZoom;
    if (dz > 1 && dz < 64) {
      view.executeZoom(
        event.mid.x - boundingClientRect.x,
        event.mid.y - boundingClientRect.y,
        dz
      );
    }
  };

  let lastWheel = 0;
  const onMouseWheel = (
    event: { delta: number; lastMouseX: number; lastMouseY: number } | undefined
  ) => {
    const now = Date.now();
    if (event === undefined || now - lastWheel < 60) return;
    lastWheel = now;

    // event.preventDefault();
    let dt = -event.delta / 120;
    if (dt > 0) {
      lastZoom *= 1.4142135623730951;
    }
    if (dt < 0) {
      lastZoom /= 1.4142135623730951;
    }
    if (lastZoom > 64) {
      lastZoom = 64;
      dt = 0;
    } else if (lastZoom < 1) {
      lastZoom = 1;
      dt = 0;
    }
    view.smoothZoom(
      event.lastMouseX - boundingClientRect.x,
      event.lastMouseY - boundingClientRect.y,
      lastZoom
    );
  };

  on('dbclick', onDbClick);
  on('dragstart', onDragStart);
  on('dragmove', onDragMove);
  on('dragend', onDragEnd);
  on('touchscalestart', onTouchScaleStart);
  on('touchscalemove', onTouchScaleMove);
  on('mousewheel', onMouseWheel);

  return () => {
    off('dbclick', onDbClick);
    off('dragstart', onDragStart);
    off('dragmove', onDragMove);
    off('dragend', onDragEnd);
    off('touchscalestart', onTouchScaleStart);
    off('touchscalemove', onTouchScaleMove);
    off('mousewheel', onMouseWheel);
  };
};

export default controlView;
