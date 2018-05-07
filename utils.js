const Promise = require('bluebird');
const assert = require('assert')
const lodash = require('lodash');

exports.testParams = function (params) {
  //take all arguments after params, assume they are required props
  lodash.each(Array.prototype.slice.call(arguments, 1), function (prop) {
    assert(lodash.has(params, prop), "Missing required property: " + prop);
  });
  return params;
};

exports.initTable = Promise.method(function (con, schema) {
  assert(con, 'requires rethink connection')
  assert(schema, 'table initialization requires schema with table name')
  assert(schema.table, 'table initialization requires schema with table name')

  var indexes = [];
  
  // create secondary indexes
  if(schema.indices) {
    // default index name "table_field"
    lodash.each(schema.indices, field => {
      indexes.push({ unique: false, fields: [field] })
    });
  }
  
  // create compound indexs
  if(schema.compound){
    // TODO
    // {
    //   name: 'public_by_author',
    //   fields: ['author', 'status']
    // }
  }

  var model = con.define(schema.table, schema.fields, { indexes: indexes });

  return con.sync().then(function () {
    model.schema = schema;
    return model;
  });
})