import type { Node, Point, Polygon } from "./nirTree";

const node = (poly: Polygon, points: Point[], children: Node[] = []): Node => {
  const node: Node = { poly, children, points };
  for (const child of children) child.parent = node;
  return node;
};

/** The running example of the paper (Figure 4a). */
// oxfmt-ignore
export const figure4 = () => node([], [], [
  node([[[1, 3], [4, 7]], [[1, 1], [9, 3]]], [[3, 7], [1, 1], [9, 3]]), // A
  node([[[4, 3], [9, 9]]], [], [ // B
    node([[[4, 7], [6, 9]]], [[4, 7], [6, 9]]), // D
    node([[[6, 5], [8, 7]]], [[7, 6.5]]), // E
    node([[[5, 3], [6, 6]], [[6, 3], [8, 5]], [[8, 3], [9, 6]]], [[5, 6], [7, 4], [8.5, 5]]), // F
  ]),
  node([[[9, 3], [13, 5]], [[13, 3], [16, 7]]], [[10, 4], [16, 7]]), // C
]);
