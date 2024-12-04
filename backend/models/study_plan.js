'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class study_plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.course, { foreignKey: 'study_plan_id', as: 'courses' });
      this.belongsTo(models.user, { foreignKey: 'user_id', as: 'user' });
    }
  }
  study_plan.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    user_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'study_plan',
  });
  return study_plan;
};