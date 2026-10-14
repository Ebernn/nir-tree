// NIR-Tree: A Non-Intersecting R-Tree (Langendoen, Glasbergen & Daudjee, SSDBM 2021)

export type Point = number[]; // Definition 3
export type Rect = [ll: Point, ur: Point]; // Definition 5
export type Polygon = Rect[]; // Definition 7
/** A node with its bounding polygon: leaves have no children, routing nodes have no points. */
export type Node = { poly: Polygon; parent?: Node; children: Node[]; points: Point[] };

// Geometry (Section 4)

/** Definition 6 */
export const contains = ([ll, ur]: Rect, p: Point) => p.every((x, d) => ll[d] <= x && x <= ur[d]);

/** Definition 8 */
export const polyContains = (poly: Polygon, p: Point) => poly.some((r) => contains(r, p));

/** Definition 9 */
export const intersect = ([ll1, ur1]: Rect, [ll2, ur2]: Rect): Rect | undefined => {
  const ll = ll1.map((x, d) => Math.max(x, ll2[d]));
  const ur = ur1.map((x, d) => Math.min(x, ur2[d]));
  return ll.every((x, d) => x <= ur[d]) ? [ll, ur] : undefined;
};

/** Definition 11 */
export const intersectPoly = (P: Polygon, Q: Polygon) =>
  P.flatMap((r) => Q.map((s) => intersect(r, s)).filter((r) => r !== undefined));

/**
 * Definition 12: rectangles are disjoint when they share at most (part of) their perimeter,
 * except when both are flat in the same hyperplane (e.g. coplanar points) and overlap within it.
 */
export const disjoint = ([ll1, ur1]: Rect, [ll2, ur2]: Rect) =>
  ll1.some(
    (_, d) => (ur1[d] <= ll2[d] || ur2[d] <= ll1[d]) && !(ll1[d] === ur2[d] && ll2[d] === ur1[d]),
  );

/** Definition 14: the fragments of r outside of s, one floor and one ceiling per dimension. */
export const fragment = (r: Rect, s: Rect): Polygon => {
  if (disjoint(r, s)) return [r];
  let [ll, ur] = r;
  const fragments: Polygon = [];
  for (let d = 0; d < ll.length; d++) {
    if (ll[d] < s[0][d]) fragments.push([ll, ur.with(d, s[0][d])]);
    if (s[1][d] < ur[d]) fragments.push([ll.with(d, s[1][d]), ur]);
    [ll, ur] = [ll.with(d, Math.max(ll[d], s[0][d])), ur.with(d, Math.min(ur[d], s[1][d]))];
  }
  return fragments;
};

/** Definition 15, one rectangle of Q after the other (Section 3.2.1). */
export const fragmentPoly = (P: Polygon, Q: Polygon) =>
  Q.reduce((P, s) => P.flatMap((r) => fragment(r, s)), P);

const encloses = (r: Rect, s: Rect) => contains(r, s[0]) && contains(r, s[1]);

const bbox = (rects: Rect[]): Rect => [
  rects[0][0].map((_, d) => Math.min(...rects.map((r) => r[0][d]))),
  rects[0][1].map((_, d) => Math.max(...rects.map((r) => r[1][d]))),
];

/** Figure 6: drop rectangles enclosed by another one (a, b), merge rows and columns (c). */
export const refine = (poly: Polygon): Polygon => {
  poly = poly.filter(
    (r, i) => !poly.some((s, j) => j !== i && encloses(s, r) && (j < i || !encloses(r, s))),
  );
  for (const [i, r] of poly.entries())
    for (const s of poly.slice(i + 1))
      if (intersect(r, s) && r[0].filter((x, d) => x !== s[0][d] || r[1][d] !== s[1][d]).length < 2)
        return refine([bbox([r, s]), ...poly.filter((t) => t !== r && t !== s)]);
  return poly;
};

// Tree (Section 3)

const volume = ([ll, ur]: Rect) => ll.reduce((v, x, d) => v * (ur[d] - x), 1);
const margin = ([ll, ur]: Rect) => ll.reduce((v, x, d) => v + ur[d] - x, 0);
const size = (node: Node) => node.points.length + node.children.length;

/** Algorithm 1: descend to a leaf, expanding, fragmenting and refining polygons on the way. */
export const chooseLeaf = (root: Node, p: Point): Node => {
  let node = root;
  while (node.children.length) {
    let next = node.children.find((c) => polyContains(c.poly, p));
    if (!next) {
      // expand the rectangle needing the least additional area (then margin, for flat rectangles)
      const { child, expanded } = node.children
        .flatMap((child) =>
          child.poly.map((rect) => {
            const expanded = bbox([rect, [p, p]]);
            const cost = [volume(expanded) - volume(rect), margin(expanded) - margin(rect)];
            return { child, expanded, cost };
          }),
        )
        .reduce((a, b) => ((b.cost[0] - a.cost[0] || b.cost[1] - a.cost[1]) < 0 ? b : a));
      // only add the new area: the expanded rectangle minus all the children polygons
      let added = node.children.reduce((P, c) => fragmentPoly(P, c.poly), [expanded]);
      if (node.parent) added = intersectPoly(added, node.poly);
      child.poly = refine([...child.poly, ...added]);
      next = child;
    }
    node = next;
  }
  return node;
};

/** Extent of a point or of a node polygon along dimension d. */
const extent = (item: Point | Node, d: number) =>
  Array.isArray(item)
    ? [item[d], item[d]]
    : [Math.min(...item.poly.map((r) => r[0][d])), Math.max(...item.poly.map((r) => r[1][d]))];

/** Algorithm 3: split a node along x[d] = l, recursively splitting the children crossing it. */
export const splitNode = (node: Node, l: number, d: number): [Node, Node] => {
  // N.poly (the pseudo-code's N.parent.poly is a typo, see the proof of Theorem 1)
  const ref = node.parent
    ? node.poly
    : [bbox([...node.points.map((p): Rect => [p, p]), ...node.children.flatMap((c) => c.poly)])];
  const half = (lo: number, hi: number): Node => ({
    poly: refine(
      ref
        .filter(([ll, ur]) => ll[d] <= hi && lo <= ur[d])
        .map(([ll, ur]): Rect => [
          ll.with(d, Math.max(ll[d], lo)),
          ur.with(d, Math.min(ur[d], hi)),
        ]),
    ),
    parent: node.parent,
    children: [],
    points: [],
  });
  const halves: [Node, Node] = [half(-Infinity, l), half(l, Infinity)];
  const add = (half: Node, item: Point | Node) => {
    if (Array.isArray(item)) half.points.push(item);
    else if (size(item)) half.children.push(Object.assign(item, { parent: half }));
  };
  for (const item of [...node.points, ...node.children]) {
    const [lo, hi] = extent(item, d);
    // items crossing the line are split, items lying on it go to the smallest half
    if (lo < l && l < hi) splitNode(item as Node, l, d).forEach((h, i) => add(halves[i], h));
    else if (lo < l || (hi === l && size(halves[0]) <= size(halves[1]))) add(halves[0], item);
    else add(halves[1], item);
  }
  return halves;
};

/** Algorithm 4: a partition line through the mean point (the paper's "geometric median"). */
export const partitionNode = (node: Node): [l: number, d: number] => {
  const leaf = !node.children.length;
  const points = leaf ? node.points : node.children.flatMap((c) => c.poly.flat());
  const mean = points[0].map((_, d) => points.reduce((sum, p) => sum + p[d], 0) / points.length);
  // leaves: the dimension of highest variance, routing nodes: the line crossing the fewest children
  const cost = mean.map((l, d) =>
    leaf
      ? -points.reduce((sum, p) => sum + (p[d] - l) ** 2, 0)
      : points.every((p) => p[d] === l)
        ? Infinity
        : node.children.map((c) => extent(c, d)).filter(([lo, hi]) => lo < l && l < hi).length,
  );
  const d = cost.indexOf(Math.min(...cost));
  return [mean[d], d];
};

export class NIRTree {
  root: Node = { poly: [], children: [], points: [] };

  /** @param m maximum fanout */
  constructor(readonly m = 50) {}

  /**
   * Algorithm 1, then Algorithm 2: split overflowing nodes from the leaf up to the root.
   * As in the paper, a half may still overflow when many children cross the partition line:
   * it is split again by a later insertion going through it.
   */
  insert(p: Point) {
    let node: Node | undefined = chooseLeaf(this.root, p);
    node.points.push(p);
    for (; node; node = node.parent) {
      if (size(node) <= this.m) continue;
      const halves = splitNode(node, ...partitionNode(node)).filter(size);
      if (!node.parent) node.parent = this.root = { poly: [], children: [node], points: [] };
      node.parent.children.splice(node.parent.children.indexOf(node), 1, ...halves);
      for (const half of halves) half.parent = node.parent;
    }
    return this;
  }

  /** Algorithm 5: the points inside a query rectangle. */
  search(q: Rect, node = this.root): Point[] {
    const children = node.children.filter((c) => c.poly.some((r) => intersect(r, q)));
    return [
      ...node.points.filter((p) => contains(q, p)),
      ...children.flatMap((c) => this.search(q, c)),
    ];
  }

  /** Section 3.2.3: remove a point, then the nodes left empty. */
  remove(p: Point, node = this.root): boolean {
    const i = node.points.findIndex((q) => q.every((x, d) => x === p[d]));
    if (i >= 0) node.points.splice(i, 1);
    else if (!node.children.some((c) => polyContains(c.poly, p) && this.remove(p, c))) return false;
    if (node.parent && !size(node))
      node.parent.children.splice(node.parent.children.indexOf(node), 1);
    return true;
  }
}
