AFRAME.registerComponent('duplicate-me', {
  schema: {
    nbTimes: {type: 'number', default: 3},
    minSpread: {type: 'number', default: 1},
    maxSpread: {type: 'number', default: 5},
    msInterval: {type: 'number', default: 1000},
  },

  init: function () {
    this.count = 0;
    this.tick = AFRAME.utils.throttleTick(this.duplicate, this.data.msInterval, this);
    this.el.flushToDOM(true);
  },

  duplicate: function () {
    // job's done ?
    if (this.count > this.data.nbTimes) return;
    // skip the first interval
    if (this.count == 0) { this.count++; return;}
    this.count++;
    // Clone and spread the position from the original object
    const clone = this.el.cloneNode(true);
    clone.removeAttribute('duplicate-me');  // beware of the clone army ! (If you remove this line :)
    const spreadX = THREE.MathUtils.randFloat(this.data.minSpread, this.data.maxSpread);
    const signX = Math.random() > 0.5 ? 1 : -1;
    const spreadZ = THREE.MathUtils.randFloat(this.data.minSpread, this.data.maxSpread);
    const signZ = Math.random() > 0.5 ? 1 : -1;
    clone.setAttribute('position', 'x', this.el.object3D.position.x + signX * spreadX);
    clone.setAttribute('position', 'y', this.el.object3D.position.y);
    clone.setAttribute('position', 'z', this.el.object3D.position.z + signZ * spreadZ);
    // All done, we add the clone to the sceneEl
    this.el.sceneEl.appendChild(clone);
  }
});