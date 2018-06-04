const Promise = require('bluebird')
const assert = require('assert')
const lodash = require('lodash')
const utils = require('./utils');
const uuid = require('uuid/v4')

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
      assert(schema, 'requires schema')
      return utils.alterTable(con, schema)
    }

    table.filter = function (options) {
      assert(options, 'requires options')
      return table().select('*').where(options)
    }

    table.between = function(index, start, end) {
      assert(index, 'requres column index')
      assert(start, 'requires start')
      assert(end, 'requires end')
      return table().havingBetween('index', [start, end])
    }

    table.getBy = function (index, id) {
      assert(index, 'requres column index')
      return table().select('*').where(index, id)
    }

    table.get = function (id) {
      assert(id, 'requires id')
      return table.getBy('id', id).first().then(res => {
        assert(res, `no record found matching id: ${id}`)
        return res
      })
    }

    table.getAll = function (ids) {
      assert(ids, 'requires ids')
      ids = lodash.castArray(ids)
      return Promise.mapSeries(ids, table.get)
    }

    table.has = function (id) {
      assert(id, 'requires id')
      return table.get(id).then(row => {
        return true
      }).catch(err => {
        return false
      })
    }

    table.hasBy = function (index, id) {
      assert(index, 'requres column index')
      assert(id, 'requires id')
      return table.getBy(index, id).first().then(row => {
        return !!row
      })
    }

    table.update = function (id, object) {
      assert(id, 'requires id')
      assert(object, 'requires object')
      object = lodash.omit(object, 'id')
      return table().where('id', id).update(object).then(function(){
        object.id = id
        return object
      })
    }

    table.create = function (object) {
      assert(object, 'requires object to create')
      if(!object.id) object.id = uuid()
      return table().insert(object).then(function(){
        return object
      })
    }

    table.upsert = function (object) {
      assert(object, 'requires object to upsert')
      assert(lodash.isObject(object), 'requires object to upsert')
      return table.create(object).then(result => {
        return object
      }).catch(err => {
        return table.update(object.id, object)
      })
    }

    table.list = function () {
      return table()
    }

    table.readStream = function () {
      return table().stream();
    }

    table.streamify = function (query) {
      assert(query, 'requires driver query')
      return query.stream()
    }

    table.delete = function (id) {
      assert(id, 'requires id')
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