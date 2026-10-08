function setup() {
  // Créer un canevas de 500x300 pixels
  let canvas = createCanvas(500, 300);
  
  // Paramètres
}
function draw() {
  // Nettoyer l'écran à chaque frame
  background(0)
  let nbDots = 30;
  let dotSize = 5;
  let px = 0+dotSize;
  let py = 300-dotSize;
  
  // Dessiner les points
  for (let i = 0; i < nbDots; i++) {
    // Calcul de la distance entre le point et la souris
    let d = dist(mouseX, mouseY, px, py);

    // L'effet de mouvement : plus la souris est proche, plus le point se rapproche
    let target = map(d, 0, 100, 0, 10); // Mape la distance entre 0 et 100 pour un déplacement de 0 à 10

    // Mise à jour de la position du point
    px += (mouseX - px) * 0.1;
    py += (mouseY - py) * 0.1;

    // Dessin du point
    ellipse(px, py, dotSize, dotSize);
  }
}
