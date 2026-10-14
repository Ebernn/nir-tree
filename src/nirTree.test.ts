import { describe, expect, it } from "vitest";
import {
  NIRTree,
  chooseLeaf,
  contains,
  disjoint,
  fragment,
  intersectPoly,
  polyContains,
  refine,
  splitNode,
  type Node,
  type Point,
  type Polygon,
  type Rect,
} from "./nirTree";

/** r(x0, y0, ..., x1, y1, ...) is the rectangle from (x0, y0, ...) to (x1, y1, ...). */
const r = (...c: number[]): Rect => [c.slice(0, c.length / 2), c.slice(c.length / 2)];

const node = (poly: Polygon, points: Point[], children: Node[] = []): Node => {
  const node: Node = { poly, children, points };
  for (const child of children) child.parent = node;
  return node;
};

/** The running example of the paper (Figure 4a). */
// oxfmt-ignore
const figure4 = () => node([], [], [
  node([r(1, 3, 4, 7), r(1, 1, 9, 3)], [[3, 7], [1, 1], [9, 3]]), // A
  node([r(4, 3, 9, 9)], [], [ // B
    node([r(4, 7, 6, 9)], [[4, 7], [6, 9]]), // D
    node([r(6, 5, 8, 7)], [[7, 6.5]]), // E
    node([r(5, 3, 6, 6), r(6, 3, 8, 5), r(8, 3, 9, 6)], [[5, 6], [7, 4], [8.5, 5]]), // F
  ]),
  node([r(9, 3, 13, 5), r(13, 3, 16, 7)], [[10, 4], [16, 7]]), // C
]);

describe("geometry", () => {
  it("tells disjoint rectangles apart (Definition 12)", () => {
    expect(disjoint(r(0, 0, 1, 1), r(1, 0, 2, 1))).toBe(true); // shared edge
    expect(disjoint(r(0, 0, 1, 1), r(1, 1, 2, 2))).toBe(true); // shared corner
    expect(disjoint(r(0, 0, 2, 2), r(1, 1, 3, 3))).toBe(false);
    expect(disjoint(r(0, 0, 2, 2), r(1, 0, 1, 2))).toBe(false); // line crossing the inside
  });

  it("fragments a rectangle around another one (Figure 5)", () => {
    expect(fragment(r(0, 0, 4, 4), r(2, 1, 6, 3))).toEqual([
      r(0, 0, 2, 4),
      r(2, 0, 4, 1),
      r(2, 3, 4, 4),
    ]);
    expect(fragment(r(0, 0, 4, 4), r(4, 0, 6, 4))).toEqual([r(0, 0, 4, 4)]);
    expect(fragment(r(0, 0, 0, 3, 3, 3), r(1, 1, 1, 2, 2, 2))).toHaveLength(6);
  });

  it("refines polygons (Figure 6)", () => {
    expect(refine([r(0, 0, 1, 2), r(1, 1, 1, 2)])).toEqual([r(0, 0, 1, 2)]); // a
    expect(refine([r(0, 0, 2, 2), r(1, 1, 1.5, 1.5)])).toEqual([r(0, 0, 2, 2)]); // b
    expect(refine([r(0, 0, 1, 1), r(1, 0, 2, 1), r(0, 1, 1, 2), r(1, 1, 2, 2)])).toEqual([
      r(0, 0, 2, 2),
    ]); // c
    expect(refine([r(0, 0, 1, 1), r(1, 0, 2, 2)])).toHaveLength(2);
  });
});

describe("Figure 4", () => {
  it("expands, fragments and refines along the insertion path (4b-4e)", () => {
    const E = chooseLeaf(figure4(), [10, 7]);
    expect(E.parent?.poly).toEqual([r(4, 3, 9, 9), r(9, 5, 10, 9)]); // B1, B2
    expect(E.poly).toEqual([r(6, 5, 8, 7), r(9, 5, 10, 7), r(8, 6, 9, 7)]); // E1, E2, E3
  });

  it("splits children crossing the partition line (4f-4h)", () => {
    const [left, right] = splitNode(figure4(), 7, 0);
    expect(left.poly).toEqual([r(1, 1, 7, 9)]);
    expect(right.poly).toEqual([r(7, 1, 16, 9)]);
    expect(left.children.map((c) => c.children.length)).toEqual([0, 3]); // A, B (D, E, F)
    expect(right.children.map((c) => c.children.length)).toEqual([0, 1, 0]); // A, B (F), C
    expect(right.children[1].children[0].points.flat()).toEqual([7, 4, 8.5, 5]); // F's right half
  });
});

let seed = 1;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/** Check the invariants (Definition 16) of a tree and its answers to point and range queries. */
const check = (tree: NIRTree, points: Point[], maxScatter: number) => {
  const levels: Node[][] = [];
  const leafDepths = new Set<number>();
  const misplaced: Point[] = [];
  const walk = (node: Node, ancestors: Node[]) => {
    (levels[ancestors.length] ??= []).push(node);
    if (!node.children.length) leafDepths.add(ancestors.length);
    misplaced.push(...node.points.filter((p) => !ancestors.every((a) => polyContains(a.poly, p))));
    for (const c of node.children) {
      expect(c.parent).toBe(node);
      walk(c, [...ancestors, c]);
    }
  };
  walk(tree.root, []);
  expect(leafDepths.size).toBeLessThanOrEqual(1);
  expect(misplaced).toEqual([]);
  // zero-area intersection between the polygons of a level
  const overlaps = levels.flatMap((nodes) =>
    nodes.flatMap((a, i) => nodes.slice(i + 1).flatMap((b) => intersectPoly(a.poly, b.poly))),
  );
  expect(overlaps.filter(([ll, ur]) => ll.every((x, d) => x < ur[d]))).toEqual([]);
  // point queries visit a single node per level, but for points on shared perimeters
  const scattered = points.filter((p) =>
    levels.some((nodes) => nodes.filter((n) => polyContains(n.poly, p)).length > 1),
  );
  expect(scattered.length / points.length).toBeLessThanOrEqual(maxScatter);
  expect(points.filter((p) => !tree.search([p, p]).length)).toEqual([]);
  const sorted = (points: Point[]) => points.map(String).sort();
  for (let i = 0; i < 50; i++) {
    const [a, b] = [0, 0].map(() => points[Math.floor(random() * points.length)]);
    const q: Rect = [a.map((x, d) => Math.min(x, b[d])), a.map((x, d) => Math.max(x, b[d]))];
    expect(sorted(tree.search(q))).toEqual(sorted(points.filter((p) => contains(q, p))));
  }
};

// name, point generator, max ratio of point queries visiting several nodes of a level
const datasets: [string, () => Point, number][] = [
  ["uniform 2d", () => [random(), random()], 0.02],
  ["uniform 3d", () => [random(), random(), random()], 0.02],
  ["coplanar 3d", () => [random(), random(), 0], 0.02],
  ["grid 2d", () => [Math.floor(random() * 8), Math.floor(random() * 8)], 1], // duplicates scatter
];

describe.each(datasets)("NIR-Tree on %s data", (_, generate, maxScatter) => {
  it.each([3, 8])("keeps its invariants with a fanout of %i", (m) => {
    const points = Array.from({ length: 1000 }, generate);
    const tree = new NIRTree(m);
    for (const p of points) tree.insert(p);
    check(tree, points, maxScatter);
    expect(points.splice(0, 600).every((p) => tree.remove(p))).toBe(true);
    check(tree, points, maxScatter);
    expect(points.every((p) => tree.remove(p))).toBe(true);
    expect(tree.root).toMatchObject({ children: [], points: [] });
  });
});
