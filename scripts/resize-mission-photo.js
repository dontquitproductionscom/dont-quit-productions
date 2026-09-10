const sharp = require('sharp');
const path = require('path');

const src = process.argv[2];
const dest = process.argv[3];

sharp(src)
  .resize({ width: 1600, withoutEnlargement: true })
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile(dest)
  .then(info => console.log('wrote', dest, info))
  .catch(err => { console.error(err); process.exit(1); });
