'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'created_by', as: 'user'});
      this.hasMany(models.discussion, { foreignKey: 'team_id', as: 'discussions' });
    }
  }
  team.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    created_by: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'team',
  });
  return team;
};