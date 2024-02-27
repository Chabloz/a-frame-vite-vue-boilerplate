AFRAME.registerComponent('look-at', {
  schema: {
    target: {type: 'selector', default: '[camera]'},
    enabled: {type: 'boolean', default: true},
  },
  init: function () {
    this.targetWorldPos = new THREE.Vector3();
    this.myWorldPos = new THREE.Vector3();
    this.originalRotation = [this.el.object3D.rotation.x, this.el.object3D.rotation.y, this.el.object3D.rotation.z];
  },
  update: function () {
    if (this.data.enabled) return;
    this.el.object3D.rotation.x = this.originalRotation[0];
    this.el.object3D.rotation.y = this.originalRotation[1];
    this.el.object3D.rotation.z = this.originalRotation[2];
  },
  tick: function () {
    if (!this.data.enabled) return;
    if (!this.data.target) return;
    this.data.target.object3D.getWorldPosition(this.targetWorldPos);
    this.el.object3D.getWorldPosition(this.myWorldPos);
    this.el.object3D.lookAt(this.targetWorldPos);
  }
});