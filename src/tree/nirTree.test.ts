import { chooseLeaf, getNodePolygon } from './nirTree';
import { buildExampleTree } from './misc/buildTree';

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
  const tree = buildExampleTree();

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
