const Knex = require('knex')
const Promise = require('bluebird')
const assert = require('assert')
const lodash = require('lodash')

function createDB(con, name) {
  return con.raw(`CREATE DATABASE IF NOT EXISTS ${name}`)
}

var Connection = Promise.method(function (config) {
  assert(config.user, 'requires user')
  assert(config.host, 'requires host')
  assert(config.password, 'requires password')

  return Knex({
    pool: config.pool || {
      min: 1,
      max: 10
    },
    acquireConnectionTimeout:  config.acquireConnectionTimeout || 10000,
    client: config.client || 'mysql',
    connection: {
      user: config.user,
      host: config.host,
      password: config.password,
      database: config.database,
      port: config.port,
      typeCast: function (field, next) {
        // console.log('typecasting...', field.name, field.type)
        if (field.type === ('BLOB' || 'JSON')) {

          var string = null
          try {
            string = field.string()
            string = JSON.parse(string)
          } catch (e) {
            return next()
          } 
          
          return string
        }
        return next()
      }
    }
  })
})

module.exports = function (config, tables) {
  assert(config.database, 'requires database')

  return Connection({
    user: config.user,
    host: config.host,
    port: config.port,
    password: config.password
  }).then(con => {
    return createDB(con, config.database)
  }).then(con => {
    return Connection(config)
  }).then(con => {
    tables = lodash.castArray(tables);
    return Promise.reduce(tables, function (result, table) {
      return table(con).then(function (table) {
        result[table.schema.table] = table;
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