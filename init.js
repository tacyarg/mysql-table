const Mysql = require('mysql2');
const Sequelize = require('sequelize');
const lodash = require('lodash');
const Promise = require('bluebird');
const assert = require('assert');

const Table = require('./table');

function createConnection(host, user, pass, db, dialect) {
    return new Sequelize(db, user, pass, {
        host: host,
        dialect: dialect || 'mysql',
        pool: {
            max: 5,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: false
        },
        logging: false
    }
    );
}

// basic implementation for now...
module.exports = Promise.method(function (config, tables) {
    assert(config, 'requires mysql connection configuration');
    assert(config.database, 'requires database to connect');

    var sequelize = createConnection(config.host, config.user, config.password, config.dialect);
    //have to hack in db creation...
    return sequelize.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`, { raw: true }).then(function () {
        var con = createConnection(config.host, config.user, config.password, config.database, config.dialect)
        // include seccondary mysql lib for lower level calls.
        con.mysql = Mysql.createConnection(config);

        // initialize models
        tables = lodash.castArray(tables);
        return Promise.reduce(tables, function (result, table) {
            return table(con).then(function (table) {
                result[table.schema.table] = table;
                return result;
            });
        }, { _con: con, _config: config });
    });
});

