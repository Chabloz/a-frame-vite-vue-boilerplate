/**
 * obb-collider-ready
 *
 * Drop-in replacement for obb-collider that delays its registration
 * until `delay` ms after the scene `loaded` event, avoiding the
 * A-Frame startup bug where entities briefly sit at (0,0,0) and
 * trigger false obbcollisionstarted events.
 *
 * Usage: replace obb-collider with obb-collider-ready and add delay.
 *
 *   <a-entity obb-collider="trackedObject3D: foo; size: 0.04">
 *   →
 *   <a-entity obb-collider-ready="trackedObject3D: foo; size: 0.04; delay: 200">
 */
AFRAME.registerComponent('obb-collider-ready', {
  schema: {
    // obb-collider passthrough props
    trackedObject3D: { type: 'string',  default: '' },
    size:            { type: 'number',  default: 0 },
    centerModel:     { type: 'boolean', default: false },
    // delay control
    delay: { type: 'number', default: 200 },
  },

  init: function () {
    this._timer = null;

    const schedule = () => {
      this._timer = setTimeout(() => {
        // Build passthrough data, omitting 'delay' itself
        const obbData = {};
        if (this.data.trackedObject3D) obbData.trackedObject3D = this.data.trackedObject3D;
        if (this.data.size)            obbData.size             = this.data.size;
        if (this.data.centerModel)     obbData.centerModel      = this.data.centerModel;

        this.el.setAttribute('obb-collider', obbData);
      }, this.data.delay);
    };

    if (this.el.sceneEl.hasLoaded) {
      schedule();
    } else {
      this.el.sceneEl.addEventListener('loaded', schedule, { once: true });
    }
  },

  remove: function () {
    clearTimeout(this._timer);
  },
});
