import { chooseLeaf, getNodePolygon } from './nirTree';
import buildTree from './misc/buildTree';

describe('Tree', () => {
  /**
   *  Example tree (figure 4)
   *
   *  9   |       ┌───┬─────┐
   *  8   | *     │ D │ B   │
   *  7   | ┌─────┼───┼───┐ │ *     ┌─────┐
   *  6   | │ A1  │ ┌─┤ E ├─┤   *   │ C2  │
   *  5   | │     │ │F├───┤F├───────┤     │
   *      | │     │ │1│ F2│3│ C1    │     │
   *  3   | ├─────┴─┴─┴───┴─┼───────┴─────┘
   *  2   | │ A2            │ *
   *  1   | └───────────────┘
   *      + - - - - - - - - - - - - - - - - -
   *        1   3 4 5 6 7 8 9 10    13    16
   */
  const tree = buildTree({
    branches: [
      // A
      {
        child: {
          points: [],
        },
        polygon: [
          // A1
          [
            [1, 3],
            [4, 7],
          ],
          // A2
          [
            [1, 1],
            [9, 3],
          ],
        ],
      },
      // B
      {
        child: {
          branches: [
            // D
            {
              child: {
                points: [],
              },
              polygon: [
                [
                  [4, 7],
                  [6, 9],
                ],
              ],
            },
            // E
            {
              child: {
                points: [],
              },
              polygon: [
                [
                  [6, 5],
                  [8, 7],
                ],
              ],
            },
            // F
            {
              child: {
                points: [],
              },
              polygon: [
                // F1
                [
                  [5, 3],
                  [6, 6],
                ],
                // F2
                [
                  [6, 3],
                  [8, 5],
                ],
                // F3
                [
                  [8, 3],
                  [9, 6],
                ],
              ],
            },
          ],
        },
        polygon: [
          [
            [4, 3],
            [9, 9],
          ],
        ],
      },
      // C
      {
        child: {
          points: [],
        },
        polygon: [
          // C1
          [
            [9, 3],
            [13, 5],
          ],
          // C2
          [
            [13, 3],
            [16, 7],
          ],
        ],
      },
    ],
  });

  describe('Algorithm 1. choose leaf', () => {
    it('should choose the correct leaf, expand, fragment and refine properly', () => {
      expect(getNodePolygon(chooseLeaf(tree, [10, 7]))).toEqual([
        [
          [9, 5],
          [10, 7],
        ],
        [
          [8, 6],
          [9, 7],
        ],
        [
          [6, 5],
          [8, 7],
        ],
      ]);
      expect(getNodePolygon(chooseLeaf(tree, [10, 2]))).toEqual([
        [
          [1, 3],
          [4, 7],
        ],
        [
          [1, 1],
          [10, 3],
        ],
      ]);
      expect(getNodePolygon(chooseLeaf(tree, [1, 8]))).toEqual([
        [
          [1, 3],
          [4, 8],
        ],
        [
          [1, 1],
          [10, 3],
        ],
      ]);
      expect(getNodePolygon(chooseLeaf(tree, [11, 5.5]))).toEqual([
        [
          [9, 3],
          [10, 5],
        ],
        [
          [10, 3],
          [13, 5.5],
        ],
        [
          [13, 3],
          [16, 7],
        ],
      ]);
    });
  });
});
