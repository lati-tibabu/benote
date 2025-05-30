'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('team_membership_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      team_membership_id: {
        type: Sequelize.UUID
      },
      can_create_workspace: {
        type: Sequelize.BOOLEAN
      },
      can_upload_files: {
        type: Sequelize.BOOLEAN
      },
      can_participate_discussion: {
        type: Sequelize.BOOLEAN
      },
      can_create_task: {
        type: Sequelize.BOOLEAN
      },
      can_create_todo: {
        type: Sequelize.BOOLEAN
      },
      can_create_roadmap: {
        type: Sequelize.BOOLEAN
      },
      can_create_study_plan: {
        type: Sequelize.BOOLEAN
      },
      can_create_notes: {
        type: Sequelize.BOOLEAN
      },
      can_share_notes: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('team_membership_permissions');
  }
};