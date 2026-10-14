import { describe, expect, it } from "vitest";
import { figure4 } from "./figure4";
import { chooseLeaf, disjoint, fragment, refine, splitNode, type Rect } from "./nirTree";

/** r(x0, y0, ..., x1, y1, ...) is the rectangle from (x0, y0, ...) to (x1, y1, ...). */
const r = (...c: number[]): Rect => [c.slice(0, c.length / 2), c.slice(c.length / 2)];

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
