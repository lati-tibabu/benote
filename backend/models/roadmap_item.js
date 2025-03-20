"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class roadmap_item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.roadmap, {
        foreignKey: "roadmap_id",
        as: "roadmap",
      });
    }
  }
  roadmap_item.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      status: DataTypes.STRING,
      roadmap_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "roadmap_item",
    },
  );
  return roadmap_item;
};
