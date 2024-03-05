import { NativeModules, findNodeHandle, StyleSheet } from 'react-native';
import { Placement, Rect, Size } from './Types';
import { DEFAULT_ARROW_SIZE, DEFAULT_BORDER_RADIUS } from './Constants';

// Need any here to match signature of findNodeHandle
// eslint-disable-next-line

export function getRectForRef(ref) {
  return new Promise((resolve, reject) => {
    if (ref.current) {
      NativeModules.UIManager.measure(findNodeHandle(ref.current), (_1, _2, width, height, x, y) => resolve(new Rect(x, y, width, height)));
    } else {
      reject(new Error('getRectForRef - current is not set'));
    }
  });
}
export async function waitForChange(getFirst, getSecond) {
  // Failsafe so that the interval doesn't run forever
  let count = 0;
  let first, second;
  do {
    first = await getFirst();
    second = await getSecond();
    await new Promise(resolve => {
      setTimeout(resolve, 100);
    });
    count++;
    if (count++ > 20) {
      throw new Error('waitForChange - Timed out waiting for change (waited 2 seconds)');
    }
  } while (first.equals(second));
}
export async function waitForNewRect(ref, initialRect) {
  await waitForChange(() => getRectForRef(ref), () => Promise.resolve(initialRect));
  const rect = await getRectForRef(ref);
  return rect;
}
export function sizeChanged(a, b) {
  if (!a || !b) return false;
  return Math.round(a.width) !== Math.round(b.width) || Math.round(a.height) !== Math.round(b.height);
}
export function rectChanged(a, b) {
  if (!a || !b) return false;
  return Math.round(a.x) !== Math.round(b.x) || Math.round(a.y) !== Math.round(b.y) || Math.round(a.width) !== Math.round(b.width) || Math.round(a.height) !== Math.round(b.height);
}
export function pointChanged(a, b) {
  return Math.round(a.x) !== Math.round(b.x) || Math.round(a.y) !== Math.round(b.y);
}
export function getArrowSize(placement, arrowStyle) {
  let {
    width,
    height
  } = StyleSheet.flatten(arrowStyle);
  if (typeof width !== 'number') ({
    width
  } = DEFAULT_ARROW_SIZE);
  if (typeof height !== 'number') ({
    height
  } = DEFAULT_ARROW_SIZE);
  switch (placement) {
    case Placement.LEFT:
    case Placement.RIGHT:
      return new Size(height, width);
    default:
      return new Size(width, height);
  }
}
export function getBorderRadius(popoverStyle) {
  if (StyleSheet.flatten(popoverStyle).borderRadius === 0) return 0;
  return StyleSheet.flatten(popoverStyle).borderRadius || DEFAULT_BORDER_RADIUS;
}
export function getChangedProps(props, prevProps, importantProps) {
  return importantProps.filter(key => {
    const curVal = props[key];
    const prevVal = prevProps[key];
    if (curVal instanceof Rect && prevVal instanceof Rect) {
      return !curVal.equals(prevVal);
    }
    return curVal !== prevVal;
  });
}
//# sourceMappingURL=Utility.js.map