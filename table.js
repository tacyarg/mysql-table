var Promise = require('bluebird')
var assert = require('assert')
var lodash = require('lodash')
var highland = require('highland');
const utils = require('./utils');

module.exports = function (con, schema) {
  assert(con, 'Table requires rethink db connection')
  assert(schema, 'Table requires schema object')

  return utils.initTable(con, schema).then(table => {
    var methods = {}

    methods.schema = schema
    methods.con = con

    methods.upsert = Promise.method(function (value) {
      return table.upsert(value);
    });

    methods.get = Promise.method(function (id) {
      assert(id, 'id required to find')
      return table.findById(id).then(row => {
        if (row) return row;
        else {
          throw new Error(`No record found: ${id}`);
        }
      })
    })

    methods.has = Promise.method(function (id) {
      return table.findById(id).then(row => {
        return row === null ? false : true;
      })
    })

    methods.getBy = Promise.method(function (key, value) {
      assert(key, 'requres key field')
      assert(value, 'requires value to match')

      // uhm lol..
      var obj = {};
      obj[key] = value;

      return table.findAll({
        where: obj
      });
    });

    methods.update = Promise.method(function (key, values) {
      assert(key, 'requres id key')
      assert(values, 'requires values to update')
      return table.update(values, {
        where: {
          id: key
        }
      })
    })

    methods.paginate = Promise.method(function (index, page, limit) {
      assert(index, 'requres field index')

      page = page || 1
      limit = limit || 100

      return Promise.all([
        table.count(),
        table.findAll({
          order: [
            [index, 'ASC']
          ],
          offset: (page - 1) * limit,
          limit: limit
        })
      ]).spread(function (count, rows) {
        return {
          currentPage: page,
          perPage: limit,
          total: count,
          totalPages: Math.ceil(count / perPage),
          data: rows
        }
      })
    })

    // fucking sequelize..
    methods.readStream = Promise.method(function () {
      return con.mysql.query(`SELECT * FROM ${table.schema.table}`).stream()
    })

    return methods;
  })
}