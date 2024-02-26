AFRAME.registerComponent('visibility', {
  schema: {default: true},

  // init: function () {
  //   this.el.addEventListener('model-loaded', this.tick.bind(this));
  // },

  // update: function () {
  //   this.tick();
  // },

  tick : function () {
    if (!this.el.getObject3D('mesh')) return;
    this.el.getObject3D('mesh').visible = this.data;
  }

});