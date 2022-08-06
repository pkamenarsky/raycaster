const eps = 0.001;
const inf = 9999999999;

const screenWidth = 320, screenHeight = 200;
const levelWidth = 8, levelHeight = 8;
const cellWidth = 64, cellHeight = 64;

let cellX = 2, cellY = 2;
let angle = 0.5;

const level = [
  [ 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 0, 0, 0, 0, 1, 0, 1 ],
  [ 1, 0, 0, 0, 0, 0, 0, 1 ],
  [ 1, 0, 0, 1, 1, 1, 0, 1 ],
  [ 1, 0, 0, 0, 0, 0, 0, 1 ],
  [ 1, 0, 1, 0, 0, 1, 0, 1 ],
  [ 1, 0, 0, 0, 0, 0, 0, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1 ],
];

function eq(x, y) {
  return x < (y + eps) && x > (y - eps);
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function castRay(x) {
  const angleDelta = Math.atan2((screenWidth / 2) - x, screenWidth / 2);
  const rayAngle = angle + angleDelta;
  let slopeX = Math.cos(rayAngle), slopeY = Math.sin(rayAngle);

  const stepX = Math.sign(slopeX);
  const stepY = Math.sign(slopeY);

  let distY = 0;
  let distX = 0;
  let texX = 0, texY = 0;

  // y walls
  if (eq(slopeX, 0)) {
     distY = inf;
  }
  // cast ray
  else {
    slopeY = Math.abs(Math.tan(rayAngle)) * stepY;
    let x = cellX, testY = cellY;

    while (1) {
      x += stepX;
      testY += slopeY;

      let testX = x + (stepX > 0 ? 0 : -1);
      let testYInt = Math.floor(testY);

      if (testX >= 0 && testYInt >= 0 && testX < levelWidth && testYInt < levelHeight) {
        if (level[testYInt][testX]) {
          distY = distance(cellX, cellY, x, testY);
          texY = testY - testYInt;
          break;
        }
      }
      else {
        distY = inf;
        break;
      }
    }
  }

  // x walls
  if (eq(slopeY, 0)) {
     distX = inf;
  }
  // cast ray
  else {
    slopeX = Math.abs(1 / Math.tan(rayAngle)) * stepX;
    let testX = cellX, y = cellY;

    while (1) {
      y += stepY;
      testX += slopeX;

      let testY = y + (stepY > 0 ? 0 : -1);
      let testXInt = Math.floor(testX);

      if (testXInt >= 0 && testY >= 0 && testXInt < levelWidth && testY < levelHeight) {
        if (level[testY][testXInt]) {
          distX = distance(cellX, cellY, testX, y);
          texX = testX - testXInt;
          break;
        }
      }
      else {
        distX = inf;
        break;
      }
    }
  }

  let dist, tex;

  if (distX < distY) {
    dist = distX;
    tex = texX;
  }
  else {
    dist = distY;
    tex = texY;
  }

  const proj = distance(0, 0, screenWidth / 2, x - screenWidth / 2);
  const height = proj / dist;

  return [height, tex, dist];
}

function color(r, g, b, att) {
  return 'rgb(' + r * att + ', ' + g * att + ', ' + b * att + ')';
}

function drawColumn(ctx, x, [height, texF, dist]) {
  const texX = Math.floor(texF * 64);
  const step = 64 / height;
  const att = Math.min(1, Math.max(0, 3 / dist));

  for (let i = 0, texY = 0; i < height; i++, texY += step) {
    const y = (screenHeight - height) / 2 + i;
    const checkY = Math.floor(texY / 8);
    const checkX = (Math.floor(texX / 8) + (checkY % 2 == 0 ? 0 : 1)) % 2;

    const c = checkX == 0 ? color(255, 100, 100, att) : color(100, 100, 200, att);

    ctx.fillStyle = c;
    ctx.fillRect(x, y, 2, 2);
  }
}

function draw() {
  let canvas = document.getElementById('tutorial');
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, 320, 200);

  for (let x = 0; x < 320; x++) {
    drawColumn(ctx, x, castRay(x));
  }
}

window.document.addEventListener('keydown', e => {
  if (e.key == 'ArrowLeft') {
    angle += 0.2;
  }
  else if (e.key == 'ArrowRight') {
    angle -= 0.2;
  }
  else if (e.key == 'ArrowUp') {
    cellX = Math.round(cellX + Math.cos(angle) * 1.5);
    cellY = Math.round(cellY + Math.sin(angle) * 1.5);
  }
  else if (e.key == 'ArrowDown') {
    cellX = Math.round(cellX - Math.cos(angle) * 1.5);
    cellY = Math.round(cellY - Math.sin(angle) * 1.5);
  }

  draw();
});
