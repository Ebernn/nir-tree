import { figure4 } from "./figure4";
import { chooseLeaf, splitNode, type Node, type Point } from "./nirTree";

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
let mouse: Point | undefined;
let shift = false;

function render() {
  const scale = Math.min(innerWidth / 18, innerHeight / 11);
  const [X, Y] = [(x: number) => (x + 0.5) * scale, (y: number) => (10.5 - y) * scale];
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.font = "12px system-ui";
  let root = figure4();
  if (mouse && shift) root = { poly: [], children: splitNode(root, mouse[0], 0), points: [] };
  else if (mouse) chooseLeaf(root, mouse);
  const nodes = [root];
  for (const node of nodes) nodes.push(...node.children);
  nodes.slice(1).forEach((node: Node, i) => {
    const hue = (i * 67) % 360;
    node.poly.forEach(([[x0, y0], [x1, y1]], j) => {
      ctx.fillStyle = `hsl(${hue} 70% 60% / 0.2)`;
      ctx.strokeStyle = `hsl(${hue} 70% 60%)`;
      ctx.fillRect(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1));
      ctx.strokeRect(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1));
      ctx.fillStyle = "#ddd";
      ctx.fillText(
        `${String.fromCharCode(65 + i)}${node.poly.length > 1 ? j + 1 : ""}`,
        X(x0) + 4,
        Y(y1) + 14,
      );
    });
    for (const [x, y] of node.points) ctx.fillRect(X(x) - 2, Y(y) - 2, 4, 4);
  });
  if (mouse) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(X(mouse[0]), Y(mouse[1]), 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}

onmousemove = (e) => {
  const scale = Math.min(innerWidth / 18, innerHeight / 11);
  mouse = [e.clientX / scale - 0.5, 10.5 - e.clientY / scale];
  shift = e.shiftKey;
  render();
};
onkeydown = onkeyup = (e) => {
  shift = e.shiftKey;
  render();
};
onresize = render;
render();
