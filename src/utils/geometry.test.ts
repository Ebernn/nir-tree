import {
  rectangleIncludesPoint,
  polygonIncludesPoint,
  rectanglesAreDisjoint,
  rectangleVolume,
  polygonVolume,
  polygonIntersection,
  rectangleIntersection,
  rectangleFragmentation,
  pointInPerimeter,
  rectangleInPerimeter,
  refine,
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

    describe('properties', () => {
      it('should deduce correclty their volume', () => {
        expect(
          rectangleVolume([
            [0, 0],
            [0, 10],
          ])
        ).toBe(0);
        expect(
          rectangleVolume([
            [1, 3],
            [3, 5],
          ])
        ).toBe(4);
        expect(
          rectangleVolume([
            [0, 0, 0],
            [10, 10, 0],
          ])
        ).toBe(0);
        expect(
          rectangleVolume([
            [1, 3, 2],
            [3, 5, 4],
          ])
        ).toBe(8);
      });
    });

    describe('inclusions', () => {
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
          [2.5, 2],
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
          [1, 2],
          [3.25, 2.5],
          [2.75, 0.5],
        ];
        expect(
          points
            .map((point) => rectangleIncludesPoint(rectangleA, point))
            .every((v) => v === false)
        ).toBe(true);
      });
    });

    describe('intersections', () => {
      it('shoud be disjoint', () => {
        expect(rectanglesAreDisjoint(rectangleA, rectangleC)).toBe(true);
        expect(
          rectanglesAreDisjoint(
            rectangleA,
            // rectangle C translated by -1 on the x axis
            rectangleC.map(([x, y]): Point<2> => [x - 1, y]) as Rectangle<2>
          )
        ).toBe(true);
      });
      it('shoud NOT be disjoint', () => {
        expect(rectanglesAreDisjoint(rectangleA, rectangleB)).toBe(false);
      });
      it('should deduce correclty their intersections', () => {
        expect(
          JSON.stringify(rectangleIntersection(rectangleA, rectangleC))
        ).toBeUndefined();
      });
    });

    describe('perimeter', () => {
      describe('point', () => {
        it('should be in perimeter', () => {
          // edge
          expect(
            pointInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [1.5, 1]
            )
          ).toBe(1);
          // corner
          expect(
            pointInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [1, 1]
            )
          ).toBe(0);
        });
        it('should NOT be in the perimeter', () => {
          // center
          expect(
            pointInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [1.5, 1.5]
            )
          ).toBe(undefined);
          // outside (but aligned on the first axis)
          expect(
            pointInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [0.5, 1]
            )
          ).toBe(undefined);
        });
      });
      describe('rectangle', () => {
        it('should be in perimeter', () => {
          // edge
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [
                [1.25, 1],
                [1.75, 1],
              ]
            )
          ).toBe(1);
          // corner
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [
                [1, 1],
                [1, 1],
              ]
            )
          ).toBe(0);
          // line
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [1, 2],
              ],
              [
                [1, 1.25],
                [1, 1.75],
              ]
            )
          ).toBe(0);
          // line (itself)
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [1, 2],
              ],
              [
                [1, 1],
                [1, 2],
              ]
            )
          ).toBe(0);
        });
        it('should NOT be in perimeter', () => {
          // center
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [
                [1.25, 1.25],
                [1.75, 1.75],
              ]
            )
          ).toBe(undefined);
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [
                [1, 1],
                [2, 2],
              ]
            )
          ).toBe(undefined);
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [
                [0.5, 0.5],
                [2.5, 2.5],
              ]
            )
          ).toBe(undefined);
          // shifted
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [
                [2, 1],
                [3, 2],
              ]
            )
          ).toBe(undefined);
          // outside (but aligned on the first axis)
          expect(
            rectangleInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [
                [0.5, 1],
                [2.5, 1],
              ]
            )
          ).toBe(undefined);
        });
      });
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
    const rectangle1A: Rectangle<2> = [
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
    const rectangle1B: Rectangle<2> = [
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
    const rectangle1C: Rectangle<2> = [
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
    const polygon1 = [rectangle1A, rectangle1B, rectangle1C];

    /**
     *      |
     *  3   |     ┌── +
     *  2   |     + ──┘
     *      |
     *      + - - - - - -
     *            3   5
     */
    const rectangle2A: Rectangle<2> = [
      [3, 2],
      [5, 3],
    ];

    /**
     *  4   |     ┌── +
     *  3   |     + ──┘
     *      |
     *      |
     *      + - - - - - -
     *            3   5
     */
    const rectangle2B: Rectangle<2> = [
      [3, 3],
      [5, 4],
    ];

    /**
     *  4   |     ┌───┐
     *  3   |     ├───┤
     *  2   |     └───┘
     *      |
     *      + - - - - - -
     *            3 4 5
     */
    const polygon2 = [rectangle2A, rectangle2B];

    describe('properties', () => {
      it('should deduce correclty their volume', () => {
        expect(polygonVolume(polygon1)).toBe(5);
        expect(
          polygonVolume([
            [
              [2, 2, 1],
              [3, 4, 3],
            ],
            [
              [3, 2, 2],
              [4, 3, 3],
            ],
            [
              [4, 2, 1],
              [5, 4, 1],
            ],
          ])
        ).toBe(5);
      });
    });

    describe('inclusions', () => {
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
            .map((point) => polygonIncludesPoint(polygon1, point))
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
            .map((point) => polygonIncludesPoint(polygon1, point))
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
            .map((point) => polygonIncludesPoint(polygon1, point))
            .every((v) => v === false)
        ).toBe(true);
      });
    });

    describe('intersections', () => {
      it('should deduce correclty their intersections', () => {
        expect(JSON.stringify(polygonIntersection(polygon1, polygon2))).toBe(
          '[[[3,2],[3,3]],[[3,3],[3,4]],[[3,2],[4,3]],[[3,3],[4,3]],[[4,2],[5,3]],[[4,3],[5,4]]]'
        );
        expect(
          JSON.stringify(
            polygonIntersection(polygon1, [
              [
                [2, 2],
                [5, 4],
              ],
            ])
          )
        ).toBe(JSON.stringify(polygon1));
        expect(
          polygonIntersection(polygon1, [
            [
              [2, 0],
              [2, 5],
            ],
          ]).length
        ).toBe(1);
        expect(
          polygonIntersection(polygon1, [
            [
              [2.5, 0],
              [2.5, 5],
            ],
          ]).length
        ).toBe(1);
        expect(
          polygonIntersection(polygon1, [
            [
              [1.5, 0],
              [1.5, 5],
            ],
          ]).length
        ).toBe(0);
      });
    });

    describe('fragmentation', () => {
      describe('rectangle VS rectangle', () => {
        it('should correctly replace rectangle with fragments of itself', () => {
          expect(
            JSON.stringify(
              rectangleFragmentation(
                [
                  [1, 0, 0],
                  [4, 3, 3],
                ],
                [
                  [3, 1, 1],
                  [5, 2, 2],
                ]
              )
            )
          ).toBe(
            '[[[1,0,0],[3,3,3]],[[3,0,0],[4,1,3]],[[3,2,0],[4,3,3]],[[3,1,0],[4,2,1]],[[3,1,2],[4,2,3]]]'
          );
          expect(
            JSON.stringify(
              rectangleFragmentation(
                [
                  [1, 0, 0],
                  [4, 3, 3],
                ],
                [
                  [3, 1, 2],
                  [5, 2, 3],
                ]
              )
            )
          ).toBe(
            '[[[1,0,0],[3,3,3]],[[3,0,0],[4,1,3]],[[3,2,0],[4,3,3]],[[3,1,0],[4,2,2]]]'
          );
        });
      });
    });

    describe('refinement', () => {
      it('should remove rectangles on edges', () => {
        // edge
        expect(
          JSON.stringify(
            refine([
              [
                [1, 1],
                [2, 2],
              ],
              [
                [1, 1],
                [2, 1],
              ],
            ])
          )
        ).toBe('[[[1,1],[2,2]]]');
        // corner
        expect(
          JSON.stringify(
            refine([
              [
                [1, 1],
                [2, 2],
              ],
              [
                [1, 1],
                [1, 1],
              ],
            ])
          )
        ).toBe('[[[1,1],[2,2]]]');
      });
      it('should simplify inclusions', () => {
        expect(
          JSON.stringify(
            refine([
              [
                [1, 1],
                [2, 2],
              ],
              [
                [1.25, 1.25],
                [1.75, 1.75],
              ],
            ])
          )
        ).toBe('[[[1,1],[2,2]]]');
      });
      it('should merge rectangles into columns / rows', () => {
        // column
        expect(
          JSON.stringify(
            refine([
              [
                [1, 1],
                [2, 1.5],
              ],
              [
                [1, 1.5],
                [2, 2],
              ],
            ])
          )
        ).toBe('[[[1,1],[2,2]]]');
        // row
        expect(
          JSON.stringify(
            refine([
              [
                [1, 1],
                [1.5, 2],
              ],
              [
                [1.5, 1],
                [2, 2],
              ],
            ])
          )
        ).toBe('[[[1,1],[2,2]]]');
        // mix
        expect(
          JSON.stringify(
            refine([
              [
                [1, 1],
                [1.5, 1.5],
              ],
              [
                [1.5, 1],
                [2, 1.5],
              ],
              [
                [1, 1.5],
                [1.5, 2],
              ],
              [
                [1.5, 1.5],
                [2, 2],
              ],
            ])
          )
        ).toBe('[[[1,1],[2,2]]]');
      });
      it('should not merge anything', () => {
        expect(
          JSON.stringify(
            refine([
              [
                [1, 1],
                [2, 1.5],
              ],
              [
                [2, 1.5],
                [2, 2],
              ],
            ])
          )
        ).toBe('[[[1,1],[2,1.5]],[[2,1.5],[2,2]]]');
        expect(
          JSON.stringify(
            refine([
              [
                [1, 1],
                [2, 2],
              ],
              [
                [3, 1],
                [4, 2],
              ],
            ])
          )
        ).toBe('[[[1,1],[2,2]],[[3,1],[4,2]]]');
      });
      it('should refine intersection', () => {
        expect(
          JSON.stringify(refine(polygonIntersection(polygon1, polygon2)))
        ).toBe('[[[3,3],[3,4]],[[3,2],[5,3]],[[4,3],[5,4]]]');
      });
    });
  });
});
