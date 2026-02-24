// Fingertip indices per WebXR Hand Input spec
var FINGERTIP_INDICES = [4, 9, 14, 19, 24];
var FINGERTIP_COLORS  = [0xe74c3c, 0x2ecc71, 0x3498db, 0xf39c12, 0x9b59b6];

AFRAME.registerComponent('hand-gestures', {
  schema: {},

  init: function () {
    this._jointMatrix = new THREE.Matrix4();
    this._tipPosition = new THREE.Vector3();
    this._dummy       = new THREE.Object3D();
    this._instancedMesh = null;

    this._createInstancedMesh();
  },

  _createInstancedMesh: function () {
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

  tick: function () {
    var handControls = this.el.components['hand-tracking-controls'];
    if (!handControls || !handControls.hasPoses) {
      this._instancedMesh.visible = false;
      return;
    }

    var jointPoses = handControls.jointPoses;
    this._instancedMesh.visible = true;

    for (var i = 0; i < FINGERTIP_INDICES.length; i++) {
      var boneIndex = FINGERTIP_INDICES[i];

      // Read the world-space 4x4 matrix from the flat Float32Array (same as updateHandDotsModel)
      this._jointMatrix.fromArray(jointPoses, boneIndex * 16);
      this._tipPosition.setFromMatrixPosition(this._jointMatrix);

      this._dummy.position.copy(this._tipPosition);
      this._dummy.updateMatrix();
      this._instancedMesh.setMatrixAt(i, this._dummy.matrix);
    }

    this._instancedMesh.instanceMatrix.needsUpdate = true;
  },

  remove: function () {
    if (this._instancedMesh) {
      this.el.sceneEl.object3D.remove(this._instancedMesh);
      this._instancedMesh.geometry.dispose();
      this._instancedMesh.material.dispose();
      this._instancedMesh = null;
    }
  },

});