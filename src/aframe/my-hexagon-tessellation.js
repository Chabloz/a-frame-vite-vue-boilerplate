AFRAME.registerPrimitive('my-hexagon-tessellation', {
  defaultComponents: {
    "my-hexagon-tessellation": {},
  },
  mappings: {
    radius: 'my-hexagon-tessellation.radius',
    cellsize : 'my-hexagon-tessellation.cellsize',
    height: 'my-hexagon-tessellation.height',
    color: 'my-hexagon-tessellation.color',
    gap: 'my-hexagon-tessellation.gap',
    "color-entropy": 'my-hexagon-tessellation.colorEntropy',
  }
});

AFRAME.registerComponent('my-hexagon-tessellation', {
  schema: {
    radius: {type: 'number', default: 1},
    cellsize : {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    color: {type: 'color', default: 'tomato'},
    gap: {type: 'number', default: 0.01},
    colorEntropy: {type: 'number', default: 0.1},
  },
  init: function () {
    this.cellRadius = this.data.cellsize / 2;
    this.createVertices();
    this.createShape();
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
    this.createTessellation();
  },

  createVertices: function () {
    const vertices = [];
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3 + Math.PI / 6;
      const x = this.cellRadius * Math.cos(angle);
      const y = this.cellRadius * Math.sin(angle);
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
    this.geometry = new THREE.ExtrudeGeometry(this.shape, {depth: this.data.height, bevelEnabled: false});
  },

  createMaterial: function () {
    this.material = new THREE.MeshLambertMaterial({color: new THREE.Color(this.data.color)});
  },

  createMesh: function () {
    this.hexagon = new THREE.Mesh(this.geometry, this.material);
    this.hexagon.position.y = -this.data.height/2;
    this.hexagon.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI / 2);
  },

  createTessellation: function () {
    const group = new THREE.Group();
    for (let q = -this.data.radius; q <= this.data.radius; q++) {
      const r1 = Math.max(-this.data.radius, -q - this.data.radius);
      const r2 = Math.min(this.data.radius, -q + this.data.radius);
      for (let r = r1; r <= r2; r++) {
        const hex = this.hexagon.clone();
        const color = new THREE.Color(this.data.color);
        color.offsetHSL(0, 0, (Math.random() - 0.5) * this.data.colorEntropy);
        hex.material = this.material.clone();
        hex.material.color = color;
        const x = (this.data.gap + this.data.cellsize/2) * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
        const z = (this.data.gap + this.data.cellsize/2) * (3/2 * r)
        hex.position.set(x, 0, z);
        group.add(hex);
      }
    }
    this.el.object3D.add(group);
  },

  update: function (oldData) {
    if (oldData.color !== this.data.color) {
      this.material.color.set(new THREE.Color(this.data.color));
    }
  },


});