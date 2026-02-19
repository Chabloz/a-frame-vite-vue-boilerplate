
import { getRandomFloat } from '../utils/math.js';

AFRAME.registerComponent('duplicate', {
  schema: {
    rows: {type: 'number', default: 2},
    cols: {type: 'number', default: 2},
    gap: {type: 'number', default: 0.1},
    gltf: {type: 'string', default: ''},
    entropy: {type: 'number', default: 0},
  },

  init: function () {
    this.target = this.el;
    this.parent = document.createElement('a-entity');
    this.clone0 = this.target.cloneNode(true);
    this.clone0.removeAttribute('duplicate');

    if (this.data.gltf) {
      this.target.addEventListener('model-loaded', () => {
        this.calculateBoundingBox();
        this.target.removeAttribute('gltf-model');
        this.createDuplicates();
      }, {once: true});
    } else {
      this.calculateBoundingBox();
      this.createDuplicates();
    }
  },

  calculateBoundingBox: function () {
    const box = new THREE.Box3().setFromObject(this.target.object3D);
    const size = new THREE.Vector3();
    box.getSize(size);
    this.width = size.x;
    this.depth = size.z;
  },

  createDuplicates: function () {
    const {rows, cols, gap} = this.data;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const clone = this.clone0.cloneNode(true);
        const x = col * (gap + this.width) + getRandomFloat(-this.data.entropy, this.data.entropy);
        const z = row * (gap + this.depth) + getRandomFloat(-this.data.entropy, this.data.entropy);
        clone.object3D.position.set(x, 0, z);
        if (this.data.gltf) clone.setAttribute('gltf-model', this.data.gltf);
        this.parent.appendChild(clone);
      }
    }
    this.el.appendChild(this.parent);
  },

  remove: function () {
    this.parent.replaceChildren();
    this.el.removeChild(this.parent);
    if (this.data.gltf) this.target.setAttribute('gltf-model', this.data.gltf);
  },

});