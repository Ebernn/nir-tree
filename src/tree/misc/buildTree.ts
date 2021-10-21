import { Point, Polygon } from '../../utils/types';
import { isLeaf, Node, RoutingNode } from '../nirTree';

export type LeafNodeTemplate<Dimensions extends number> = {
  points: Point<Dimensions>[];
};
export type RoutingNodeTemplate<Dimensions extends number> = {
  branches: { child: NodeTemplate<Dimensions>; polygon: Polygon<Dimensions> }[];
};
export type NodeTemplate<Dimensions extends number> =
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
export const buildTree = <Dimensions extends number>(
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

/**
 * Utility function to help retreiving a NIR-tree template from its root.
 * @param node NIR-tree root
 * @returns NIR-tree template
 */
export const retreiveTemplate = <Dimensions extends number>(
  node: Node<Dimensions>
): NodeTemplate<Dimensions> =>
  isLeaf(node)
    ? { points: node.points }
    : {
        branches: node.branches.map(({ child, polygon }) => ({
          child: { ...retreiveTemplate(child) },
          polygon,
        })),
      };

/**
 *  Utility function to help building the example tree (figure 4).
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
 *
 *  @returns NIR-tree root node
 */
export const buildExampleTree = (): Node<2> =>
  buildTree({
    branches: [
      // A
      {
        child: {
          points: [
            [3, 7],
            [1, 1],
            [9, 3],
          ],
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
                points: [
                  [4, 7],
                  [6, 9],
                ],
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
                points: [[7, 6.5]],
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
                points: [
                  [5, 6],
                  [7, 4],
                  [8.5, 5],
                ],
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
          points: [
            [10, 4],
            [16, 7],
          ],
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

export default buildTree;
