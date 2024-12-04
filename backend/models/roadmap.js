'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class roadmap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'created_by', as: 'user' });
      this.hasMany(models.mindmap_item, { foreignKey: 'mindmap_id', as: 'mindmap_items'});
    }
  }
  roadmap.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    workpace_id: DataTypes.UUID,
    created_by: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'roadmap',
  });
  return roadmap;
};