"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _deprecatedReactNativePropTypes = require("deprecated-react-native-prop-types");
var _Types = require("./Types");
var _Constants = require("./Constants");
var _JSModalPopover = _interopRequireDefault(require("./JSModalPopover"));
var _RNModalPopover = _interopRequireDefault(require("./RNModalPopover"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
class Popover extends _react.Component {
  static propTypes = {
    // display
    isVisible: _propTypes.default.bool,
    // anchor
    from: _propTypes.default.oneOfType([_propTypes.default.instanceOf(_Types.Rect), _propTypes.default.func, _propTypes.default.node, _propTypes.default.shape({
      current: _propTypes.default.any
    })]),
    // config
    displayArea: _propTypes.default.oneOfType([_propTypes.default.exact({
      x: _propTypes.default.number,
      y: _propTypes.default.number,
      width: _propTypes.default.number,
      height: _propTypes.default.number
    })]),
    displayAreaInsets: _propTypes.default.shape({
      left: _propTypes.default.number,
      right: _propTypes.default.number,
      top: _propTypes.default.number,
      bottom: _propTypes.default.number
    }),
    placement: _propTypes.default.oneOfType([_propTypes.default.oneOf([_Types.Placement.LEFT, _Types.Placement.RIGHT, _Types.Placement.TOP, _Types.Placement.BOTTOM, _Types.Placement.AUTO, _Types.Placement.FLOATING, _Types.Placement.CENTER]), _propTypes.default.arrayOf(_propTypes.default.oneOf([_Types.Placement.LEFT, _Types.Placement.RIGHT, _Types.Placement.TOP, _Types.Placement.BOTTOM, _Types.Placement.AUTO, _Types.Placement.FLOATING, _Types.Placement.CENTER]))]),
    animationConfig: _propTypes.default.object,
    verticalOffset: _propTypes.default.number,
    // style
    popoverStyle: _deprecatedReactNativePropTypes.ViewPropTypes.style,
    popoverShift: _propTypes.default.shape({
      x: _propTypes.default.number,
      y: _propTypes.default.number
    }),
    backgroundStyle: _deprecatedReactNativePropTypes.ViewPropTypes.style,
    arrowSize: _propTypes.default.shape({
      width: _propTypes.default.number,
      height: _propTypes.default.number
    }),
    arrowShift: _propTypes.default.number,
    // lifecycle
    onOpenStart: _propTypes.default.func,
    onOpenComplete: _propTypes.default.func,
    onRequestClose: _propTypes.default.func,
    onCloseStart: _propTypes.default.func,
    onCloseComplete: _propTypes.default.func,
    onPositionChange: _propTypes.default.func,
    debug: _propTypes.default.bool
  };
  static defaultProps = {
    mode: _Types.Mode.RN_MODAL,
    placement: _Types.Placement.AUTO,
    verticalOffset: 0,
    popoverStyle: {},
    arrowSize: _Constants.DEFAULT_ARROW_SIZE,
    backgroundStyle: {},
    debug: false
  };
  state = {
    isVisible: false
  };
  sourceRef = /*#__PURE__*/_react.default.createRef();
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
          fromRect = new _Types.Rect(fromAsRect.x, fromAsRect.y, fromAsRect.width, fromAsRect.height);
        } else {
          fromRect = new _Types.Rect(from.x, from.y, 0, 0);
        }
      } else if ({}.hasOwnProperty.call(from, 'current')) {
        fromRef = from;
      } else if (typeof from === 'function') {
        const element = from(this.sourceRef, () => this.setState({
          isVisible: true
        }));
        if ( /*#__PURE__*/_react.default.isValidElement(element)) {
          sourceElement = element;
          fromRef = this.sourceRef;
        }
      } else if ( /*#__PURE__*/_react.default.isValidElement(from)) {
        if (isVisible === undefined) {
          sourceElement = /*#__PURE__*/_react.default.cloneElement(from, {
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
      sourceElement = /*#__PURE__*/_react.default.cloneElement(sourceElement, {
        ref: this.sourceRef
      });
    }
    const modalProps = {
      ...otherProps,
      fromRect,
      fromRef,
      isVisible: actualIsVisible,
      arrowSize: arrowSize ? new _Types.Size(arrowSize === null || arrowSize === void 0 ? void 0 : arrowSize.width, arrowSize === null || arrowSize === void 0 ? void 0 : arrowSize.height) : undefined,
      displayArea: displayArea ? new _Types.Rect(displayArea.x, displayArea.y, displayArea.width, displayArea.height) : undefined,
      onRequestClose: () => {
        if (onRequestClose) onRequestClose();
        this.setState({
          isVisible: false
        });
      },
      // Handle changing CENTER -> FLOATING until CENTER is removed
      placement: placement === _Types.Placement.CENTER ? _Types.Placement.FLOATING : placement
    };
    if (mode === _Types.Mode.RN_MODAL) {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, sourceElement, /*#__PURE__*/_react.default.createElement(_RNModalPopover.default, modalProps));
    }
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, sourceElement, /*#__PURE__*/_react.default.createElement(_JSModalPopover.default, _extends({
      showBackground: mode !== _Types.Mode.TOOLTIP
    }, modalProps)));
  }
}
exports.default = Popover;
//# sourceMappingURL=Popover.js.map