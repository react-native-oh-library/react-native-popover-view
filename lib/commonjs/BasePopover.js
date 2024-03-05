"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _Arrow = _interopRequireDefault(require("./Arrow"));
var _Constants = require("./Constants");
var _Geometry = require("./Geometry");
var _Types = require("./Types");
var _Utility = require("./Utility");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class BasePopover extends _react.Component {
  state = {
    requestedContentSize: null,
    activeGeom: undefined,
    nextGeom: undefined,
    showing: false,
    animatedValues: {
      scale: new _reactNative.Animated.Value(0),
      translate: new _reactNative.Animated.ValueXY(),
      fade: new _reactNative.Animated.Value(0),
      translateArrow: new _reactNative.Animated.ValueXY()
    }
  };
  _isMounted = false;
  animating = false;
  animateOutAfterShow = false;
  popoverRef = /*#__PURE__*/_react.default.createRef();
  arrowRef = /*#__PURE__*/_react.default.createRef();
  debug(line, obj) {
    if (_Constants.DEBUG || this.props.debug) console.log(`[${new Date().toISOString()}] ${line}${obj ? `: ${JSON.stringify(obj)}` : ''}`);
  }
  componentDidMount() {
    this._isMounted = true;
  }
  componentDidUpdate(prevProps) {
    // Make sure a value we care about has actually changed
    const importantProps = ['isVisible', 'fromRect', 'displayArea', 'verticalOffset', 'offset', 'placement'];
    const changedProps = (0, _Utility.getChangedProps)(this.props, prevProps, importantProps);
    if (!changedProps.length) return;
    this.debug('[BasePopover] componentDidUpdate - changedProps', changedProps);
    if (this.props.isVisible !== prevProps.isVisible) {
      this.debug(`componentDidUpdate - isVisible changed, now ${this.props.isVisible}`);
      if (!this.props.isVisible) {
        if (this.state.showing) this.animateOut();else this.animateOutAfterShow = true;
        this.debug('componentDidUpdate - Hiding popover');
      }
    } else if (this.props.isVisible && prevProps.isVisible) {
      this.debug('componentDidUpdate - isVisible not changed, handling other changes');
      this.handleChange();
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
    if (this.state.showing) {
      this.debug('componentWillUnmount');
      this.animateOut();
    }
  }
  measureContent(requestedContentSize) {
    if (!requestedContentSize.width) {
      console.warn(`Popover Warning - Can't Show - The Popover content has a width of 0, so there is nothing to present.`);
      return;
    }
    if (!requestedContentSize.height) {
      console.warn(`Popover Warning - Can't Show - The Popover content has a height of 0, so there is nothing to present.`);
      return;
    }
    if (this.props.skipMeasureContent()) {
      this.debug(`measureContent - Skipping, waiting for resize to finish`);
      return;
    }
    if (!this.state.requestedContentSize || !requestedContentSize.equals(this.state.requestedContentSize)) {
      this.debug(`measureContent - new requestedContentSize: ${JSON.stringify(requestedContentSize)} (used to be ${JSON.stringify(this.state.requestedContentSize)})`);
      this.setState({
        requestedContentSize
      }, () => this.handleChange());
    } else {
      this.debug(`measureContent - Skipping, content size did not change`);
    }
  }

  /*
   * Many factors may cause the geometry to change.
   * This function collects all of them, waiting for 200ms after the last change,
   * then takes action, either bringing up the popover or moving it to its new location
   */
  handleChange() {
    if (this.handleChangeTimeout) clearTimeout(this.handleChangeTimeout);

    /*
     * This function will be called again once we have a requested content size,
     * so safe to ignore for now
     */
    if (!this.state.requestedContentSize) {
      this.debug('handleChange - no requestedContentSize, exiting...');
      return;
    }
    this.debug('handleChange - waiting 100ms to accumulate all changes');
    this.handleChangeTimeout = setTimeout(() => {
      const {
        activeGeom,
        animatedValues,
        requestedContentSize
      } = this.state;
      const {
        arrowSize,
        popoverStyle,
        fromRect,
        displayArea,
        placement,
        onOpenStart,
        arrowShift,
        onPositionChange,
        offset,
        popoverShift
      } = this.props;
      if (requestedContentSize) {
        this.debug('handleChange - requestedContentSize', requestedContentSize);
        this.debug('handleChange - displayArea', displayArea);
        this.debug('handleChange - fromRect', fromRect);
        if (placement) this.debug('handleChange - placement', placement.toString());
        const geom = (0, _Geometry.computeGeometry)({
          requestedContentSize,
          placement,
          fromRect,
          displayArea,
          arrowSize: arrowSize || _Constants.DEFAULT_ARROW_SIZE,
          popoverStyle,
          arrowShift,
          debug: this.debug.bind(this),
          previousPlacement: this.getGeom().placement,
          offset,
          popoverShift
        });
        this.setState({
          nextGeom: geom,
          requestedContentSize
        }, () => {
          if (geom.viewLargerThanDisplayArea.width || geom.viewLargerThanDisplayArea.height) {
            /*
             * If the view initially overflowed the display area,
             * wait one more render cycle to test-render it within
             * the display area to get final calculations for popoverOrigin before show
             */
            this.debug('handleChange - delaying showing popover because viewLargerThanDisplayArea');
          } else if (!activeGeom) {
            this.debug('handleChange - animating in');
            if (onOpenStart) setTimeout(onOpenStart);
            this.animateIn();
          } else if (activeGeom && !_Geometry.Geometry.equals(activeGeom, geom)) {
            const moveTo = new _Types.Point(geom.popoverOrigin.x, geom.popoverOrigin.y);
            this.debug('handleChange - Triggering popover move to', moveTo);
            this.animateTo({
              values: animatedValues,
              fade: 1,
              scale: 1,
              translatePoint: moveTo,
              easing: _reactNative.Easing.inOut(_reactNative.Easing.quad),
              geom,
              callback: onPositionChange
            });
          } else {
            this.debug('handleChange - no change');
          }
        });
      }
    }, 100);
  }
  static getPolarity() {
    return _reactNative.I18nManager.isRTL ? -1 : 1;
  }
  getGeom() {
    const {
      activeGeom,
      nextGeom
    } = this.state;
    if (activeGeom) return activeGeom;
    if (nextGeom) return nextGeom;
    return new _Geometry.Geometry({
      popoverOrigin: new _Types.Point(0, 0),
      anchorPoint: new _Types.Point(0, 0),
      placement: _Types.Placement.AUTO,
      forcedContentSize: new _Types.Size(0, 0),
      viewLargerThanDisplayArea: {
        width: false,
        height: false
      }
    });
  }
  getTranslateOrigin() {
    const {
      requestedContentSize
    } = this.state;
    const arrowSize = this.props.arrowSize || _Constants.DEFAULT_ARROW_SIZE;
    const {
      forcedContentSize,
      viewLargerThanDisplayArea,
      anchorPoint,
      placement
    } = this.getGeom();
    let viewWidth = 0;
    if (viewLargerThanDisplayArea.width && forcedContentSize !== null && forcedContentSize !== void 0 && forcedContentSize.width) viewWidth = forcedContentSize.width;else if (requestedContentSize !== null && requestedContentSize !== void 0 && requestedContentSize.width) viewWidth = requestedContentSize.width;
    if ([_Types.Placement.LEFT, _Types.Placement.RIGHT].includes(placement)) viewWidth += arrowSize.height;
    let viewHeight = 0;
    if (viewLargerThanDisplayArea.height && forcedContentSize !== null && forcedContentSize !== void 0 && forcedContentSize.height) viewHeight = forcedContentSize.height;else if (requestedContentSize !== null && requestedContentSize !== void 0 && requestedContentSize.height) viewHeight = requestedContentSize.height;
    if ([_Types.Placement.TOP, _Types.Placement.BOTTOM].includes(placement)) viewHeight += arrowSize.height;
    this.debug('getTranslateOrigin - popoverSize', {
      width: viewWidth,
      height: viewHeight
    });
    this.debug('getTranslateOrigin - anchorPoint', anchorPoint);
    return new _Types.Point(anchorPoint.x - viewWidth / 2, anchorPoint.y - viewHeight / 2);
  }
  animateOut() {
    if (this.props.onCloseStart) setTimeout(this.props.onCloseStart);
    if (this._isMounted) this.setState({
      showing: false
    });
    this.debug('animateOut - isMounted', this._isMounted);
    this.animateTo({
      values: this.state.animatedValues,
      fade: 0,
      scale: 0,
      translatePoint: this.getTranslateOrigin(),
      callback: () => setTimeout(this.props.onCloseComplete),
      easing: _reactNative.Easing.inOut(_reactNative.Easing.quad),
      geom: this.getGeom()
    });
  }
  animateIn() {
    const {
      nextGeom
    } = this.state;
    if (nextGeom !== undefined && nextGeom instanceof _Geometry.Geometry) {
      const values = this.state.animatedValues;

      // Should grow from anchor point
      const translateStart = this.getTranslateOrigin();
      // eslint-disable-next-line
      translateStart.y += _Constants.FIX_SHIFT; // Temp fix for useNativeDriver issue
      values.translate.setValue(translateStart);
      const translatePoint = new _Types.Point(nextGeom.popoverOrigin.x, nextGeom.popoverOrigin.y);
      this.debug('animateIn - translateStart', translateStart);
      this.debug('animateIn - translatePoint', translatePoint);
      this.animateTo({
        values,
        fade: 1,
        scale: 1,
        translatePoint,
        easing: _reactNative.Easing.out(_reactNative.Easing.back(1)),
        geom: nextGeom,
        callback: () => {
          if (this._isMounted) {
            this.setState({
              showing: true
            });
            if (this.props.debug || _Constants.DEBUG) {
              setTimeout(() => this.popoverRef.current && (0, _Utility.getRectForRef)(this.popoverRef).then(rect => this.debug('animateIn - onOpenComplete - Calculated Popover Rect', rect)));
              setTimeout(() => this.arrowRef.current && (0, _Utility.getRectForRef)(this.arrowRef).then(rect => this.debug('animateIn - onOpenComplete - Calculated Arrow Rect', rect)));
            }
          }
          if (this.props.onOpenComplete) setTimeout(this.props.onOpenComplete);
          if (this.animateOutAfterShow || !this._isMounted) {
            this.animateOut();
            this.animateOutAfterShow = false;
          }
        }
      });
    }
  }
  animateTo(args) {
    const {
      fade,
      translatePoint,
      scale,
      callback,
      easing,
      values
    } = args;
    const commonConfig = {
      duration: 300,
      easing,
      useNativeDriver: !_Constants.isWeb,
      ...this.props.animationConfig
    };
    if (this.animating) {
      setTimeout(() => this.animateTo(args), 100);
      return;
    }

    // eslint-disable-next-line
    translatePoint.y = translatePoint.y + _Constants.FIX_SHIFT; // Temp fix for useNativeDriver issue

    if (!fade && fade !== 0) {
      console.log('Popover: Fade value is null');
      return;
    }
    if (!translatePoint) {
      console.log('Popover: Translate Point value is null');
      return;
    }
    if (!scale && scale !== 0) {
      console.log('Popover: Scale value is null');
      return;
    }
    this.animating = true;
    _reactNative.Animated.parallel([_reactNative.Animated.timing(values.fade, {
      ...commonConfig,
      toValue: fade
    }), _reactNative.Animated.timing(values.translate, {
      ...commonConfig,
      toValue: translatePoint
    }), _reactNative.Animated.timing(values.scale, {
      ...commonConfig,
      toValue: scale
    })]).start(() => {
      this.animating = false;
      if (this._isMounted) this.setState({
        activeGeom: this.state.nextGeom
      });
      if (callback) callback();
    });
  }
  render() {
    const {
      animatedValues,
      nextGeom,
      requestedContentSize
    } = this.state;
    const flattenedPopoverStyle = _reactNative.StyleSheet.flatten(this.props.popoverStyle);
    const arrowSize = this.props.arrowSize || _Constants.DEFAULT_ARROW_SIZE;
    const geom = this.getGeom();
    const transformStyle = {
      position: 'absolute',
      ...requestedContentSize,
      transform: [{
        translateX: animatedValues.translate.x
      }, {
        translateY: animatedValues.translate.y
      }, {
        scale: animatedValues.scale
      }]
    };
    const {
      shadowOffset,
      shadowColor,
      shadowOpacity,
      shadowRadius,
      elevation,
      ...otherPopoverStyles
    } = flattenedPopoverStyle;
    const shadowStyle = {
      shadowOffset,
      shadowColor,
      shadowOpacity,
      shadowRadius
    };
    const contentWrapperStyle = {
      ..._Constants.styles.popoverContent,
      ...otherPopoverStyles,
      elevation
    };

    /*
     * We want to always use next here, because the we need this to re-render
     * before we can animate to the correct spot for the active.
     */
    if (nextGeom) {
      contentWrapperStyle.maxWidth = nextGeom.forcedContentSize.width;
      contentWrapperStyle.maxHeight = nextGeom.forcedContentSize.height;
    }
    const arrowPositionStyle = {};
    if (geom.placement === _Types.Placement.RIGHT || geom.placement === _Types.Placement.LEFT) {
      arrowPositionStyle.top = geom.anchorPoint.y - geom.popoverOrigin.y - arrowSize.height;
      if (transformStyle.width) transformStyle.width += arrowSize.height;
      if (geom.placement === _Types.Placement.RIGHT) contentWrapperStyle.left = arrowSize.height;
    } else if (geom.placement === _Types.Placement.TOP || geom.placement === _Types.Placement.BOTTOM) {
      arrowPositionStyle.left = geom.anchorPoint.x - geom.popoverOrigin.x - arrowSize.width / 2;
      if (transformStyle.height) transformStyle.height += arrowSize.height;
      if (geom.placement === _Types.Placement.BOTTOM) contentWrapperStyle.top = arrowSize.height;
    }
    switch (geom.placement) {
      case _Types.Placement.TOP:
        arrowPositionStyle.bottom = 0;
        break;
      case _Types.Placement.BOTTOM:
        arrowPositionStyle.top = 0;
        break;
      case _Types.Placement.LEFT:
        arrowPositionStyle.right = 0;
        break;
      case _Types.Placement.RIGHT:
        arrowPositionStyle.left = 0;
        break;
      default:
    }

    // Temp fix for useNativeDriver issue
    const backgroundShift = animatedValues.fade.interpolate({
      inputRange: [0, 0.0001, 1],
      outputRange: [0, _Constants.FIX_SHIFT, _Constants.FIX_SHIFT]
    });
    const backgroundStyle = {
      ..._Constants.styles.background,
      transform: [{
        translateY: backgroundShift
      }],
      ..._reactNative.StyleSheet.flatten(this.props.backgroundStyle)
    };
    const containerStyle = {
      ..._Constants.styles.container,
      opacity: animatedValues.fade
    };
    const backgroundColor = flattenedPopoverStyle.backgroundColor || _Constants.styles.popoverContent.backgroundColor;
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      pointerEvents: "box-none",
      style: [_Constants.styles.container, {
        top: -1 * _Constants.FIX_SHIFT
      }]
    }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      pointerEvents: "box-none",
      style: [_Constants.styles.container, {
        top: _Constants.FIX_SHIFT,
        flex: 1
      }],
      onLayout: evt => this.props.onDisplayAreaChanged(new _Types.Rect(evt.nativeEvent.layout.x, evt.nativeEvent.layout.y - _Constants.FIX_SHIFT, evt.nativeEvent.layout.width, evt.nativeEvent.layout.height))
    }), /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
      pointerEvents: "box-none",
      style: containerStyle
    }, this.props.showBackground !== false && /*#__PURE__*/_react.default.createElement(_reactNative.TouchableWithoutFeedback, {
      onPress: this.props.onRequestClose
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
      style: backgroundStyle
    })), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      pointerEvents: "box-none",
      style: {
        top: 0,
        left: 0,
        ...shadowStyle
      }
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
      style: transformStyle
    }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      ref: this.popoverRef,
      style: contentWrapperStyle,
      onLayout: evt => {
        const layout = {
          ...evt.nativeEvent.layout
        };
        setTimeout(() => this._isMounted && this.measureContent(new _Types.Size(layout.width, layout.height)), 10);
      }
    }, this.props.children), geom.placement !== _Types.Placement.FLOATING && /*#__PURE__*/_react.default.createElement(_Arrow.default, {
      ref: this.arrowRef,
      placement: geom.placement,
      color: backgroundColor,
      arrowSize: arrowSize,
      positionStyle: arrowPositionStyle,
      elevation: elevation
    })))));
  }
}
exports.default = BasePopover;
//# sourceMappingURL=BasePopover.js.map