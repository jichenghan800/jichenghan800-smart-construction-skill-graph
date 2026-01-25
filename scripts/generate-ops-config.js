const fs = require('fs');
const path = require('path');

const password = process.env.OPS_PASSWORD;
const targetPath = path.join(process.cwd(), 'public', 'config', 'ops.json');

if (!password) {
  console.log('OPS_PASSWORD not set; leaving ops.json unchanged.');
  process.exit(0);
}

const payload = JSON.stringify({ password }, null, 2) + '\n';

let existing = null;
try {
  existing = fs.readFileSync(targetPath, 'utf8');
} catch (error) {
  existing = null;
}

if (existing === payload) {
  console.log('ops.json already matches OPS_PASSWORD.');
  process.exit(0);
}

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, payload, 'utf8');
console.log('Updated ops.json from OPS_PASSWORD.');
