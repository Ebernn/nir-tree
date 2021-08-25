import {
  rectangleIncludesPoint,
  polygonIncludesPoint,
  rectanglesAreDisjoint,
} from './geometry';
import { Point, Rectangle } from './types';

describe('Geometry', () => {
  describe('Rectangles', () => {
    /**
     *  4   |   ┌ +
     *      |   │ │
     *  2   |   + ┘
     *      |
     *      + - - - - - -
     *          2 3
     */
    const rectangleA: Rectangle<2> = [
      [2, 2],
      [3, 4],
    ];

    /**
     *      |
     *  3   | ┌──── +
     *  2   | + ────┘
     *      |
     *      + - - - - - -
     *        1     4
     */
    const rectangleB: Rectangle<2> = [
      [1, 2],
      [4, 3],
    ];

    /**
     *  4   |       ┌ +
     *      |       │ │
     *  2   |       + ┘
     *      |
     *      + - - - - - -
     *              4 5
     */
    const rectangleC: Rectangle<2> = [
      [4, 2],
      [5, 4],
    ];

    it('should include points', () => {
      const points: Point<2>[] = [
        [2.25, 2.5],
        [2.75, 3.5],
      ];
      expect(
        points
          .map((point) => rectangleIncludesPoint(rectangleA, point))
          .every((v) => v === true)
      ).toBe(true);
    });
    it('should include points (edge cases)', () => {
      const points: Point<2>[] = [
        [2, 2],
        [3, 4],
      ];
      expect(
        points
          .map((point) => rectangleIncludesPoint(rectangleA, point))
          .every((v) => v === true)
      ).toBe(true);
    });
    it('should NOT include points', () => {
      const points: Point<2>[] = [
        [3.25, 2.5],
        [2.75, 0.5],
      ];
      expect(
        points
          .map((point) => rectangleIncludesPoint(rectangleA, point))
          .every((v) => v === false)
      ).toBe(true);
    });
    it('shoud be disjoint', () => {
      expect(rectanglesAreDisjoint(rectangleA, rectangleC)).toBe(true);
    });
    it('shoud NOT be disjoint', () => {
      expect(rectanglesAreDisjoint(rectangleA, rectangleB)).toBe(false);
    });
  });
  describe('Polygons', () => {
    /**
     *  4   |   ┌ +
     *      |   │ │
     *  2   |   + ┘
     *      |
     *      + - - - - - -
     *          2 3
     */
    const rectangleA: Rectangle<2> = [
      [2, 2],
      [3, 4],
    ];

    /**
     *      |
     *  3   |     ┌ +
     *  2   |     + ┘
     *      |
     *      + - - - - - -
     *            3 4
     */
    const rectangleB: Rectangle<2> = [
      [3, 2],
      [4, 3],
    ];

    /**
     *  4   |       ┌ +
     *      |       │ │
     *  2   |       + ┘
     *      |
     *      + - - - - - -
     *              4 5
     */
    const rectangleC: Rectangle<2> = [
      [4, 2],
      [5, 4],
    ];

    /**
     *  4   |   ┌─┐ ┌─┐
     *  3   |   │ ├─┤ │
     *  2   |   └─┴─┴─┘
     *      |
     *      + - - - - - -
     *          2 3 4 5
     */
    const polygon = [rectangleA, rectangleB, rectangleC];

    it('should include points', () => {
      const points: Point<2>[] = [
        [2.5, 2.5],
        [3.5, 2.5],
        [4.5, 2.5],
        [2.5, 3.5],
        [4.5, 3.5],
      ];
      expect(
        points
          .map((point) => polygonIncludesPoint(polygon, point))
          .every((v) => v === true)
      ).toBe(true);
    });
    it('should include points (edge cases)', () => {
      const points: Point<2>[] = [
        [2, 2],
        [3, 3],
        [4, 3],
        [5, 4],
      ];
      expect(
        points
          .map((point) => polygonIncludesPoint(polygon, point))
          .every((v) => v === true)
      ).toBe(true);
    });
    it('should NOT include points', () => {
      const points: Point<2>[] = [
        [1.5, 2.5],
        [5.5, 2.5],
        [1.5, 3.5],
        [3.5, 3.5],
        [5.5, 3.5],
      ];
      expect(
        points
          .map((point) => polygonIncludesPoint(polygon, point))
          .every((v) => v === false)
      ).toBe(true);
    });
  });
});
