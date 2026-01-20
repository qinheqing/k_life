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
const existingCodes = new Set();

db.all('SELECT code FROM access_codes', (err, rows) => {
  if (err) {
    console.error('Error fetching existing codes:', err);
    process.exit(1);
  }

  rows.forEach(row => existingCodes.add(row.code));
  generateCodes();
});

function generateCodes() {
  let generated = 0;
  let attempts = 0;
  const maxAttempts = count * 100;

  const generateSingle = () => {
    while (generated < count && attempts < maxAttempts) {
      attempts++;

      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      if (!existingCodes.has(code)) {
        existingCodes.add(code);
        codes.push(code);

        db.run('INSERT INTO access_codes (code) VALUES (?)', [code], (err) => {
          if (err) {
            console.error('Error inserting code:', err);
          }
        });

        generated++;
        process.stdout.write('.');
      }
    }

    console.log('\nGenerated codes:');
    codes.forEach(code => console.log(code));
    console.log(`\nTotal: ${codes.length} codes (${attempts} attempts)`);

    db.close();
    process.exit(0);
  };

  generateSingle();
}
