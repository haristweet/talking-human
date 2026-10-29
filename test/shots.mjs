// 絵で確かめる台本：決まった時刻のコマを描いて1枚の一覧にする
//   python3 -m http.server 8805 &  node test/shots.mjs [出力.png]
// 既定は顔ごとに［線画・ポリゴン］を、カットの違う時刻で並べる。BAD END を見るとき：
//   TIMES=13,14.5,16.2,17.2,17.55,18,18.8,19.6 ROWS='[["a","wire",true,4,true]]'
//   ROWS の各行は［顔・描き方・走査線・カットの間隔・BAD END］。BAD END は 20 秒の歌声ふうの曲を入れて、17.4 秒で砕ける
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const out = process.argv[2] || 'shots.png';
const LEN = 20;
const TIMES = (process.env.TIMES || '1,3,5.2,9.4,13').split(',').map(Number);
const ROWS = JSON.parse(process.env.ROWS || JSON.stringify(['a', 'b', 'c', 'd'].flatMap(k => [[k, 'wire', true, 4, false], [k, 'solid', false, 4, false]])));
// 歌声ふうの音：2〜3 拍ごとに大きくなったり休んだりする 400Hz あたりの音
const sr = 8000, n = sr * LEN, wav = Buffer.alloc(44 + n * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + n * 2, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sr, 24); wav.writeUInt32LE(sr * 2, 28);
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) { const t = i / sr, env = Math.max(0, Math.sin(t * Math.PI * 2.2)) ** 2 * (Math.sin(t * .7) > -.3 ? 1 : 0); wav.writeInt16LE(Math.round(9000 * env * Math.sin(t * 6.283 * 420)), 44 + i * 2); }
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
p.on('pageerror', e => console.error('pageerror', e.message));
await p.goto('http://localhost:8805/');
await p.evaluate(() => localStorage.clear());
await p.reload();
await p.setInputFiles('#afile', { name: 'test.wav', mimeType: 'audio/wav', buffer: wav });
await p.waitForFunction(() => typeof snd !== 'undefined' && snd);
const cells = [];
for (const [face, style, crt, cutLen, bad] of ROWS) for (const t of TIMES) {
  cells.push(await p.evaluate(([face, style, crt, cutLen, bad, t]) => {
    playing = false; exporting = true;
    Object.assign(cfg, { style, crt, cutLen, aspect: '16:9', seed: 1234, scenes: [face], badEnd: !!bad });
    const s = newSim(), dt = 1 / 30;
    for (let k = 0; k < Math.round(t / dt); k++) s.update(dt);
    const c = document.createElement('canvas'); c.width = 480; c.height = 270;
    drawFrame(c.getContext('2d'), 480, 270, s, lookFor(s));
    return c.toDataURL();
  }, [face, style, crt, cutLen, bad, t]));
}
const html = `<body style="margin:0;background:#222;color:#ccc;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat(${TIMES.length},240px);gap:2px">`
  + TIMES.map(t => `<div>${t}s</div>`).join('') + cells.map(u => `<img src="${u}" width=240>`).join('') + '</div>';
await p.setContent(html);
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log('wrote', out);
