import { NIRTree, intersect, type Node, type Point, type Rect } from "./nirTree";

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const canvas = $<HTMLCanvasElement>("canvas");
const ctx = canvas.getContext("2d")!;
const fanout = $<HTMLInputElement>("#fanout");
let tree = new NIRTree(+fanout.value);
let mouse: Point = [-1, -1];
let start: Point | undefined; // where the mouse was pressed
let query: Rect | undefined; // range query being dragged

const box = (a: Point, b: Point): Rect => [
  a.map((x, d) => Math.min(x, b[d])),
  a.map((x, d) => Math.max(x, b[d])),
];
const points = () => tree.search(box([-Infinity, -Infinity], [Infinity, Infinity]));
const rebuild = (points: Point[]) => {
  tree = new NIRTree(+fanout.value);
  for (const p of points) tree.insert(p);
};
const cluster = () => {
  const center = [innerWidth, innerHeight].map((x) => x * (0.2 + 0.7 * Math.random()));
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 80;
  for (let i = 0; i < 100; i++) tree.insert(center.map((x) => x + gauss()));
};

function render() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const q = query ?? [mouse, mouse];
  const visit = (node: Node): Node[] =>
    node.children
      .filter((c) => c.poly.some((r) => intersect(r, q)))
      .flatMap((c) => [c, ...visit(c)]);
  const visited = new Set(visit(tree.root));
  const levels: Node[][] = [];
  for (let level = [tree.root]; level.length; level = level.flatMap((n) => n.children))
    levels.push(level);
  // leaves filled, upper levels with thicker outlines, visited nodes in white
  levels.forEach((nodes, depth) =>
    nodes.forEach((node, i) => {
      for (const [[x0, y0], [x1, y1]] of node.poly) {
        if (!node.children.length) {
          ctx.fillStyle = `hsl(${(i * 137.5) % 360} 60% 50% / 0.3)`;
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
        ctx.lineWidth = levels.length - depth;
        ctx.strokeStyle = visited.has(node) ? "#fff" : `hsl(${depth * 70} 70% 65% / 0.7)`;
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      }
    }),
  );
  const found = new Set(tree.search(q));
  for (const p of points()) {
    ctx.fillStyle = found.has(p) ? "#ff0" : "#fff";
    ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3);
  }
  if (query) {
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ff0";
    ctx.strokeRect(query[0][0], query[0][1], query[1][0] - query[0][0], query[1][1] - query[0][1]);
  }
  const nodes = levels.flat().slice(1);
  const rects = nodes.reduce((sum, n) => sum + n.poly.length, 0) / nodes.length || 0;
  $("#stats").textContent =
    `${points().length} points · fanout ${tree.m} · ${levels.length} levels · ${nodes.length} nodes · ` +
    `${rects.toFixed(2)} rectangles per polygon · ${query ? "range" : "point"} query: ` +
    `${visited.size} nodes visited, ${found.size} points found`;
}

canvas.onmousedown = (e) => {
  if (e.button === 0) [start, query] = [[e.clientX, e.clientY], undefined];
};
onmousemove = (e) => {
  mouse = [e.clientX, e.clientY];
  if (start && Math.hypot(mouse[0] - start[0], mouse[1] - start[1]) > 4) query = box(start, mouse);
  render();
};
onmouseup = () => {
  if (start && !query) tree.insert(start);
  start = undefined;
  render();
};
canvas.oncontextmenu = (e) => {
  e.preventDefault();
  const near = tree.search([mouse.map((x) => x - 8), mouse.map((x) => x + 8)]);
  const distance = (p: Point) => Math.hypot(p[0] - mouse[0], p[1] - mouse[1]);
  const [nearest] = near.sort((a, b) => distance(a) - distance(b));
  if (nearest) tree.remove(nearest);
  render();
};
const andRender = (action: () => void) => () => {
  action();
  render();
};
$("#cluster").onclick = andRender(cluster);
$("#clear").onclick = andRender(() => rebuild([]));
fanout.oninput = andRender(() => rebuild(points()));
onresize = render;
for (let i = 0; i < 4; i++) cluster();
render();
