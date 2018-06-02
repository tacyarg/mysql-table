# MYSQL-TABLE
Useful utility for creating and manipulating mysql tables. 
Simplified schema definition, and automatic db/table creation.
Includes a streaming interface.

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

# API

// TODO: add examples

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
### table.schema()
Return the current table schema.
### table.con()
Return the base class knex object.
### table.delete(id)
Delete a row from the table.
### table.drop()
Drop the table entirely.
