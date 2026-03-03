// Fingertip indices per WebXR Hand Input spec
var FINGERTIP_INDICES = [4, 9, 14, 19, 24];
var FINGERTIP_COLORS  = [0xe74c3c, 0x2ecc71, 0x3498db, 0xf39c12, 0x9b59b6];

var INDEX_TIP_BONE    = 9;     // index-finger-tip joint index
var TRAIL_HISTORY     = 72;    // control points kept for the CatmullRom curve (visual only)
var TRAIL_SAMPLES     = 72;    // ribbon segments sampled from curve
var TRAIL_HALF_WIDTH  = 0.014; // meters at the tip (tapers to 0 at tail)
var MIN_MOVE_DIST     = 0.003; // min displacement (m) to record a new trail point
var SPEED_MIN         = 0.25;  // m/s — below this speed ribbon is invisible
var SPEED_MAX         = 1.2;   // m/s — above this speed ribbon is at full length
var SPEED_EMA         = 0.18;  // EMA smoothing factor (higher = more reactive)

// Circle gesture detection (from ribbon trail points)
var CIRCLE_MIN_POINTS     = 12;    // minimum trail points to attempt detection
var CIRCLE_RADIUS_MIN     = 0.03;  // min average radius (m) to count as a circle
var CIRCLE_RADIUS_MAX     = 0.25;  // max average radius (m)
var CIRCLE_VARIANCE_MAX   = 0.22;  // max allowed coefficient of variation (stddev/mean)
var CIRCLE_ANGLE_COVERAGE = 4.5;   // min |net signed| angular coverage in radians (~258°)
var CIRCLE_DIR_RATIO      = 0.75;  // at least 75% of angular deltas must agree in direction
var CIRCLE_TURN_CV_MAX    = 0.80;  // max CV of |per-step turning angle| (rejects triangles: spiky corners)
var CIRCLE_COOLDOWN       = 2000;  // ms between consecutive circle emits
var CIRCLE_CHECK_INTERVAL = 150;   // ms between detection checks (perf)

// Triangle gesture detection (from ribbon trail points)
var TRI_MIN_POINTS      = 15;     // minimum trail points
var TRI_SIZE_MIN        = 0.03;   // min mean radius from centroid (m)
var TRI_SIZE_MAX        = 0.30;   // max mean radius
var TRI_CLOSURE_RATIO   = 0.35;   // max gap / perimeter to count as closed
var TRI_CORNER_THRESH   = 0.40;   // min |turning angle| at a corner (rad ~23°)
var TRI_PEAK_MERGE_FRAC = 0.12;   // merge peaks within this fraction of n
var TRI_MIN_SIDE_FRAC   = 0.12;   // min gap between corners as fraction of n
var TRI_COOLDOWN        = 2000;   // ms between triangle emits
var TRI_CHECK_INTERVAL  = 150;    // ms between checks

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

    // Speed tracking (EMA)
    this._speed           = 0;     // smoothed m/s
    this._prevTipPos      = new THREE.Vector3(1e9, 1e9, 1e9); // sentinel
    this._visibleHistory  = 0;     // how many curve points are actually drawn

    // ── Circle detection state (ribbon-based) ──
    this._circleLastEmit  = 0;
    this._circleLastCheck = 0;

    // ── Triangle detection state ──
    this._triLastEmit  = 0;
    this._triLastCheck = 0;
    this._tri_u2d      = new Float32Array(TRAIL_HISTORY);
    this._tri_v2d      = new Float32Array(TRAIL_HISTORY);

    if (this.data.debug) this._createInstancedMesh();
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
      if (this._ribbonMesh) {
        // Decay speed to 0 so ribbon fades out
        this._speed = this._speed * (1 - SPEED_EMA);
        var fadedAlpha = Math.max(0, (this._speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN));
        var fadedHist  = Math.round(fadedAlpha * this._histCount);
        if (fadedHist >= 3) this._rebuildRibbon(fadedHist, fadedAlpha);
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

    // ── Record trail + gesture points ──
    if (rawDist >= MIN_MOVE_DIST) {
      if (this._ribbonMesh) {
        this._pushHistoryPoint(this._tipPosition);
        this._lastAddTime = t;
      }
    }

    // ── Ribbon visual ──
    if (this._ribbonMesh) {
      var speedT = Math.min(1, Math.max(0, (this._speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)));
      this._visibleHistory = Math.round(speedT * this._histCount);
      if (this._visibleHistory >= 3) {
        this._rebuildRibbon(this._visibleHistory, speedT);
      } else {
        this._ribbonMesh.visible = false;
      }
    }

    // ── Gesture detection (ribbon-based) ──
    // Triangle first: if detected it flushes trail, preventing false circle
    this._checkTriangle(t);
    this._checkCircle(t);
  },

  remove: function () {
    this._destroyInstancedMesh();
    this._destroyRibbon();
  },

  // ── Circle detection from trail control points ─────────────────────────
  _checkCircle: function (t) {
    // Throttle: don't run every frame
    if (t - this._circleLastCheck < CIRCLE_CHECK_INTERVAL) return;
    this._circleLastCheck = t;

    // Cooldown between emits
    if (t - this._circleLastEmit < CIRCLE_COOLDOWN) return;

    var n = this._histCount;
    if (n < CIRCLE_MIN_POINTS) return;

    var pts = this._curveVecs;

    // 1) Compute centroid of the N most recent points
    var cx = 0, cy = 0, cz = 0;
    for (var i = 0; i < n; i++) {
      cx += pts[i].x; cy += pts[i].y; cz += pts[i].z;
    }
    cx /= n; cy /= n; cz /= n;

    // 2) Compute mean radius & std deviation from centroid
    var sumR = 0, sumR2 = 0;
    for (var i = 0; i < n; i++) {
      var dx = pts[i].x - cx;
      var dy = pts[i].y - cy;
      var dz = pts[i].z - cz;
      var r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      sumR  += r;
      sumR2 += r * r;
    }
    var meanR = sumR / n;
    var variance = (sumR2 / n) - (meanR * meanR);
    var stddev = Math.sqrt(Math.max(0, variance));
    var cv = (meanR > 0.001) ? (stddev / meanR) : 999;

    // Reject if radius out of range or too irregular
    if (meanR < CIRCLE_RADIUS_MIN || meanR > CIRCLE_RADIUS_MAX) return;
    if (cv > CIRCLE_VARIANCE_MAX) return;

    // 3) Best-fit plane via PCA-lite: find the normal of the point cloud
    //    using the covariance matrix and picking the eigenvector with
    //    the smallest eigenvalue. For speed we use the cross-product of
    //    two spread vectors (first and middle point from centroid).
    var midIdx = Math.floor(n / 2);
    var v1x = pts[0].x - cx, v1y = pts[0].y - cy, v1z = pts[0].z - cz;
    var v2x = pts[midIdx].x - cx, v2y = pts[midIdx].y - cy, v2z = pts[midIdx].z - cz;
    var nx = v1y * v2z - v1z * v2y;
    var ny = v1z * v2x - v1x * v2z;
    var nz = v1x * v2y - v1y * v2x;
    var nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (nLen < 1e-6) return;
    nx /= nLen; ny /= nLen; nz /= nLen;

    // Build local 2D basis on the plane: u = normalize(v1), v = cross(n, u)
    var u1Len = Math.sqrt(v1x * v1x + v1y * v1y + v1z * v1z);
    if (u1Len < 1e-6) return;
    var ux = v1x / u1Len, uy = v1y / u1Len, uz = v1z / u1Len;
    var vx = ny * uz - nz * uy;
    var vy = nz * ux - nx * uz;
    var vz = nx * uy - ny * ux;

    // 4) Project points onto 2D plane and compute angular coverage
    var angles = [];
    for (var i = 0; i < n; i++) {
      var px = pts[i].x - cx, py = pts[i].y - cy, pz = pts[i].z - cz;
      var projU = px * ux + py * uy + pz * uz;
      var projV = px * vx + py * vy + pz * vz;
      angles.push(Math.atan2(projV, projU));
    }

    // Signed angular deltas — a real circle accumulates net rotation,
    // while back-and-forth or zigzag motions cancel out.
    var signedAngle = 0;
    var sameDirCount = 0;
    var totalDeltas  = n - 1;
    for (var i = 1; i < n; i++) {
      var da = angles[i] - angles[i - 1];
      // Wrap to [-PI, PI]
      if (da > Math.PI)  da -= 2 * Math.PI;
      if (da < -Math.PI) da += 2 * Math.PI;
      signedAngle += da;
    }

    var totalAngle = Math.abs(signedAngle);
    if (totalAngle < CIRCLE_ANGLE_COVERAGE) return;

    // Direction consistency: count deltas agreeing with the dominant direction
    var sign = signedAngle > 0 ? 1 : -1;
    var sumDA = 0, sumDA2 = 0;
    for (var i = 1; i < n; i++) {
      var da = angles[i] - angles[i - 1];
      if (da > Math.PI)  da -= 2 * Math.PI;
      if (da < -Math.PI) da += 2 * Math.PI;
      if (da * sign > 0) sameDirCount++;
      var absDA = Math.abs(da);
      sumDA  += absDA;
      sumDA2 += absDA * absDA;
    }
    var dirRatio = sameDirCount / totalDeltas;
    if (dirRatio < CIRCLE_DIR_RATIO) return;

    // Turning-angle uniformity: in a circle the per-step |delta angle|
    // is roughly constant. In a triangle it spikes at corners and is
    // near-zero on sides → high CV. Reject if CV too large.
    var meanDA   = sumDA / totalDeltas;
    var varDA    = (sumDA2 / totalDeltas) - (meanDA * meanDA);
    var stddevDA = Math.sqrt(Math.max(0, varDA));
    var turnCV   = (meanDA > 1e-6) ? (stddevDA / meanDA) : 999;
    if (turnCV > CIRCLE_TURN_CV_MAX) return;

    // ── Circle detected! ──
    this._circleLastEmit = t;
    // Flush trail so the same gesture doesn't fire twice
    this._histCount = 0;
    this.el.emit('circle-shape', { radius: meanR, coverage: totalAngle });
    var self = this;
    setTimeout(function () { self.el.emit('circle-shape-end', {}); }, 1000);
  },

  // ── Triangle detection from trail control points ───────────────────────
  _checkTriangle: function (t) {
    // Throttle
    if (t - this._triLastCheck < TRI_CHECK_INTERVAL) return;
    this._triLastCheck = t;

    // Cooldown
    if (t - this._triLastEmit < TRI_COOLDOWN) return;

    var n = this._histCount;
    if (n < TRI_MIN_POINTS) return;

    var pts = this._curveVecs;

    // 1) Centroid
    var cx = 0, cy = 0, cz = 0;
    for (var i = 0; i < n; i++) { cx += pts[i].x; cy += pts[i].y; cz += pts[i].z; }
    cx /= n; cy /= n; cz /= n;

    // 2) Mean radius (size check)
    var sumR = 0;
    for (var i = 0; i < n; i++) {
      var dx = pts[i].x - cx, dy = pts[i].y - cy, dz = pts[i].z - cz;
      sumR += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    var meanR = sumR / n;
    if (meanR < TRI_SIZE_MIN || meanR > TRI_SIZE_MAX) return;

    // 3) Best-fit plane (reuse circle approach)
    var midIdx = Math.floor(n / 2);
    var v1x = pts[0].x - cx, v1y = pts[0].y - cy, v1z = pts[0].z - cz;
    var v2x = pts[midIdx].x - cx, v2y = pts[midIdx].y - cy, v2z = pts[midIdx].z - cz;
    var nx = v1y * v2z - v1z * v2y;
    var ny = v1z * v2x - v1x * v2z;
    var nz = v1x * v2y - v1y * v2x;
    var nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (nLen < 1e-6) return;
    nx /= nLen; ny /= nLen; nz /= nLen;

    var u1Len = Math.sqrt(v1x * v1x + v1y * v1y + v1z * v1z);
    if (u1Len < 1e-6) return;
    var ux = v1x / u1Len, uy = v1y / u1Len, uz = v1z / u1Len;
    var vx = ny * uz - nz * uy;
    var vy = nz * ux - nx * uz;
    var vz = nx * uy - ny * ux;

    // Project points to 2D
    var u2d = this._tri_u2d, v2d = this._tri_v2d;
    for (var i = 0; i < n; i++) {
      var px = pts[i].x - cx, py = pts[i].y - cy, pz = pts[i].z - cz;
      u2d[i] = px * ux + py * uy + pz * uz;
      v2d[i] = px * vx + py * vy + pz * vz;
    }

    // 4) Perimeter and closure check
    var perimeter = 0;
    for (var i = 1; i < n; i++) {
      var du = u2d[i] - u2d[i - 1], dv = v2d[i] - v2d[i - 1];
      perimeter += Math.sqrt(du * du + dv * dv);
    }
    if (perimeter < 1e-6) return;
    var closureDist = Math.sqrt(
      (u2d[0] - u2d[n - 1]) * (u2d[0] - u2d[n - 1]) +
      (v2d[0] - v2d[n - 1]) * (v2d[0] - v2d[n - 1])
    );
    if (closureDist / perimeter > TRI_CLOSURE_RATIO) return;

    // 5) Compute windowed turning angles along the path
    var W = Math.max(2, Math.floor(n / 12));
    var turnSigned = [];
    var turnAbs    = [];
    var turnIdx    = [];

    for (var i = W; i < n - W; i++) {
      var inU  = u2d[i] - u2d[i - W], inV  = v2d[i] - v2d[i - W];
      var outU = u2d[i + W] - u2d[i], outV = v2d[i + W] - v2d[i];
      var inA  = Math.atan2(inV, inU);
      var outA = Math.atan2(outV, outU);
      var turn = outA - inA;
      if (turn > Math.PI)  turn -= 2 * Math.PI;
      if (turn < -Math.PI) turn += 2 * Math.PI;
      turnSigned.push(turn);
      turnAbs.push(Math.abs(turn));
      turnIdx.push(i);
    }

    if (turnSigned.length < 5) return;

    // 6) Find local maxima of |turning angle| above threshold
    var peaks = [];
    for (var i = 1; i < turnAbs.length - 1; i++) {
      if (turnAbs[i] >= TRI_CORNER_THRESH &&
          turnAbs[i] >= turnAbs[i - 1] &&
          turnAbs[i] >= turnAbs[i + 1]) {
        peaks.push({ idx: turnIdx[i], angle: turnSigned[i], absAngle: turnAbs[i] });
      }
    }

    // 7) Merge nearby peaks (keep the strongest within merge window)
    var mergeW  = Math.max(3, Math.floor(n * TRI_PEAK_MERGE_FRAC));
    var merged  = [];
    for (var i = 0; i < peaks.length; i++) {
      if (merged.length === 0 || peaks[i].idx - merged[merged.length - 1].idx > mergeW) {
        merged.push(peaks[i]);
      } else if (peaks[i].absAngle > merged[merged.length - 1].absAngle) {
        merged[merged.length - 1] = peaks[i];
      }
    }

    // 8) Exactly 3 corners
    if (merged.length !== 3) return;

    // 9) Direction consistency: all 3 corners must turn the same way
    var s0 = merged[0].angle > 0 ? 1 : -1;
    var s1 = merged[1].angle > 0 ? 1 : -1;
    var s2 = merged[2].angle > 0 ? 1 : -1;
    if (!(s0 === s1 && s1 === s2)) return;

    // 10) Corners must be spread out along the path
    var minGap = Math.floor(n * TRI_MIN_SIDE_FRAC);
    var i0 = merged[0].idx, i1 = merged[1].idx, i2 = merged[2].idx;
    if (i1 - i0 < minGap || i2 - i1 < minGap) return;

    // ── Triangle detected! ──
    this._triLastEmit = t;
    this._histCount = 0;
    this.el.emit('triangle-shape', { radius: meanR, corners: 3 });
    var self = this;
    setTimeout(function () { self.el.emit('triangle-shape-end', {}); }, 1000);
  },

});