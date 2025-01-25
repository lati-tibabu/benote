'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class workspace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'created_by', as: 'user' });
      this.belongsTo(models.team, { foreignKey: 'belongs_to_team', as: 'team' });
      this.hasMany(models.task, { foreignKey: 'workspace_id', as: 'tasks' });
    }
  }
  workspace.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    emoji: {
      type: DataTypes.STRING,
      defaultValue: '🗂️'
    },
    created_by: {
      type:DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    belongs_to_team: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'

    },
  }, {
    sequelize,
    modelName: 'workspace',
  });
  return workspace;
};