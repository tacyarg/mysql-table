# MYSQL-TABLE
simplified mysql lib allowing rapid application development.

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

### table.get
### table.has
### table.getBy
### table.update
### table.readStream