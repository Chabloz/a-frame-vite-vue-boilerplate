AFRAME.registerComponent('hide-in-vr', {
  schema: {
    // Set this to true if you want to hide the entity in flat 3d (desktop fullscreen mode of A-Frame)
    hideInFlat3d: {type: 'boolean', default: false},
    hideInAR: {type: 'boolean', default: true},
  },

  init: function () {
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.lastState = this.el.object3D.visible;

    if (this.el.sceneEl.is('vr-mode') || (this.data.hideInAR && this.el.sceneEl.is('ar-mode'))) {
      this.hide();
    } else {
      this.show();
    }
    this.el.sceneEl.addEventListener('enter-vr', this.hide);
    this.el.sceneEl.addEventListener('exit-vr', this.show);
  },

  hide: function () {
    if (!this.data.hideInFlat3d) {
      const isTrueVrOrAr = AFRAME.utils.device.checkHeadsetConnected() || (this.data.hideInAR && this.el.sceneEl.is('ar-mode'));
      if (!isTrueVrOrAr) return;
    }
    if (!this.data.hideInAR && this.el.sceneEl.is('ar-mode')) return;
    this.el.object3D.visible = false;
  },

  show: function () {
    this.el.object3D.visible = true;
  },

  remove: function () {
    this.el.object3D.visible = true;
    this.el.sceneEl.removeEventListener('enter-vr', this.hide);
    this.el.sceneEl.removeEventListener('exit-vr', this.show);
  },

});