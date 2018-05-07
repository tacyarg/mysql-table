# MYSQL-TABLE
simplified mysql lib allowing rapid application development.

# API

## Table (con,schema)
```js
var Table = require('rethink-table').Table 

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