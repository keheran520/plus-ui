/**
 * 将 SVG 转为 ICO（通过 Canvas API in Node.js 或直接嵌入 PNG）
 * 运行：node scripts/svg2ico.mjs
 *
 * 依赖：无（使用浏览器端方案，需要在浏览器控制台运行）
 *
 * 由于 Node.js 没有内置 Canvas，这里提供两种方式：
 * 1. 浏览器控制台一键生成（推荐，零依赖）
 * 2. 安装 canvas 包后本地生成
 */

// ===== 方式一：复制以下代码到浏览器控制台运行 =====
const browserCode = `
(async () => {
  const svgText = await fetch('/logo-icon.svg').then(r => r.text());
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngs = await Promise.all(sizes.map(size => new Promise(resolve => {
    const img = new Image();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d').drawImage(img, 0, 0, size, size);
      c.toBlob(b => b.arrayBuffer().then(resolve), 'image/png');
    };
    img.src = URL.createObjectURL(blob);
  })));

  // 构建 ICO 文件
  const icoData = buildIco(pngs.map((png, i) => ({ png, size: sizes[i] })));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([icoData], { type: 'image/x-icon' }));
  a.download = 'favicon.ico';
  a.click();
  console.log('✅ favicon.ico 已下载');

  function buildIco(images) {
    const headerSize = 6;
    const dirEntrySize = 16;
    const dirSize = headerSize + dirEntrySize * images.length;
    let offset = dirSize;
    const offsets = images.map(({ png }) => { const o = offset; offset += png.byteLength; return o; });
    const buf = new ArrayBuffer(offset);
    const view = new DataView(buf);
    // ICONDIR header
    view.setUint16(0, 0, true);  // reserved
    view.setUint16(2, 1, true);  // type: ICO
    view.setUint16(4, images.length, true);
    // ICONDIRENTRY
    images.forEach(({ png, size }, i) => {
      const base = headerSize + i * dirEntrySize;
      view.setUint8(base, size >= 256 ? 0 : size);
      view.setUint8(base + 1, size >= 256 ? 0 : size);
      view.setUint8(base + 2, 0);  // color count
      view.setUint8(base + 3, 0);  // reserved
      view.setUint16(base + 4, 1, true);  // planes
      view.setUint16(base + 6, 32, true); // bit count
      view.setUint32(base + 8, png.byteLength, true);
      view.setUint32(base + 12, offsets[i], true);
    });
    // PNG data
    images.forEach(({ png }, i) => {
      new Uint8Array(buf).set(new Uint8Array(png), offsets[i]);
    });
    return buf;
  }
})();
`;

console.log('='.repeat(60));
console.log('📋 请将以下代码复制到浏览器控制台运行：');
console.log('   （先在浏览器打开 http://localhost:5173 或任意页面）');
console.log('='.repeat(60));
console.log(browserCode);
console.log('='.repeat(60));
console.log('下载后将 favicon.ico 放到 plus-ui-ts/public/ 目录即可');
