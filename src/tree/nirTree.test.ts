import { chooseLeaf, getNodePolygon, splitNode } from './nirTree';
import { buildExampleTree, retreiveTemplate } from './misc/buildTree';

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
  const treeA = buildExampleTree();
  const treeB = buildExampleTree();

  describe('Algorithm 1. choose leaf', () => {
    it('should choose the correct leaf, expand, fragment and refine properly', () => {
      expect(getNodePolygon(chooseLeaf(treeA, [10, 7]))).toEqual([
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
      expect(getNodePolygon(chooseLeaf(treeA, [10, 2]))).toEqual([
        [
          [1, 3],
          [4, 7],
        ],
        [
          [1, 1],
          [10, 3],
        ],
      ]);
      expect(getNodePolygon(chooseLeaf(treeA, [1, 8]))).toEqual([
        [
          [1, 3],
          [4, 8],
        ],
        [
          [1, 1],
          [10, 3],
        ],
      ]);
      expect(getNodePolygon(chooseLeaf(treeA, [11, 5.5]))).toEqual([
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

  describe('Algorithm 3. split node', () => {
    // TODO : implement the test
    expect({
      parent: undefined,
      branches: [
        {
          points: [[1, 2]],
          polygon: [
            [1, 2],
            [3, 4],
          ],
        },
      ],
    }).toEqual({
      parent: undefined,
      branches: [
        {
          points: [[1, 2]],
          polygon: [
            [1, 2],
            [3, 4],
          ],
        },
      ],
    });
    console.log(
      JSON.stringify(
        retreiveTemplate({
          parent: undefined,
          branches: splitNode(treeB, 7, 0),
        }),
        null,
        2
      )
    );
    // expect(splitNode(buildExampleTree(), 7, 0));
  });
});
