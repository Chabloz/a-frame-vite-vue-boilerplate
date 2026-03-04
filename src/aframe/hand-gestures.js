import { DollarRecognizer, DollarPoint } from '../../public/lib/dollar.js';

// Fingertip indices per WebXR Hand Input spec
var FINGERTIP_INDICES = [4, 9, 14, 19, 24];
var FINGERTIP_COLORS  = [0xe74c3c, 0x2ecc71, 0x3498db, 0xf39c12, 0x9b59b6];

var INDEX_TIP_BONE    = 9;     // index-finger-tip joint index
var THUMB_TIP_BONE    = 4;     // thumb tip joint index
var TRAIL_HISTORY     = 72;    // control points kept for the CatmullRom curve (visual only)
var TRAIL_SAMPLES     = 72;    // ribbon segments sampled from curve
var TRAIL_HALF_WIDTH  = 0.014; // meters at the tip (tapers to 0 at tail)
var MIN_MOVE_DIST     = 0.003; // min displacement (m) to record a new trail point
var SPEED_EMA         = 0.18;  // EMA smoothing factor for speed display

// Pinch gesture trigger
var PINCH_DIST        = 0.025; // m — pinch begins below this threshold
var PINCH_RELEASE     = 0.040; // m — pinch ends above this threshold (hysteresis)

// $1 gesture recognition
var GESTURE_MIN_POINTS = 8;    // min stroke points to attempt recognition
var GESTURE_SCORE_MIN  = 0.51; // min $1 score to accept a result
var GESTURE_COOLDOWN   = 1500; // ms between gesture emits

// ── Shaders ─────────────────────────────────────────────────────────────────
var RIBBON_VERT = /* glsl */`
  attribute float aT;   // 0 = tip, 1 = tail
  varying   float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

var RIBBON_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uAlpha;
  varying float vT;
  void main() {
    // Fade from opaque tip to transparent tail, with core glow
    float alpha = pow(1.0 - vT, 1.4) * 0.92 * uAlpha;
    vec3  glow  = uColor + (1.0 - vT) * 0.35; // brighten toward tip
    gl_FragColor = vec4(glow, alpha);
  }
`;
// ────────────────────────────────────────────────────────────────────────────

AFRAME.registerComponent('hand-gestures', {
  schema: {
    debug:           { type: 'boolean', default: true },
    trail:           { type: 'boolean', default: true  },
    trailColor:      { type: 'color',   default: '#ffd700' },
    trailFade:       { type: 'number',  default: 1000 },
  },

  init: function () {
    this._jointMatrix = new THREE.Matrix4();
    this._tipPosition = new THREE.Vector3();
    this._dummy       = new THREE.Object3D();

    this._instancedMesh = null;

    // ── Ribbon trail internals ──
    this._ribbonMesh    = null;
    this._ribbonGeo     = null;
    this._ribbonMat     = null;

    // Pre-allocated CatmullRom control points (circular shift buffer)
    this._curveVecs  = Array.from({ length: TRAIL_HISTORY }, function () { return new THREE.Vector3(); });
    this._curve      = new THREE.CatmullRomCurve3(this._curveVecs, false, 'catmullrom', 0.5);
    this._histCount  = 0;
    this._lastHistPt = new THREE.Vector3(1e9, 1e9, 1e9); // sentinel

    // Pre-allocated sample targets for curve.getPoint()
    this._samplePts  = Array.from({ length: TRAIL_SAMPLES }, function () { return new THREE.Vector3(); });
    this._sampleTans = Array.from({ length: TRAIL_SAMPLES }, function () { return new THREE.Vector3(); });

    // Per-frame temp vectors
    this._camWorldPos = new THREE.Vector3();
    this._toCam       = new THREE.Vector3();
    this._perp        = new THREE.Vector3();

    // Pre-allocated flat buffers (N*2 vertices, 3 floats each)
    this._ribbonPosArr = new Float32Array(TRAIL_SAMPLES * 2 * 3);
    this._ribbonaTArr  = new Float32Array(TRAIL_SAMPLES * 2);
    this._ribbonIdxArr = this._buildIndexBuffer();

    // Track last timestamp to compute history decay
    this._lastAddTime     = 0;

    // Speed / prev tip (still used for MIN_MOVE_DIST gating)
    this._speed           = 0;
    this._prevTipPos      = new THREE.Vector3(1e9, 1e9, 1e9); // sentinel
    this._visibleHistory  = 0;

    // Thumb tip temp vector
    this._thumbPosition = new THREE.Vector3();

    // Camera axis temp vectors (for 2D projection)
    this._camRight = new THREE.Vector3();
    this._camUp    = new THREE.Vector3();

    // ── Pinch + $1 gesture state ──
    this._isPinching      = false;
    this._strokePoints    = [];      // DollarPoint[] built during pinch
    this._gestureLastEmit = 0;
    this._recognizer      = new DollarRecognizer();

    // ── 2D debug canvas state ──
    this._debugCanvas  = null;
    this._debugCtx     = null;
    this._debugTexture = null;
    this._debugPlane   = null;

    if (this.data.debug) this._createInstancedMesh();
    if (this.data.debug) this._createDebugCanvas();
    if (this.data.trail) this._createRibbon();
  },

  _buildIndexBuffer: function () {
    var N   = TRAIL_SAMPLES;
    var idx = new Uint16Array((N - 1) * 6);
    var k   = 0;
    for (var i = 0; i < N - 1; i++) {
      var a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
      idx[k++] = a; idx[k++] = b; idx[k++] = c;
      idx[k++] = b; idx[k++] = d; idx[k++] = c;
    }
    return idx;
  },

  update: function (prevData) {
    if (!prevData) return;

    if (this.data.debug !== prevData.debug) {
      this.data.debug ? this._createInstancedMesh() : this._destroyInstancedMesh();
      this.data.debug ? this._createDebugCanvas()   : this._destroyDebugCanvas();
    }
    if (this.data.trail !== prevData.trail) {
      this.data.trail ? this._createRibbon() : this._destroyRibbon();
    }
    if (this.data.trailColor !== prevData.trailColor && this._ribbonMat) {
      this._ribbonMat.uniforms.uColor.value.set(this.data.trailColor);
    }
  },

  // ── Debug instanced cubes ──────────────────────────────────────────────────
  _createInstancedMesh: function () {
    if (this._instancedMesh) return;
    var count    = FINGERTIP_INDICES.length;
    var geometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    this._instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    this._instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this._instancedMesh.visible = false;
    this._instancedMesh.frustumCulled = false;

    var color = new THREE.Color();
    FINGERTIP_COLORS.forEach(function (hex, i) {
      this._instancedMesh.setColorAt(i, color.setHex(hex));
    }, this);
    this._instancedMesh.instanceColor.needsUpdate = true;
    this.el.sceneEl.object3D.add(this._instancedMesh);
  },

  _destroyInstancedMesh: function () {
    if (!this._instancedMesh) return;
    this.el.sceneEl.object3D.remove(this._instancedMesh);
    this._instancedMesh.geometry.dispose();
    this._instancedMesh.material.dispose();
    this._instancedMesh = null;
  },

  // ── Ribbon trail ─────────────────────────────────────────────────────────
  _createRibbon: function () {
    if (this._ribbonMesh) return;

    this._ribbonGeo = new THREE.BufferGeometry();

    var posAttr = new THREE.BufferAttribute(this._ribbonPosArr, 3);
    var aTAttr  = new THREE.BufferAttribute(this._ribbonaTArr, 1);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    aTAttr.setUsage(THREE.DynamicDrawUsage);

    this._ribbonGeo.setAttribute('position', posAttr);
    this._ribbonGeo.setAttribute('aT', aTAttr);
    this._ribbonGeo.setIndex(new THREE.BufferAttribute(this._ribbonIdxArr, 1));

    this._ribbonMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(this.data.trailColor) },
        uAlpha: { value: 1.0 },
      },
      vertexShader:   RIBBON_VERT,
      fragmentShader: RIBBON_FRAG,
      transparent:    true,
      depthWrite:     false,
      side:           THREE.DoubleSide,
      blending:       THREE.AdditiveBlending,
    });

    this._ribbonMesh = new THREE.Mesh(this._ribbonGeo, this._ribbonMat);
    this._ribbonMesh.frustumCulled = false;
    this._ribbonMesh.visible = false;
    this.el.sceneEl.object3D.add(this._ribbonMesh);
  },

  _destroyRibbon: function () {
    if (!this._ribbonMesh) return;
    this.el.sceneEl.object3D.remove(this._ribbonMesh);
    this._ribbonGeo.dispose();
    this._ribbonMat.dispose();
    this._ribbonMesh = null;
    this._ribbonGeo  = null;
    this._ribbonMat  = null;
    this._histCount  = 0;
  },

  _pushHistoryPoint: function (pos) {
    // Circular shift: push current pos to front, oldest drops off the end
    var max = Math.min(this._histCount + 1, TRAIL_HISTORY);
    for (var i = max - 1; i > 0; i--) {
      this._curveVecs[i].copy(this._curveVecs[i - 1]);
    }
    this._curveVecs[0].copy(pos);
    this._histCount = max;
    this._lastHistPt.copy(pos);
  },

  _decayHistory: function (t) {
    // When hand is not tracked, shrink history over trailFade ms
    if (this._histCount < 2) return;
    var elapsed = t - this._lastAddTime;
    if (elapsed > this.data.trailFade) {
      this._histCount = 0;
    }
  },

  _rebuildRibbon: function (visibleN, alpha) {
    var n = (visibleN !== undefined) ? visibleN : this._histCount;
    if (n < 3) { this._ribbonMesh.visible = false; return; }
    if (this._ribbonMat) this._ribbonMat.uniforms.uAlpha.value = (alpha !== undefined) ? alpha : 1.0;

    // Point the curve at the valid slice only
    this._curve.points = this._curveVecs.slice(0, n);

    var camObj = this.el.sceneEl.camera;
    if (!camObj) return;
    camObj.getWorldPosition(this._camWorldPos);

    var N      = TRAIL_SAMPLES;
    var posArr = this._ribbonPosArr;
    var aTArr  = this._ribbonaTArr;

    for (var i = 0; i < N; i++) {
      var t     = i / (N - 1); // 0 = tip, 1 = tail
      var halfW = TRAIL_HALF_WIDTH * Math.pow(1.0 - t, 0.6); // tapers toward tail

      var pt  = this._samplePts[i];
      var tan = this._sampleTans[i];
      this._curve.getPoint(t, pt);
      this._curve.getTangent(t, tan);

      // Billboard perp: cross(tangent, normalize(camPos - pt))
      this._toCam.subVectors(this._camWorldPos, pt).normalize();
      this._perp.crossVectors(tan, this._toCam);
      if (this._perp.lengthSq() < 1e-6) this._perp.set(0, 1, 0); // safe fallback
      this._perp.normalize().multiplyScalar(halfW);

      var vi = i * 2;
      // Left vertex
      posArr[vi * 3]     = pt.x - this._perp.x;
      posArr[vi * 3 + 1] = pt.y - this._perp.y;
      posArr[vi * 3 + 2] = pt.z - this._perp.z;
      // Right vertex
      posArr[(vi + 1) * 3]     = pt.x + this._perp.x;
      posArr[(vi + 1) * 3 + 1] = pt.y + this._perp.y;
      posArr[(vi + 1) * 3 + 2] = pt.z + this._perp.z;

      aTArr[vi]     = t;
      aTArr[vi + 1] = t;
    }

    this._ribbonGeo.attributes.position.needsUpdate = true;
    this._ribbonGeo.attributes.aT.needsUpdate = true;
    this._ribbonGeo.computeBoundingSphere();
    this._ribbonMesh.visible = true;
  },

  // ── Tick ───────────────────────────────────────────────────────────────────
  tick: function (t, dt) {
    var handControls = this.el.components['hand-tracking-controls'];
    var hasPoses     = handControls && handControls.hasPoses;
    var jointPoses   = hasPoses ? handControls.jointPoses : null;

    // ── Debug cubes ──
    if (this._instancedMesh) {
      this._instancedMesh.visible = !!hasPoses;
      if (hasPoses) {
        for (var i = 0; i < FINGERTIP_INDICES.length; i++) {
          this._jointMatrix.fromArray(jointPoses, FINGERTIP_INDICES[i] * 16);
          this._tipPosition.setFromMatrixPosition(this._jointMatrix);
          this._dummy.position.copy(this._tipPosition);
          this._dummy.updateMatrix();
          this._instancedMesh.setMatrixAt(i, this._dummy.matrix);
        }
        this._instancedMesh.instanceMatrix.needsUpdate = true;
      }
    }

    // ── No hand data ──
    if (!hasPoses) {
      this._isPinching = false; // reset pinch state
      if (this._ribbonMesh) {
        // Time-based fade when hand lost
        var elapsed   = t - this._lastAddTime;
        var fadeAlpha = Math.max(0, 1.0 - elapsed / Math.max(1, this.data.trailFade));
        var fadedHist = Math.round(fadeAlpha * this._histCount);
        if (fadedHist >= 3) this._rebuildRibbon(fadedHist, fadeAlpha);
        else this._ribbonMesh.visible = false;
      }
      return;
    }


    // ── Get current index fingertip world position ──
    this._jointMatrix.fromArray(jointPoses, INDEX_TIP_BONE * 16);
    this._tipPosition.setFromMatrixPosition(this._jointMatrix);

    // ── Speed EMA ──
    var dtSec    = Math.max(dt, 1) / 1000; // avoid div-by-zero
    var rawDist  = this._tipPosition.distanceTo(this._prevTipPos);
    var rawSpeed = (rawDist / dtSec);       // m/s
    this._speed  = this._speed + SPEED_EMA * (rawSpeed - this._speed);
    this._prevTipPos.copy(this._tipPosition);

    // ── Pinch detection (index tip ↔ thumb tip) ──
    this._jointMatrix.fromArray(jointPoses, THUMB_TIP_BONE * 16);
    this._thumbPosition.setFromMatrixPosition(this._jointMatrix);
    var pinchDist   = this._tipPosition.distanceTo(this._thumbPosition);
    var wasPinching = this._isPinching;
    this._isPinching = pinchDist < (this._isPinching ? PINCH_RELEASE : PINCH_DIST);

    // ── Record trail only while pinching ──
    if (this._isPinching && rawDist >= MIN_MOVE_DIST) {
      if (this._ribbonMesh) {
        this._pushHistoryPoint(this._tipPosition);
        this._lastAddTime = t;
      }
      // Collect 2D projected point for $1 recognizer
      this._strokePoints.push(this._projectToCameraPlane(this._tipPosition));
      if (this.data.debug && this._strokePoints.length >= 2) {
        this._updateDebugCanvas(this._strokePoints, null);
      }
    }

    // ── Pinch released → run $1 recognition ──
    if (wasPinching && !this._isPinching) {
      this._recognizeStroke(t);
    }

    // ── Ribbon visual ──
    if (this._ribbonMesh) {
      if (this._isPinching && this._histCount >= 3) {
        // Full-bright ribbon while pinching
        this._rebuildRibbon(this._histCount, 1.0);
      } else {
        // Time-based fade after pinch release
        var elapsed   = t - this._lastAddTime;
        var fadeAlpha = Math.max(0, 1.0 - elapsed / Math.max(1, this.data.trailFade));
        var fadedHist = Math.round(fadeAlpha * this._histCount);
        if (fadedHist >= 3) this._rebuildRibbon(fadedHist, fadeAlpha);
        else this._ribbonMesh.visible = false;
      }
    }
  },

  remove: function () {
    this._destroyInstancedMesh();
    this._destroyRibbon();
    this._destroyDebugCanvas();
  },

  // ── $1 gesture recognition ────────────────────────────────────────────
  _recognizeStroke: function (t) {
    var pts = this._strokePoints;
    this._strokePoints = []; // reset for next stroke
    this._histCount    = 0;  // clear ribbon trail

    if (pts.length < GESTURE_MIN_POINTS) return;
    if (t - this._gestureLastEmit < GESTURE_COOLDOWN) return;

    var result = this._recognizer.recognize(pts);
    if (this.data.debug) {
      this._updateDebugCanvas(pts, result.name + ' (' + result.score.toFixed(2) + ')');
    }
    if (result.score < GESTURE_SCORE_MIN) return;

    this._gestureLastEmit = t;
    var evtName = result.name + '-shape';
    this.el.emit('gesture', { name: result.name, score: result.score });
    this.el.emit(evtName, { name: result.name, score: result.score });
    var self = this;
    setTimeout(function () { self.el.emit(evtName + '-end', {}); }, 1000);
  },

  // ── 2D debug canvas plane ──────────────────────────────────────────────────
  _createDebugCanvas: function () {
    if (this._debugPlane) return;
    var SIZE = 512;
    var canvas = document.createElement('canvas');
    canvas.width  = SIZE;
    canvas.height = SIZE;
    this._debugCanvas = canvas;
    this._debugCtx    = canvas.getContext('2d');
    this._clearDebugCanvas();

    var plane = document.createElement('a-plane');
    plane.setAttribute('position', '0.5 1.5 -1.2');
    plane.setAttribute('width',  '0.5');
    plane.setAttribute('height', '0.5');
    plane.setAttribute('material', 'color: #111111; shader: flat; side: double');
    this._debugPlane = plane;
    this.el.sceneEl.appendChild(plane);

    var self = this;
    var applyTex = function () {
      var mesh = plane.getObject3D('mesh');
      if (!mesh) return;
      self._debugTexture = new THREE.CanvasTexture(canvas);
      mesh.material.map = self._debugTexture;
      mesh.material.needsUpdate = true;
    };
    if (plane.hasLoaded) { applyTex(); }
    else { plane.addEventListener('loaded', applyTex); }
  },

  _destroyDebugCanvas: function () {
    if (this._debugPlane && this._debugPlane.parentNode) {
      this._debugPlane.parentNode.removeChild(this._debugPlane);
    }
    this._debugPlane   = null;
    this._debugCanvas  = null;
    this._debugCtx     = null;
    this._debugTexture = null;
  },

  _clearDebugCanvas: function () {
    if (!this._debugCtx) return;
    var ctx = this._debugCtx;
    var W = this._debugCanvas.width;
    var H = this._debugCanvas.height;
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    ctx.stroke();
    if (this._debugTexture) this._debugTexture.needsUpdate = true;
  },

  _updateDebugCanvas: function (pts, label) {
    if (!this._debugCtx || !pts || pts.length < 2) return;
    var ctx = this._debugCtx;
    var W   = this._debugCanvas.width;
    var H   = this._debugCanvas.height;
    var PAD = 48;

    // Compute bounds with uniform scale to preserve aspect ratio
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].X < minX) minX = pts[i].X; if (pts[i].X > maxX) maxX = pts[i].X;
      if (pts[i].Y < minY) minY = pts[i].Y; if (pts[i].Y > maxY) maxY = pts[i].Y;
    }
    var cx    = (minX + maxX) / 2;
    var cy    = (minY + maxY) / 2;
    var range = Math.max(maxX - minX, maxY - minY) || 1;
    var scale = (W - 2 * PAD) / range;

    var toSX = function (x) { return W / 2 + (x - cx) * scale; };
    var toSY = function (y) { return H / 2 - (y - cy) * scale; }; // flip Y axis

    // Background + crosshairs
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    ctx.stroke();

    // Stroke path
    ctx.strokeStyle = label ? '#ffaa00' : '#00ff88';
    ctx.lineWidth   = 3;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(toSX(pts[0].X), toSY(pts[0].Y));
    for (var j = 1; j < pts.length; j++) {
      ctx.lineTo(toSX(pts[j].X), toSY(pts[j].Y));
    }
    ctx.stroke();

    // Start dot (red)
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(toSX(pts[0].X), toSY(pts[0].Y), 7, 0, Math.PI * 2);
    ctx.fill();

    // End dot (cyan)
    ctx.fillStyle = '#00ccff';
    ctx.beginPath();
    ctx.arc(toSX(pts[pts.length - 1].X), toSY(pts[pts.length - 1].Y), 7, 0, Math.PI * 2);
    ctx.fill();

    // Label
    if (label) {
      ctx.font      = 'bold 38px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffdd00';
      ctx.fillText(label, W / 2, H - 14);
    }

    if (this._debugTexture) this._debugTexture.needsUpdate = true;
  },

  // Project a 3D world position onto the camera's right/up plane → DollarPoint
  _projectToCameraPlane: function (worldPos) {
    var cam = this.el.sceneEl.camera;
    if (!cam) return new DollarPoint(0, 0);
    this._camRight.set(1, 0, 0).applyQuaternion(cam.quaternion);
    this._camUp.set(0, 1, 0).applyQuaternion(cam.quaternion);
    var scale = 1000; // arbitrary but consistent; $1 normalises internally
    return new DollarPoint(
      worldPos.dot(this._camRight) * scale,
      worldPos.dot(this._camUp)    * scale
    );
  },


});