import { Point, Polygon, Rectangle } from './types';

/**
 * Check whether a rectangle includes a point or not.
 * @param rectangle
 * @param point
 * @returns {boolean} true if the rectangle includes the point, false otherwise
 */
export const rectangleIncludesPoint = <Dimensions extends number>(
  [point0, point1]: Rectangle<Dimensions>,
  point: Point<Dimensions>
): boolean => {
  const dimensions = point.length;
  for (let axis = 0; axis < dimensions; axis++) {
    if (point0[axis] > point[axis] || point1[axis] < point[axis]) return false;
  }
  return true;
};

/**
 * Check whether a polygon includes a point or not.
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
 * Check if two rectangles are disjoint a point or not.
 * @param rectangleA
 * @param rectangleB
 * @returns {boolean} true if their intersection is empty, false otherwise
 */
export const rectanglesAreDisjoint = <Dimensions extends number>(
  [pointA0, pointA1]: Rectangle<Dimensions>,
  rectangleB: Rectangle<Dimensions>
): boolean => {
  const rectangleACorners: Point<Dimensions>[] = pointA1.map<Point<Dimensions>>(
    (component1, i) =>
      pointA0.map((component0, j) =>
        i === j ? component1 : component0
      ) as Point<Dimensions>
  );
  for (let i = 0; i < rectangleACorners.length; i++) {
    if (rectangleIncludesPoint(rectangleB, rectangleACorners[i])) return false;
  }
  return true;
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
 * Returns the intersection of two rectangles.
 * @param rectangleA
 * @param rectangleB
 * @returns the intersection of these two rectangles
 */
export const rectangleIntersection = <Dimensions extends number>(
  [A0, A1]: Rectangle<Dimensions>,
  [B0, B1]: Rectangle<Dimensions>
): Rectangle<Dimensions> =>
  // make sure that the second point dominate the first one
  (rectanglesAreDisjoint([A0, A1], [B0, B1])
    ? [new Array(A0.length).fill(0), new Array(A0.length).fill(0)]
    : [
        new Array(A0.length)
          .fill(0)
          .map((_, axis) => Math.max(A0[axis], B0[axis])),
        new Array(A0.length)
          .fill(0)
          .map((_, axis) => Math.min(A1[axis], B1[axis])),
      ]) as Rectangle<Dimensions>;

/**
 * Returns the intersection of two polygons.
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
    // remove empty rectangles
    .filter((rectangle) => rectangleVolume(rectangle) > 0);
