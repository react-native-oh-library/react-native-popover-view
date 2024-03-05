"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styles = exports.isWeb = exports.isIOS = exports.POPOVER_MARGIN = exports.MULTIPLE_POPOVER_WARNING = exports.FIX_SHIFT = exports.DEFAULT_BORDER_RADIUS = exports.DEFAULT_ARROW_SIZE = exports.DEBUG = void 0;
var _reactNative = require("react-native");
var _Types = require("./Types");
const MULTIPLE_POPOVER_WARNING = exports.MULTIPLE_POPOVER_WARNING = `Popover Warning - Can't Show - Attempted to show a Popover while another one was already showing.  You can only show one Popover at a time, and must wait for one to close completely before showing a different one.  You can use the onCloseComplete prop to detect when a Popover has finished closing.  To show multiple Popovers simultaneously, all but one should have mode={Popover.MODE.JS_MODAL}.  Once you change the mode, you can show as many Popovers as you want, but you are responsible for keeping them above other views.`;
const DEFAULT_ARROW_SIZE = exports.DEFAULT_ARROW_SIZE = new _Types.Size(16, 8);
const DEFAULT_BORDER_RADIUS = exports.DEFAULT_BORDER_RADIUS = 3;
const POPOVER_MARGIN = exports.POPOVER_MARGIN = 10;
const DEBUG = exports.DEBUG = false;
const isIOS = exports.isIOS = _reactNative.Platform.OS === 'ios' || 'harmony';
const isWeb = exports.isWeb = _reactNative.Platform.OS === 'web';

/*
 * FIX_SHIFT resolves an issue with useNativeDriver, where it would flash the
 * popover on and off really quickly, and then animate in normally. Now, because
 * of the shift, the flash happens off screen, and then it is shifted on screen
 * just before beginning the actual animation.
 */
const FIX_SHIFT = exports.FIX_SHIFT = isWeb ? 0 : _reactNative.Dimensions.get('window').height * 2;
const styles = exports.styles = _reactNative.StyleSheet.create({
  container: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    backgroundColor: 'transparent'
  },
  background: {
    top: 0,
    bottom: FIX_SHIFT,
    left: 0,
    right: 0,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  popoverContent: {
    overflow: 'hidden',
    position: 'absolute',
    backgroundColor: 'white',
    borderBottomColor: '#333438',
    borderRadius: DEFAULT_BORDER_RADIUS
  }
});
//# sourceMappingURL=Constants.js.map