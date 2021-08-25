import { Tuple } from '../utils/types';

// Definitions

type Point<Dimensions extends number> = Tuple<number, Dimensions>;
type Rectangle<Dimensions extends number> = [
  Point<Dimensions>,
  Point<Dimensions>
];
type Polygon<Dimensions extends number> = Rectangle<Dimensions>[];

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
