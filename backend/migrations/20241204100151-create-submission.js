'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('submissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.UUID
      },
      assignment_id: {
        type: Sequelize.UUID
      },
      submitted_by: {
        type: Sequelize.UUID
      },
      file_path: {
        type: Sequelize.STRING
      },
      submitted_at: {
        type: Sequelize.DATE
      },
      graded_by: {
        type: Sequelize.UUID
      },
      grade: {
        type: Sequelize.STRING
      },
      feedback: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('submissions');
  }
};