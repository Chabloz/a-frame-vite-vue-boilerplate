AFRAME.registerComponent('copy-rotation', {
  schema: {
    target: {type: 'selector'},
    convertToLocal: {type: 'boolean', default: false},
  },

  init: function () {
    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.scale = new THREE.Vector3();
    this.parentQuaternion = new THREE.Quaternion();

    const target = this.data.target.object3D;
    const el = this.el.object3D;

    if (!this.data.convertToLocal) {
      target.matrixWorld.decompose(this.position, this.quaternion, this.scale);
      el.quaternion.copy( this.quaternion);
      el.updateMatrixWorld(true);
    } else {
      target.updateMatrixWorld(true);
      target.getWorldQuaternion(this.quaternion);
      el.parent.getWorldQuaternion(this.parentQuaternion);
      this.parentQuaternion.invert();
      this.quaternion.premultiply(this.parentQuaternion);
      el.quaternion.copy(this.quaternion);
    }
  }

});