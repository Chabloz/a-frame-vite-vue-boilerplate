/**
 * $1 Unistroke Recognizer — adapted as ES module for WebXR / A-Frame
 *
 * Original authors:
 *   Jacob O. Wobbrock, University of Washington
 *   Andrew D. Wilson, Microsoft Research
 *   Yang Li, University of Washington
 *
 * Original publication:
 *   Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without libraries,
 *   toolkits or training: A $1 recognizer for user interface prototypes.
 *   UIST '07, pp. 159-168. https://dl.acm.org/citation.cfm?id=1294238
 *
 * Original source: https://depts.washington.edu/acelab/proj/dollar/dollar.js
 * Copyright (C) 2007-2018, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *  - Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  - Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *  - Neither the names of the University of Washington nor Microsoft, nor the
 *    names of its contributors may be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * ── Modifications from the original (BSD 3-clause permits these) ────────────
 *  - Converted to ES module (export DollarRecognizer, DollarPoint)
 *  - Renamed identifiers to camelCase / underscore-prefixed private helpers
 *  - Removed Result/Rectangle classes; recognize() returns plain {name, score}
 *  - Protractor-only (Golden Section Search variant removed)
 *  - circle templates replaced with mathematically generated points (CW + CCW)
 *  - rectangle templates replaced with mathematically generated points (CW + CCW)
 *  - Reduced built-in template set to: circle (×2), rectangle (×2), triangle,
 *    star, zig-zag, pigtail  (check, x, arrow, caret, brackets, v, delete,
 *    curly braces removed as unused in this project)
 */

export function DollarPoint(x, y) { this.X = x; this.Y = y; }

// ── Internal constants ───────────────────────────────────────────────────────
var NUM_POINTS  = 64;
var SQUARE_SIZE = 250.0;
var ORIGIN      = new DollarPoint(0, 0);
var DIAGONAL    = Math.sqrt(SQUARE_SIZE * SQUARE_SIZE + SQUARE_SIZE * SQUARE_SIZE);
var HALF_DIAG   = 0.5 * DIAGONAL;
var ANGLE_RANGE = _deg2rad(45.0);
var ANGLE_PREC  = _deg2rad(2.0);
var PHI         = 0.5 * (-1.0 + Math.sqrt(5.0)); // golden ratio

// ── Internal helpers ─────────────────────────────────────────────────────────
function _deg2rad(d) { return d * Math.PI / 180.0; }

function _Rect(x, y, w, h) { this.X = x; this.Y = y; this.Width = w; this.Height = h; }

function _Unistroke(name, points) {
  this.Name   = name;
  this.Points = _resample(points, NUM_POINTS);
  var rad     = _indicativeAngle(this.Points);
  this.Points = _rotateBy(this.Points, -rad);
  this.Points = _scaleTo(this.Points, SQUARE_SIZE);
  this.Points = _translateTo(this.Points, ORIGIN);
  this.Vector = _vectorize(this.Points); // Protractor
}

function _resample(points, n) {
  var I = _pathLength(points) / (n - 1);
  var D = 0.0;
  var newpts = [new DollarPoint(points[0].X, points[0].Y)];
  for (var i = 1; i < points.length; i++) {
    var d = _dist(points[i - 1], points[i]);
    if (D + d >= I) {
      var qx = points[i-1].X + ((I - D) / d) * (points[i].X - points[i-1].X);
      var qy = points[i-1].Y + ((I - D) / d) * (points[i].Y - points[i-1].Y);
      var q  = new DollarPoint(qx, qy);
      newpts.push(q);
      points.splice(i, 0, q);
      D = 0.0;
    } else {
      D += d;
    }
  }
  if (newpts.length === n - 1)
    newpts.push(new DollarPoint(points[points.length-1].X, points[points.length-1].Y));
  return newpts;
}

function _indicativeAngle(pts) {
  var c = _centroid(pts);
  return Math.atan2(c.Y - pts[0].Y, c.X - pts[0].X);
}

function _rotateBy(pts, rad) {
  var c = _centroid(pts); var cos = Math.cos(rad); var sin = Math.sin(rad);
  return pts.map(function(p) {
    return new DollarPoint(
      (p.X - c.X) * cos - (p.Y - c.Y) * sin + c.X,
      (p.X - c.X) * sin + (p.Y - c.Y) * cos + c.Y
    );
  });
}

function _scaleTo(pts, size) {
  var B = _boundingBox(pts);
  return pts.map(function(p) {
    return new DollarPoint(p.X * (size / B.Width), p.Y * (size / B.Height));
  });
}

function _translateTo(pts, pt) {
  var c = _centroid(pts);
  return pts.map(function(p) {
    return new DollarPoint(p.X + pt.X - c.X, p.Y + pt.Y - c.Y);
  });
}

function _vectorize(pts) {
  var sum = 0, vec = [];
  pts.forEach(function(p) { vec.push(p.X); vec.push(p.Y); sum += p.X*p.X + p.Y*p.Y; });
  var mag = Math.sqrt(sum);
  return vec.map(function(v) { return v / mag; });
}

function _optimalCosineDistance(v1, v2) {
  var a = 0, b = 0;
  for (var i = 0; i < v1.length; i += 2) {
    a += v1[i]*v2[i] + v1[i+1]*v2[i+1];
    b += v1[i]*v2[i+1] - v1[i+1]*v2[i];
  }
  var angle = Math.atan(b / a);
  return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}

function _distanceAtBestAngle(pts, T, a, b, thr) {
  var x1 = PHI*a + (1-PHI)*b, f1 = _distanceAtAngle(pts, T, x1);
  var x2 = (1-PHI)*a + PHI*b, f2 = _distanceAtAngle(pts, T, x2);
  while (Math.abs(b - a) > thr) {
    if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = PHI*a+(1-PHI)*b; f1 = _distanceAtAngle(pts,T,x1); }
    else         { a = x1; x1 = x2; f1 = f2; x2 = (1-PHI)*a+PHI*b; f2 = _distanceAtAngle(pts,T,x2); }
  }
  return Math.min(f1, f2);
}

function _distanceAtAngle(pts, T, rad) { return _pathDist(_rotateBy(pts, rad), T.Points); }
function _centroid(pts) { var x=0,y=0; pts.forEach(function(p){x+=p.X;y+=p.Y;}); return new DollarPoint(x/pts.length, y/pts.length); }
function _boundingBox(pts) { var x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity; pts.forEach(function(p){x0=Math.min(x0,p.X);y0=Math.min(y0,p.Y);x1=Math.max(x1,p.X);y1=Math.max(y1,p.Y);}); return new _Rect(x0,y0,x1-x0,y1-y0); }
function _pathDist(a, b) { var d=0; for(var i=0;i<a.length;i++) d+=_dist(a[i],b[i]); return d/a.length; }
function _pathLength(pts) { var d=0; for(var i=1;i<pts.length;i++) d+=_dist(pts[i-1],pts[i]); return d; }
function _dist(a, b) { var dx=b.X-a.X,dy=b.Y-a.Y; return Math.sqrt(dx*dx+dy*dy); }

// ── Template generators ──────────────────────────────────────────────────────
// Generate N evenly-spaced points around a circle (cx,cy) radius r.
// dir > 0 → CCW in screen coords (Y down), dir < 0 → CW.
function _makeCirclePts(cx, cy, r, n, dir) {
  var pts = [];
  for (var i = 0; i < n; i++) {
    var a = dir * 2 * Math.PI * i / n;
    pts.push(new DollarPoint(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  return pts;
}

// Generate N points around a rectangle perimeter.
// dir =  1 → down→right→up→left (same direction as the official hand-drawn template)
// dir = -1 → up→right→down→left
function _makeRectPts(x, y, w, h, n, dir) {
  var pts = [];
  var perim = 2 * (w + h);
  for (var i = 0; i < n; i++) {
    var d = perim * i / n;
    var px, py;
    if (dir > 0) {
      // down → right → up → left  (start: top-left corner)
      if      (d < h)         { px = x;         py = y + d; }
      else if (d < h + w)     { px = x + (d-h); py = y + h; }
      else if (d < 2*h + w)   { px = x + w;     py = y + h - (d-h-w); }
      else                    { px = x + w - (d-2*h-w); py = y; }
    } else {
      // up → right → down → left  (start: bottom-left corner)
      d = perim * i / n;
      if      (d < h)         { px = x;         py = y + h - d; }
      else if (d < h + w)     { px = x + (d-h); py = y; }
      else if (d < 2*h + w)   { px = x + w;     py = y + (d-h-w); }
      else                    { px = x + w - (d-2*h-w); py = y + h; }
    }
    pts.push(new DollarPoint(px, py));
  }
  return pts;
}

// ── Built-in templates ───────────────────────────────────────────────────────
// Circle: two mathematically precise templates covering both draw directions.
// Rectangle: two templates covering both winding orders.
// Triangle, star, check, x, arrow: original official hand-drawn data (unchanged).
/* eslint-disable */
var _TEMPLATES = [
  // ── Circles (CW and CCW in screen/canvas coords) ──────────────────────────
  ['circle', _makeCirclePts(125, 125, 100, 64,  1)],  // CCW
  ['circle', _makeCirclePts(125, 125, 100, 64, -1)],  // CW

  // ── Rectangles (both winding orders) ─────────────────────────────────────
  ['rectangle', _makeRectPts(50, 50, 150, 150, 64,  1)],  // down→right→up→left
  ['rectangle', _makeRectPts(50, 50, 150, 150, 64, -1)],  // up→right→down→left

  // ── Triangle (official data) ──────────────────────────────────────────────
  ['triangle',  [new DollarPoint(137,139),new DollarPoint(135,141),new DollarPoint(133,144),new DollarPoint(132,146),new DollarPoint(130,149),new DollarPoint(128,151),new DollarPoint(126,155),new DollarPoint(123,160),new DollarPoint(120,166),new DollarPoint(116,171),new DollarPoint(112,177),new DollarPoint(107,183),new DollarPoint(102,188),new DollarPoint(100,191),new DollarPoint(95,195),new DollarPoint(90,199),new DollarPoint(86,203),new DollarPoint(82,206),new DollarPoint(80,209),new DollarPoint(75,213),new DollarPoint(73,213),new DollarPoint(70,216),new DollarPoint(67,219),new DollarPoint(64,221),new DollarPoint(61,223),new DollarPoint(60,225),new DollarPoint(62,226),new DollarPoint(65,225),new DollarPoint(67,226),new DollarPoint(74,226),new DollarPoint(77,227),new DollarPoint(85,229),new DollarPoint(91,230),new DollarPoint(99,231),new DollarPoint(108,232),new DollarPoint(116,233),new DollarPoint(125,233),new DollarPoint(134,234),new DollarPoint(145,233),new DollarPoint(153,232),new DollarPoint(160,233),new DollarPoint(170,234),new DollarPoint(177,235),new DollarPoint(179,236),new DollarPoint(186,237),new DollarPoint(193,238),new DollarPoint(198,239),new DollarPoint(200,237),new DollarPoint(202,239),new DollarPoint(204,238),new DollarPoint(206,234),new DollarPoint(205,230),new DollarPoint(202,222),new DollarPoint(197,216),new DollarPoint(192,207),new DollarPoint(186,198),new DollarPoint(179,189),new DollarPoint(174,183),new DollarPoint(170,178),new DollarPoint(164,171),new DollarPoint(161,168),new DollarPoint(154,160),new DollarPoint(148,155),new DollarPoint(143,150),new DollarPoint(138,148),new DollarPoint(136,148)]],

  // ── Star (official data) ──────────────────────────────────────────────────
  ['star',      [new DollarPoint(75,250),new DollarPoint(75,247),new DollarPoint(77,244),new DollarPoint(78,242),new DollarPoint(79,239),new DollarPoint(80,237),new DollarPoint(82,234),new DollarPoint(82,232),new DollarPoint(84,229),new DollarPoint(85,225),new DollarPoint(87,222),new DollarPoint(88,219),new DollarPoint(89,216),new DollarPoint(91,212),new DollarPoint(92,208),new DollarPoint(94,204),new DollarPoint(95,201),new DollarPoint(96,196),new DollarPoint(97,194),new DollarPoint(98,191),new DollarPoint(100,185),new DollarPoint(102,178),new DollarPoint(104,173),new DollarPoint(104,171),new DollarPoint(105,164),new DollarPoint(106,158),new DollarPoint(107,156),new DollarPoint(107,152),new DollarPoint(108,145),new DollarPoint(109,141),new DollarPoint(110,139),new DollarPoint(112,133),new DollarPoint(113,131),new DollarPoint(116,127),new DollarPoint(117,125),new DollarPoint(119,122),new DollarPoint(121,121),new DollarPoint(123,120),new DollarPoint(125,122),new DollarPoint(125,125),new DollarPoint(127,130),new DollarPoint(128,133),new DollarPoint(131,143),new DollarPoint(136,153),new DollarPoint(140,163),new DollarPoint(144,172),new DollarPoint(145,175),new DollarPoint(151,189),new DollarPoint(156,201),new DollarPoint(161,213),new DollarPoint(166,225),new DollarPoint(169,233),new DollarPoint(171,236),new DollarPoint(174,243),new DollarPoint(177,247),new DollarPoint(178,249),new DollarPoint(179,251),new DollarPoint(180,253),new DollarPoint(180,255),new DollarPoint(179,257),new DollarPoint(177,257),new DollarPoint(174,255),new DollarPoint(169,250),new DollarPoint(164,247),new DollarPoint(160,245),new DollarPoint(149,238),new DollarPoint(138,230),new DollarPoint(127,221),new DollarPoint(124,220),new DollarPoint(112,212),new DollarPoint(110,210),new DollarPoint(96,201),new DollarPoint(84,195),new DollarPoint(74,190),new DollarPoint(64,182),new DollarPoint(55,175),new DollarPoint(51,172),new DollarPoint(49,170),new DollarPoint(51,169),new DollarPoint(56,169),new DollarPoint(66,169),new DollarPoint(78,168),new DollarPoint(92,166),new DollarPoint(107,164),new DollarPoint(123,161),new DollarPoint(140,162),new DollarPoint(156,162),new DollarPoint(171,160),new DollarPoint(173,160),new DollarPoint(186,160),new DollarPoint(195,160),new DollarPoint(198,161),new DollarPoint(203,163),new DollarPoint(208,163),new DollarPoint(206,164),new DollarPoint(200,167),new DollarPoint(187,172),new DollarPoint(174,179),new DollarPoint(172,181),new DollarPoint(153,192),new DollarPoint(137,201),new DollarPoint(123,211),new DollarPoint(112,220),new DollarPoint(99,229),new DollarPoint(90,237),new DollarPoint(80,244),new DollarPoint(73,250),new DollarPoint(69,254),new DollarPoint(69,252)]],

  // ── Zig-zag (official data) ───────────────────────────────────────────────
  ['zig-zag',   [new DollarPoint(307,216),new DollarPoint(333,186),new DollarPoint(356,215),new DollarPoint(375,186),new DollarPoint(399,216),new DollarPoint(418,186)]],

  // ── Pigtail (official data) ───────────────────────────────────────────────
  ['pigtail',   [new DollarPoint(81,219),new DollarPoint(84,218),new DollarPoint(86,220),new DollarPoint(88,220),new DollarPoint(90,220),new DollarPoint(92,219),new DollarPoint(95,220),new DollarPoint(97,219),new DollarPoint(99,220),new DollarPoint(102,218),new DollarPoint(105,217),new DollarPoint(107,216),new DollarPoint(110,216),new DollarPoint(113,214),new DollarPoint(116,212),new DollarPoint(118,210),new DollarPoint(121,208),new DollarPoint(124,205),new DollarPoint(126,202),new DollarPoint(129,199),new DollarPoint(132,196),new DollarPoint(136,191),new DollarPoint(139,187),new DollarPoint(142,182),new DollarPoint(144,179),new DollarPoint(146,174),new DollarPoint(148,170),new DollarPoint(149,168),new DollarPoint(151,162),new DollarPoint(152,160),new DollarPoint(152,157),new DollarPoint(152,155),new DollarPoint(152,151),new DollarPoint(152,149),new DollarPoint(152,146),new DollarPoint(149,142),new DollarPoint(148,139),new DollarPoint(145,137),new DollarPoint(141,135),new DollarPoint(139,135),new DollarPoint(134,136),new DollarPoint(130,140),new DollarPoint(128,142),new DollarPoint(126,145),new DollarPoint(122,150),new DollarPoint(119,158),new DollarPoint(117,163),new DollarPoint(115,170),new DollarPoint(114,175),new DollarPoint(117,184),new DollarPoint(120,190),new DollarPoint(125,199),new DollarPoint(129,203),new DollarPoint(133,208),new DollarPoint(138,213),new DollarPoint(145,215),new DollarPoint(155,218),new DollarPoint(164,219),new DollarPoint(166,219),new DollarPoint(177,219),new DollarPoint(182,218),new DollarPoint(192,216),new DollarPoint(196,213),new DollarPoint(199,212),new DollarPoint(201,211)]],

];
/* eslint-enable */

// ── Public API ───────────────────────────────────────────────────────────────
export function DollarRecognizer() {
  this._unistrokes = _TEMPLATES.map(function(t) { return new _Unistroke(t[0], t[1].slice()); });

  /**
   * Recognize a gesture from an array of DollarPoint.
   * @param {DollarPoint[]} points
   * @returns {{ name: string, score: number }}
   */
  this.recognize = function(points) {
    if (points.length < 2) return { name: 'no match', score: 0 };
    var candidate = new _Unistroke('', points.slice());
    var best = null, bestDist = Infinity;
    for (var i = 0; i < this._unistrokes.length; i++) {
      var d = _optimalCosineDistance(this._unistrokes[i].Vector, candidate.Vector);
      if (d < bestDist) { bestDist = d; best = this._unistrokes[i]; }
    }
    return best
      ? { name: best.Name, score: Math.max(0, 1.0 - bestDist) }
      : { name: 'no match', score: 0 };
  };

  /**
   * Add (or replace) a custom gesture template.
   * @param {string}        name
   * @param {DollarPoint[]} points
   */
  this.addGesture = function(name, points) {
    // replace if name already exists
    for (var i = 0; i < this._unistrokes.length; i++) {
      if (this._unistrokes[i].Name === name) {
        this._unistrokes[i] = new _Unistroke(name, points.slice());
        return;
      }
    }
    this._unistrokes.push(new _Unistroke(name, points.slice()));
  };
}
