export type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & {
  length: TLength;
};
export type Point<Dimensions extends number> = Tuple<number, Dimensions>;
export type Rectangle<Dimensions extends number> = [
  Point<Dimensions>,
  Point<Dimensions>
];
export type Polygon<Dimensions extends number> = Rectangle<Dimensions>[];
