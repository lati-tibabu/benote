"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class classroom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.assignment, {
        foreignKey: "classroom_id",
        as: "assignments",
      });
      this.belongsTo(models.user, { foreignKey: "teacher_id", as: "teacher" });
      this.belongsToMany(models.user, {
        through: "studentClassrooms",
        foreignKey: "classroom_id",
        otherKey: "student_id",
        as: "students",
      });
      this.hasMany(models.resource, {
        foreignKey: "classroom_id",
        as: "materials",
      });
    }
  }
  classroom.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      teacher_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "classroom",
    }
  );
  return classroom;
};
