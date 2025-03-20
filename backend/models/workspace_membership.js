"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class workspace_membership extends Model {
    static associate(models) {
      this.belongsTo(models.workspace, {
        foreignKey: "workspace_id",
        as: "workspace",
      });
      this.belongsTo(models.user, { foreignKey: "user_id", as: "user" });
      this.belongsTo(models.team, { foreignKey: "team_id", as: "team" });
    }
  }

  workspace_membership.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      workspace_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "workspaces", key: "id" },
        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      role: {
        type: DataTypes.ENUM("admin", "member"),
        defaultValue: "member",
      },
      team_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "teams", key: "id" },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "workspace_membership",
      tableName: "workspace_memberships",
    },
  );

  return workspace_membership;
};
