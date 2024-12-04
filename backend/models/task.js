'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'assigned_to', as: 'user' });
      this.belongsTo(models.workspace, { foreignKey: 'workspace_id', as: 'workspace' });
    }
  }
  task.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    status: DataTypes.STRING,
    due_date: DataTypes.DATE,
    assigned_to: DataTypes.UUID,
    workspace_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'task',
  });
  return task;
};