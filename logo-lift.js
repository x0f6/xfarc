// Chemins du logo (copiés de logo_xfdb.svg, viewBox 0 0 1200 524.42)
const LOGO_W = 1200, LOGO_H = 524.42;
const LOGO_PATHS = [
  "M0,515.77l108.08-187.88L4.5,148.4h97.55l54.78,94.74,54.5-94.74h93.43l-101.19,175.59,110.88,191.78h-97.94l-61.77-107.04-61.68,107.04H0Z",
  "M326.55,148.4h44.28v-27.67c0-33.44,3.18-57.65,9.53-72.64,6.36-14.99,16.64-26.75,30.85-35.28,14.22-8.53,31.72-12.8,52.52-12.8,22.65,0,44.83,4.15,66.56,12.45l-10.38,67.45c-12.92-3.69-25.25-5.54-37.01-5.54s-19.49,3.25-24.56,9.73c-5.08,6.49-7.61,19.23-7.61,38.22v26.07h59.5v76.45h-59.5v290.92h-79.91V224.85h-44.28v-76.45Z",
  "M830.9,515.77h-74.03v-53.96c-12.23,20.76-26.64,36.38-43.24,46.87s-33.67,15.74-51.2,15.74c-33.67,0-63.02-16.8-88.04-50.42-25.03-33.61-37.53-81.61-37.53-143.99s12.2-110.26,36.61-142.25c24.4-32,54.45-48,90.14-48,16.81,0,32.52,4.27,47.14,12.8,14.62,8.53,28.03,21.33,40.23,38.4V8.65h79.91v507.12ZM618.51,324.11c0,33.31,2.82,58.12,8.45,74.42,5.63,16.31,13.68,28.57,24.15,36.78,10.46,8.22,22.26,12.32,35.37,12.32,17.48,0,32.66-9.48,45.55-28.45,12.89-18.97,19.33-47.53,19.33-85.7,0-42.32-6.27-72.79-18.81-91.42-12.54-18.62-28.47-27.93-47.79-27.93s-34.05,9.14-46.93,27.41c-12.89,18.27-19.32,45.8-19.32,82.57Z",
  "M905.97,515.77V8.65h79.91v182.3c12.2-17.06,25.61-29.86,40.23-38.4,14.62-8.53,30.33-12.8,47.14-12.8,35.46,0,65.44,16.06,89.97,48.17,24.52,32.12,36.78,79.48,36.78,142.08s-12.55,110.38-37.65,143.99c-25.1,33.62-54.57,50.42-88.42,50.42-17.27,0-34.31-5.36-51.12-16.09-16.81-10.72-31.08-26.23-42.82-46.53v53.96h-74.03ZM985.18,324.11c0,31.69,2.99,55.86,8.99,72.51,5.99,16.66,14.53,29.32,25.6,37.99,11.07,8.68,22.71,13.01,34.94,13.01,17.52,0,32.52-9.19,44.97-27.58,12.45-18.39,18.68-47.47,18.68-87.26,0-41.86-6.29-72.1-18.85-90.72-12.57-18.62-28.54-27.93-47.91-27.93s-34.13,9.02-47.05,27.06c-12.92,18.04-19.37,45.68-19.37,82.92Z"
];

let cells = [];
let cols = 100;                        // nombre de points sur la largeur du logo
let logoW, logoH, step, dotSize, lift, radius;
let holder, fgCol;

function readColors() {
  fgCol = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
}

// recalcule tout à partir de la largeur donnée par le CSS
function measure() {
  logoW = holder.offsetWidth;
  logoH = logoW * LOGO_H / LOGO_W;
  step = logoW / cols;
  dotSize = step * 1;
  lift = logoW * 0.33;                // remontée max
  radius = logoW * 0.5;               // rayon d'influence de la souris
}

function setup() {
  readColors();
  window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', readColors);

  holder = document.getElementById('p5');
  measure();
  let cnv = createCanvas(logoW, Math.ceil(logoH + lift));
  cnv.parent(holder);
  buildGrid();
}

function buildGrid() {
  cells = [];
  const ctx = document.createElement('canvas').getContext('2d');
  const paths = LOGO_PATHS.map(d => new Path2D(d));

  const scale = logoW / LOGO_W;
  const oy = height - logoH;          // le logo est posé en bas, la marge du haut sert à la remontée

  for (let y = oy + step / 2; y < height; y += step) {
    for (let x = step / 2; x < logoW; x += step) {
      const sx = x / scale;
      const sy = (y - oy) / scale;
      if (paths.some(p => ctx.isPointInPath(p, sx, sy))) {
        cells.push({ x, y, v: 0 });
      }
    }
  }
}

function draw() {
  clear();                            // canvas transparent, voir ci-dessous
  noStroke();
  fill(fgCol);

  for (let c of cells) {
    let d = dist(mouseX, mouseY, c.x, c.y);
    let target = constrain(1 - d / radius, 0, 1);
    c.v = lerp(c.v, target, 0.15);

    let tx = c.x;   // destination en x : la même, donc pas de déplacement horizontal
    let ty = 0;     // destination en y : le haut du canvas

    let px = lerp(c.x, tx, c.v);
    let py = lerp(c.y, ty, c.v);
    ellipse(px, py, dotSize, dotSize);
  }
}

function windowResized() {
  measure();
  resizeCanvas(logoW, Math.ceil(logoH + lift));
  buildGrid();
}