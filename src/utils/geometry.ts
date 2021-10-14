import { Point, Polygon, Rectangle } from './types';

/**
 * Definition 4. Check whether point0 dominates point1.
 * @param point0
 * @param point1
 * @returns {boolean} true if point0 dominates point1, false otherwise
 */
export const dominates = <Dimensions extends number>(
  point0: Point<Dimensions>,
  point1: Point<Dimensions>
): boolean => {
  const dimensions = point0.length;
  for (let axis = 0; axis < dimensions; axis++) {
    if (point0[axis] < point1[axis]) return false;
  }
  return true;
};

/**
 * Definition 10. Check whether a point is in the rectangle perimeter.
 * @param rectangle
 * @param point
 * @returns {number | undefined} axis of alignement, undefined if the point is not in the perimeter
 */
export const pointInPerimeter = <Dimensions extends number>(
  [ll, ur]: Rectangle<Dimensions>,
  point: Point<Dimensions>
): number | undefined => {
  const dimensions = ll.length;
  for (let axis = 0; axis < dimensions; axis++) {
    if (rectangleIncludesPoint([ll, ur], point)) {
      if (point[axis] === ll[axis]) return axis;
      if (point[axis] === ur[axis]) return axis + dimensions; // to distinguish the sides
    }
  }
  return undefined;
};

/**
 * Check whether rectangle B is in the perimeter of rectangle A.
 * @param rectangleA
 * @param rectangleB
 * @returns {number | undefined} axis of alignement, undefined if rectangle B is not in the perimeter of rectangle A
 */
export const rectangleInPerimeter = <Dimensions extends number>(
  rectangle: Rectangle<Dimensions>,
  [ll, ur]: Rectangle<Dimensions>
): number | undefined => {
  const perll = pointInPerimeter(rectangle, ll);
  const perur = pointInPerimeter(rectangle, ur);
  return perll === perur ? perll : undefined;
};

/**
 * Definition 6. Check whether a rectangle includes a point or not.
 * @param rectangle
 * @param point
 * @returns {boolean} true if the rectangle includes the point, false otherwise
 */
export const rectangleIncludesPoint = <Dimensions extends number>(
  [ll, ur]: Rectangle<Dimensions>,
  point: Point<Dimensions>
): boolean => dominates(point, ll) && dominates(ur, point);

/**
 * Definition 8. Check whether a polygon includes a point or not.
 * @param rectangles a polygon
 * @param point
 * @returns {boolean} true if the polygon includes the point, false otherwise
 */
export const polygonIncludesPoint = <Dimensions extends number>(
  rectangles: Polygon<Dimensions>,
  point: Point<Dimensions>
): boolean => {
  for (let i = 0; i < rectangles.length; i++) {
    if (rectangleIncludesPoint(rectangles[i], point)) return true;
  }
  return false;
};

/**
 * Definition 12. Check if two rectangles are disjoint.
 * @param rectangleA
 * @param rectangleB
 * @returns {boolean} true if they are disjoint, false otherwise
 */
export const rectanglesAreDisjoint = <Dimensions extends number>(
  rectangleA: Rectangle<Dimensions>,
  rectangleB: Rectangle<Dimensions>
): boolean => {
  const intersection = rectangleIntersection(rectangleA, rectangleB);
  if (!intersection) return true;
  const perA = rectangleInPerimeter(rectangleA, intersection);
  const perB = rectangleInPerimeter(rectangleB, intersection);
  return perA !== undefined && perA === perB;
};

/**
 * Expands a rectangle to enclose a point.
 * @param rectangle
 * @param point
 * @returns expanded rectangle containing the point
 */
export const rectangleEnclose = <Dimensions extends number>(
  [ll, ur]: Rectangle<Dimensions>,
  point: Point<Dimensions>
): Rectangle<Dimensions> =>
  [
    ll.map((comp, axis) => (point[axis] < comp ? point[axis] : comp)),
    ur.map((comp, axis) => (point[axis] > comp ? point[axis] : comp)),
  ] as Rectangle<Dimensions>;

/**
 * Returns a rectangle volume.
 * @param rectangle
 * @returns {number} volume
 */
export const rectangleVolume = <Dimensions extends number>([
  ll,
  ur,
]: Rectangle<Dimensions>): number =>
  ur
    .map((comp, axis) => comp - ll[axis])
    .reduce((accVolume, curVolume) => accVolume * curVolume);

/**
 * Returns a polygon volume.
 * @param rectangle
 * @returns {number} volume
 */
export const polygonVolume = <Dimensions extends number>(
  rectangles: Polygon<Dimensions>
): number =>
  rectangles
    .map((rectangle) => rectangleVolume(rectangle))
    .reduce((accVolume, curVolume) => accVolume + curVolume);

/**
 * Definition 9. Returns the intersection of two rectangles.
 * @param rectangleA
 * @param rectangleB
 * @returns the intersection of these two rectangles
 */
export const rectangleIntersection = <Dimensions extends number>(
  [llA, urA]: Rectangle<Dimensions>,
  [llB, urB]: Rectangle<Dimensions>
): Rectangle<Dimensions> | undefined =>
  (([ll, ur]: Rectangle<Dimensions>) =>
    // make sure that ur dominates ll
    dominates(ur, ll) ? [ll, ur] : undefined)([
    // apply the intersection definition
    llA.map((comp, axis) => Math.max(comp, llB[axis])) as Point<Dimensions>,
    urA.map((comp, axis) => Math.min(comp, urB[axis])) as Point<Dimensions>,
  ]) as Rectangle<Dimensions>;

/**
 * Definition 11. Returns the intersection of two polygons.
 * @param polygonA
 * @param polygonB
 * @returns the intersection of these two polygons
 */
export const polygonIntersection = <Dimensions extends number>(
  rectanglesA: Polygon<Dimensions>,
  rectanglesB: Polygon<Dimensions>
): Polygon<Dimensions> =>
  rectanglesA
    .map((rectangle1) =>
      // TODO : improve this part, quadratic complexity for now :S
      rectanglesB
        // get their intersection
        .map((rectangle2) => rectangleIntersection(rectangle1, rectangle2))
    )
    // concat them all
    .flat()
    // remove empty intersections
    .filter((rectangle) => rectangle) as Polygon<Dimensions>;

/**
 * Definition 14. Rectangle R is replaced with fragments of itself
 * @param rectanglesR
 * @param rectanglesRp
 * @returns fragmented rectangle R
 */
export const rectangleFragmentation = <Dimensions extends number>(
  [Rll, Rur]: Rectangle<Dimensions>,
  [Rpll, Rpur]: Rectangle<Dimensions>
): Polygon<Dimensions> => {
  const dimensions = Rpll.length;
  // our result, fragmented rectangle R
  const fragments: Polygon<Dimensions> = [];
  // remaining rectangle to be fragmented
  const [rll, rur]: Rectangle<Dimensions> = [Rll, Rur];
  const inside = (point: Point<Dimensions>, axis: number) =>
    rll[axis] < point[axis] && rur[axis] > point[axis];
  // fragment the remaining rectangle
  for (let axis = 0; axis < dimensions; axis++) {
    // move the remaining rectangle face to fit Rpll / Rpur on this axis if possible
    if (inside(Rpll, axis))
      fragments.push([
        [...rll],
        Rur.map((comp, RurAxis) => (RurAxis === axis ? Rpll[axis] : comp)),
      ] as Rectangle<Dimensions>);
    if (inside(Rpur, axis))
      fragments.push([
        Rll.map((comp, RllAxis) => (RllAxis === axis ? Rpur[axis] : comp)),
        [...rur],
      ] as Rectangle<Dimensions>);
    // update the remaining rectangle
    rll[axis] = Math.max(rll[axis], Rpll[axis]);
    rur[axis] = Math.min(rur[axis], Rpur[axis]);
  }
  return fragments;
};

/**
 * Definition 15. Polygon P is replaced with fragments of itself
 * @param rectanglesP
 * @param rectanglesPp
 * @returns fragmented polygon P
 */
export const polygonFragmentation = <Dimensions extends number>(
  rectanglesP: Polygon<Dimensions>,
  rectanglesPp: Polygon<Dimensions>
): Polygon<Dimensions> =>
  rectanglesP
    .map((rectangleP) =>
      rectanglesPp.map((rectanglePp) =>
        rectangleFragmentation(rectangleP, rectanglePp)
      )
    )
    .flat(2);
