"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, {
        foreignKey: "receiver_id",
        as: "receiver",
      });
      this.belongsTo(models.user, { foreignKey: "sender_id", as: "sender" });
    }
  }
  notification.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      type: {
        type: DataTypes.ENUM(
          "invitation",
          "system",
          "recommendation",
          "info",
          "warning",
          "error",
          "success",
          "study_plan"
        ),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      action: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      receiver_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        validate: {
          notEmpty: true,
        },
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "notification",
    }
  );
  return notification;
};
