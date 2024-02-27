AFRAME.registerComponent('bind-position', {
  schema: {
    target: {type: 'selector'},
  },

  init: function () {
    this.targetPos = new THREE.Vector3();
    this.pos = new THREE.Vector3();
  },

  tick: function () {
    const sourceObject = this.data.target.object3D;
    const targetObject = this.el.object3D;
    sourceObject.getWorldPosition(this.targetPos);
    const localPosition = this.el.parentEl.object3D.worldToLocal(this.targetPos.clone());
    targetObject.position.copy(localPosition);
  }
});