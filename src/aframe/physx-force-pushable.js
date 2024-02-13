/*
From https://github.com/c-frame/physx

MIT License

Copyright (c) 2020 Zach Capalbo
Copyright (c) 2022 Lee Stemkoski
Copyright (c) 2022 Diarmid Mackenzie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/**
 * Force Pushable component.
 *
 * Based on an original component by Don McCurdy in aframe-physics-system
 *
 * Copyright (c) 2016 Don McCurdy
 *
 * Applies behavior to the current entity such that cursor clicks will apply a
 * strong impulse, pushing the entity away from the viewer.
 *
 * 2024 Nicolas Chabloz modification: add schema to allow for customizing the target and the event.
 *
 * Requires: physx
 */
AFRAME.registerComponent('physx-force-pushable', {
  schema: {
    target: {type: 'selector', default: '[camera]'},
    event: {type: 'string', default: 'click'},
    force: { default: 10 }
  },
  init: function () {

    this.pStart = new THREE.Vector3();
    this.sourceEl = this.data.target;
    this.forcePushPhysX = this.forcePushPhysX.bind(this);
    this.sourcePosition = new THREE.Vector3();
    this.force = new THREE.Vector3();
    this.pos = new THREE.Vector3();
  },

  play() {
    this.el.addEventListener(this.data.event, this.forcePushPhysX);
  },

  pause() {
    this.el.removeEventListener(this.data.event, this.forcePushPhysX);
  },

  remove() {
    this.el.removeEventListener(this.data.event, this.forcePushPhysX);
  },

  forcePushPhysX: function (e) {

    const el = this.el
    if (!el.components['physx-body']) return
    const body = el.components['physx-body'].rigidBody
    if (!body) return

    const force = this.force
    const source = this.sourcePosition

    // WebXR requires care getting camera position https://github.com/mrdoob/three.js/issues/18448
    source.setFromMatrixPosition( this.sourceEl.object3D.matrixWorld );

    el.object3D.getWorldPosition(force)
    force.sub(source)

    force.normalize();

    // not sure about units, but force seems stronger with PhysX than Cannon, so scaling down
    // by a factor of 5.
    force.multiplyScalar(this.data.force / 5);

    // use data from intersection to determine point at which to apply impulse.
    const pos = this.pos
    pos.copy(e.detail.intersection.point)
    el.object3D.worldToLocal(pos)

    body.addImpulseAtLocalPos(force, pos);
  }
});