import {
  expand,
  polygonFragmentation,
  polygonIncludesPoint,
  polygonIntersection,
  polygonsAreDisjoint,
  refine,
} from '../utils/geometry';
import { Point, Polygon } from '../utils/types';

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
