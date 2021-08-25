import { Point, Polygon } from '../utils/types';

// Definitions

type RootNode<Dimensions extends number> =
  | { points: Point<Dimensions>[] }
  | { branches: Branch<Dimensions>[] };
type RoutingNode<Dimensions extends number> = {
  parent: Node<Dimensions>;
  branches: Branch<Dimensions>[];
};
type LeafNode<Dimensions extends number> = {
  parent: Node<Dimensions>;
  points: Point<Dimensions>[];
};
type Branch<Dimensions extends number> = {
  child: Node<Dimensions>;
  polygon: Polygon<Dimensions>;
}[];
type Node<Dimensions extends number> =
  | RootNode<Dimensions>
  | RoutingNode<Dimensions>
  | LeafNode<Dimensions>;
