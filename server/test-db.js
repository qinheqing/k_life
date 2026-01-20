const { db } = require('./database');
console.log('Database path:', db.filename);
db.all('SELECT * FROM access_codes', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Rows:', rows.length);
  }
  db.close();
});
