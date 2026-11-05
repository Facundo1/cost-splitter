import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export default function groupPage() {
  return {
    name: 'group-page',
    apply: 'build',
    writeBundle(options) {
      const dir = options.dir;
      if (!dir) return;
      const source = readFileSync(`${dir}/index.html`, 'utf8');
      mkdirSync(`${dir}/group`, { recursive: true });
      writeFileSync(`${dir}/group/index.html`, source.replaceAll(/(href|src)="\.\//g, '$1="../'));
    },
  };
}
