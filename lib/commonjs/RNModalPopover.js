"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _AdaptivePopover = _interopRequireDefault(require("./AdaptivePopover"));
var _Constants = require("./Constants");
var _Types = require("./Types");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
class RNModalPopover extends _react.Component {
  state = {
    visible: false
  };
  static isShowingInModal = false;
  componentDidMount() {
    if (this.props.isVisible) {
      if (RNModalPopover.isShowingInModal) console.warn(_Constants.MULTIPLE_POPOVER_WARNING);else this.setState({
        visible: true
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.isVisible && !prevProps.isVisible) {
      if (RNModalPopover.isShowingInModal) console.warn(_Constants.MULTIPLE_POPOVER_WARNING);else this.setState({
        visible: true
      });
    }
    if (!this.state.visible && prevState.visible && this.props.onCloseComplete) {
      /*
       * Don't run this callback until after update, so that <Modal> is no longer active
       * Need to wait 50ms to make sure <Modal> is completely gone, in case
       * we want to show another popover immediately after
       */
      setTimeout(this.props.onCloseComplete, 50);
    }
  }
  render() {
    const {
      statusBarTranslucent,
      onCloseStart,
      onRequestClose
    } = this.props;
    const {
      visible
    } = this.state;
    return /*#__PURE__*/_react.default.createElement(_reactNative.Modal, {
      transparent: true,
      supportedOrientations: ['portrait', 'portrait-upside-down', 'landscape'],
      hardwareAccelerated: true,
      visible: visible,
      statusBarTranslucent: statusBarTranslucent,
      onShow: () => {
        RNModalPopover.isShowingInModal = true;
      }
      // Handles android back button
      ,
      onRequestClose: onRequestClose
    }, /*#__PURE__*/_react.default.createElement(_AdaptivePopover.default, _extends({}, this.props, {
      onCloseStart: () => {
        RNModalPopover.isShowingInModal = false;
        if (onCloseStart) onCloseStart();
      },
      onCloseComplete: () => this.setState({
        visible: false
      }),
      getDisplayAreaOffset: () => Promise.resolve(new _Types.Point(0, 0))
    })));
  }
}
exports.default = RNModalPopover;
//# sourceMappingURL=RNModalPopover.js.map