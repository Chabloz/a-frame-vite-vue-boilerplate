AFRAME.registerComponent('teleport-camera-rig', {
  multiple: true,

  schema: {
    // The camera rig must be a direct child of <a-scene>
    rig: {type: 'selector', default: '#camera-rig'},
    camera: {type: 'selector', default: '[camera]'},
    on: {type: 'string', default: 'click'},
    x: {type: 'number', default: 0},
    y: {type: 'number', default: 0},
    z: {type: 'number', default: 0},
    handleRotation: {type: 'boolean', default: true},
    rot: {type: 'number', default: 0}, // rotation in degrees
  },

  init: function () {
    this.onEvent = this.onEvent.bind(this);
    this.el.addEventListener(this.data.on, this.onEvent);
  },

  onEvent: function () {
    // Put the rig at the specified position
    this.data.rig.object3D.position.x = this.data.x;
    this.data.rig.object3D.position.y = this.data.y;
    this.data.rig.object3D.position.z = this.data.z;
    // Put the camera at the centre of the rig
    this.data.camera.object3D.position.x = 0;
    this.data.camera.object3D.position.z = 0;
    // Rotate the rig if needed
    if (this.data.handleRotation) {
      // Take the camera quaternion
      const quaternion = new THREE.Quaternion();
      quaternion.setFromEuler(new THREE.Euler(0, this.data.camera.object3D.rotation.y, 0));
      // invert it to nullify the camera rotation
      quaternion.invert();
      // convert this.data.rot to a quaternion
      const quaternionToApply = new THREE.Quaternion();
      const rot = THREE.MathUtils.degToRad(this.data.rot);
      quaternionToApply.setFromEuler(new THREE.Euler(0, rot, 0));
      // combine the two quaternions and apply to the rig
      quaternion.multiply(quaternionToApply);
      this.data.rig.object3D.setRotationFromQuaternion(quaternion);
    }
  },

  update: function (oldData) {
    if (oldData.on != this.data.on) {
      this.el.removeEventListener(oldData.on, this.onEvent);
      this.el.addEventListener(this.data.on, this.onEvent);
    }
  },

  remove: function () {
    this.el.removeEventListener(this.data.on, this.onEvent);
  },

});