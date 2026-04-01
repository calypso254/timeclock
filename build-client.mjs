import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const rootDir = process.cwd();
const sourceFiles = [
  'assets/js/helpers.jsx',
  'assets/js/components.jsx',
  'assets/js/app.jsx',
];
const tempInputPath = join(rootDir, '.tmp-app-combined.jsx');
const outputPath = join(rootDir, 'assets/js/app.bundle.js');

const combinedSource = sourceFiles
  .map(filePath => readFileSync(join(rootDir, filePath), 'utf8'))
  .join('\n\n');

writeFileSync(tempInputPath, combinedSource, 'utf8');

const command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const args = process.platform === 'win32'
  ? [
      '/c',
      'npx',
      'esbuild',
      tempInputPath,
      `--outfile=${outputPath}`,
      '--format=iife',
      '--jsx=transform',
      '--loader:.jsx=jsx',
    ]
  : [
      'esbuild',
      tempInputPath,
      `--outfile=${outputPath}`,
      '--format=iife',
      '--jsx=transform',
      '--loader:.jsx=jsx',
    ];

const result = spawnSync(command, args, {
  cwd: rootDir,
  stdio: 'inherit',
});

try {
  unlinkSync(tempInputPath);
} catch (_) {
  // Ignore cleanup failures so the build result is still reported.
}

if (result.status !== 0) {
  if (result.error) {
    console.error(result.error);
  }
  process.exit(result.status ?? 1);
}
