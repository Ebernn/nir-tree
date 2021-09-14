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
export const inPerimeter = <Dimensions extends number>(
  [point0, point1]: Rectangle<Dimensions>,
  point: Point<Dimensions>
): number | undefined => {
  const dimensions = point0.length;
  for (let axis = 0; axis < dimensions; axis++) {
    if (point[axis] === point0[axis] || point[axis] === point1[axis])
      return axis;
  }
  return undefined;
};

/**
 * Definition 6. Check whether a rectangle includes a point or not.
 * @param rectangle
 * @param point
 * @returns {boolean} true if the rectangle includes the point, false otherwise
 */
export const rectangleIncludesPoint = <Dimensions extends number>(
  [point0, point1]: Rectangle<Dimensions>,
  point: Point<Dimensions>
): boolean => dominates(point, point0) && dominates(point1, point);

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
  const [I0, I1] = intersection;
  const axisAI0 = inPerimeter(rectangleA, I0);
  const axisAI1 = inPerimeter(rectangleA, I1);
  const axisBI0 = inPerimeter(rectangleB, I0);
  const axisBI1 = inPerimeter(rectangleB, I1);
  return (
    axisAI0 !== undefined &&
    axisAI0 === axisAI1 &&
    axisAI0 === axisBI0 &&
    axisAI0 === axisBI1
  );
};

/**
 * Expands a rectangle to enclose a point.
 * @param rectangle
 * @param point
 * @returns expanded rectangle containing the point
 */
export const rectangleEnclose = <Dimensions extends number>(
  [point0, point1]: Rectangle<Dimensions>,
  point: Point<Dimensions>
): Rectangle<Dimensions> =>
  [
    point0.map((component, axis) =>
      point[axis] < component ? point[axis] : component
    ),
    point1.map((component, axis) =>
      point[axis] > component ? point[axis] : component
    ),
  ] as Rectangle<Dimensions>;

/**
 * Returns a rectangle volume.
 * @param rectangle
 * @returns {number} volume
 */
export const rectangleVolume = <Dimensions extends number>([
  point0,
  point1,
]: Rectangle<Dimensions>): number =>
  point1
    .map((component, axis) => component - point0[axis])
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
  [A0, A1]: Rectangle<Dimensions>,
  [B0, B1]: Rectangle<Dimensions>
): Rectangle<Dimensions> | undefined =>
  (([I0, I1]) => {
    // make sure that the second point dominates the first one
    const dimensions = I0.length;
    for (let axis = 0; axis < dimensions; axis++) {
      if (I1[axis] < I0[axis]) {
        return undefined;
      }
    }
    return [I0, I1];
  })([
    // apply the intersection definition
    A0.map((component, axis) => Math.max(component, B0[axis])),
    A1.map((component, axis) => Math.min(component, B1[axis])),
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
    .reduce((acc, cur) => [...acc, ...cur])
    // remove empty intersections
    .filter((rectangle) => rectangle) as Polygon<Dimensions>;

/**
 * Rectangle B is replaced with fragments of itself
 * @param rectanglesA
 * @param rectanglesB
 * @returns fragmented rectangle B
 */
export const rectangleFragmentaion = <Dimensions extends number>(
  [A0, A1]: Rectangle<Dimensions>,
  [B0, B1]: Rectangle<Dimensions>
): Polygon<Dimensions> => {
  const dimensions = A0.length;
  // our result, fragmented rectangle B
  const fragments: Polygon<Dimensions> = [];
  // remaining rectangle to be fragmented
  const [r0, r1]: Rectangle<Dimensions> = [B0, B1];
  // fragment the remaining rectangle
  for (let axis = 0; axis < dimensions; axis++) {
    if (r0[axis] < A0[axis] && r1[axis] > A0[axis])
      fragments.push([
        // move the remaining rectangle face to fit A0 on this axis
        [...r0],
        B1.map((B1component, B1axis) =>
          B1axis === axis ? A0[axis] : B1component
        ),
      ] as Rectangle<Dimensions>);
    if (r0[axis] < A1[axis] && r1[axis] > A1[axis])
      fragments.push([
        // move the remaining rectangle face to fit A1 on this axis
        B0.map((B0component, B0axis) =>
          B0axis === axis ? A1[axis] : B0component
        ),
        [...r1],
      ] as Rectangle<Dimensions>);
    // update the remaining rectangle
    r0[axis] = Math.max(r0[axis], A0[axis]);
    r1[axis] = Math.min(r1[axis], A1[axis]);
  }
  // remove empty rectangles
  return fragments.filter((rectangle) => rectangleVolume(rectangle) > 0);
};
