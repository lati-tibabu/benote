"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class study_plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.course, {
        foreignKey: "study_plan_id",
        as: "courses",
      });
      this.hasMany(models.time_block, {
        foreignKey: "study_plan_id",
        as: "timeBlocks",
      });
      this.belongsTo(models.user, { foreignKey: "user_id", as: "user" });
    }
  }
  study_plan.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
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
      workspace_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "workspaces",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "study_plan",
    },
  );

  study_plan.beforeCreate(async (newPlan, options) => {
    // const validDates = newPlan.start_date >= new Date().toISOString() && newPlan.end_date >= new Date().toISOString();

    // if(!validDates){
    //   throw new Error("Start and end date must be in the future");
    // }

    const correctDates = newPlan.start_date <= newPlan.end_date;

    if (!correctDates) {
      throw new Error("End date must be after start date");
    }

    const overlappingPlan = await study_plan.findOne({
      where: {
        user_id: newPlan.user_id,
        [Op.or]: [
          {
            start_date: {
              [Op.between]: [newPlan.start_date, newPlan.end_date],
            },
          },
          {
            end_date: { [Op.between]: [newPlan.start_date, newPlan.end_date] },
          },
          {
            start_date: { [Op.lte]: newPlan.start_date },
            end_date: { [Op.gte]: newPlan.end_date },
          },
        ],
      },
    });
    if (overlappingPlan) {
      throw new Error("Study plan overlaps with another study plan");
    }
  });

  study_plan.beforeUpdate(async (updatedPlan, options) => {
    const validDates =
      updatedPlan.start_date >= new Date().toISOString() &&
      updatedPlan.end_date >= new Date().toISOString();

    if (!validDates) {
      throw new Error("Start and end date must be in the future");
    }

    const correctDates = updatedPlan.start_date <= updatedPlan.end_date;

    if (!correctDates) {
      throw new Error("End date must be after start date");
    }

    const overlappingPlan = await study_plan.findOne({
      where: {
        user_id: updatedPlan.user_id,
        id: { [sequelize.Op.not]: updatedPlan.id },
        [Op.or]: [
          {
            start_date: {
              [Op.between]: [updatedPlan.start_date, updatedPlan.end_date],
            },
          },
          {
            end_date: {
              [Op.between]: [updatedPlan.start_date, updatedPlan.end_date],
            },
          },
          {
            start_date: { [Op.lte]: updatedPlan.start_date },
            end_date: { [Op.gte]: updatedPlan.end_date },
          },
        ],
      },
    });
    if (overlappingPlan) {
      throw new Error("Study plan overlaps with another study plan");
    }
  });

  return study_plan;
};
