'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class discussion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'user_id', as: 'user' });
      this.belongsTo(models.team, { foreignKey: 'team_id', as: 'team' });
    }
  }
  discussion.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    user_id: DataTypes.UUID,
    team_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'discussion',
  });
  return discussion;
};