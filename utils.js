const Promise = require('bluebird')
const assert = require('assert')
const lodash = require('lodash')
const highland = require('highland');
const utils = require('./utils');

function createTable(con, schema) {
  assert(schema.fields, 'requires the fields you wish to create!')
  return con.schema.createTable(schema.table, schema.fields).then(res => {
    return con
  })
}

function alterTable(con, schema) {
  assert(schema.fields, 'requires the fields you wish to create!')
  return con.schema.table(schema.table, schema.fields).then(res => {
    return con
  })
}

module.exports.initTable = function (con, schema) {
  assert(con, 'requires rethink connection')
  assert(schema, 'table initialization requires schema with table name')
  assert(schema.table, 'table initialization requires schema with table name')

  return con.schema.hasTable(schema.table).then(function (result) {
    if (result) return con
    return createTable(con, schema)
  })
}

module.exports.alterTable = function (con, schema) {
  assert(con, 'requires rethink connection')
  assert(schema, 'table initialization requires schema with table name')
  assert(schema.table, 'table initialization requires schema with table name')

  return con.schema.hasTable(schema.table).then(function (result) {
    return result ? alterTable(con, schema) : createTable(con, schema);
  })
}

module.exports.count = function (query) {
  assert(query, 'driver query required.')
  return query.clone().count('* as count').first().then(result => result.count).catch(err => { return 0 })
}

module.exports.paginate = function (query, page, limit) {
  assert(query, 'driver query required.')
  page = page || 1
  limit = limit || 50

  if (page < 1) page = 1
  var offset = (page - 1) * limit

  return Promise.all([
    module.exports.count(query),
    query.offset(offset).limit(limit)
  ]).spread(function (count, rows) {
    return {
      currentPage: page,
      perPage: limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      data: rows
    }
  })
}

module.exports.stringifySchema = function (object, fields) {
  var row = lodash.cloneDeep(object)
  lodash.each(fields, key => {
    if(!row[key]) return
    if(!lodash.isObject(row[key])) return 
    row[key] = JSON.stringify(row[key])
  })
  return row
}