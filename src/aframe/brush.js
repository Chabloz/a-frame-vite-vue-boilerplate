let pressed = true;

AFRAME.registerComponent("brush", {
  init: function () {
    this.pos = new THREE.Vector3();
    this.tick = AFRAME.utils.throttleTick(this.tick, 250, this);
    this.points = [];
    this.lastCurveObject = null;
    this.curveObject = null;
    // change a state when a button click happens
    // this.el.addEventListener("gripdown", () => {
    //   pressed = true;
    // });
    // this.el.addEventListener("gripup", () => {
    //   pressed = false;
    // });
  },

  tick: function () {
    // this.el.object3D.getWorldPosition(this.pos);
    this.el.object3D.getWorldPosition(this.pos);
    this.points.push(this.pos.clone());

    // If the button is not pressed, do nothing
    // if (!pressed) return;
    //Create a closed wavey loop
    if (this.points.length < 2) return;

    const curve = new THREE.CatmullRomCurve3(this.points);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    // Create the final object to add to the scene
    this.curveObject = new THREE.Line(geometry, material);
    // this.el.setObject3D("brush", curveObject);
    this.el.setObject3D("brush", this.curveObject);
  },
});

AFRAME.registerComponent("brush-test", {
  init: function () {
    this.geometry = null;
    this.pos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(this.pos);
    this.curveObject = null;
    this.lastCurveObject = null;
    this.tick = AFRAME.utils.throttleTick(this.tick, 250, this);
    this.points = [this.pos.clone()];
  },

  tick: function () {
    this.el.object3D.getWorldPosition(this.pos);
    this.points.push(this.pos.clone());

    if (this.points.length < 2) return;

    const curve = new THREE.CatmullRomCurve3(this.points, false, "chordal", 0);
    const points = curve.getPoints(200);
    this.geometry = null;
    this.geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 3,
      linecap: "round",
      linejoin: "round",
    });
    this.curveObject = new THREE.Line(this.geometry, material);

    if (this.lastCurveObject) {
      this.el.sceneEl.object3D.remove(this.lastCurveObject);
    }

    this.curveObject.position.set(0, -0.5, 0);
    this.el.sceneEl.object3D.add(this.curveObject);

    this.lastCurveObject = this.curveObject;
  },
});

AFRAME.registerComponent("brush-tube", {
  init: function () {
    this.geometry = null;
    this.pos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(this.pos);
    this.curveObject = null;
    this.lastCurveObject = null;
    this.points = [this.pos.clone()];
    this.tick = AFRAME.utils.throttleTick(this.tick, 500, this);
  },

  tick: function () {
    this.el.object3D.getWorldPosition(this.pos);
    this.points.push(this.pos.clone());

    if (this.points.length < 2) return;
    if (this.points.length % 5 !== 0) return;

    // Utiliser CatmullRomCurve3 pour créer une courbe à partir des points
    const curve = new THREE.CatmullRomCurve3(
      this.points,
      false,
      "centripetal",
      0.2
    );

    // Créer un TubeGeometry à partir de cette courbe
    // Remplacer ici le BufferGeometry par TubeGeometry
    this.geometry = new THREE.TubeGeometry(curve, 32, 0.1, 8, false);

    const material = new THREE.MeshBasicMaterial({
      color: 0x560053,
      //   wireframe: true,
      side: THREE.DoubleSide,
    });

    // Remplacer THREE.Line par THREE.Mesh pour dessiner le tube
    this.curveObject = new THREE.Mesh(this.geometry, material);

    // if (this.lastCurveObject) {
    //   this.el.sceneEl.object3D.remove(this.lastCurveObject);
    // }

    // La position n'a pas besoin d'être ajustée ici, car le tube suivra la courbe
    this.curveObject.position.set(0, -0.5, 0);
    this.el.sceneEl.object3D.add(this.curveObject);

    // this.lastCurveObject = this.curveObject;
  },
});

AFRAME.registerComponent("draw-tube", {
  init: function () {
    this.drawing = false;
    this.lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffd000 });
    this.tubeRadius = 0.2;
    this.points = [];
    this.mesh = null;
    this.maxLength = 25; // Maximum number of points before reset

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.drawing = true;
      }
    });
    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        this.drawing = false;
      }
    });
  },

  tick: function (time, deltaTime) {
    if (!this.drawing) return;

    const cameraEl = this.el.sceneEl.camera.el;
    const worldPosition = new THREE.Vector3();
    cameraEl.object3D.getWorldPosition(worldPosition);

    const worldDirection = new THREE.Vector3();
    this.el.sceneEl.camera.getWorldDirection(worldDirection);
    worldDirection.multiplyScalar(0.5); // Adjust this value to move the start point
    const startPosition = worldPosition.add(worldDirection);

    if (this.points.length >= this.maxLength) {
      this.points.shift();
    }

    if (this.points.length > this.data.maxLength) {
      // Keep recent points (< maxLength)
      this.points = this.points.slice(-this.data.maxLength);
    }

    this.points.push(startPosition.clone());
    if (this.points.length > 1) {
      this.drawTube();
    }
  },

  drawTube: function () {
    if (this.points.length < 2) return;

    if (this.mesh) {
      this.el.object3D.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }

    const path = new THREE.CatmullRomCurve3(this.points, false);
    const geometry = new THREE.TubeGeometry(
      path,
      16,
      this.tubeRadius,
      6,
      false
    );
    this.mesh = new THREE.Mesh(geometry, this.lineMaterial);

    // this.el.object3D.add(this.mesh);
    // this.el.sceneEl.object3D.add(this.mesh);
  },
});
