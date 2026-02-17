AFRAME.registerComponent('duplicate', {
  schema: {
    width: {type: 'number', default: 1},
    depth: {type: 'number', default: 1},
    gap: {type: 'number', default: 0.1},
  },

  init: function () {
    const target = this.el;
    const clone = target.cloneNode(true);
    clone.removeAttribute('duplicate');
    clone.setAttribute('position', {
      x: target.getAttribute('position').x + this.data.width + this.data.gap,
      y: target.getAttribute('position').y,
      z: target.getAttribute('position').z + this.data.depth + this.data.gap,
    });
    target.parentNode.appendChild(clone);
  },

  remove: function () {

  },

});