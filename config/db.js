
import { Sequelize } from "sequelize";

const db = new Sequelize('new-sealable','pcs','123456',{
    host: "localhost",
    dialect: "mysql"
});

export default db;
