import { ZoomTransform } from 'd3-zoom';
import { NumberKeyframeTrack, PerspectiveCamera, Vector3 } from 'three';
import { Graph } from '../../types/graph';
import { zoomIdentity } from 'd3-zoom';
export interface Point {
  x: number;
  y: number;
}

export type Transform = {
  x: number;
  y: number;
  k: number;
};

export function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

export function center(x1: number, y1: number, x2: number, y2: number) {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2
  };
}

function toRadians(angle: number) {
  return angle * (Math.PI / 180);
}

export function getScaleFromZ(z: number, fov: number, height: number) {
  const halfFov = toRadians(fov / 2);
  const halfFovHeight = Math.tan(halfFov) * z;
  const fovHeight = halfFovHeight * 2;
  // Divide visualization height by height derived from field of view
  return height / fovHeight;
}

export function getZFromScale(scale: number, fov: number, height: number) {
  const halfFov = toRadians(fov / 2);
  const scaleHeight = height / scale;
  return scaleHeight / (2 * Math.tan(halfFov));
}

export function positionThreeCamera(
  camera: PerspectiveCamera,
  t: Pick<ZoomTransform, 'x' | 'y' | 'k'>,
  w: number,
  h: number,
  fov: number
) {
  const scale = t.k;
  const x = -t.x / scale;
  const y = t.y / scale;
  const z = getZFromScale(t.k, fov, h);
  camera.position.set(x, y, z);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function pointOnLine(
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  t: number
): Point {
  return { x: sx + t * (ex - sx), y: sy + t * (ey - sy) };
}

export function bbox({ nodes }: Graph) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < nodes.length; i++) {
    const { x = 0, y = 0, r = 0 } = nodes[i].attributes;
    if (x - r < minX) minX = x - r;
    if (x + r > maxX) maxX = x + r;
    if (y - r < minY) minY = y - r;
    if (y + r > maxY) maxY = y + r;
  }

  return { minX, minY, maxX, maxY };
}

const trainsformIdentity = (): Transform => ({ k: 1, x: 0, y: 0 });

export function getBoundsTransform(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  canvasWidth: number,
  canvasHeight: number
): Transform {
  const w = Math.abs(x1 - x0) || 0;
  const h = Math.abs(y1 - y0) || 0;
  const cx = (x0 + x1) / 2 || 0;
  const cy = (y0 + y1) / 2 || 0;

  if (isNaN(w) || isNaN(h) || !isFinite(w) || !isFinite(h))
    return { x: 0, y: 0, k: 1 };

  const scale = 0.25 / Math.max(w / canvasWidth, h / canvasHeight);
  return zoomIdentity.translate(-scale * cx, scale * cy).scale(scale);
}

export function mouseToThree(x: number, y: number, w: number, h: number) {
  return new Vector3((x / w) * 2 - 1, -(y / h) * 2 + 1, 1);
}

function scale(transform: Transform, k: number) {
  return k === transform.k
    ? transform
    : { k: k, x: transform.x * k, y: transform.y * k };
}

function tr({ x, y, k }: Transform, dx: number, dy: number): Transform {
  return {
    x: x + dx * k,
    y: y + dy * k,
    k
  };
}

function translate(
  transform: Transform,
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number
) {
  var x = p0x - p1x * transform.k,
    y = p0y - p1y * transform.k;
  return x === transform.x && y === transform.y
    ? transform
    : { k: transform.k, x, y };
}

function invert(transform: Transform, x: number, y: number) {
  return {
    x: (x - transform.x) / transform.k,
    y: (y - transform.y) / transform.k
  };
}

export function zoomAround(
  transform: Transform,
  x: number,
  y: number,
  zoom: number
) {
  const { x: x1, y: y1 } = invert(transform, x, y);
  return translate(scale(transform, zoom), x, y, x1, y1);
}

export function isPointInLine(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  margin = 0
): boolean {
  // http://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
  const len = distance(x1, y1, x2, y2),
    epsilon = width / 2,
    m = (epsilon + margin) / len,
    dx = (x2 - x1) * m,
    dy = (y2 - y1) * m,
    rx1 = x1 + dy,
    ry1 = y1 - dx,
    rx2 = x1 - dy,
    ry2 = y1 + dx,
    rx4 = x2 + dy,
    ry4 = y2 - dx;

  const AMx = px - rx1,
    AMy = py - ry1,
    ABx = rx2 - rx1,
    ABy = ry2 - ry1,
    ADx = rx4 - rx1,
    ADy = ry4 - ry1;

  const AMdotAB = AMx * ABx + AMy * ABy,
    ABdotAB = ABx * ABx + ABy * ABy,
    AMdotAD = AMx * ADx + AMy * ADy,
    ADdotAD = ADx * ADx + ADy * ADy;

  return AMdotAB > 0 && AMdotAB < ABdotAB && AMdotAD > 0 && AMdotAD < ADdotAD;
}
