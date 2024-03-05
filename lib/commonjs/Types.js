"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Size = exports.Rect = exports.Point = exports.Placement = exports.Mode = void 0;
// eslint-disable-next-line
let Placement = exports.Placement = /*#__PURE__*/function (Placement) {
  Placement["TOP"] = "top";
  Placement["RIGHT"] = "right";
  Placement["BOTTOM"] = "bottom";
  Placement["LEFT"] = "left";
  Placement["AUTO"] = "auto";
  Placement["FLOATING"] = "floating";
  Placement["CENTER"] = "center";
  return Placement;
}({}); // eslint-disable-next-line
let Mode = exports.Mode = /*#__PURE__*/function (Mode) {
  Mode["JS_MODAL"] = "js-modal";
  Mode["RN_MODAL"] = "rn-modal";
  Mode["TOOLTIP"] = "tooltip";
  return Mode;
}({});
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  equals(b) {
    return Math.round(this.x) === Math.round(b.x) && Math.round(this.y) === Math.round(b.y);
  }
}
exports.Point = Point;
class Size {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  equals(b) {
    return Math.round(this.width) === Math.round(b.width) && Math.round(this.height) === Math.round(b.height);
  }
}
exports.Size = Size;
class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  equals(b) {
    return Math.round(this.x) === Math.round(b.x) && Math.round(this.y) === Math.round(b.y) && Math.round(this.width) === Math.round(b.width) && Math.round(this.height) === Math.round(b.height);
  }
  static clone(rect) {
    return new Rect(rect.x, rect.y, rect.width, rect.height);
  }
}
exports.Rect = Rect;
//# sourceMappingURL=Types.js.map