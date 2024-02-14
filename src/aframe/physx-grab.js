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
 * Grab component.
 *
 * Based on an original component by Don McCurdy in aframe-physics-system
 *
 * Copyright (c) 2016 Don McCurdy
 *
 * 2024 Nicolas Chabloz modification: Test if the entity has a physx-grabbable attribute before grabbing it.
 *
 * Requires: physx
 */
AFRAME.registerComponent('physx-grab', {
  init: function () {

    // If a state of "grabbed" is set on a physx-body entity,
    // the entity is automatically transformed into a kinematic entity.
    // To avoid triggering this (we want to grab using constraints, and leave the
    // body as dynamic), we use a non-clashing name for the state we set on the entity when
    // grabbing it.
    this.GRABBED_STATE = 'grabbed-dynamic';

    this.grabbing = false;
    this.hitEl =      /** @type {AFRAME.Element}    */ null;
    this.physics =    /** @type {AFRAME.System}     */ this.el.sceneEl.systems.physics;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);

  },

  play: function () {
    var el = this.el;
    el.addEventListener('contactbegin', this.onHit);
    el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('contactbegin', this.onHit);
    el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },

  onGripClose: function (evt) {
    this.grabbing = true;
  },

  onGripOpen: function (evt) {
    var hitEl = this.hitEl;
    this.grabbing = false;
    if (!hitEl) { return; }
    hitEl.removeState(this.GRABBED_STATE);

    this.hitEl = undefined;

    this.removeJoint()
  },

  onHit: function (evt) {
    var hitEl = evt.detail.otherComponent.el;
    if (!hitEl.hasAttribute('physx-grabbable')) return;

    // If the element is already grabbed (it could be grabbed by another controller).
    // If the hand is not grabbing the element does not stick.
    // If we're already grabbing something you can't grab again.
    if (!hitEl || hitEl.is(this.GRABBED_STATE) || !this.grabbing || this.hitEl) { return; }
    hitEl.addState(this.GRABBED_STATE);
    this.hitEl = hitEl;

    this.addJoint(hitEl, evt.target)
  },

  addJoint(el, target) {

    this.removeJoint()

    this.joint = document.createElement('a-entity')
    this.joint.setAttribute("physx-joint", `type: Fixed; target: #${target.id}`)

    el.appendChild(this.joint)
  },

  removeJoint() {

    if (!this.joint) return
    this.joint.parentElement.removeChild(this.joint)
    this.joint = null
  }
});