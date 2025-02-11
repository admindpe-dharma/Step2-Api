
import { Sequelize } from "sequelize";
const db = new Sequelize(process.env.DATABASE,'pcs','123456',{
    host: "localhost",
    dialect: "mysql",
    logging:false
});
db.sync().catch((err)=>{
    console.log({errDb: err});
});
export default db;
