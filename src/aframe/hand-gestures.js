// Fingertip indices per WebXR Hand Input spec
var FINGERTIP_INDICES = [4, 9, 14, 19, 24];
var FINGERTIP_COLORS  = [0xe74c3c, 0x2ecc71, 0x3498db, 0xf39c12, 0x9b59b6];

var INDEX_TIP_BONE    = 9;     // index-finger-tip joint index
var TRAIL_HISTORY     = 28;    // control points kept for the CatmullRom curve
var TRAIL_SAMPLES     = 72;    // ribbon segments sampled from curve
var TRAIL_HALF_WIDTH  = 0.014; // meters at the tip (tapers to 0 at tail)
var MIN_MOVE_DIST     = 0.003; // min displacement (m) to record a new control point
var SPEED_MIN         = 0.25;  // m/s — below this speed ribbon is invisible
var SPEED_MAX         = 1.2;   // m/s — above this speed ribbon is at full length
var SPEED_EMA         = 0.18;  // EMA smoothing factor (higher = more reactive)

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
    debug:      { type: 'boolean', default: false },
    trail:      { type: 'boolean', default: true  },
    trailColor: { type: 'color',   default: '#ffd700' },
    trailFade:  { type: 'number',  default: 1000 },     // ms (controls history decay rate)
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

    // ── Ribbon ──
    if (!this._ribbonMesh) return;

    if (!hasPoses) {
      // Decay speed to 0 so ribbon fades out
      this._speed = this._speed * (1 - SPEED_EMA);
      var fadedAlpha = Math.max(0, (this._speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN));
      var fadedHist  = Math.round(fadedAlpha * this._histCount);
      if (fadedHist >= 3) this._rebuildRibbon(fadedHist, fadedAlpha);
      else this._ribbonMesh.visible = false;
      return;
    }

    // Get current index fingertip world position
    this._jointMatrix.fromArray(jointPoses, INDEX_TIP_BONE * 16);
    this._tipPosition.setFromMatrixPosition(this._jointMatrix);

    // ── Speed EMA ──
    var dtSec    = Math.max(dt, 1) / 1000; // avoid div-by-zero
    var rawDist  = this._tipPosition.distanceTo(this._prevTipPos);
    var rawSpeed = (rawDist / dtSec);       // m/s
    this._speed  = this._speed + SPEED_EMA * (rawSpeed - this._speed);
    this._prevTipPos.copy(this._tipPosition);

    // Map speed → [0..1]
    var speedT = Math.min(1, Math.max(0, (this._speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)));

    // How many history points to show (full buffer at SPEED_MAX, 0 at SPEED_MIN)
    this._visibleHistory = Math.round(speedT * this._histCount);

    // Add to history only if moved enough (avoids degenerate curve segments)
    if (rawDist >= MIN_MOVE_DIST) {
      this._pushHistoryPoint(this._tipPosition);
      this._lastAddTime = t;
    }

    if (this._visibleHistory >= 3) {
      this._rebuildRibbon(this._visibleHistory, speedT);
    } else {
      this._ribbonMesh.visible = false;
    }
  },

  remove: function () {
    this._destroyInstancedMesh();
    this._destroyRibbon();
  },
});