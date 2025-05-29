// models/announcement.js
module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define(
    "announcement",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      classroom_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );
  Announcement.associate = (models) => {
    Announcement.belongsTo(models.user, {
      foreignKey: "teacher_id",
      as: "teacher",
    });
    Announcement.belongsTo(models.classroom, {
      foreignKey: "classroom_id",
      as: "classroom",
    });
  };
  return Announcement;
};
