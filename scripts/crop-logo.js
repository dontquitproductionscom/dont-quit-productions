const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function autocrop(srcPath, destPath, paddingPct = 0.04) {
  const data = fs.readFileSync(srcPath);
  const png = PNG.sync.read(data);
  const { width, height } = png;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const alpha = png.data[idx + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const padX = Math.round(boxW * paddingPct);
  const padY = Math.round(boxH * paddingPct);

  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  const cropW = Math.min(width - minX, boxW + padX * 2);
  const cropH = Math.min(height - minY, boxH + padY * 2);

  const out = new PNG({ width: cropW, height: cropH });
  PNG.bitblt(png, out, minX, minY, cropW, cropH, 0, 0);

  fs.writeFileSync(destPath, PNG.sync.write(out));
  console.log(`${path.basename(srcPath)}: ${width}x${height} -> ${cropW}x${cropH} (cropped ${destPath})`);
}

const dir = path.join(__dirname, '..', 'assets', 'img');
autocrop(path.join(dir, 'dqp-mark.png'), path.join(dir, 'dqp-mark-cropped.png'));
autocrop(path.join(dir, 'dqp-lockup-horizontal.png'), path.join(dir, 'dqp-lockup-horizontal-cropped.png'));
autocrop(path.join(dir, 'dqp-lockup-full.png'), path.join(dir, 'dqp-lockup-full-cropped.png'));
