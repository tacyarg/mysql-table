# MYSQL-TABLE
> Useful utility for creating and manipulating mysql tables using [KnexJS](https://knexjs.org/#Schema-Building).
> Works with any db knex supports: Postgres, MSSQL, MySQL, MariaDB, SQLite3, Oracle, and Amazon Redshift.
> Simplified schema definition, and automatic db/table creation.
> Includes a streaming interface.

## Initialization
```js
var { Table, Init, Utils } = require('mysql-table');

const config = {
    database: 'series',
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'some_secret_password'
}

function UserTable(con) {
    var SCHEMA = {
      table: 'series',
      fields: function (schema) {
        // columnss
        schema.uuid('id').notNullable().primary()
        schema.integer('rank')
        schema.json('meta')
    
        // indexs
        schema.index('rank')
      }
    }

    return Table(con, schema).then(table => {

        table.setUsername = function (id, username) {
            return table.update(id, { username })
        }

        return table;
    })
};

Init(config, [
  UserTable
]).then(tables => {
    // do things with db
})
```

# Data Models

## Config Object
Object containing connection options or knex config object.

```js
const config = {
    database: 'epic_application',
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'some_secret_password'
}
```

## Schema Object
* `table` - the table name
* `fields` - function using the knex schema building tools. [Referance Docs](https://knexjs.org/#Schema-Building)

```js
var SCHEMA = {
    table: 'users',
    fields: function (schema) {
        // columnss
        schema.uuid('id').notNullable().primary()
        schema.integer('rank')
        schema.json('meta')

        // indexs
        schema.index('rank')
    }
}
```

# API INTERFACE

## Init(config, tables)
Creates the database and initalizes connection pool. Also creates and initalizes table schemas.
> returns object keyed by table name each containing [Table Methods](#table-methods) for the table.

* `config` - configuration and database connection options.
* `tables` - single or array of table definitions.

```js
const config = {...}

// SINGLE DEFINITION
var tables = require('./models/users')
// OR, ARRAY OF DEFINITIONS
var tables = [
    require('./models/users'),
    ...
]

Init(config, tables).then(tables => {
    // do things with db tables...
})
```

## Table(con, schema) & Utils
Creates table and initalizes your defined schema, will ignore if the table is already created.
> Returns object of [Table Methods](#table-methods).

* `con` - Database connection from the init method.
* `schema` - [Schema Object](#schema-object)

```js
module.exports = function(con) {

    var {Table, Utils} = require('mysql-table')
    var schema = {...}

    return Table(con, schema).then(table => {

        // cool custom methods
        table.setUsername = function (id, username) {
            return table.update(id, { username })
        }

        table.getOnlinePaginated = function (page, limit) {
            var query = table.getBy('online', true)
            return Utils.paginate(query, page, limit)
        }

        return table;
    })
}
```

## Table Methods

### table.alter(schema)
Modify the table schema.
### table.get(id)
Get a single row from the table.
### table.getAll(ids)
Get many rows from the table.
### table.getBy(field, id)
Get rows from the table by column.
### table.has(id)
Check table for existing row using id.
### table.hasBy(field, id)
Check table for existing row using column and id.
### table.update(id, fieldsObj)
Update a row.
### table.upsert(fieldsObj)
Update an object if key exists, or insert new object otherwise.
### table.create(fieldsObj)
Create a new row in the table, will throw error if another row is exisitng with the same id.
### table.filter(filterObj)
Filter the table.
### table.count()
Count all rows in the table.
### table.readStream()
Stream the table.
### table.streamify(query)
Streamify a query.
### table.list()
List all rows in the table.
### table.delete(id)
Delete a row from the table.
### table.drop()
Drop the table entirely.

### table.schema
Return the current table schema.
### table.con
Return the base class knex object.
