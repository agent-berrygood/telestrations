import { mkdir, copyFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
await mkdir(new URL('dist/', root), { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'game.js', 'favicon.svg']) {
  await copyFile(new URL(`public/${file}`, root), new URL(`dist/${file}`, root));
}
console.log('Built telestrations → dist/');
