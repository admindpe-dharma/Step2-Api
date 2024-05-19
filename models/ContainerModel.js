import { Sequelize, Op } from "sequelize";
import db from "../config/db.js";
import Waste from "./WasteModel.js";

const { DataTypes } = Sequelize;

const container = db.define('container', {
    containerid: {
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


Waste.hasMany(container, { foreignKey: 'Idwaste', as: 'container' });
container.belongsTo(Waste, { foreignKey: 'Idwaste', as: 'waste' });

export default container;