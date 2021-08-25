import { Point, Polygon, Rectangle } from './types';

/**
 * Check whether a rectangle includes a point or not.
 * @param rectangle
 * @param point
 * @returns {boolean} true if the rectangle includes the point, false otherwise
 */
export const rectangleIncludesPoint = <Dimensions extends number>(
  rectangle: Rectangle<Dimensions>,
  point: Point<Dimensions>
): boolean => {
  const dimensions = point.length;
  for (let axis = 0; axis < dimensions; axis++) {
    if (rectangle[0][axis] > point[axis] || rectangle[1][axis] < point[axis])
      return false;
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
 * @returns true if their intersection is empty, false otherwise
 */
export const rectanglesAreDisjoint = <Dimensions extends number>(
  rectangleA: Rectangle<Dimensions>,
  rectangleB: Rectangle<Dimensions>
): boolean => {
  const rectangleACorners: Point<Dimensions>[] = rectangleA[1].map<
    Point<Dimensions>
  >(
    (component1, i) =>
      rectangleA[0].map((component0, j) =>
        i === j ? component1 : component0
      ) as Point<Dimensions>
  );
  for (let i = 0; i < rectangleACorners.length; i++) {
    if (rectangleIncludesPoint(rectangleB, rectangleACorners[i])) return false;
  }
  return true;
};
