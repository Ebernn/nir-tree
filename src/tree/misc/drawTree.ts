import { hslToHex } from '../../viewport/utils';
import { Polygon, Rectangle } from '../../utils/types';
import { isLeaf, Node } from '../nirTree';

const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const getSymbol = (i: number): string =>
  i < symbols.length
    ? symbols[i]
    : `${getSymbol(Math.floor(i / symbols.length) - 1)}${
        symbols[i % symbols.length]
      }`;
export const scaleFactor = 10;

const drawTree = (
  context: CanvasRenderingContext2D,
  node: Node<2>,
  i = 0
): void => {
  if (!isLeaf(node)) {
    context.save();
    if (i === 0) {
      context.scale(scaleFactor, scaleFactor);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '0.5px Arial';
      context.lineWidth = 0.5 / scaleFactor;
    }
    node.branches.forEach(({ polygon }) => {
      const h = (360 / symbols.length) * ((383 * i) % symbols.length);
      context.fillStyle = hslToHex(h, 100, 50);
      context.strokeStyle = hslToHex(h, 100, 25);
      drawPolygon(context, polygon, getSymbol(i));
      i++;
    });
    node.branches.forEach(({ child }) => drawTree(context, child, i));
    context.restore();
  }
};

const drawPolygon = (
  context: CanvasRenderingContext2D,
  rectangles: Polygon<2>,
  name: string
) => {
  if (rectangles.length === 1) drawRectangle(context, rectangles[0], name);
  else
    rectangles.forEach((rectangle, i) =>
      drawRectangle(context, rectangle, `${name}${i + 1}`)
    );
};

const drawRectangle = (
  context: CanvasRenderingContext2D,
  [ll, ur]: Rectangle<2>,
  name: string
) => {
  context.save();
  context.beginPath();
  context.rect(ll[0], -ll[1], ur[0] - ll[0], -(ur[1] - ll[1]));
  context.fill();
  context.stroke();
  context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  context.fillText(name, (ur[0] + ll[0]) / 2, -(ur[1] + ll[1]) / 2);
  context.stroke();
  context.restore();
};

export default drawTree;
