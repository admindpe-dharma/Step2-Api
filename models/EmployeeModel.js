import { Sequelize, Op } from "sequelize";
import db from "../config/db.js";

const { DataTypes } = Sequelize;

const employee = db.define('employee', {
    badgeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    station:{
        type:DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING,
    },
    IN:{
        type: DataTypes.BOOLEAN
    },
    OUT:{
        type: DataTypes.BOOLEAN        
    }
}, {
    freezeTableName: true
});

export default employee;