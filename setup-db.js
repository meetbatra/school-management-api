const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false }
    });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Drop index if exists by querying information_schema first
    const [indexes] = await conn.query(`
      SELECT INDEX_NAME 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'schools' AND INDEX_NAME = 'idx_location'
    `, [process.env.DB_NAME]);

    if (indexes.length > 0) {
      await conn.query('DROP INDEX idx_location ON schools');
    }
    
    await conn.query('CREATE INDEX idx_location ON schools (latitude, longitude)');

    const [rows] = await conn.query('SHOW TABLES');
    console.log('Tables in DB:', rows);

    const [cols] = await conn.query('DESCRIBE schools');
    console.log('schools columns:', cols);

    await conn.end();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
