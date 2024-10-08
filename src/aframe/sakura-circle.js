AFRAME.registerComponent('sakura-circle', {
  schema: {
    resolution: {type: 'int', default: 512},
    backSide: {type: 'boolean', default: false},
  },

  init: function () {
    this.material = this.el.getObject3D('mesh').material = new THREE.ShaderMaterial({

      uniforms: {
        time: {value: 0},
        resolution: {value: this.resolution}
      },

      vertexShader: /*glsl*/ `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: /*glsl*/ `
        precision highp float; // mediump or highp

        #define PI 3.14159265359
        #define TAU 6.28318530718

        uniform float time;
        uniform vec2 resolution;

        varying vec2 vUv;

        vec2 rotate2D(vec2 _st, float _angle){
          _st -= 0.5;
          _st =  mat2(cos(_angle),-sin(_angle),
                      sin(_angle),cos(_angle)) * _st;
          _st += 0.5;
          return _st;
        }

        vec2 random2(vec2 st){
          st = vec2( dot(st,vec2(127.1,311.7)),
                    dot(st,vec2(269.5,183.3)) );
          return -1.0 + 2.0*fract(sin(st)*43758.5453123);
        }


        void main() {
          vec2 st = vUv;

          // scale the space
          vec2 stTemp = fract(st * 10.);
          float y1 = step(.5,mod(stTemp.x,2.0));
          float y2 = -1.*step(0.5,1.-mod(stTemp.x,2.0));

          // scale the space
          st *= 10.;

          // rotate the space
          st = rotate2D(st,PI*0.25 + (y1 + y2)*time/15000.0);

          vec2 i_st = floor(st);
          vec2 f_st = fract(st);

          float m_dist = 1.;  // minimum distance
          for (int y= -1; y <= 1; y++) {
            for (int x= -1; x <= 1; x++) {
              // cellules voisines
              vec2 neighbor = vec2(float(x),float(y));
              vec2 point = random2(i_st + neighbor);
              point = .5 + .5*sin(time/2000. + TAU*point);
              // Vector between the pixel and the point
              vec2 diff = neighbor + point - f_st;
              float dist = length(diff);
              m_dist = min(m_dist, dist);
            }
          }

          vec3 color = vec3(.0);
          color += m_dist;
          color -= step(.7,abs(sin(27.0*m_dist)))*.5;
          color += vec3(1./2., 0., abs(cos(time/8000.)));

          gl_FragColor = vec4(color,1.0);
        }
      `,

    });

    if (this.data.backSide) this.material.side = THREE.BackSide;
  },

  tick: function (elapsedT) {
    this.material.uniforms.time.value = elapsedT;
  },

  remove: function () {
    this.material.dispose();
  },

});