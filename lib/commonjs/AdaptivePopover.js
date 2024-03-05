"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _Constants = require("./Constants");
var _Types = require("./Types");
var _Utility = require("./Utility");
var _BasePopover = _interopRequireDefault(require("./BasePopover"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
class AdaptivePopover extends _react.Component {
  state = {
    fromRect: null,
    shiftedDisplayArea: null,
    defaultDisplayArea: null,
    displayAreaOffset: null,
    showing: false
  };
  getUnshiftedDisplayArea() {
    return this.props.displayArea || this.state.defaultDisplayArea || new _Types.Rect(0, 0, _reactNative.Dimensions.get('window').width, _reactNative.Dimensions.get('window').height);
  }

  // Apply insets and shifts if needed
  getDisplayArea() {
    const {
      displayAreaInsets
    } = this.props;
    const displayArea = this.state.shiftedDisplayArea || this.getUnshiftedDisplayArea();
    if (displayAreaInsets) {
      this.debug('[AdaptivePopover] getDisplayArea - displayAreaInsets', displayAreaInsets);
      return new _Types.Rect(displayArea.x + (displayAreaInsets.left ?? 0), displayArea.y + (displayAreaInsets.top ?? 0), displayArea.width - (displayAreaInsets.left ?? 0) - (displayAreaInsets.right ?? 0), displayArea.height - (displayAreaInsets.top ?? 0) - (displayAreaInsets.bottom ?? 0));
    }
    return displayArea;
  }

  /*
   * This is used so that when the device is rotating
   * or the viewport is expanding for any other reason,
   * we can suspend updates due to content changes until
   * we are finished calculating the new display
   * area and rect for the new viewport size.
   * This makes the recalc on rotation much faster.
   */
  waitForResizeToFinish = false;
  skipNextDefaultDisplayArea = false;
  _isMounted = false;
  keyboardDidHideSubscription = null;
  keyboardDidShowSubscription = null;
  handleResizeEventSubscription = null;
  constructor(props) {
    super(props);
    this.handleResizeEvent = this.handleResizeEvent.bind(this);
    this.keyboardDidHide = this.keyboardDidHide.bind(this);
    this.keyboardDidShow = this.keyboardDidShow.bind(this);
  }
  componentDidMount() {
    this.handleResizeEventSubscription = _reactNative.Dimensions.addEventListener('change', this.handleResizeEvent);
    if (this.props.fromRect) this.setState({
      fromRect: this.props.fromRect
    });else if (this.props.fromRef) this.calculateRectFromRef();
    this._isMounted = true;
  }
  componentWillUnmount() {
    var _this$handleResizeEve, _this$handleResizeEve2, _this$keyboardDidShow, _this$keyboardDidHide;
    this._isMounted = false;
    if (typeof ((_this$handleResizeEve = this.handleResizeEventSubscription) === null || _this$handleResizeEve === void 0 ? void 0 : _this$handleResizeEve.remove) === 'function') (_this$handleResizeEve2 = this.handleResizeEventSubscription) === null || _this$handleResizeEve2 === void 0 || _this$handleResizeEve2.remove();else
      // Backward-compatibility with RN <= 0.63
      _reactNative.Dimensions.removeEventListener('change', this.handleResizeEvent);
    (_this$keyboardDidShow = this.keyboardDidShowSubscription) === null || _this$keyboardDidShow === void 0 || _this$keyboardDidShow.remove();
    (_this$keyboardDidHide = this.keyboardDidHideSubscription) === null || _this$keyboardDidHide === void 0 || _this$keyboardDidHide.remove();
  }
  componentDidUpdate(prevProps) {
    // Make sure a value we care about has actually changed
    const importantProps = ['fromRef', 'fromRect', 'displayArea'];
    const changedProps = (0, _Utility.getChangedProps)(this.props, prevProps, importantProps);
    if (!changedProps.length) return;
    this.debug('[AdaptivePopover] componentDidUpdate - changedProps', changedProps);
    if (changedProps.includes('fromRect')) {
      this.debug('componentDidUpdate - fromRect changed', this.props.fromRect);
      this.setState({
        fromRect: this.props.fromRect || null
      });
    } else if (this.props.fromRef !== prevProps.fromRef) {
      this.debug('componentDidUpdate - fromRef changed');
      if (this.props.fromRef) this.calculateRectFromRef();else this.setState({
        fromRect: null
      });
    }
    if (this.props.isVisible && prevProps.isVisible) {
      if (changedProps.includes('displayArea') || this.displayAreaStore && !this.getDisplayArea().equals(this.displayAreaStore)) {
        this.debug('componentDidUpdate - displayArea changed', this.getDisplayArea());
        this.displayAreaStore = this.getDisplayArea();
      }
    }
  }

  // First thing called when device rotates
  handleResizeEvent(change) {
    this.debug('handleResizeEvent - New Dimensions', change);
    if (this.props.isVisible) {
      this.waitForResizeToFinish = true;
    }
  }
  debug(line, obj) {
    if (_Constants.DEBUG || this.props.debug) console.log(`[${new Date().toISOString()}] ${line}${obj ? `: ${JSON.stringify(obj)}` : ''}`);
  }
  async setDefaultDisplayArea(newDisplayArea) {
    if (!this._isMounted) return;
    const {
      defaultDisplayArea
    } = this.state;

    /*
     * When the popover is closing and the display area's onLayout event is called,
     * the width/height values may be zero which causes a bad display area for the
     * first mount when the popover re-opens
     */
    const isValidDisplayArea = newDisplayArea.width > 0 && newDisplayArea.height > 0;
    if ((!defaultDisplayArea || !newDisplayArea.equals(defaultDisplayArea)) && isValidDisplayArea) {
      this.debug('setDefaultDisplayArea - newDisplayArea', newDisplayArea);
      if (!this.skipNextDefaultDisplayArea) {
        const displayAreaOffset = await this.props.getDisplayAreaOffset();
        this.debug('setDefaultDisplayArea - displayAreaOffset', displayAreaOffset);
        await new Promise(resolve => {
          this.setState({
            defaultDisplayArea: newDisplayArea,
            displayAreaOffset
          }, () => resolve(null));
        });

        /*
         * If we have a ref, then changing the display area may have resulted in the view moving,
         * so need to poll and see if it moves
         */
        if (this.props.fromRef) {
          await this.calculateRectFromRef();
        }
        this.waitForResizeToFinish = false;
        this.displayAreaStore = this.getDisplayArea();
      }
      if (this.skipNextDefaultDisplayArea) this.debug('setDefaultDisplayArea - Skipping first because isLandscape');
      this.skipNextDefaultDisplayArea = false;
    }
  }

  // Custom type here, as KeyboardEvent type does not contain endCoordinates
  keyboardDidShow(e) {
    this.debug(`keyboardDidShow - keyboard height: ${e.endCoordinates.height}`);
    this.shiftForKeyboard(e.endCoordinates.height);
  }
  keyboardDidHide() {
    this.debug('keyboardDidHide');
    if (this._isMounted) this.setState({
      shiftedDisplayArea: null
    });
  }
  shiftForKeyboard(keyboardHeight) {
    const displayArea = this.getUnshiftedDisplayArea();
    const absoluteVerticalCutoff = _reactNative.Dimensions.get('window').height - keyboardHeight - (_Constants.isIOS ? 10 : 40);
    const combinedY = Math.min(displayArea.height + displayArea.y, absoluteVerticalCutoff);
    this.setState({
      shiftedDisplayArea: new _Types.Rect(displayArea.x, displayArea.y, displayArea.width, combinedY - displayArea.y)
    });
  }
  async calculateRectFromRef() {
    const {
      fromRef
    } = this.props;
    const initialRect = this.state.fromRect || new _Types.Rect(0, 0, 0, 0);
    const displayAreaOffset = this.state.displayAreaOffset ?? {
      x: 0,
      y: 0
    };
    this.debug('calculateRectFromRef - waiting for ref');
    let count = 0;
    while (!(fromRef !== null && fromRef !== void 0 && fromRef.current)) {
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
      // Timeout after 2 seconds
      if (count++ > 20) return;
    }
    const verticalOffset = (this.props.verticalOffset ?? 0) - displayAreaOffset.y;
    const horizontalOffset = -displayAreaOffset.x;
    this.debug('calculateRectFromRef - waiting for ref to move from', initialRect);
    let rect;
    count = 0;
    do {
      rect = await (0, _Utility.getRectForRef)(fromRef);
      if ([rect.x, rect.y, rect.width, rect.height].every(i => i === undefined)) {
        this.debug('calculateRectFromRef - rect not found, all properties undefined');
        return;
      }
      rect = new _Types.Rect(rect.x + horizontalOffset, rect.y + verticalOffset, rect.width, rect.height);
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
      // Timeout after 2 seconds
      if (count++ > 20) return;
      /*
       * Checking if x and y is less than -1000 because of a strange issue on Android related
       * to the "Toggle from" feature, where the rect.y is a large negative number at first
       */
    } while (rect.equals(initialRect) || rect.y < -1000 || rect.x < -1000);
    this.debug('calculateRectFromRef - calculated Rect', rect);
    if (this._isMounted) this.setState({
      fromRect: rect
    });
  }
  render() {
    const {
      onOpenStart,
      onCloseStart,
      onCloseComplete,
      fromRef,
      ...otherProps
    } = this.props;
    const {
      fromRect,
      showing
    } = this.state;

    // Don't render popover until we have an initial fromRect calculated for the view
    if (fromRef && !fromRect && !showing) return null;
    return /*#__PURE__*/_react.default.createElement(_BasePopover.default, _extends({}, otherProps, {
      displayArea: this.getDisplayArea(),
      fromRect: fromRect,
      onOpenStart: () => {
        onOpenStart === null || onOpenStart === void 0 || onOpenStart();
        this.debug('Setting up keyboard listeners');
        this.keyboardDidShowSubscription = _reactNative.Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
        this.keyboardDidHideSubscription = _reactNative.Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
        this.displayAreaStore = this.getDisplayArea();
        this.setState({
          showing: true
        });
      },
      onCloseStart: () => {
        onCloseStart === null || onCloseStart === void 0 || onCloseStart();
        this.debug('Tearing down keyboard listeners');
        if (this.keyboardDidShowSubscription !== null) {
          this.keyboardDidShowSubscription.remove();
          this.keyboardDidShowSubscription = null;
        }
        if (this.keyboardDidHideSubscription !== null) {
          this.keyboardDidHideSubscription.remove();
          this.keyboardDidHideSubscription = null;
        }
        if (this._isMounted) this.setState({
          shiftedDisplayArea: null
        });
      },
      onCloseComplete: () => {
        this.setState({
          showing: false
        }, () => {
          onCloseComplete === null || onCloseComplete === void 0 || onCloseComplete();
        });
      },
      skipMeasureContent: () => this.waitForResizeToFinish,
      onDisplayAreaChanged: rect => this.setDefaultDisplayArea(rect)
    }));
  }
}
exports.default = AdaptivePopover;
//# sourceMappingURL=AdaptivePopover.js.map