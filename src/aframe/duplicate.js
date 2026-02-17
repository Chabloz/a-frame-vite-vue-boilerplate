
AFRAME.registerComponent('duplicate', {
  schema: {
    rows: {type: 'number', default: 2},
    cols: {type: 'number', default: 2},
    gap: {type: 'number', default: 5},
    gltf: {type: 'string', default: ''},
  },

  init: function () {
    this.target = this.el;
    this.parent = document.createElement('a-entity');
    this.clone0 = this.target.cloneNode(true);
    this.clone0.removeAttribute('duplicate');
    // get the bouding box of the original model to get width and depth for the gap
    const box = new THREE.Box3().setFromObject(this.target.object3D);
    const size = new THREE.Vector3();
    box.getSize(size);
    this.width = size.x;
    this.depth = size.z;
    this.createDuplicates();
  },

  createDuplicates: function () {
    const {rows, cols, gap} = this.data;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const clone = this.clone0.cloneNode(true);
        clone.object3D.position.set(col * gap, 0, row * gap);
        if (this.data.gltf) clone.setAttribute('gltf-model', this.data.gltf);
        this.parent.appendChild(clone);
      }
    }
    this.el.appendChild(this.parent);
  },

  remove: function () {

  },

});