"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class resource extends Model {
    static associate(models) {
      // Associate with user (uploader)
      this.belongsTo(models.user, {
        foreignKey: "uploader_id",
        as: "uploader",
      });

      // Associate with team
      this.belongsTo(models.team, {
        foreignKey: "team_id",
        as: "team",
      });
    }
  }

  resource.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      uploader_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      team_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "teams",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "resource",
    }
  );

  return resource;
};
