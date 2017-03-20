var config      = require('../knexfile.js');  
var env         = process.env.DB_ENV;  
const knex      = require('knex')(config[env]);

module.exports = knex;

knex.migrate.latest([config]);
