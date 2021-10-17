import { Point, Polygon } from '../../utils/types';
import { Node, RoutingNode } from '../nirTree';

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

export default buildTree;
