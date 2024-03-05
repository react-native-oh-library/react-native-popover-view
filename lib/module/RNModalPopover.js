function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { Component } from 'react';
import { Modal } from 'react-native';
import AdaptivePopover from './AdaptivePopover';
import { MULTIPLE_POPOVER_WARNING } from './Constants';
import { Point } from './Types';
export default class RNModalPopover extends Component {
  state = {
    visible: false
  };
  static isShowingInModal = false;
  componentDidMount() {
    if (this.props.isVisible) {
      if (RNModalPopover.isShowingInModal) console.warn(MULTIPLE_POPOVER_WARNING);else this.setState({
        visible: true
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.isVisible && !prevProps.isVisible) {
      if (RNModalPopover.isShowingInModal) console.warn(MULTIPLE_POPOVER_WARNING);else this.setState({
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
    return /*#__PURE__*/React.createElement(Modal, {
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
    }, /*#__PURE__*/React.createElement(AdaptivePopover, _extends({}, this.props, {
      onCloseStart: () => {
        RNModalPopover.isShowingInModal = false;
        if (onCloseStart) onCloseStart();
      },
      onCloseComplete: () => this.setState({
        visible: false
      }),
      getDisplayAreaOffset: () => Promise.resolve(new Point(0, 0))
    })));
  }
}
//# sourceMappingURL=RNModalPopover.js.map