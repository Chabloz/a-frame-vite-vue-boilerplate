import { copyRotation } from '../utils/aframe.js';

AFRAME.registerComponent('bind-rotation', {
  schema: {
    target: {type: 'selector'},
    convertToLocal: {type: 'boolean', default: false},
  },

  tick: function () {
    copyRotation(this.data.target, this.el, this.data.convertToLocal);
  }
});