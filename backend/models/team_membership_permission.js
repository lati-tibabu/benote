"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class team_membership_permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.team_membership, {
        foreignKey: "team_membership_id",
        as: "team_membership",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  team_membership_permission.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      team_membership_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: "team_memberships", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      can_create_workspace: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_upload_files: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_participate_discussion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_create_task: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_create_todo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_create_roadmap: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_create_study_plan: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_create_notes: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_share_notes: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "team_membership_permission",
    }
  );
  return team_membership_permission;
};
