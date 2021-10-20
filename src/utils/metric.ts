import { Rectangle } from './types';

/**
 * Returns rectangle Manhattan distance.
 * @param rectangle
 * @returns {number} sum of its borders length
 */
export const manhattanMetric = <Dimensions extends number>([
  ll,
  ur,
]: Rectangle<Dimensions>): number =>
  ur
    .map((comp, axis) => comp - ll[axis])
    .reduce((accDistance, curDistance) => accDistance + curDistance, 0);

/**
 * Returns a rectangle volume.
 * @param rectangle
 * @returns {number} volume
 */
export const volumeMetric = <Dimensions extends number>([
  ll,
  ur,
]: Rectangle<Dimensions>): number =>
  ur
    .map((comp, axis) => comp - ll[axis])
    .reduce((accVolume, curVolume) => accVolume * curVolume);

export default volumeMetric;
