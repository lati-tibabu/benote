"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class roadmap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: "created_by", as: "user" });
      this.hasMany(models.roadmap_item, {
        foreignKey: "roadmap_id",
        as: "roadmap_items",
      });

      this.belongsTo(models.workspace, {
        foreignKey: "workspace_id",
        as: "workspace",
      });
    }
  }
  roadmap.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Roadmap item",
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      workspace_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "workspaces",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "roadmap",
    }
  );
  return roadmap;
};
