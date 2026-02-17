AFRAME.registerPrimitive('my-hexagon', {
  defaultComponents: {
    "my-hexagon": {},
  },
  mappings: {
    radius: 'my-hexagon.radius',
    color: 'my-hexagon.color',
  }
});

AFRAME.registerComponent('my-hexagon', {
  schema: {
    radius: {type: 'number', default: 1},
    color: {type: 'color', default: 'tomato'},
  },
  init: function () {
    console.log('Creating hexagon with radius', this.data.radius);
    this.createVertices();
    this.createShape();
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
  },

  createVertices: function () {
    const vertices = [];
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      const x = this.data.radius * Math.cos(angle);
      const y = this.data.radius * Math.sin(angle);
      vertices.push({x, y});
    }
    this.vertices = vertices;
  },

  createShape: function () {
    const shape = new THREE.Shape();
    shape.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      shape.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    shape.closePath();
    this.shape = shape;
  },

  createGeometry: function () {
    this.geometry = new THREE.ExtrudeGeometry(this.shape, {depth: 0.1, bevelEnabled: false});
  },

  createMaterial: function () {
    this.material = new THREE.MeshLambertMaterial({color: this.data.color});
  },

  createMesh: function () {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.el.setObject3D('mesh', this.mesh);
  },

  update: function (oldData) {
    if (oldData.color !== this.data.color) {
      this.material.color.set(this.data.color);
    }
  },


});