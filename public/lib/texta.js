// --- THREE.Font / THREE.FontLoader / THREE.TextGeometry shims (removed from core in r125) ---
(function () {
  if (!THREE.Font) {
    function createPaths(text, size, data) {
      var chars = Array.from ? Array.from(text) : text.split('');
      var scale = size / data.resolution;
      var lineHeight = (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) * scale;
      var paths = [];
      var offsetX = 0, offsetY = 0;
      for (var i = 0; i < chars.length; i++) {
        var char = chars[i];
        if (char === '\n') {
          offsetX = 0; offsetY -= lineHeight;
        } else {
          var ret = createPath(char, scale, offsetX, offsetY, data);
          if (ret) { offsetX += ret.offsetX; paths.push(ret.path); }
        }
      }
      return paths;
    }
    function createPath(char, scale, offsetX, offsetY, data) {
      var glyph = data.glyphs[char] || data.glyphs['?'];
      if (!glyph) { console.warn('THREE.Font: missing glyph "' + char + '"'); return null; }
      var path = new THREE.ShapePath();
      var out = glyph._cache || (glyph._cache = (glyph.o || '').split(' '));
      for (var i = 0, l = out.length; i < l; ) {
        var a = out[i++];
        if (a === 'm') { path.moveTo(out[i++] * scale + offsetX, out[i++] * scale + offsetY); }
        else if (a === 'l') { path.lineTo(out[i++] * scale + offsetX, out[i++] * scale + offsetY); }
        else if (a === 'q') {
          var cpx = out[i++]*scale+offsetX, cpy = out[i++]*scale+offsetY;
          path.quadraticCurveTo(out[i++]*scale+offsetX, out[i++]*scale+offsetY, cpx, cpy);
        } else if (a === 'b') {
          var cpx = out[i++]*scale+offsetX, cpy = out[i++]*scale+offsetY;
          var cp1x = out[i++]*scale+offsetX, cp1y = out[i++]*scale+offsetY;
          path.bezierCurveTo(cp1x, cp1y, out[i++]*scale+offsetX, out[i++]*scale+offsetY, cpx, cpy);
        }
      }
      return { offsetX: glyph.ha * scale, path: path };
    }
    THREE.Font = function Font(data) {
      this.isFont = true;
      this.type = 'Font';
      this.data = data;
    };
    THREE.Font.prototype.generateShapes = function (text, size) {
      size = size !== undefined ? size : 100;
      var shapes = [];
      var paths = createPaths(text, size, this.data);
      for (var p = 0; p < paths.length; p++) {
        Array.prototype.push.apply(shapes, paths[p].toShapes());
      }
      return shapes;
    };
  }

  if (!THREE.FontLoader) {
    THREE.FontLoader = function FontLoader(manager) {
      this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
      this.path = '';
    };
    THREE.FontLoader.prototype.setPath = function (value) { this.path = value; return this; };
    THREE.FontLoader.prototype.load = function (url, onLoad, onProgress, onError) {
      var self = this;
      var loader = new THREE.FileLoader(this.manager);
      loader.setPath(this.path);
      loader.load(url, function (text) {
        var json;
        try { json = JSON.parse(text); } catch (e) { console.warn('THREE.FontLoader: parse error'); if (onError) onError(e); return; }
        if (onLoad) onLoad(self.parse(json));
      }, onProgress, onError);
    };
    THREE.FontLoader.prototype.parse = function (json) {
      return new THREE.Font(json);
    };
  }

  if (!THREE.TextGeometry) {
    THREE.TextGeometry = class TextGeometry extends THREE.ExtrudeGeometry {
      constructor(text, parameters) {
        parameters = parameters || {};
        var font = parameters.font;
        var shapes = (font && font.generateShapes)
          ? font.generateShapes(text, parameters.size !== undefined ? parameters.size : 100)
          : [];
        if (!font || !font.generateShapes) {
          console.error('THREE.TextGeometry: "font" parameter must be a THREE.Font instance.');
        }
        super(shapes, {
          depth:          parameters.height         !== undefined ? parameters.height         : 50,
          curveSegments:  parameters.curveSegments  !== undefined ? parameters.curveSegments  : 12,
          bevelThickness: parameters.bevelThickness !== undefined ? parameters.bevelThickness : 10,
          bevelSize:      parameters.bevelSize      !== undefined ? parameters.bevelSize      : 8,
          bevelEnabled:   parameters.bevelEnabled   !== undefined ? parameters.bevelEnabled   : false
        });
        this.type = 'TextGeometry';
      }
    };
  }
})();
// --- end shims ---

!function(e){function t(n){if(o[n])return o[n].exports;var r=o[n]={exports:{},id:n,loaded:!1};return e[n].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t){var o=AFRAME.utils.debug,n=o("aframe-text-component:error"),r=new THREE.FontLoader;AFRAME.registerComponent("text-geometry",{schema:{bevelEnabled:{default:!1},bevelSize:{default:8,min:0},bevelThickness:{default:12,min:0},curveSegments:{default:12,min:0},font:{type:"asset",default:"https://rawgit.com/ngokevin/kframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json"},height:{default:.05,min:0},size:{default:.5,min:0},style:{default:"normal",oneOf:["normal","italics"]},weight:{default:"normal",oneOf:["normal","bold"]},value:{default:""}},update:function(e){var t=this.data,o=this.el,a=o.getOrCreateObject3D("mesh",THREE.Mesh);t.font.constructor===String?r.load(t.font,function(e){var o=AFRAME.utils.clone(t);o.font=e,a.geometry=new THREE.TextGeometry(t.value,o)}):t.font.constructor===Object?a.geometry=new THREE.TextGeometry(t.value,t):n("Must provide `font` (typeface.json) or `fontPath` (string) to text component.")}})}]);