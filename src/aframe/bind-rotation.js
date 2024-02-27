AFRAME.registerComponent("bind-rotation", {
  schema: {
    target: { type: "selector" },
  },
  tick: function () {
    this.el.object3D.rotation.copy(this.data.target.object3D.rotation);
  },
});

AFRAME.registerComponent("bind-position", {
  schema: {
    target: { type: "selector" },
  },
  init: function () {
    this.targetWorldPos = new THREE.Vector3();
    this.myWorldPos = new THREE.Vector3();
  },
  tick: function () {
    this.data.target.object3D.getWorldPosition(this.targetWorldPos);
    this.el.object3D.position.copy(this.targetWorldPos);
    // // world to local
    // this.myWorldPos = this.el.object3D.parent.worldToLocal(this.myWorldPos);
    // this.el.object3D.position.copy(this.targetWorldPos);
  },
});
