'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'created_by', as: 'creator'});
      
      this.belongsToMany(models.user, {
        through: 'team_membership',
        foreignKey: 'team_id',
        otherKey: 'user_id',
        as: 'members'
      });

      this.hasMany(models.team_membership, { foreignKey: 'team_id', as: 'memberships' });
      this.hasMany(models.discussion, { foreignKey: 'team_id', as: 'discussions' });
      this.hasMany(models.workspace, { foreignKey: 'belongs_to_team', as: 'workspaces' });
      this.hasMany(models.workspace_membership, { foreignKey: 'team_id', as: 'workspace_memberships' }); 
    }
  }
  team.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    created_by: {
      type:DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'team',
  });
  return team;
};