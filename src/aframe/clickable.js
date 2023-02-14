AFRAME.registerComponent('clickable', {
  schema: {
    color: {type: 'color', default: 'black'}
  },

  init: function () {
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.el.addEventListener('mouseenter', this.onEnter);
    this.el.addEventListener('mouseleave', this.onLeave);
  },

  onEnter: function (evt) {
    const cursor = evt.detail.cursorEl;
    if (cursor.getAttribute('raycaster').showLine) {
      this.savedColor = cursor.getAttribute('raycaster').lineColor;
      cursor.setAttribute('raycaster', 'lineColor', this.data.color);
    } else {
      this.savedColor = cursor.getAttribute('material').color;
      cursor.setAttribute('material', 'color', this.data.color);
    }
  },

  onLeave: function (evt) {
    const cursor = evt.detail.cursorEl;
    if (cursor.getAttribute('raycaster').showLine) {
      cursor.setAttribute('raycaster', 'lineColor', this.savedColor);
    } else {
      cursor.setAttribute('material', 'color', this.savedColor);
    }
  },

  remove: function () {
    this.el.removeEventListener('mouseenter', this.onEnter);
    this.el.removeEventListener('mouseleave', this.onLeave);
  },

});