import { copyPosition, copyRotation } from '../utils/aframe.js';
import Keyboard from '../utils/keyboard.js';


AFRAME.registerSystem('simple-grab', {
  schema: {
    allowMidAirDrop: {type: 'boolean', default: false},
    handRight: {type: 'selector', default: '#hand-right'},
    handLeft: {type: 'selector', default: '#hand-left'},
    dummyHandRight: {type: 'selector', default: '#dummy-hand-right'},
    dummyHandLeft: {type: 'selector', default: '#dummy-hand-left'},
    nonVrCursor: {type: 'selector', default: '[cursor]'},
    leftDummyHandKey: {type: 'string', default: 'ShiftLeft'},
    grabEventName:  {type: 'string', default: 'grab'},
    dropEventName:  {type: 'string', default: 'drop'},
    undropEventName:  {type: 'string', default: 'undrop'},
  },

  init: function () {
    this.leftHand = this.data.handLeft;
    this.rightHand = this.data.handRight;
    this.dummyHandLeft = this.data.dummyHandLeft;
    this.dummyHandRight = this.data.dummyHandRight;
    this.nonVrCursor = this.data.nonVrCursor;
    this.keyboard = new Keyboard();
    this.currentGrab = new Map();
    this.currentGrab.set(this.leftHand, null);
    this.currentGrab.set(this.rightHand, null);
    this.currentGrab.set(this.dummyHandLeft, null);
    this.currentGrab.set(this.dummyHandRight, null);
    this.isGrabInProgress = false;
    this.timerGrabInProgress = null;

    if (this.data.allowMidAirDrop) {
      this.onSceneClick = this.onSceneClick.bind(this);
      this.onLeftHandTrigger = this.onLeftHandTrigger.bind(this);
      this.onRightHandTrigger = this.onRightHandTrigger.bind(this);
      document.addEventListener('click', this.onSceneClick);
      // For VR, listen to the controller trigger events
      this.leftHand.addEventListener('triggerdown', this.onLeftHandTrigger);
      this.rightHand.addEventListener('triggerdown', this.onRightHandTrigger);
    }
  },

  onSceneClick: function (evt) {
    const hand = this.getDummyHand();
    setTimeout(() => this.dropMidAir(hand), 200);
  },

  onLeftHandTrigger: function (evt) {
    setTimeout(() => this.dropMidAir(this.leftHand), 200);
  },

  onRightHandTrigger: function (evt) {
    setTimeout(() => this.dropMidAir(this.rightHand), 200);
  },

  dropMidAir: function (hand) {
    if (this.isGrabInProgress) return;
    const currentGrab = this.getCurrentGrab(hand);
    if (currentGrab === null) return;
    this.removeCurrentGrab(hand, currentGrab, null);
    currentGrab.components['simple-grab'].grabbedBy = null;
  },

  setCurrentGrab: function (hand, el) {
    this.currentGrab.set(hand, el);
    // Emit the grab event on: the grabbed entity, the hand and the scene
    el.emit(this.data.grabEventName, {hand, el});
    hand.emit(this.data.grabEventName, {hand, el});
    this.el.emit(this.data.grabEventName, {hand, el});
  },

  getCurrentGrab: function (hand) {
    return this.currentGrab.get(hand);
  },

  removeCurrentGrab: function (hand, el, dropZone) {
    this.currentGrab.set(hand, null);
    // Emit the drop event on: the grabbed entity, the hand, the scene and the drop zone (if any)
    el.emit(this.data.dropEventName, {hand, el, dropZone});
    hand.emit(this.data.dropEventName, {hand, el, dropZone});
    if (dropZone) dropZone.emit(this.data.dropEventName, {hand, el, dropZone});
    this.el.emit(this.data.dropEventName, {hand, el, dropZone});
  },

  removeFromDropZone: function (hand, el, dropZone) {
    dropZone.emit(this.data.undropEventName, {hand, el, dropZone});
    this.el.emit(this.data.undropEventName, {hand, el, dropZone});
  },

  getDummyHand: function () {
    return this.keyboard.isKeyDown(this.data.leftDummyHandKey) ?
           this.dummyHandLeft :
           this.dummyHandRight;
  },

  getHand: function (evt) {
    const cursor = evt.detail.cursorEl;
    // for non vr cursor, test if the default left hand key is pressed to use the left hand
    // otherwise use the right hand
    if (cursor === this.nonVrCursor) {
      return this.getDummyHand();
    } else {
      // for VR "hands" check if the cursor is in the left or right hand
      const isLeftHand = cursor === this.leftHand;
      const isRightHand = cursor === this.rightHand;
      // if it's not a hand, return
      if (!isLeftHand && !isRightHand) return null;
      return cursor;
    }
  }

});

AFRAME.registerComponent('simple-grab', {

  schema: {
    event: {type: 'string', default: 'click'},
  },

  init: function () {
    this.onEvent = this.onEvent.bind(this);
    this.el.addEventListener(this.data.event, this.onEvent);
    this.grabbedBy = null;
    this.actualDropZone = null;
  },

  onEvent: function (evt) {
    // If the event is not from a hand, return
    this.grabbedBy = this.system.getHand(evt);
    if (this.grabbedBy === null) return;

    const currentGrab = this.system.getCurrentGrab(this.grabbedBy);
    // Do nothing if the object is already grabbed by the same hand
    if (currentGrab === this.el) return;

    this.system.isGrabInProgress = true;
    if (this.system.timerGrabInProgress) clearTimeout(this.system.timerGrabInProgress);
    this.system.timerGrabInProgress = setTimeout(() => this.system.isGrabInProgress = false, 500);

    // If something already grabbed, switch it
    if (currentGrab) {
      copyPosition(this.el, currentGrab);
      copyRotation(this.el, currentGrab);
      currentGrab.components['simple-grab'].grabbedBy = null;
      // If the object was in a drop zone, remove it from there
      // and add the grabbed object to the drop zone
      if (this.actualDropZone) {
        currentGrab.components['simple-grab'].actualDropZone = this.actualDropZone;
        this.actualDropZone.components['simple-grab-drop-zone'].droppedEl = currentGrab;
        this.system.removeCurrentGrab(this.grabbedBy, currentGrab, this.actualDropZone);
      } else {
        this.system.removeCurrentGrab(this.grabbedBy, currentGrab, null);
      }
    }

    this.system.setCurrentGrab(this.grabbedBy, this.el);

    // If the object was grabbed from a drop zone, remove it from there
    if (this.actualDropZone) {
      if (!currentGrab) {
        // The drop zone is now empty, trigger an undrop event
        this.system.removeFromDropZone(this.grabbedBy, this.actualDropZone.components['simple-grab-drop-zone'].droppedEl, this.actualDropZone);
        this.actualDropZone.components['simple-grab-drop-zone'].droppedEl = null;
      }
      this.actualDropZone = null;
    }
  },

  remove: function () {
    this.el.removeEventListener(this.data.event, this.onEvent);
  },

  tick: function () {
    if (!this.grabbedBy) return;
    copyPosition(this.grabbedBy, this.el);
    copyRotation(this.grabbedBy, this.el, true);
  }

});

AFRAME.registerComponent('simple-grab-drop-zone', {

  schema: {
    dropOnly: {type: 'boolean', default: false},
    event: {type: 'string', default: 'click'},
  },

  init: function () {
    this.system = this.el.sceneEl.systems['simple-grab'];
    this.onEvent = this.onEvent.bind(this);
    this.droppedEl = null;
    this.el.addEventListener(this.data.event, this.onEvent);
  },

  onEvent: function (evt) {
    // if the event is not from a hand, return
    this.grabbedBy = this.system.getHand(evt);
    if (this.grabbedBy === null) return;

    const currentGrab = this.system.getCurrentGrab(this.grabbedBy);

    // disallow dropping if the drop zone is already occupied
    if (this.data.dropOnly && this.droppedEl !== null) return;

    this.system.isGrabInProgress = true;
    if (this.system.timerGrabInProgress) clearTimeout(this.system.timerGrabInProgress);
    this.system.timerGrabInProgress = setTimeout(() => this.system.isGrabInProgress = false, 500);

    // drop the current grab
    if (currentGrab) {
      currentGrab.components['simple-grab'].grabbedBy = null;
      currentGrab.components['simple-grab'].actualDropZone = this.el;
      this.system.removeCurrentGrab(this.grabbedBy, currentGrab, this.el);
      copyPosition(this.el, currentGrab);
      copyRotation(this.el, currentGrab, true);
      if (this.data.dropOnly) currentGrab.removeAttribute('simple-grab');
    }

    // if something was already in there, put it in the hand
    if (!this.data.dropOnly && this.droppedEl !== null) {
      this.system.setCurrentGrab(this.grabbedBy, this.droppedEl);
      this.droppedEl.components['simple-grab'].grabbedBy = this.grabbedBy;
      this.droppedEl.components['simple-grab'].actualDropZone = null;
      const oldDroppedEl = this.droppedEl;
      this.droppedEl = null;
      // if the drop zone is now empty, trigger an undrop event
      if (!currentGrab) this.system.removeFromDropZone(this.grabbedBy, oldDroppedEl, this.el);
    }

    if (currentGrab) this.droppedEl = currentGrab;
  },

  remove: function () {
    this.el.removeEventListener(this.data.event, this.onEvent);
  },

});