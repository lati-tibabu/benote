"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class submission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.assignment, {
        foreignKey: "assignment_id",
        as: "assignment",
      });
      this.belongsTo(models.user, {
        foreignKey: "submitted_by",
        as: "student",
      });
      this.belongsTo(models.user, { foreignKey: "graded_by", as: "teacher" });
    }
  }
  submission.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      assignment_id: DataTypes.UUID,
      submitted_by: {
        type: DataTypes.UUID,
        references: { model: "users", key: "id", as: "student" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      description: DataTypes.TEXT,
      file_path: DataTypes.STRING,
      submitted_at: DataTypes.DATE,
      graded_by: DataTypes.UUID,
      grade: DataTypes.STRING,
      feedback: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "submission",
    }
  );
  return submission;
};
