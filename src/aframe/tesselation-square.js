AFRAME.registerComponent('tesselation-square', {
  schema: {
    depth: {type: 'number', default: 10},
    width: {type: 'number', default: 10},
    boxSize: {type: 'number', default: 2},
    gap: {type: 'number', default: 0.1}
  },
  init: function () {
    console.log('tesselation-square');
    console.log(this.el);
    const box = document.createElement('a-box');
    box.setAttribute('width', this.data.boxSize);

    for (let x = 0; x < this.data.width; x++) {
      const clone = box.cloneNode();
      clone.setAttribute('position', `${x * (this.data.boxSize + this.data.gap)} 0 0`);
      this.el.appendChild(clone);
    }
    // setTimeout(() => this.el.setAttribute('tesselation-square', {depth: 20, width: 20}), 5000);
  },
  update: function () {
    console.log(this.data);
  },
  tick: function () {

  }
});