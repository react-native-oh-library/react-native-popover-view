function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { Component } from 'react';
import { View } from 'react-native';
import AdaptivePopover from './AdaptivePopover';
import { styles } from './Constants';
import { Point } from './Types';
import { getRectForRef } from './Utility';
export default class JSModalPopover extends Component {
  state = {
    visible: false
  };
  containerRef = /*#__PURE__*/React.createRef();
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
      return /*#__PURE__*/React.createElement(View, {
        pointerEvents: "box-none",
        style: styles.container,
        ref: this.containerRef
      }, /*#__PURE__*/React.createElement(AdaptivePopover, _extends({}, this.props, {
        onCloseComplete: () => {
          if (onCloseComplete) onCloseComplete();
          this.setState({
            visible: false
          });
        },
        getDisplayAreaOffset: async () => {
          const rect = await getRectForRef(this.containerRef);
          return new Point(rect.x, rect.y);
        }
      })));
    }
    return null;
  }
}
//# sourceMappingURL=JSModalPopover.js.map