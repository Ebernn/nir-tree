import {
  polygonExpand,
  polygonFragmentation,
  polygonIncludesPoint,
  polygonIntersection,
  polygonsAreDisjoint,
  polygonVolume,
  refine,
} from '../utils/geometry';
import { Point, Polygon } from '../utils/types';

// Definitions

type RootNode<Dimensions extends number> =
  | { points: Point<Dimensions>[]; isLeaf: true }
  | { branches: Branch<Dimensions>[]; isLeaf: false };
type RoutingNode<Dimensions extends number> = {
  parent: Node<Dimensions>;
  branches: Branch<Dimensions>[];
  isLeaf: false;
};
type LeafNode<Dimensions extends number> = {
  parent: Node<Dimensions>;
  points: Point<Dimensions>[];
  isLeaf: true;
};
type Branch<Dimensions extends number> = {
  child: Node<Dimensions>;
  polygon: Polygon<Dimensions>;
};
type Node<Dimensions extends number> =
  | RootNode<Dimensions>
  | RoutingNode<Dimensions>
  | LeafNode<Dimensions>;

/**
 * Algorithm 1. Insert a point in a branch leaf (choose the best polygon)
 * @param rootBranch
 * @param point
 * @returns the leaf node where the node has been inserted
 */
export const chooseLeaf = <Dimensions extends number>(
  // prefer using a branch instead of a node (so we do not lose the polygon information)
  rootBranch: Branch<Dimensions>,
  point: Point<Dimensions>
): LeafNode<Dimensions> | { points: Point<Dimensions>[]; isLeaf: true } => {
  let leafBranch: Branch<Dimensions> = rootBranch;
  while (!leafBranch.child.isLeaf) {
    // let's find a branch including the point
    let branchIncludingPoint = false;
    const branches = leafBranch.child.branches;
    for (const branch of branches) {
      if (polygonIncludesPoint(branch.polygon, point)) {
        leafBranch = branch;
        branchIncludingPoint = true;
        break;
      }
    }
    // we do not have found any branch including the point, so let's expand a branch polygon
    if (!branchIncludingPoint) {
      // find and expand the best polygon, minimizing additional area to enclose the point
      // eslint-disable-next-line prefer-const
      let [minIndex, minExpandedPolygon] = branches.reduce(
        ([minIndex, minExpandedPolygon, minAddVolume], branch, index) => {
          const expandedPolygon = polygonExpand(branch.polygon, point);
          const addVolume =
            polygonVolume(expandedPolygon) - polygonVolume(branch.polygon);
          return addVolume < minAddVolume
            ? [index, expandedPolygon, addVolume]
            : [minIndex, minExpandedPolygon, minAddVolume];
        },
        [-1, branches[0].polygon, Number.POSITIVE_INFINITY]
      );
      if (minIndex < 0) throw new Error('The non-leaf node has no branch.');
      // fragment it (with non-disjoint neighboring polygons)
      branches
        .filter(
          ({ polygon }) => !polygonsAreDisjoint(polygon, minExpandedPolygon)
        )
        .forEach(({ polygon }) => {
          minExpandedPolygon = polygonFragmentation(
            minExpandedPolygon,
            polygon
          );
        });
      // intersect it (with its parent polygon)
      minExpandedPolygon = polygonIntersection(
        minExpandedPolygon,
        leafBranch.polygon
      );
      // refine it (and update the branch)
      branches[minIndex].polygon = refine(minExpandedPolygon);
      leafBranch = branches[minIndex];
    }
  }
  return leafBranch.child;
};
