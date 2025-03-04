AFRAME.registerComponent('clickable', {
  schema: {
    color: {type: 'color', default: 'black'}
  },

  init: function () {
    this.cursor = null;
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.el.addEventListener('mouseenter', this.onEnter);
    this.el.addEventListener('mouseleave', this.onLeave);
  },

  onEnter: function (evt) {
    this.cursor = evt.detail.cursorEl;
    this.changeCursorColor(this.data.color, true);
  },

  onLeave: function (evt) {
    this.cursor = evt.detail.cursorEl;
    this.changeCursorColor(this.savedColor);
  },

  changeCursorColor: function (color, saveLast = false) {
    if (this.cursor.getAttribute('raycaster').showLine) {
      if (saveLast) this.savedColor = this.cursor.getAttribute('raycaster').lineColor;
      this.cursor.setAttribute('raycaster', 'lineColor', color);
    } else {
      if (this.cursor.getAttribute('material') === null) return;
      if (saveLast) this.savedColor = this.cursor.getAttribute('material').color;
      this.cursor.setAttribute('material', 'color', color);
    }
  },

  remove: function () {
    this.changeCursorColor(this.savedColor);
    this.el.removeEventListener('mouseenter', this.onEnter);
    this.el.removeEventListener('mouseleave', this.onLeave);
  },

});