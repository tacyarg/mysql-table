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
    table.utils = utils

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
      return Promise.map(ids, table.get, {
        concurrency: 20
      })
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

    table.update = function (id, object, fields) {
      assert(id, 'requires id')
      assert(lodash.isObject(object), 'requires object')
      object = lodash.omit(object, 'id')

      var stringified = null
      if(fields) {
        fields = lodash.castArray(fields)
        stringified = utils.stringifySchema(object, fields)
      }
      return table().where('id', id).update(stringified || object).then(function(){
        object.id = id
        return object
      })
    }

    table.create = function (object, fields) {
      assert(lodash.isObject(object), 'requires object')
      if(!object.id) object.id = uuid()

      var stringified = null
      if(fields) {
        fields = lodash.castArray(fields)
        stringified = utils.stringifySchema(object, fields)
      }
      
      return table().insert(stringified || object).then(function(res){
        return object
      })
    }

    table.upsert = function (object, fields) {
      assert(lodash.isObject(object), 'requires object to upsert')
      return table.create(object, fields).catch(err => {
        return table.update(object.id, object, fields)
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
      return table.getBy('id', id).first().del().then(result => {
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