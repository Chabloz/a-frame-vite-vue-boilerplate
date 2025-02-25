AFRAME.registerComponent('track-me', {
  schema: {
    enable: {type: 'boolean', default: false},
    target: {type: 'selector'},
  },

  init: function () {
    this.lastPosition = new THREE.Vector3();
    this.el.object3D.getWorldPosition(this.lastPosition);
    // this.tick = AFRAME.utils.throttleTick(this.tick, 1000, this);
  },

  remove: function () {

  },

  tick: function () {
    if (!this.data.enable) return;
    const currentPosition = new THREE.Vector3();
    this.el.object3D.getWorldPosition(currentPosition);
    const delta = currentPosition.clone().sub(this.lastPosition);
    // apply the same delta to the target
    this.data.target.object3D.position.sub(delta);
    this.lastPosition = currentPosition
  }

});