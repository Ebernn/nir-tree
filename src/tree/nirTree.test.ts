import { Point, Polygon } from '../utils/types';
import { chooseLeaf, getNodePolygon, Node, RoutingNode } from './nirTree';

type LeafNodeTemplate<Dimensions extends number> = {
  points: Point<Dimensions>[];
};
type RoutingNodeTemplate<Dimensions extends number> = {
  branches: { child: NodeTemplate<Dimensions>; polygon: Polygon<Dimensions> }[];
};
type NodeTemplate<Dimensions extends number> =
  | LeafNodeTemplate<Dimensions>
  | RoutingNodeTemplate<Dimensions>;
const isLeafTemplate = <Dimensions extends number>(
  node: NodeTemplate<Dimensions>
): node is LeafNodeTemplate<Dimensions> =>
  (<LeafNodeTemplate<Dimensions>>node).points !== undefined;

/**
 * Utility function to help building a NIR-tree.
 * @param template NIR-tree template
 * @returns NIR-tree root node
 */
const buildTree = <Dimensions extends number>(
  template: NodeTemplate<Dimensions>
): Node<Dimensions> => {
  if (isLeafTemplate(template))
    return { points: template.points, parent: undefined };
  else {
    const routingNode: RoutingNode<Dimensions> = {
      branches: [],
      parent: undefined,
    };
    routingNode.branches = template.branches.map(({ child, polygon }) => ({
      child: { ...buildTree(child), parent: routingNode },
      polygon,
    }));
    return routingNode;
  }
};

describe('Tree', () => {
  /**
   *  Example tree (figure 4)
   *
   *  9   |       ┌───┬─────┐
   *      |       │ D │ B   │
   *  7   | ┌─────┼───┼───┐ │ *     ┌─────┐
   *  6   | │ A1  │ ┌─┤ E ├─┤       │ C2  │
   *  5   | │     │ │F├───┤F├───────┤     │
   *      | │     │ │1│ F2│3│ C1    │     │
   *  3   | ├─────┴─┴─┴───┴─┼───────┴─────┘
   *  2   | │ A2            │ *
   *  1   | └───────────────┘
   *      + - - - - - - - - - - - - - - - - -
   *        1     4 5 6 7 8 9 10    13    16
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
    });
  });
});
