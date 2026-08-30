const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}
const table = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

const buf = fs.readFileSync('public/veyra-stickers/doc.png');
let pos = 8, width, height;
const idatChunks = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString('ascii');
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
  } else if (type === 'IDAT') {
    idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const raw = zlib.inflateSync(Buffer.concat(idatChunks));
const bpp = 3;
const stride = 1 + width * bpp;
const rgb = Buffer.alloc(width * height * 3);

let prevRow = Buffer.alloc(width * bpp);
for (let y = 0; y < height; y++) {
  const filter = raw[y * stride];
  const row = raw.slice(y * stride + 1, (y + 1) * stride);
  const unfilt = Buffer.alloc(width * bpp);
  for (let x = 0; x < width * bpp; x++) {
    const a = x >= bpp ? unfilt[x - bpp] : 0;
    const b = prevRow[x];
    const c = x >= bpp ? prevRow[x - bpp] : 0;
    let val = row[x];
    if (filter === 1) val = (val + a) & 0xff;
    else if (filter === 2) val = (val + b) & 0xff;
    else if (filter === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
    else if (filter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      val = (val + pr) & 0xff;
    }
    unfilt[x] = val;
  }
  unfilt.copy(rgb, y * width * 3);
  prevRow = unfilt;
}

// Flood fill from edges for checkerboard
const isBg = (idx) => {
  const r = rgb[idx * 3], g = rgb[idx * 3 + 1], b = rgb[idx * 3 + 2];
  return (r >= 225 && g >= 225 && b >= 225 && Math.abs(r - g) <= 10 && Math.abs(g - b) <= 10 && Math.abs(r - b) <= 10);
};

const visited = new Uint8Array(width * height);
const queue = [];

for (let x = 0; x < width; x++) {
  if (isBg(x)) { visited[x] = 1; queue.push(x); }
  const bot = (height - 1) * width + x;
  if (isBg(bot)) { visited[bot] = 1; queue.push(bot); }
}
for (let y = 0; y < height; y++) {
  const left = y * width;
  if (isBg(left) && !visited[left]) { visited[left] = 1; queue.push(left); }
  const right = y * width + (width - 1);
  if (isBg(right) && !visited[right]) { visited[right] = 1; queue.push(right); }
}

let head = 0;
while (head < queue.length) {
  const curr = queue[head++];
  const cx = curr % width;
  const cy = Math.floor(curr / width);

  const neighbors = [
    cx > 0 ? curr - 1 : -1,
    cx < width - 1 ? curr + 1 : -1,
    cy > 0 ? curr - width : -1,
    cy < height - 1 ? curr + width : -1
  ];

  for (const n of neighbors) {
    if (n !== -1 && !visited[n] && isBg(n)) {
      visited[n] = 1;
      queue.push(n);
    }
  }
}

// Soft feather 1 pixel along background border to eliminate halo
const alpha = new Uint8Array(width * height);
for (let i = 0; i < width * height; i++) {
  if (!visited[i]) {
    alpha[i] = 255;
  }
}

// Find bounding box of foreground
let minX = width, maxX = 0, minY = height, maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    if (alpha[idx] > 0) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const pad = 4;
minX = Math.max(0, minX - pad);
maxX = Math.min(width - 1, maxX + pad);
minY = Math.max(0, minY - pad);
maxY = Math.min(height - 1, maxY + pad);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

console.log('Final crop:', { cropW, cropH, minX, maxX, minY, maxY });

// Build RGBA output
const outStride = 1 + cropW * 4;
const outRaw = Buffer.alloc(cropH * outStride);

for (let y = 0; y < cropH; y++) {
  const srcY = minY + y;
  outRaw[y * outStride] = 0; // Filter None
  for (let x = 0; x < cropW; x++) {
    const srcX = minX + x;
    const srcIdx = srcY * width + srcX;
    const outPos = y * outStride + 1 + x * 4;
    outRaw[outPos] = rgb[srcIdx * 3];
    outRaw[outPos + 1] = rgb[srcIdx * 3 + 1];
    outRaw[outPos + 2] = rgb[srcIdx * 3 + 2];
    outRaw[outPos + 3] = alpha[srcIdx];
  }
}

const compressed = zlib.deflateSync(outRaw, { level: 9 });

const ihdrBuf = Buffer.alloc(13);
ihdrBuf.writeUInt32BE(cropW, 0);
ihdrBuf.writeUInt32BE(cropH, 4);
ihdrBuf[8] = 8; // 8 bit depth
ihdrBuf[9] = 6; // RGBA colorType
ihdrBuf[10] = 0; // compression
ihdrBuf[11] = 0; // filter
ihdrBuf[12] = 0; // interlace

const pngSignature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);
const ihdrChunk = makeChunk('IHDR', ihdrBuf);
const idatChunk = makeChunk('IDAT', compressed);
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);

fs.writeFileSync('public/veyra-stickers/doc.png', finalPng);
fs.writeFileSync('veyra_mini_me_characters_separate/doc.png', finalPng);
console.log('Saved transparent doc.png successfully! File size:', finalPng.length);
