import { copyPosition } from '../utils/aframe.js';

AFRAME.registerComponent('bind-position', {
  schema: {
    target: {type: 'selector'},
  },

  tick: function () {
    copyPosition(this.data.target, this.el);
  }
});