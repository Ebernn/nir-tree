/* eslint-disable no-param-reassign */
/* eslint-disable no-mixed-operators */
import mitt, { Emitter } from 'mitt';
import { Bounds, Coords, Limits } from '../types';
import {
  AnimationInterval,
  setAnimationInterval,
  lerp,
  outPow,
} from '../utils';

export type Events = {
  move: undefined;
  moveend: undefined;
  zoom: undefined;
  zoomend: undefined;
};

export type View = {
  limits: Limits;
  viewRect: { topLeft: Coords; bottomRight: Coords };
  getPos: () => Coords;
  getZoom: () => number;
  getBounds: () => Bounds;
  executeMove: (dx: number, dy: number, overrideSmooth: boolean) => void;
  executeZoom: (mouseX: number, mouseY: number, newZoom: number) => void;
  smoothMove: (dx: number, dy: number) => void;
  smoothZoom: (mouseX: number, mouseY: number, newZoom: number) => void;
  applyToContext: (
    ctx: CanvasRenderingContext2D,
    options?: {
      zoom: number;
      pos: { x: number; y: number };
      bounds: { width: number; height: number };
    }
  ) => void;
  mousePosToViewPos: (
    mouseX: number,
    mouseY: number
  ) => { x: number; y: number };
} & Emitter<Events>;

/**
 * Simulate a bounded view with position and zoom (with smooth transitions).
 *
 * Emitted events:
 *   move, movend,
 *   zoom, zoomend
 *
 * @param getBounds The view bounds getter
 * @param limits The space limits that can be viewed
 * @param pos The view position
 * @param zoom The view zoom
 * @returns {View} View object emitting the listed events.
 */
const view = (
  getBounds: () => Bounds,
  limits: Limits,
  pos: Coords = { x: 0, y: 0 },
  zoom = 1
): View => {
  const { emit, ...other } = mitt<Events>();
  /*
  ### viewRect ###

    + (topLeft) ----
    |                |
    |       + (pos)  | zoom*height
    |                |
      ---------------+ (bottomRight)
        zoom*width
  */
  const firstBounds = getBounds();
  const viewRect = {
    topLeft: {
      x: ((-1 / zoom) * firstBounds.width) / 2 + pos.x,
      y: ((-1 / zoom) * firstBounds.height) / 2 + pos.y,
    },
    bottomRight: {
      x: ((1 / zoom) * firstBounds.width) / 2 + pos.x,
      y: ((1 / zoom) * firstBounds.height) / 2 + pos.y,
    },
  };

  // zoom snap
  const zoomSnap = true;

  // smooth zoom
  let smoothZoomStartDate = Date.now();
  // in seconds
  const smoothZoomDuration = 0.2;
  let smoothZoomFrom: number;
  let smoothZoomTo: number;
  let smoothZoomInterval: AnimationInterval | undefined;

  // smooth move
  let smoothMoveStartDate = Date.now();
  // in seconds
  const smoothMoveDuration = 0.5;
  let smoothMoveFrom: Coords | undefined;
  let smoothMoveTo: Coords | undefined;
  let smoothMoveInterval: AnimationInterval | undefined;

  const pixelRatio =
    typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  const setPos = (x: number, y: number) => {
    pos.x = x;
    pos.y = y;
  };

  const getPos = (): Coords => pos;

  const setZoom = (newZoom: number) => {
    if (zoomSnap && !smoothZoomInterval) {
      const z = Math.log(newZoom) / 0.6931471806;
      const rz = Math.round(z);
      if (Math.abs(z - rz) < 0.04) newZoom = 2 ** rz;
    }
    zoom = newZoom;
  };

  const getZoom = (): number => zoom;

  const limit = () => {
    if (zoom > 64) {
      setZoom(64);
    } else if (zoom < 1) {
      setZoom(1);
    }

    let dx;
    let dy;
    const bounds = getBounds();
    if (bounds.width / zoom > limits.maxx - limits.minx) {
      dx = -pos.x;
    } else {
      dx = Math.max(limits.minx - viewRect.topLeft.x, 0);
      if (dx === 0) {
        dx = -Math.max(viewRect.bottomRight.x - limits.maxx, 0);
      }
    }
    if (bounds.height / zoom > limits.maxy - limits.miny) {
      dy = -pos.y;
    } else {
      dy = Math.max(limits.miny - viewRect.topLeft.y, 0);
      if (dy === 0) {
        dy = -Math.max(viewRect.bottomRight.y - limits.maxy, 0);
      }
    }

    setPos(pos.x + dx, pos.y + dy);
  };

  const updateViewRect = () => {
    const bounds = getBounds();
    viewRect.topLeft.x = ((-1 / zoom) * bounds.width) / 2 + pos.x;
    viewRect.topLeft.y = ((-1 / zoom) * bounds.height) / 2 + pos.y;
    viewRect.bottomRight.x = ((1 / zoom) * bounds.width) / 2 + pos.x;
    viewRect.bottomRight.y = ((1 / zoom) * bounds.height) / 2 + pos.y;
  };

  const executeMove = (dx: number, dy: number, overrideSmooth: boolean) => {
    if (overrideSmooth && smoothMoveInterval) {
      smoothMoveInterval.clear();
      smoothMoveInterval = undefined;
    }
    setPos(pos.x - dx / zoom / pixelRatio, pos.y - dy / zoom / pixelRatio);
    updateViewRect();
    limit();
    updateViewRect();
    emit('move');
  };

  const smoothMoveUpdate = () => {
    const now = Date.now();
    const tMove = (now - smoothMoveStartDate) / (smoothMoveDuration * 1000);
    if (smoothMoveFrom === undefined || smoothMoveTo === undefined) return;

    if (tMove > 1) {
      // stop the loop
      executeMove(smoothMoveTo.x, smoothMoveTo.y, true);
      emit('moveend');
      return;
    }
    const newdx = outPow(smoothMoveFrom.x, smoothMoveTo.x, 3, tMove);
    const newdy = outPow(smoothMoveFrom.y, smoothMoveTo.y, 3, tMove);
    executeMove(newdx, newdy, false);
  };

  const smoothMove = (dx: number, dy: number) => {
    smoothMoveFrom = { x: dx / pixelRatio, y: dy / pixelRatio };
    smoothMoveTo = { x: 0, y: 0 };
    smoothMoveStartDate = Date.now();
    if (smoothMoveInterval) {
      smoothMoveInterval.clear();
      smoothMoveInterval = undefined;
    }
    smoothMoveInterval = setAnimationInterval(() => {
      smoothMoveUpdate();
    });
  };

  const applyToContext = (
    ctx: CanvasRenderingContext2D,
    options?: {
      zoom: number;
      pos: { x: number; y: number };
      bounds: { width: number; height: number };
    }
  ) => {
    const viewZoom = options ? options.zoom : getZoom();
    const { x, y } = options ? options.pos : getPos();
    const { width, height } = options ? options.bounds : getBounds();
    ctx.translate(width / 2, height / 2);
    ctx.scale(viewZoom, viewZoom);
    ctx.translate(-x, -y);
  };

  const mousePosToViewPos = (mouseX: number, mouseY: number) => {
    const x = Math.floor(
      lerp(
        viewRect.topLeft.x,
        viewRect.bottomRight.x,
        mouseX / window.innerWidth
      )
    );
    const y = Math.floor(
      lerp(
        viewRect.topLeft.y,
        viewRect.bottomRight.y,
        mouseY / window.innerHeight
      )
    );
    return { x, y };
  };

  const executeZoom = (mouseX: number, mouseY: number, newZoom: number) => {
    const bounds = getBounds();
    mouseX -= (bounds.width / 2) * pixelRatio;
    mouseY -= (bounds.height / 2) * pixelRatio;
    setPos(
      pos.x + mouseX / zoom / pixelRatio,
      pos.y + mouseY / zoom / pixelRatio
    );
    setZoom(newZoom);
    setPos(
      pos.x - mouseX / zoom / pixelRatio,
      pos.y - mouseY / zoom / pixelRatio
    );
    updateViewRect();
    limit();
    updateViewRect();
    emit('zoom');
  };

  const smoothZoomUpdate = (mouseX: number, mouseY: number) => {
    const now = Date.now();
    const tZoom = (now - smoothZoomStartDate) / (smoothZoomDuration * 1000);

    if (tZoom > 1 && smoothZoomInterval) {
      // stop the loop
      smoothZoomInterval.clear();
      smoothZoomInterval = undefined;
      executeZoom(mouseX, mouseY, smoothZoomTo);
      emit('zoomend');
      return;
    }
    executeZoom(mouseX, mouseY, outPow(smoothZoomFrom, smoothZoomTo, 3, tZoom));
  };

  const smoothZoom = (mouseX: number, mouseY: number, newZoom: number) => {
    smoothZoomFrom = zoom;
    smoothZoomTo = newZoom;
    smoothZoomStartDate = Date.now();
    if (smoothZoomInterval) {
      smoothZoomInterval.clear();
      smoothZoomInterval = undefined;
    }
    smoothZoomInterval = setAnimationInterval(() => {
      smoothZoomUpdate(mouseX, mouseY);
    });
  };

  limit();
  updateViewRect();

  return {
    emit,
    ...other,
    limits,
    viewRect,
    getPos,
    getZoom,
    getBounds,
    executeMove,
    executeZoom,
    smoothZoom,
    smoothMove,
    applyToContext,
    mousePosToViewPos,
  };
};

export default view;
