# MYSQL-TABLE
simplified mysql lib allowing rapid application development.

## Initialization
```js
var { Table, Init } = require('mysql-table');

const config = {
    database: 'series',
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root'
}

function UserTable(con) {
    var schema = {
        table: 'users',
        fields: {
            id: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false
            },
            username: Sequelize.STRING
        },
        indices: ['username']
    }


    return Table(con, schema).then(table => {

        table.setUsername = function (id, username) {
            return table.update(id, { username })
        }

        return table;
    })
};

Init(config, UserTable).then(tables => {
    // do things with db
})
```

# API

## Table & Schema

```js
const Sequelize = require('sequelize');
const Table = require('mysql-table').Table;

var schema = {
  table: 'bets',
  fields: {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    userid: Sequelize.STRING
  },
  indices: ['userid']
}

Table(con,schema).then(function(table){
  //your table object
})
```

## Table Methods
All return promises or in some cases a stream.

### table.upsert(fieldObj)
Upsert row.
### table.get(id)
Get a row from the table, throws error if not found.
### table.has(id)
Check if a row exisits.
### table.getBy(field, value)
Find rows matching the given field and value.
### table.update(id, fieldsObj)
Update a given row.
### table.readStream()
Stream a table.