'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('chat_histories');
    
    if (!tableDescription.session_id) {
      // Add session_id column as nullable first
      await queryInterface.addColumn('chat_histories', 'session_id', {
        type: Sequelize.UUID,
        allowNull: true,
      });

      // Create sessions for existing records
      // Group existing messages by user and create sessions
      const existingRecords = await queryInterface.sequelize.query(
        'SELECT id, user_id FROM chat_histories ORDER BY user_id, "createdAt"',
        { type: Sequelize.QueryTypes.SELECT }
      );

      const userSessions = {};
      for (const record of existingRecords) {
        if (!userSessions[record.user_id]) {
          userSessions[record.user_id] = require('crypto').randomUUID();
        }
        await queryInterface.sequelize.query(
          'UPDATE chat_histories SET session_id = ? WHERE id = ?',
          { replacements: [userSessions[record.user_id], record.id] }
        );
      }

      // Now make the column not null
      await queryInterface.changeColumn('chat_histories', 'session_id', {
        type: Sequelize.UUID,
        allowNull: false,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('chat_histories');
    
    if (tableDescription.session_id) {
      await queryInterface.removeColumn('chat_histories', 'session_id');
    }
  }
};
