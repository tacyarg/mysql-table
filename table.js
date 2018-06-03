const Promise = require('bluebird')
const assert = require('assert')
const lodash = require('lodash')
const utils = require('./utils');

module.exports = function (con, schema) {
  assert(con, 'Table requires rethink db connection')
  assert(schema, 'Table requires schema object')

  return utils.initTable(con, schema).then(con => {

    var table = function () {
      return con(schema.table)
    }

    table.schema = schema
    table.con = con

    table.alter = function (schema) {
      return utils.alterTable(con, schema)
    }

    table.filter = function (options) {
      return table().select('*').where(options)
    }

    table.getBy = function (index, id) {
      return table().select('*').where(index, id)
    }

    table.get = function (id) {
      return table.getBy('id', id).first()
    }

    table.getAll = function (ids) {
      return table().select('*').where('id', ids)
    }

    table.has = function (id) {
      return table.get(id).then(row => {
        return !!row
      })
    }

    table.hasBy = function (index, id) {
      return table.getBy(index, id).first().then(row => {
        return !!row
      })
    }

    table.update = function (id, object) {
      object = lodash.omit(object, ['id'])
      return table().where('id', id).update(object).then(function(){
        return object
      })
    }

    table.create = function (object) {
      return table().insert(object).then(function(){
        return object
      })
    }

    table.upsert = function (object) {
      return table.create(object).catch(err => {
        return table.update(object.id, object)
      })
    }

    table.list = function () {
      return table()
    }

    table.readStream = function () {
      return table.list().stream();
    }

    table.streamify = function (query) {
      assert(query, 'requires driver query')
      return query.stream()
    }

    table.delete = function (id) {
      return table.get(id).del().then(result => {
        return true
      })
    }

    table.drop = function () {
      return con.schema.dropTable(schema.table)
    }

    // helper queries

    table.count = function () {
      return utils.count(table());
    }

    table.paginate = function (page, limit) {
      return utils.paginate(table(), page, limit);
    }

    return table;
  })

}