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
 * Unreal Bloom Effect
 *
 * Implementation for A-Frame
 * Code modified from Akbartus's post-processing A-Frame integration
 * https://github.com/akbartus/A-Frame-Component-Postprocessing
 */
import { EffectComposer } from '../three-addon/postprocessing/EffectComposer.js';
import { RenderPass } from '../three-addon/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../three-addon/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../three-addon/postprocessing/OutputPass.js';

AFRAME.registerComponent('bloom', {
  schema: {
    enabled: { type: 'boolean', default: true },
    threshold: { type: 'number', default: 1 },
    strength: { type: 'number', default: 0.5 },
    radius: { type: 'number', default: 1 }
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
    this.bind();
  },
  update: function (oldData) {
    if (oldData.enabled === false && this.data.enabled === true) {
      this.bind();
    }

    if (oldData.enabled === true && this.data.enabled === false) {
      this.el.renderer.render = this.originalRender;
    }

    if (this.composer) {
      this.composer.dispose();
    }
    // create composer with multisampling to avoid aliasing
    var resolution = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    var renderTarget = new THREE.WebGLRenderTarget(
      resolution.width,
      resolution.height,
      { type: THREE.HalfFloatType, samples: 8 }
    );

    this.composer = new EffectComposer(this.renderer, renderTarget);

    // create render pass
    var renderScene = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderScene);

    // create bloom pass
    var strength = this.data.strength;
    var radius = this.data.radius;
    var threshold = this.data.threshold;
    if (this.bloomPass) {
      this.bloomPass.dispose();
    }
    this.bloomPass = new UnrealBloomPass(
      resolution,
      strength,
      radius,
      threshold
    );
    this.composer.addPass(this.bloomPass);

    // create output pass
    if (this.outputPass) {
      this.outputPass.dispose();
    }
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  },

  bind: function () {
    var self = this;
    var isInsideComposerRender = false;

    this.el.renderer.render = function () {
      if (isInsideComposerRender) {
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
    this.bloomPass.dispose();
    this.outputPass.dispose();
    this.composer.dispose();
  }
});