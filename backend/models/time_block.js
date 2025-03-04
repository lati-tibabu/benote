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
      this.belongsTo(models.workspace, {foreignKey: 'workspace_id', as: 'workspace'});
      this.belongsTo(models.user, {foreignKey: 'user_id', as: 'user'});
      this.belongsTo(models.study_plan, {foreignKey: 'study_plan_id', as: 'study_plan'});
    }
  }
  time_block.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }, 
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'workspaces',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    job: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    study_plan_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'study_plans',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },

  }, {
    sequelize,
    modelName: 'time_block',
    indexes: [
      {
        unique: true,
        fields: ['title', 'user_id']
      }
    ]
  });
  return time_block;
};