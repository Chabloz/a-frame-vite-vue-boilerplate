AFRAME.registerComponent('visibility', {
  schema: {default: true},

  update: function () {
    if (!this.el.getObject3D('mesh')) {
      queueMicrotask(() => this.update());
      return;
    }
    this.el.getObject3D('mesh').visible = this.data;
  },

});