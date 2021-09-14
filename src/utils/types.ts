export type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & {
  length: TLength;
};
// Definition 3.
export type Point<Dimensions extends number> = Tuple<number, Dimensions>;
// Definition 4.
export type Rectangle<Dimensions extends number> = [
  Point<Dimensions>,
  Point<Dimensions>
];
// Definition 7.
export type Polygon<Dimensions extends number> = Rectangle<Dimensions>[];
