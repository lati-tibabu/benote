"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class todo_item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.todo, { foreignKey: "todo_id", as: "todo" });
    }
  }
  todo_item.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: DataTypes.STRING,
      status: DataTypes.STRING,
      todo_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "todo_item",
    },
  );
  return todo_item;
};
