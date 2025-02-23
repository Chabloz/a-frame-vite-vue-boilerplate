/*
MIT License

Copyright (c) 2023 Akbar S.

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
 * Outline Object Effect
 *
 * Implementation for A-Frame
 * Code modified from Akbartus's post-processing A-Frame integration
 * https://github.com/akbartus/A-Frame-Component-Postprocessing
 */
import { EffectComposer } from '../three-addon/postprocessing/EffectComposer.js';
import { RenderPass } from '../three-addon/postprocessing/RenderPass.js';
import { OutlinePass } from '../three-addon/postprocessing/OutlinePass.js';
import { OutputPass } from '../three-addon/postprocessing/OutputPass.js';

AFRAME.registerComponent('outline', {
  schema: {
    enabled: { type: 'boolean', default: true },
    strength: {type: 'number', default: 2.0},
    glow: {type: 'number', default: 1},
    color: {type: 'string', default: 'white'}
  },

  events: {
    rendererresize: function () {
      this.renderer.getSize(this.size);
      this.composer.setSize(this.size.width, this.size.height);
    }
  },

  init: function () {
    this.size = new THREE.Vector2();
    this.scene = this.el.object3D;
    this.renderer = this.el.renderer;
    this.camera = this.el.camera;
    this.originalRender = this.el.renderer.render;
    this.objectsToOutline = new Map();
    this.outlinePass = null;
    this.outputPass = null;
    this.composer = null;
    this.bind();
  },

  update: function (oldData) {
    if (oldData.enabled === false && this.data.enabled === true) {
      this.bind();
    }

    if (oldData.enabled === true && this.data.enabled === false) {
      this.el.renderer.render = this.originalRender;
    }


    if (this.composer) this.composer.dispose();

    // Create composer with multisampling to avoid aliasing
    const resolution = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const renderTarget = new THREE.WebGLRenderTarget(
      resolution.width,
      resolution.height,
      { type: THREE.HalfFloatType, samples: 8 }
    );

    this.composer = new EffectComposer(this.renderer, renderTarget);

    const renderScene = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderScene);

    if (this.outlinePass) this.outlinePass.dispose();
    this.outlinePass = new OutlinePass(resolution, this.scene, this.camera);
    this.composer.addPass(this.outlinePass);

    this.outlinePass.selectedObjects = this.getAllObjectsToOutline();
    this.outlinePass.renderToScreen = true;
    this.outlinePass.edgeStrength = this.data.strength;
    this.outlinePass.edgeGlow = this.data.glow;
    this.outlinePass.visibleEdgeColor.set(this.data.color);

    if (this.outputPass) this.outputPass.dispose();
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  },

  addObject: function (el) {
    const allChildMeshes = [];
    el.object3D.traverse(node => {
      if (!node.isMesh) return;
      allChildMeshes.push(node);
    });
    this.objectsToOutline.set(el, allChildMeshes);
    this.outlinePass.selectedObjects = this.getAllObjectsToOutline();
  },

  removeObject: function (el) {
    this.objectsToOutline.delete(el);
    this.outlinePass.selectedObjects = this.getAllObjectsToOutline();
  },

  getAllObjectsToOutline: function () {
    return Array.from(this.objectsToOutline.values()).reduce((acc, val) => acc.concat(val), []);
  },

  bind: function () {
    const self = this;
    let isInsideComposerRender = false;

    this.el.renderer.render = function () {
      if (isInsideComposerRender || !self.data.enabled) {
        self.originalRender.apply(this, arguments);
      } else {
        isInsideComposerRender = true;
        self.composer.render(self.el.sceneEl.delta / 1000);
        isInsideComposerRender = false;
      }
    };
  },

  remove: function () {
    this.el.renderer.render = this.originalRender;
    this.outlinePass.dispose();
    this.outputPass.dispose();
    this.composer.dispose();
  }
});

AFRAME.registerComponent('outline-on-event', {
  schema: {
    eventOn: { type: 'string', default: 'mouseenter' },
    eventOff: { type: 'string', default: 'mouseleave' }
  },

  init: function () {
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.el.addEventListener(this.data.eventOn, this.onEnter);
    this.el.addEventListener(this.data.eventOff, this.onLeave);
  },

  onEnter: function (evt) {
    this.el.sceneEl.components.outline.addObject(this.el);
  },

  onLeave: function (evt) {
    this.el.sceneEl.components.outline.removeObject(this.el);
  },

  remove: function () {
    this.onLeave();
    this.el.removeEventListener(this.data.eventOn, this.onEnter);
    this.el.removeEventListener(this.data.eventOff, this.onLeave);
  },

});