'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_team.init({
    user_id: DataTypes.UUID,
    team_id: DataTypes.UUID,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user_team',
    tableName: 'userTeams'
  });
  return user_team;
};