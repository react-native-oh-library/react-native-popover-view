"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArrowSize = getArrowSize;
exports.getBorderRadius = getBorderRadius;
exports.getChangedProps = getChangedProps;
exports.getRectForRef = getRectForRef;
exports.pointChanged = pointChanged;
exports.rectChanged = rectChanged;
exports.sizeChanged = sizeChanged;
exports.waitForChange = waitForChange;
exports.waitForNewRect = waitForNewRect;
var _reactNative = require("react-native");
var _Types = require("./Types");
var _Constants = require("./Constants");
// Need any here to match signature of findNodeHandle
// eslint-disable-next-line

function getRectForRef(ref) {
  return new Promise((resolve, reject) => {
    if (ref.current) {
      _reactNative.NativeModules.UIManager.measure((0, _reactNative.findNodeHandle)(ref.current), (_1, _2, width, height, x, y) => resolve(new _Types.Rect(x, y, width, height)));
    } else {
      reject(new Error('getRectForRef - current is not set'));
    }
  });
}
async function waitForChange(getFirst, getSecond) {
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
async function waitForNewRect(ref, initialRect) {
  await waitForChange(() => getRectForRef(ref), () => Promise.resolve(initialRect));
  const rect = await getRectForRef(ref);
  return rect;
}
function sizeChanged(a, b) {
  if (!a || !b) return false;
  return Math.round(a.width) !== Math.round(b.width) || Math.round(a.height) !== Math.round(b.height);
}
function rectChanged(a, b) {
  if (!a || !b) return false;
  return Math.round(a.x) !== Math.round(b.x) || Math.round(a.y) !== Math.round(b.y) || Math.round(a.width) !== Math.round(b.width) || Math.round(a.height) !== Math.round(b.height);
}
function pointChanged(a, b) {
  return Math.round(a.x) !== Math.round(b.x) || Math.round(a.y) !== Math.round(b.y);
}
function getArrowSize(placement, arrowStyle) {
  let {
    width,
    height
  } = _reactNative.StyleSheet.flatten(arrowStyle);
  if (typeof width !== 'number') ({
    width
  } = _Constants.DEFAULT_ARROW_SIZE);
  if (typeof height !== 'number') ({
    height
  } = _Constants.DEFAULT_ARROW_SIZE);
  switch (placement) {
    case _Types.Placement.LEFT:
    case _Types.Placement.RIGHT:
      return new _Types.Size(height, width);
    default:
      return new _Types.Size(width, height);
  }
}
function getBorderRadius(popoverStyle) {
  if (_reactNative.StyleSheet.flatten(popoverStyle).borderRadius === 0) return 0;
  return _reactNative.StyleSheet.flatten(popoverStyle).borderRadius || _Constants.DEFAULT_BORDER_RADIUS;
}
function getChangedProps(props, prevProps, importantProps) {
  return importantProps.filter(key => {
    const curVal = props[key];
    const prevVal = prevProps[key];
    if (curVal instanceof _Types.Rect && prevVal instanceof _Types.Rect) {
      return !curVal.equals(prevVal);
    }
    return curVal !== prevVal;
  });
}
//# sourceMappingURL=Utility.js.map