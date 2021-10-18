import mitt, { Emitter } from 'mitt';
import { Coords, Listener } from './types';

export type Events = {
  touchscalestart: TouchEvent;
  touchscalemove: TouchEvent & { ratio: number; mid: Coords };
  touchscaleend: TouchEvent;
  dragstart:
    | TouchEvent
    | (MouseEvent & {
        lastMouseX: number;
        lastMouseY: number;
        isMouseDown: boolean;
        dx: number;
        dy: number;
      });
  dragmove: (TouchEvent | MouseEvent) & { dx: number; dy: number };
  dragend: TouchEvent | MouseEvent;
  keydown: KeyboardEvent;
  docmouseup: MouseEvent;
  docmousemove: MouseEvent;
  click: MouseEvent;
  mousewheel: WheelEvent & {
    delta: number;
    lastMouseX: number;
    lastMouseY: number;
  };
  dbclick: MouseEvent & {
    lastMouseX: number;
    lastMouseY: number;
  };
};

export type Controller = { el: HTMLElement } & Listener & Emitter<Events>;

type KeyboardEventListener = (event: KeyboardEvent) => void;
type MouseEventListener = (event: MouseEvent) => void;
type WheelEventListener = (event: WheelEvent) => void;

/**
 * Attach a controller to an HTML element, mainly listening to mouse / touch events.
 *
 * Emitted events:
 *   dragstart, dragmove, dragend,
 *   touchstart, touchmove, touchend, touchscalestart, touchscalemove, touchscaleend,
 *   keydown, click, dbclick, mousewheel, docmouseup, docmousemove
 *
 * @param el HTML element listening to control events
 * @param dragThreshold Threshold before considering mouse dragging
 * @returns {Controller} Controller object emitting the listed events.
 */
const controller = (el: HTMLElement, dragThreshold = 2): Controller => {
  const { emit, ...other } = mitt<Events>();

  let lastMouseX = window.innerWidth / 2;
  let lastMouseY = window.innerHeight / 2;

  // keyboard
  const docKeyDownEventListener: KeyboardEventListener = (
    event: KeyboardEvent
  ) => {
    emit('keydown', event);
  };
  document.addEventListener('keydown', docKeyDownEventListener);

  // mouse
  let isMouseMoving = 0;
  let isDragging = false;
  let isMouseDown = false;
  const docMouseUpEventListener: MouseEventListener = (event: MouseEvent) => {
    isMouseDown = false;
    if (isDragging) {
      emit('dragend', event);
    }
    isDragging = false;
    emit('docmouseup', event);
  };
  const mouseUpEventListener: MouseEventListener = (event: MouseEvent) => {
    isMouseDown = false;
    if (isMouseMoving < dragThreshold) {
      emit('click', event);
    }
  };
  const mouseDownEventListener: MouseEventListener = () => {
    isMouseDown = true;
    isMouseMoving = 0;
  };
  const mouseWheelEventListener: WheelEventListener = (event: WheelEvent) => {
    emit('mousewheel', {
      ...event,
      delta: event.deltaY,
      lastMouseX,
      lastMouseY,
    });
  };
  const dblclickEventListener: MouseEventListener = (event: MouseEvent) => {
    emit('dbclick', { ...event, lastMouseX, lastMouseY });
  };
  const docMouseMoveEventListener: MouseEventListener = (event: MouseEvent) => {
    if (event === undefined) return;

    const dx = event.x - lastMouseX;
    const dy = event.y - lastMouseY;
    if (isMouseDown) {
      isMouseMoving += 1;
      if (isMouseMoving > dragThreshold) {
        if (!isDragging) {
          isDragging = true;
          emit('dragstart', {
            ...event,
            lastMouseX,
            lastMouseY,
            isMouseDown,
            dx,
            dy,
          });
        } else {
          emit('dragmove', { ...event, dx, dy });
        }
      }
    }
    emit('docmousemove', event);

    if (isDragging) {
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
      event.cancelBubble = true;
      event.returnValue = false;
      window.getSelection()?.removeAllRanges();
    }

    lastMouseX = event.x;
    lastMouseY = event.y;
  };
  document.addEventListener('mouseup', docMouseUpEventListener, false);
  el.addEventListener('mouseup', mouseUpEventListener, false);
  el.addEventListener('mousedown', mouseDownEventListener, false);
  el.addEventListener('wheel', mouseWheelEventListener, { passive: true });
  el.addEventListener('dblclick', dblclickEventListener);
  document.addEventListener('mousemove', docMouseMoveEventListener, false);
  return {
    el,
    emit,
    ...other,
    removeListeners: () => {
      document.removeEventListener('keydown', docKeyDownEventListener);
      document.removeEventListener('mouseup', docMouseUpEventListener);
      el.removeEventListener('mouseup', mouseUpEventListener);
      el.removeEventListener('mousedown', mouseDownEventListener);
      el.removeEventListener('wheel', mouseWheelEventListener);
      el.removeEventListener('dblclick', dblclickEventListener);
      document.removeEventListener('mousemove', docMouseMoveEventListener);
    },
  };
};

export default controller;
