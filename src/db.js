const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'bahasa06',
  host: 'localhost',
  port: 5432,
  database: 'ppljserver',
});

module.exports = pool;
