const Knex = require('knex')
const Promise = require('bluebird')
const assert = require('assert')
const lodash = require('lodash')

function createDB(con, name) {
  return con.raw(`CREATE DATABASE IF NOT EXISTS ${name}`)
}

var Connection = Promise.method(function (config) {
  if(config.connection) return Knex(config)
  return Knex({
    pool: {
      min: 0,
      max: 5
    },
    acquireConnectionTimeout:  config.acquireConnectionTimeout || 10000,
    client: config.client || 'mysql',
    connection: {
      user: config.user,
      host: config.host,
      password: config.password,
      database: config.database,
      port: config.port
    }
  })
})

module.exports = function (config, tables) {
  assert(config.database, 'requires database')

  config.typeCast = function (field, next) {
    if (field.type === 'JSON') {
      return (JSON.parse(field.string()))
    }
    return next()
  }

  return Connection({
    user: config.user,
    host: config.host,
    password: config.password
  }).then(con => {
    return createDB(con, config.database)
  }).then(con => {
    return Connection(config)
  }).then(con => {
    tables = lodash.castArray(tables);
    return Promise.reduce(tables, function (result, table) {
      return table(con).then(function (methods) {
        result[table.schema.table] = methods;
        return result;
      });
    }, {
      _con: con,
      _config: config
    });
  })
}

// module.exports.createTable = function(con, name, schema) {
//   return con.schema.createTable(TABLE_NAME, SCHEMA)
//     .then(function(){
//       return con
//     }).catch(err => { 
//       return con
//     })
// }