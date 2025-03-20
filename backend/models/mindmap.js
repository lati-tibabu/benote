"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mindmap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: "created_by", as: "user" });
    }
  }
  mindmap.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: DataTypes.STRING,
      workspace_id: DataTypes.UUID,
      created_by: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "mindmap",
    },
  );
  return mindmap;
};
