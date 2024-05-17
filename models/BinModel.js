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
    Idwaste: {
        type: DataTypes.INTEGER
    },
    max_weight: {
        type:DataTypes.DECIMAL,
    }
}, {
    freezeTableName: true,
    timestamps:false
});

waste.hasMany(bin, { foreignKey: 'Idwaste', as: 'bin' });
bin.belongsTo(waste, { foreignKey: 'Idwaste', as: 'waste' });

export default bin;