import { Sequelize, Op } from "sequelize";
import db from "../config/db.js";

const { DataTypes } = Sequelize;

const waste = db.define('waste', {
    wasteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey:true
    },
    name: {
        type: DataTypes.STRING,
    }
}, {
    freezeTableName: true,
    timestamps:false
});


export default waste;