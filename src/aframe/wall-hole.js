AFRAME.registerComponent('wall-hole', {
  schema: {
    width: {type: "number", default: 2},
    height: {type: "number", default: 3},
    gapWidth: {type: "number", default: .5},
    gapHeight: {type: "number", default: .5},
    depth: {type: "number", default: 1},
  },
  init: function () {
    this.genShape();
    this.genGeometry();
    this.genMaterial();
    this.genMesh();
  },
  genShape: function () {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, this.data.height);
    shape.lineTo(this.data.width, this.data.height);
    shape.lineTo(this.data.width, 0);
    shape.lineTo(0, 0);

    const hole = new THREE.Path();
    hole.moveTo(this.data.gapWidth, this.data.gapHeight);
    hole.lineTo(this.data.gapWidth, this.data.height - this.data.gapHeight);
    hole.lineTo(this.data.width - this.data.gapWidth, this.data.height - this.data.gapHeight);
    hole.lineTo(this.data.width - this.data.gapWidth, this.data.gapHeight);
    hole.lineTo(this.data.gapWidth, this.data.gapHeight);
    // hole.moveTo(0.5, 0.5);
    // hole.lineTo(0.5, 4.5);
    // hole.lineTo(4.5, 4.5);
    // hole.lineTo(4.5, 0.5);
    // hole.lineTo(0.5, 0.5);

    shape.holes = [hole];
    this.shape = shape;
  },

  genGeometry: function () {

    const extrudeSettings = {
      steps: 1,
      depth: this.data.depth,
      bevelEnabled: false,
    };

    this.geometry = new THREE.ExtrudeGeometry( this.shape, extrudeSettings );
    //   geometry.center();
  },

  genMaterial: function () {
    this.material = new THREE.MeshLambertMaterial({
       color: new THREE.Color('red'),
       side: THREE.DoubleSide,
    } );
  },

  genMesh: function () {
    this.mesh = new THREE.Mesh( this.geometry, this.material ) ;
    this.el.setObject3D('mesh', this.mesh);
  },

})
