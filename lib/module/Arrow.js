import React from 'react';
import { View } from 'react-native';
import { Placement } from './Types';
const Arrow = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    placement,
    color,
    arrowSize,
    positionStyle,
    elevation
  } = props;

  /*
   * Make width and height slightly bigger so that it overlaps popover to eliminate seem
   * (unless transparency is in play, in which case the overlap would show)
   */
  const isTransparent = color ? color.toString() === 'transparent' || color.toString().startsWith('rgba') || color.toString().startsWith('hsla') || color.toString().startsWith('#') && color.toString().length > 7 : false;
  const width = arrowSize.width + (isTransparent ? 0 : 2);
  const height = arrowSize.height + (isTransparent ? 0 : 2);

  // Flip width and height when showing on side to account for inner transform
  const placeLeftOrRight = [Placement.LEFT, Placement.RIGHT].includes(placement);
  const arrowOuterStyle = {
    position: 'absolute',
    width: placeLeftOrRight ? height : width,
    height: placeLeftOrRight ? width : height,
    overflow: 'hidden',
    elevation,
    ...positionStyle
  };

  // Create a triangle using borders
  const arrowInnerStyle = {
    position: 'absolute',
    [placement]: 0,
    borderBottomColor: color,
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    width,
    height: height * 2,
    borderBottomWidth: height,
    borderRightWidth: width / 2,
    borderLeftWidth: width / 2
  };

  // Rotate to show the triangle in different directions
  switch (placement) {
    case Placement.TOP:
      arrowInnerStyle.transform = [{
        rotateZ: '180deg'
      }];
      break;
    case Placement.LEFT:
      arrowInnerStyle.transform = [{
        rotateZ: '90deg'
      }];
      break;
    case Placement.RIGHT:
      arrowInnerStyle.transform = [{
        rotateZ: '270deg'
      }];
      break;
    default:
  }
  return /*#__PURE__*/React.createElement(View, {
    style: arrowOuterStyle,
    ref: ref
  }, /*#__PURE__*/React.createElement(View, {
    style: arrowInnerStyle
  }));
});
export default Arrow;
//# sourceMappingURL=Arrow.js.map