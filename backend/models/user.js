'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.workspace, { foreignKey: 'owned_by', as: 'workspace' });
      this.belongsToMany(models.workspace, {
        through: 'workspace_membership', 
        foreignKey: 'user_id', 
        otherKey: 'workspace_id', 
        as: 'workspaces'
      });

      this.belongsToMany(models.team, {
        through: 'team_membership',
        foreignKey: 'user_id',
        otherKey: 'team_id',
        as: 'teams'
      });

      this.hasMany(models.team, { foreignKey: 'created_by', as: 'team' });
      this.hasMany(models.roadmap, { foreignKey: 'created_by', as: 'roadmaps' });
      this.hasMany(models.mindmap, { foreignKey: 'created_by', as: 'mindmaps' });
      this.hasMany(models.classroom, { foreignKey: 'teacher_id', as: 'classrooms' });
      
      this.belongsToMany(models.classroom, {
        through: 'studentClassrooms',
        foreignKey: 'student_id',
        otherKey: 'classroom_id',
        as: 'enrolledClassrooms',
      });

      // this.belongsToMany(models.team, {
      //   through: 'userTeams',
      //   foreignKey: 'user_id',
      //   otherKey: 'team_id',
      //   as: 'inTeams'
      // });

      this.belongsToMany(models.badge, {
        through: 'userBadges',
        foreignKey: 'user_id',
        otherKey: 'badge_id',
        as: 'wonBadges',
      });

      this.hasMany(models.discussion, { foreignKey: 'user_id', as: 'discussions' });
      this.hasMany(models.study_plan, { foreignKey: 'user_id', as: 'study_plans' });
      this.hasMany(models.submission, { foreignKey: 'submitted_by', as: 'submittedSubmissions' });
      this.hasMany(models.submission, { foreignKey: 'graded_by', as: 'gradedSubmissions' });
      this.hasMany(models.task, { foreignKey: 'assigned_to', as: 'tasks'});
    }
  }
  
  user.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
    tableName: 'users',
  });
  return user;
};