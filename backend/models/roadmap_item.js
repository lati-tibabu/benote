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
        as: "roadmaps",
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
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: true },
      roadmap_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "roadmaps",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "roadmap_item",
    }
  );
  return roadmap_item;
};
