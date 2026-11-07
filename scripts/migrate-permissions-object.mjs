/**
 * One-shot: replace PERMISSION_XXX imports/usages with PERMISSIONS.XXX
 * using keys from lib/constants/permission-codes.ts (avoids false positives).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const PERMISSION_CODES_FILE = path.join(root, 'lib/constants/permission-codes.ts')
const pcSource = fs.readFileSync(PERMISSION_CODES_FILE, 'utf8')

const keys = [...pcSource.matchAll(/^\s{2}([A-Z][A-Z0-9_]*):/gm)].map((m) => m[1])
if (keys.length === 0) {
  console.error('No PERMISSIONS keys found in permission-codes.ts')
  process.exit(1)
}

const keyAlt = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
const usageRe = new RegExp(`\\bPERMISSION_(${keyAlt})\\b`, 'g')
// Use [^}]* so we never span from the first `import {` in the file to the
// permission-codes import (would delete NextResponse, zod, etc.).
const importRe = new RegExp(
  String.raw`import\s*\{[^}]*\}\s*from\s*['"]@/lib/constants/permission-codes['"]\s*\n?`,
  'g'
)

const newImportLine = `import { PERMISSIONS } from '@/lib/constants/permission-codes'\n`

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith('.')) continue
    const p = path.join(dir, name.name)
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === '.next') continue
      walk(p, out)
    } else if (/\.(ts|tsx)$/.test(name.name)) out.push(p)
  }
  return out
}

const dirs = [
  path.join(root, 'app'),
  path.join(root, 'components'),
  path.join(root, 'features'),
  path.join(root, 'lib'),
  path.join(root, 'services'),
]

let changed = 0
for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue
  for (const file of walk(dir)) {
    if (file.replace(/\\/g, '/').endsWith('lib/constants/permission-codes.ts')) continue

    let s = fs.readFileSync(file, 'utf8')
    if (!s.includes("@/lib/constants/permission-codes")) continue

    const before = s
    s = s.replace(importRe, newImportLine)
    s = s.replace(usageRe, 'PERMISSIONS.$1')

    if (s !== before) {
      fs.writeFileSync(file, s)
      changed++
      console.log('updated', path.relative(root, file))
    }
  }
}

console.log('done, files changed:', changed)
