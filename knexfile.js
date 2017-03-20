module.exports = {
  test: {
    client: 'postgresql',
    connection: {
      database: 'tripwreck_test'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds/'
    },
    useNullAsDefault: true
  },
  development: {
    client: 'postgresql',
    connection: {
      database: 'tripwreck_dev'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds/'
    },
    useNullAsDefault: true
  }
}

// const knex = require('knex')({
//   client: 'postgresql',
//   connection: {
//     // host     : '127.0.0.1',
//     // port     : 8080,
//     // user     : 'cnc',
//     // password : 'cups',
//     // database : 'tripwreckTest',
//     // host     : process.env.SERVER_IP,
//     // port     : process.env.SERVER_PORT,
//     // user     : process.env.PG_USER,
//     // password : process.env.PG_PASSWORD,
//     // database : process.env.PG_DB_NAME,
//     charset : 'UTF8_GENERAL_CI'
//   }
// });