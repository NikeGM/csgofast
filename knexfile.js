require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: {
    connectionString: process.env.POSTGRES_URL,
  },
};
