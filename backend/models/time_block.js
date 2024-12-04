'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class time_block extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  time_block.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    user_id: DataTypes.UUID,
    workspace_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'time_block',
  });
  return time_block;
};