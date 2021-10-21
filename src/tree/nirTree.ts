import {
  expand,
  polygonFragmentation,
  polygonIncludesPoint,
  polygonIntersection,
  polygonsAreDisjoint,
  refine,
} from '../utils/geometry';
import { Point, Polygon, Rectangle } from '../utils/types';

// Definitions

export type RoutingNode<Dimensions extends number> = {
  parent: RoutingNode<Dimensions> | undefined;
  branches: Branch<Dimensions>[];
};
export type LeafNode<Dimensions extends number> = {
  parent: RoutingNode<Dimensions> | undefined;
  points: Point<Dimensions>[];
};
export type Branch<Dimensions extends number> = {
  child: Node<Dimensions>;
  polygon: Polygon<Dimensions>;
};
export type Node<Dimensions extends number> =
  | RoutingNode<Dimensions>
  | LeafNode<Dimensions>;
export const isLeaf = <Dimensions extends number>(
  node: Node<Dimensions>
): node is LeafNode<Dimensions> =>
  (<LeafNode<Dimensions>>node).points !== undefined;

/**
 * Retreive a node polygon (TODO : find a better way to retreive it)
 * @param node
 * @returns node polygon (if it exists)
 */
export const getNodePolygon = <Dimensions extends number>(
  node: Node<Dimensions>
): Polygon<Dimensions> | undefined => {
  if (node.parent === undefined) return undefined;
  for (const branch of node.parent.branches) {
    if (branch.child === node) return branch.polygon;
  }
};

/**
 * Algorithm 1. Insert a point in a branch leaf (choose the best polygon)
 * @param root
 * @param point
 * @returns the leaf node where the node has been inserted
 */
export const chooseLeaf = <Dimensions extends number>(
  root: Node<Dimensions>,
  point: Point<Dimensions>
): LeafNode<Dimensions> => {
  let leaf: Node<Dimensions> = root;
  while (!isLeaf(leaf)) {
    // let's find a branch including the point
    let branchIncludingPoint = false;
    const branches = leaf.branches;
    for (const branch of branches) {
      if (polygonIncludesPoint(branch.polygon, point)) {
        leaf = branch.child;
        branchIncludingPoint = true;
        break;
      }
    }
    // we do not have found any branch including the point, so let's expand a branch polygon
    if (!branchIncludingPoint) {
      // find and expand the best polygon, minimizing additional area to enclose the point
      // eslint-disable-next-line prefer-const
      let [minIndex, minExpandedPolygon] = branches.reduce(
        ([minIndex, minExpandedPolygon, minDiff], branch, index) => {
          const [expandedPolygon, diff] = expand(branch.polygon, point);
          return diff < minDiff
            ? [index, expandedPolygon, diff]
            : [minIndex, minExpandedPolygon, minDiff];
        },
        [-1, branches[0].polygon, Number.POSITIVE_INFINITY]
      );
      if (minIndex < 0) throw new Error('The non-leaf node has no branch.');
      // fragment it (with non-disjoint neighboring polygons)
      branches
        .filter(
          ({ polygon }, index) =>
            !polygonsAreDisjoint(polygon, minExpandedPolygon) &&
            index !== minIndex
        )
        .forEach(({ polygon }) => {
          minExpandedPolygon = polygonFragmentation(
            minExpandedPolygon,
            polygon
          );
        });
      // intersect it (with its parent polygon) if leaf is not the root
      const polygon = getNodePolygon(leaf);
      if (polygon)
        minExpandedPolygon = polygonIntersection(minExpandedPolygon, polygon);
      // refine it (and update the branch)
      branches[minIndex].polygon = refine(minExpandedPolygon);
      leaf = branches[minIndex].child;
    }
  }
  return leaf;
};

/**
 * Algorithm 3. Divides a node along l on dimension d.
 * @param node
 * @param l
 * @param d
 * @returns two branches
 */
export const splitNode = <Dimensions extends number>(
  node: Node<Dimensions>,
  l: number,
  d: number
): [Branch<Dimensions>, Branch<Dimensions>] => {
  const leaf = isLeaf(node);
  const parent = node.parent;
  const polygon = parent ? getNodePolygon(parent) : undefined;
  /**
   * Find the smallest rectangle enclosing all the points.
   * @param points
   * @returns smallest rectangle enclosing all the points
   */
  const smallest = (points: Point<Dimensions>[]): Rectangle<Dimensions> =>
    points.reduce(
      ([ll, ur], point): Rectangle<Dimensions> => [
        ll.map((comp, axis) =>
          Math.min(comp, point[axis])
        ) as Point<Dimensions>,
        ur.map((comp, axis) =>
          Math.max(comp, point[axis])
        ) as Point<Dimensions>,
      ],
      [points[0], points[0]]
    );
  // find Pref
  const pRef: Polygon<Dimensions> = polygon
    ? polygon
    : [
        leaf
          ? // smallest rectangle enclosing all points
            smallest((node as LeafNode<Dimensions>).points)
          : // smallest rectangle enclosing all polygons
            smallest(
              (node as RoutingNode<Dimensions>).branches
                .map(({ polygon }) => polygon)
                .flat(2)
            ),
      ];
  // let's slice Pref along l in dimension d
  const [pL, pR] = pRef.reduce(
    (
      [pL, pR]: [Polygon<Dimensions>, Polygon<Dimensions>],
      [ll, ur]
    ): [Polygon<Dimensions>, Polygon<Dimensions>] => {
      const dL = ll[d] - l;
      const dR = ur[d] - l;
      if (dL > 0 && dR > 0) {
        pR.push([ll, ur]);
        return [pL, pR];
      }
      if (dL < 0 && dR < 0) {
        pL.push([ll, ur]);
        return [pL, pR];
      }
      pL.push([
        ll,
        ur.map((comp, axis) => (axis === d ? l : comp)),
      ] as Rectangle<Dimensions>);
      pR.push([
        ll.map((comp, axis) => (axis === d ? l : comp)),
        ur,
      ] as Rectangle<Dimensions>);
      return [pL, pR];
    },
    [[], []] as [Polygon<Dimensions>, Polygon<Dimensions>]
  );
  const [bL, bR] = leaf
    ? // iterate over the points if node is a leaf
      (node as LeafNode<Dimensions>).points.reduce(
        ([bL, bR], point) => {
          const iL = polygonIncludesPoint(pL, point);
          const iR = polygonIncludesPoint(pR, point);
          if (iL && iR) {
            (bL.child.points.length > bR.child.points.length
              ? bR.child.points
              : bL.child.points
            ).push(point);
          } else if (iL) {
            bL.child.points.push(point);
          } else if (iR) {
            bR.child.points.push(point);
          }
          return [bL, bR];
        },
        [
          {
            child: { points: [] as Point<Dimensions>[], parent },
            polygon: pL,
          },
          {
            child: { points: [] as Point<Dimensions>[], parent },
            polygon: pR,
          },
        ] as [
          {
            child: LeafNode<Dimensions>;
            polygon: Polygon<Dimensions>;
          },
          {
            child: LeafNode<Dimensions>;
            polygon: Polygon<Dimensions>;
          }
        ]
      )
    : // otherwise, iterate over the branches
      (node as RoutingNode<Dimensions>).branches.reduce(
        ([bL, bR], branch) => {
          if (polygonIntersection(branch.polygon, pL).length === 0) {
            bR.child.branches.push(branch);
            branch.child.parent = bR.child;
          } else if (polygonIntersection(branch.polygon, pR).length === 0) {
            bL.child.branches.push(branch);
            branch.child.parent = bL.child;
          } else {
            const [newBL, newBR] = splitNode(branch.child, l, d);
            bL.child.branches.push(newBL);
            newBL.child.parent = bL.child;
            bR.child.branches.push(newBR);
            newBR.child.parent = bR.child;
          }
          return [bL, bR];
        },
        [
          {
            child: { branches: [] as Branch<Dimensions>[], parent },
            polygon: pL,
          },
          {
            child: { branches: [] as Branch<Dimensions>[], parent },
            polygon: pR,
          },
        ] as [
          {
            child: RoutingNode<Dimensions>;
            polygon: Polygon<Dimensions>;
          },
          {
            child: RoutingNode<Dimensions>;
            polygon: Polygon<Dimensions>;
          }
        ]
      );
  // refine the polygons
  return [
    {
      child: bL.child,
      polygon: refine(bL.polygon),
    },
    {
      child: bR.child,
      polygon: refine(bR.polygon),
    },
  ];
};
