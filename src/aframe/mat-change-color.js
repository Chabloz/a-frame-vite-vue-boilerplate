AFRAME.registerComponent('mat-change-color', {
  schema: {
    color: {type: "color", default: 'rgb(255, 255, 255)'},
    colorEmmissive: {type: "color", default: 'rgb(255, 0, 0)'},
    isGLTF: {type: "boolean", default: false}
  },
  init: function () {
    if (this.data.isGLTF) {
      this.el.addEventListener('model-loaded', () => {
        this.setColor();
      });
    } else {
      this.setColor();
    }
  },

  setColor: function () {
    this.el.object3D.traverse(child => {
      if (!child.material) return;
      const material = child.material;
      material.color.setHex(this.data.color);
      material.emissive = new THREE.Color(this.data.colorEmmissive);
    });
  }
});