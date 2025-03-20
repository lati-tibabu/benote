"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class team_membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
      this.belongsTo(models.team, {
        foreignKey: "team_id",
        as: "team",
      });
    }
  }
  team_membership.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      team_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teams", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      role: {
        type: DataTypes.ENUM("admin", "member"),
        // defaultValue: 'admin'
      },
      workspaceAccess: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "team_membership",
    },
  );
  return team_membership;
};
