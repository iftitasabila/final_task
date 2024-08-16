const { Sequelize } = require("sequelize");

const db = new Sequelize({
    username: 'postgres',
    host: 'localhost',
    dialect: 'postgres',
    database: 'b56final_task',
    password: 'postgres123',
    port: 5432,
    schema: 'public'
});

module.exports = db;