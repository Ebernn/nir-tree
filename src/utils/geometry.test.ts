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
  polygonExpand,
  polygonsAreDisjoint,
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
        expect(
          rectanglesAreDisjoint(
            [
              [4, 7],
              [6, 9],
            ],
            [
              [6, 5],
              [8, 7],
            ]
          )
        ).toBe(true);
        expect(
          rectanglesAreDisjoint(
            [
              [5, 3],
              [6, 6],
            ],
            [
              [6, 5],
              [8, 7],
            ]
          )
        ).toBe(true);
        expect(
          rectanglesAreDisjoint(
            [
              [8, 3],
              [9, 6],
            ],
            [
              [6, 5],
              [8, 7],
            ]
          )
        ).toBe(true);
        expect(
          rectanglesAreDisjoint(
            [
              [6, 3],
              [8, 5],
            ],
            [
              [6, 5],
              [8, 7],
            ]
          )
        ).toBe(true);
      });
      it('shoud NOT be disjoint', () => {
        expect(rectanglesAreDisjoint(rectangleA, rectangleB)).toBe(false);
      });
      it('should deduce correclty their intersections', () => {
        expect(rectangleIntersection(rectangleA, rectangleC)).toBeUndefined();
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
          ).toEqual([1]);
          // corner
          expect(
            pointInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [1, 1]
            )
          ).toEqual([0, 1]);
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
          ).toEqual([]);
          // outside (but aligned on the first axis)
          expect(
            pointInPerimeter(
              [
                [1, 1],
                [2, 2],
              ],
              [0.5, 1]
            )
          ).toEqual([]);
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
          ).toEqual([1]);
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
          ).toEqual([0, 1]);
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
          ).toEqual([0, 2]);
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
          ).toEqual([0, 2]);
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
          ).toEqual([]);
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
          ).toEqual([]);
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
          ).toEqual([]);
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
          ).toEqual([]);
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
          ).toEqual([]);
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
      it('shoud be disjoint', () => {
        expect(
          polygonsAreDisjoint(
            polygon1,
            // polygon 2 translated by -2 on the y axis
            polygon2.map(
              (rectangle): Rectangle<2> =>
                rectangle.map(([x, y]): Point<2> => [x, y - 2]) as Rectangle<2>
            )
          )
        ).toBe(true);
      });
      it('shoud NOT be disjoint', () => {
        expect(polygonsAreDisjoint(polygon1, polygon2)).toBe(false);
      });
      it('should deduce correclty their intersections', () => {
        expect(polygonIntersection(polygon1, polygon2)).toEqual([
          [
            [3, 2],
            [3, 3],
          ],
          [
            [3, 3],
            [3, 4],
          ],
          [
            [3, 2],
            [4, 3],
          ],
          [
            [3, 3],
            [4, 3],
          ],
          [
            [4, 2],
            [5, 3],
          ],
          [
            [4, 3],
            [5, 4],
          ],
        ]);
        expect(
          polygonIntersection(polygon1, [
            [
              [2, 2],
              [5, 4],
            ],
          ])
        ).toEqual(polygon1);
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
            rectangleFragmentation(
              [
                [6, 5],
                [10, 7],
              ],
              [
                [8, 3],
                [9, 6],
              ]
            )
          ).toEqual([
            [
              [6, 5],
              [8, 7],
            ],
            [
              [9, 5],
              [10, 7],
            ],
            [
              [8, 6],
              [9, 7],
            ],
          ]);
          expect(
            refine(
              rectangleFragmentation(
                [
                  [6, 5],
                  [10, 7],
                ],
                [
                  [5, 7],
                  [7, 9],
                ]
              )
            )
          ).toEqual([
            [
              [6, 5],
              [10, 7],
            ],
          ]);
          expect(
            refine(
              rectangleFragmentation(
                [
                  [6, 5],
                  [10, 7],
                ],
                [
                  [4, 7],
                  [6, 9],
                ]
              )
            )
          ).toEqual([
            [
              [6, 5],
              [10, 7],
            ],
          ]);
          expect(
            rectangleFragmentation(
              [
                [6, 5],
                [10, 7],
              ],
              [
                [3, 7],
                [5, 9],
              ]
            )
          ).toEqual([
            [
              [6, 5],
              [10, 7],
            ],
          ]);
          expect(
            rectangleFragmentation(
              [
                [4, 3],
                [10, 9],
              ],
              [
                [9, 3],
                [13, 5],
              ]
            )
          ).toEqual([
            [
              [4, 3],
              [9, 9],
            ],
            [
              [9, 5],
              [10, 9],
            ],
          ]);
          expect(
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
          ).toEqual([
            [
              [1, 0, 0],
              [3, 3, 3],
            ],
            [
              [3, 0, 0],
              [4, 1, 3],
            ],
            [
              [3, 1, 0],
              [4, 2, 1],
            ],
            [
              [3, 2, 0],
              [4, 3, 3],
            ],
            [
              [3, 1, 2],
              [4, 2, 3],
            ],
          ]);
          expect(
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
          ).toEqual([
            [
              [1, 0, 0],
              [3, 3, 3],
            ],
            [
              [3, 0, 0],
              [4, 1, 3],
            ],
            [
              [3, 1, 0],
              [4, 2, 2],
            ],
            [
              [3, 2, 0],
              [4, 3, 3],
            ],
          ]);
          expect(
            refine(
              rectangleFragmentation(
                [
                  [1, 0, 0],
                  [4, 3, 3],
                ],
                [
                  [3, 1, 3],
                  [5, 2, 4],
                ]
              )
            )
          ).toEqual([
            [
              [1, 0, 0],
              [4, 3, 3],
            ],
          ]);
        });
        it('should correctly replace rectangle with fragments of itself (planes & lines)', () => {
          // 2D case (line)
          expect(
            rectangleFragmentation(
              [
                [0, 0],
                [4, 0],
              ],
              [
                [1, -1],
                [3, 1],
              ]
            )
          ).toEqual([
            [
              [0, 0],
              [1, 0],
            ],
            [
              [3, 0],
              [4, 0],
            ],
          ]);
          expect(
            rectangleFragmentation(
              [
                [0, 0],
                [0, 4],
              ],
              [
                [-1, 1],
                [1, 3],
              ]
            )
          ).toEqual([
            [
              [0, 0],
              [0, 1],
            ],
            [
              [0, 3],
              [0, 4],
            ],
          ]);
          expect(
            rectangleFragmentation(
              [
                [0, 0],
                [4, 0],
              ],
              [
                [1, 0],
                [3, 2],
              ]
            )
          ).toEqual([
            [
              [0, 0],
              [1, 0],
            ],
            [
              [3, 0],
              [4, 0],
            ],
          ]);
          expect(
            rectangleFragmentation(
              [
                [0, 0],
                [0, 4],
              ],
              [
                [0, 1],
                [2, 3],
              ]
            )
          ).toEqual([
            [
              [0, 0],
              [0, 1],
            ],
            [
              [0, 3],
              [0, 4],
            ],
          ]);
          // 3D case (plane)
          expect(
            rectangleFragmentation(
              [
                [4, 0, 0],
                [4, 3, 3],
              ],
              [
                [3, 1, 1],
                [5, 2, 2],
              ]
            )
          ).toEqual([
            [
              [4, 0, 0],
              [4, 1, 3],
            ],
            [
              [4, 1, 0],
              [4, 2, 1],
            ],
            [
              [4, 2, 0],
              [4, 3, 3],
            ],
            [
              [4, 1, 2],
              [4, 2, 3],
            ],
          ]);

          expect(
            rectangleFragmentation(
              [
                [0, 4, 0],
                [3, 4, 3],
              ],
              [
                [1, 3, 1],
                [2, 5, 2],
              ]
            )
          ).toEqual([
            [
              [0, 4, 0],
              [1, 4, 3],
            ],
            [
              [1, 4, 0],
              [2, 4, 1],
            ],
            [
              [2, 4, 0],
              [3, 4, 3],
            ],
            [
              [1, 4, 2],
              [2, 4, 3],
            ],
          ]);

          expect(
            rectangleFragmentation(
              [
                [4, 0, 0],
                [4, 3, 3],
              ],
              [
                [4, 1, 1],
                [6, 2, 2],
              ]
            )
          ).toEqual([
            [
              [4, 0, 0],
              [4, 1, 3],
            ],
            [
              [4, 1, 0],
              [4, 2, 1],
            ],
            [
              [4, 2, 0],
              [4, 3, 3],
            ],
            [
              [4, 1, 2],
              [4, 2, 3],
            ],
          ]);
        });
      });
    });

    describe('expansion', () => {
      it('should expand a polygon to enclose a point minimizing additional area', () => {
        expect(polygonExpand(polygon1, [5, 5])).toEqual([
          rectangle1A,
          rectangle1B,
          [
            [4, 2],
            [5, 5],
          ],
        ]);
        expect(polygonExpand(polygon1, [3.9, 4])).toEqual([
          rectangle1A,
          rectangle1B,
          [
            [3.9, 2],
            [5, 4],
          ],
        ]);
      });
    });

    describe('refinement', () => {
      it('should remove rectangles on edges', () => {
        // edge
        expect(
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
        ).toEqual([
          [
            [1, 1],
            [2, 2],
          ],
        ]);
        // corner
        expect(
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
        ).toEqual([
          [
            [1, 1],
            [2, 2],
          ],
        ]);
      });
      it('should simplify inclusions', () => {
        expect(
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
        ).toEqual([
          [
            [1, 1],
            [2, 2],
          ],
        ]);
      });
      it('should merge rectangles into columns / rows', () => {
        // column
        expect(
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
        ).toEqual([
          [
            [1, 1],
            [2, 2],
          ],
        ]);
        // row
        expect(
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
        ).toEqual([
          [
            [1, 1],
            [2, 2],
          ],
        ]);
        // mix
        expect(
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
        ).toEqual([
          [
            [1, 1],
            [2, 2],
          ],
        ]);
      });
      it('should not merge anything', () => {
        expect(
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
        ).toEqual([
          [
            [1, 1],
            [2, 1.5],
          ],
          [
            [2, 1.5],
            [2, 2],
          ],
        ]);
        expect(
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
        ).toEqual([
          [
            [1, 1],
            [2, 2],
          ],
          [
            [3, 1],
            [4, 2],
          ],
        ]);
      });
      it('should refine intersection', () => {
        expect(refine(polygonIntersection(polygon1, polygon2))).toEqual([
          [
            [3, 3],
            [3, 4],
          ],
          [
            [3, 2],
            [5, 3],
          ],
          [
            [4, 3],
            [5, 4],
          ],
        ]);
      });
    });
  });
});
