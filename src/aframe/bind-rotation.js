AFRAME.registerComponent('bind-rotation', {
  schema: {
    target: {type: 'selector'}
  },

  init: function () {
    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.scale = new THREE.Vector3();
  },

  tick: function () {
    const sourceObject = this.data.target.object3D;
    const targetObject = this.el.object3D;

    sourceObject.matrixWorld.decompose(this.position, this.quaternion, this.scale);
    targetObject.quaternion.copy( this.quaternion);
    targetObject.updateMatrixWorld(true);

  }
});