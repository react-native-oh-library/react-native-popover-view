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
var _Utility = require("./Utility");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
class JSModalPopover extends _react.Component {
  state = {
    visible: false
  };
  containerRef = /*#__PURE__*/_react.default.createRef();
  componentDidMount() {
    if (this.props.isVisible) this.setState({
      visible: true
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) this.setState({
      visible: true
    });
  }
  render() {
    const {
      onCloseComplete
    } = this.props;
    const {
      visible
    } = this.state;
    if (visible) {
      return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
        pointerEvents: "box-none",
        style: _Constants.styles.container,
        ref: this.containerRef
      }, /*#__PURE__*/_react.default.createElement(_AdaptivePopover.default, _extends({}, this.props, {
        onCloseComplete: () => {
          if (onCloseComplete) onCloseComplete();
          this.setState({
            visible: false
          });
        },
        getDisplayAreaOffset: async () => {
          const rect = await (0, _Utility.getRectForRef)(this.containerRef);
          return new _Types.Point(rect.x, rect.y);
        }
      })));
    }
    return null;
  }
}
exports.default = JSModalPopover;
//# sourceMappingURL=JSModalPopover.js.map