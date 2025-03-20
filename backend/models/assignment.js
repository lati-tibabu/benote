"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class assignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: "created_by", as: "user" });
      this.belongsTo(models.classroom, {
        foreignKey: "classroom_id",
        as: "classroom",
      });
      this.hasMany(models.submission, {
        foreignKey: "assignment_id",
        as: "submissions",
      });
    }
  }
  assignment.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      due_date: DataTypes.DATE,
      classroom_id: DataTypes.UUID,
      created_by: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "assignment",
    },
  );
  return assignment;
};
