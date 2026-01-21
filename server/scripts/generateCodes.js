const { db } = require('../database');

const args = process.argv.slice(2);
const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 10;
const length = parseInt(args.find(arg => arg.startsWith('--length='))?.split('=')[1]) || 12;

if (count < 1 || count > 1000) {
  console.error('Count must be between 1 and 1000');
  process.exit(1);
}

if (length < 6 || length > 32) {
  console.error('Length must be between 6 and 32');
  process.exit(1);
}

console.log(`Generating ${count} codes with length ${length}...`);

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const codes = [];

try {
  const stmt = db.prepare('SELECT code FROM access_codes');
  const rows = stmt.all();
  const existingCodes = new Set(rows.map(row => row.code));

  let generated = 0;
  let attempts = 0;
  const maxAttempts = count * 100;
  const insertStmt = db.prepare('INSERT INTO access_codes (code) VALUES (?)');

  while (generated < count && attempts < maxAttempts) {
    attempts++;

    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      insertStmt.run([code]);
      codes.push(code);
      generated++;
      process.stdout.write('.');
    }
  }

  console.log('\nGenerated codes:');
  codes.forEach(code => console.log(code));
  console.log(`\nTotal: ${codes.length} codes (${attempts} attempts)`);

  db.close();
  process.exit(0);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
