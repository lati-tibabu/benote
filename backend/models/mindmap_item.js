"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mindmap_item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.mindmap, {
        foreignKey: "mindmap_id",
        as: "mindmap",
      });
    }
  }
  mindmap_item.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: DataTypes.STRING,
      parent_id: DataTypes.UUID,
      mindmap_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "mindmap_item",
    },
  );
  return mindmap_item;
};
