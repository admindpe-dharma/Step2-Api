import { Sequelize, Op } from "sequelize";
import db from "../config/db.js";

const { DataTypes } = Sequelize;

const waste = db.define('waste', {
    Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey:true
    },
    name: {
        type: DataTypes.STRING,
    },
    scales: {
        type: DataTypes.STRING,
    },
    handletype:{
        type: DataTypes.STRING
    },
    step1: {
     type: DataTypes.BOOLEAN
    },
}, {
    freezeTableName: true,
    timestamps:false
});


export default waste;