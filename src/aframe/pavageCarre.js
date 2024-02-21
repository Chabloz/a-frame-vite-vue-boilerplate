// Fonction utilitaire pour générer une valeur aléatoire entre min et max
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  AFRAME.registerComponent('pavagecarre', {
    schema: {
      tileSize: { type: 'int', default: 1 },
      cols: { type: 'int', default: 4 },
      rows: { type: 'int', default: 4 },
      offset: { type: 'int', default: 0 },
      minYOffset: { type: 'number', default: 0 },
      maxYOffset: { type: 'number', default: 0.1 } // Décalage maximal sur l'axe Y
    },
  
    init: function () {
      const data = this.data;
      const el = this.el;
  
      // Create the default cube
      const cube = document.createElement('a-box');
      cube.setAttribute('color', '#7249d1');
      cube.setAttribute('width', data.tileSize);
      cube.setAttribute('height', data.tileSize);
      cube.setAttribute('depth', data.tileSize); // Depth can be set as desired
  
      // Duplicate the cube in a grid
      for (let i = 0; i < data.rows; i++) {
        for (let j = 0; j < data.cols; j++) {
          const clone = cube.cloneNode();
          const yOffset = randomInRange(data.minYOffset, data.maxYOffset); // Générer un décalage Y aléatoire
          clone.setAttribute('position', {
            x: el.object3D.position.x + j * (data.tileSize + data.offset),
            y: el.object3D.position.y + yOffset, // Ajouter le décalage Y aléatoire
            z: el.object3D.position.z + i * (data.tileSize + data.offset)
          });
          // alterne les couleurs de chaque cube comme un echiquier 
            if ((i + j) % 2 === 0) {
                clone.setAttribute('color', '#5365bd');
            }
          document.querySelector('a-scene').appendChild(clone);
        }
      }
    }
  });
  