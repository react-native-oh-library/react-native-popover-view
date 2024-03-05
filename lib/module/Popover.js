function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import { Rect, Placement, Mode, Size } from './Types';
import { DEFAULT_ARROW_SIZE } from './Constants';
import JSModalPopover from './JSModalPopover';
import RNModalPopover from './RNModalPopover';
export default class Popover extends Component {
  static propTypes = {
    // display
    isVisible: PropTypes.bool,
    // anchor
    from: PropTypes.oneOfType([PropTypes.instanceOf(Rect), PropTypes.func, PropTypes.node, PropTypes.shape({
      current: PropTypes.any
    })]),
    // config
    displayArea: PropTypes.oneOfType([PropTypes.exact({
      x: PropTypes.number,
      y: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number
    })]),
    displayAreaInsets: PropTypes.shape({
      left: PropTypes.number,
      right: PropTypes.number,
      top: PropTypes.number,
      bottom: PropTypes.number
    }),
    placement: PropTypes.oneOfType([PropTypes.oneOf([Placement.LEFT, Placement.RIGHT, Placement.TOP, Placement.BOTTOM, Placement.AUTO, Placement.FLOATING, Placement.CENTER]), PropTypes.arrayOf(PropTypes.oneOf([Placement.LEFT, Placement.RIGHT, Placement.TOP, Placement.BOTTOM, Placement.AUTO, Placement.FLOATING, Placement.CENTER]))]),
    animationConfig: PropTypes.object,
    verticalOffset: PropTypes.number,
    // style
    popoverStyle: ViewPropTypes.style,
    popoverShift: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    backgroundStyle: ViewPropTypes.style,
    arrowSize: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }),
    arrowShift: PropTypes.number,
    // lifecycle
    onOpenStart: PropTypes.func,
    onOpenComplete: PropTypes.func,
    onRequestClose: PropTypes.func,
    onCloseStart: PropTypes.func,
    onCloseComplete: PropTypes.func,
    onPositionChange: PropTypes.func,
    debug: PropTypes.bool
  };
  static defaultProps = {
    mode: Mode.RN_MODAL,
    placement: Placement.AUTO,
    verticalOffset: 0,
    popoverStyle: {},
    arrowSize: DEFAULT_ARROW_SIZE,
    backgroundStyle: {},
    debug: false
  };
  state = {
    isVisible: false
  };
  sourceRef = /*#__PURE__*/React.createRef();
  render() {
    const {
      mode,
      from,
      isVisible,
      onRequestClose,
      placement,
      arrowSize,
      displayArea,
      ...otherProps
    } = this.props;
    const actualIsVisible = isVisible === undefined ? this.state.isVisible : isVisible;
    let fromRect;
    let fromRef;
    let sourceElement;
    if (from) {
      if (typeof from === 'object' && (from.x || from.x === 0) && (from.y || from.y === 0)) {
        if ((from.width || from.width === 0) && (from.height || from.height === 0)) {
          const fromAsRect = from;
          fromRect = new Rect(fromAsRect.x, fromAsRect.y, fromAsRect.width, fromAsRect.height);
        } else {
          fromRect = new Rect(from.x, from.y, 0, 0);
        }
      } else if ({}.hasOwnProperty.call(from, 'current')) {
        fromRef = from;
      } else if (typeof from === 'function') {
        const element = from(this.sourceRef, () => this.setState({
          isVisible: true
        }));
        if ( /*#__PURE__*/React.isValidElement(element)) {
          sourceElement = element;
          fromRef = this.sourceRef;
        }
      } else if ( /*#__PURE__*/React.isValidElement(from)) {
        if (isVisible === undefined) {
          sourceElement = /*#__PURE__*/React.cloneElement(from, {
            onPress: () => this.setState({
              isVisible: true
            })
          });
        } else {
          sourceElement = from;
        }
        fromRef = this.sourceRef;
      } else {
        console.warn('Popover: `from` prop is an invalid value. Pass a React element, Rect, RefObject, or function that returns a React element.');
      }
    }
    if (sourceElement) {
      sourceElement = /*#__PURE__*/React.cloneElement(sourceElement, {
        ref: this.sourceRef
      });
    }
    const modalProps = {
      ...otherProps,
      fromRect,
      fromRef,
      isVisible: actualIsVisible,
      arrowSize: arrowSize ? new Size(arrowSize === null || arrowSize === void 0 ? void 0 : arrowSize.width, arrowSize === null || arrowSize === void 0 ? void 0 : arrowSize.height) : undefined,
      displayArea: displayArea ? new Rect(displayArea.x, displayArea.y, displayArea.width, displayArea.height) : undefined,
      onRequestClose: () => {
        if (onRequestClose) onRequestClose();
        this.setState({
          isVisible: false
        });
      },
      // Handle changing CENTER -> FLOATING until CENTER is removed
      placement: placement === Placement.CENTER ? Placement.FLOATING : placement
    };
    if (mode === Mode.RN_MODAL) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, sourceElement, /*#__PURE__*/React.createElement(RNModalPopover, modalProps));
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, sourceElement, /*#__PURE__*/React.createElement(JSModalPopover, _extends({
      showBackground: mode !== Mode.TOOLTIP
    }, modalProps)));
  }
}
//# sourceMappingURL=Popover.js.map