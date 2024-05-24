import { Sequelize, Op } from "sequelize";
import db from "../config/db.js";
import waste from "./WasteModel.js";

const { DataTypes } = Sequelize;

const bin = db.define('bin', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
    },
    weight: {
        type: DataTypes.DECIMAL,
    },
    IdWaste: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    max_weight: {
        type:DataTypes.DECIMAL,
    },
    name_hostname: {
        type:DataTypes.STRING,
    }

}, {
    freezeTableName: true,
    timestamps:false
});

waste.hasMany(bin, { foreignKey: 'IdWaste', as: 'bin' });
bin.belongsTo(waste, { foreignKey: 'IdWaste', as: 'waste' });

export default bin;