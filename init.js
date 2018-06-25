const Knex = require('knex')
const Promise = require('bluebird')
const assert = require('assert')
const lodash = require('lodash')

function createDB(con, name) {
  return con.raw(`CREATE DATABASE IF NOT EXISTS ${name}`).then(done => {
    return con.destroy()
  })
}

var Connection = Promise.method(function (config) {
  return Knex({
    pool: config.pool,
    acquireConnectionTimeout: config.acquireConnectionTimeout || 10000,
    client: config.client || 'mysql',
    connection: {
      user: config.user,
      host: config.host,
      password: config.password,
      database: config.database,
      port: config.port,
      typeCast: function (field, next) {
        // console.log('typecasting...', field.name, field.type)

        function parseJSON(field) {
          var string = null
          try {
            string = field.string()
            string = JSON.parse(string)
          } catch (e) {
            return next()
          }
          return string
        }

        var string = null
        switch (field.type) {
          case 'TINY':
            if (field.length != 1) return next()
            return field.string() == '1'
          case 'BLOB':
            return parseJSON(field)
          case 'JSON':
            return parseJSON(field)
        }
        return next()
      }
    }
  })
})

module.exports = function (config, tables) {
  assert(config.database, 'requires database')
  assert(config.user, 'requires user')
  assert(config.host, 'requires host')
  assert(config.password, 'requires password')

  if (config.client === 'pg') {
    return Connection(config).then(con => {
      if(!tables) return con
      return module.exports.initializeTables(con, tables)
    })
  }

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
    if(!tables) return con
    return module.exports.initializeTables(con, tables).then(tables => {
      tables._con = con
      tables._config = config
      return tables
    })
  })
}

module.exports.initializeTables = function (con, tables) {
  assert(con, 'connection object required.')
  assert(tables, 'tables required.')
  tables = lodash.castArray(tables);
  return Promise.reduce(tables, function (result, table) {
    return table(con).then(function (table) {
      result[table.schema.table] = table;
      return result;
    });
  }, {});
}
