"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class discussion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: "user_id", as: "user" });
      this.belongsTo(models.team, { foreignKey: "team_id", as: "team" });
      this.belongsTo(models.discussion, {
        foreignKey: "discussion_id",
        as: "reply",
      });
      this.hasMany(models.discussion, {
        foreignKey: "discussion_id",
        as: "replies",
      });
      // this.belongsToMany(models.user, {
      //   foreignKey: "discussion_id",
      //   as: "likes",
      // });
    }
  }
  discussion.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
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
      discussion_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "discussions",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      // likes: {
      //   type: DataTypes.UUID,
      //   allowNull: true,
      //   defaultValue: 0,
      //   references: {
      //     model: "users",
      //     key: "id",
      //   },
      //   onDelete: "CASCADE",
      //   onUpdate: "CASCADE",
      // },
    },
    {
      sequelize,
      modelName: "discussion",
    }
  );
  return discussion;
};
