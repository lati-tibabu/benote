const express = require('express');
const router = express.Router();
const { chat_history } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new chat session
router.post('/session', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title = 'New Chat' } = req.body;

    // Create a new session by inserting a placeholder message
    const newSession = await chat_history.create({
      user_id: userId,
      session_id: require('crypto').randomUUID(), // Generate new session ID
      message: 'Chat session started',
      sender: 'system'
    });

    res.status(201).json({ sessionId: newSession.session_id, title });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Save a chat message to a session
router.post('/save', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const { message, sender, sessionId } = req.body;
    const userId = req.user.id;

    const newMessage = await chat_history.create({
      user_id: userId,
      session_id: sessionId,
      message,
      sender
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ error: 'Failed to save chat message' });
  }
});

// Get all chat sessions for the user
router.get('/sessions', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get sessions with message counts
    const sessions = await chat_history.findAll({
      where: { user_id: userId },
      attributes: [
        'session_id',
        [require('sequelize').fn('MIN', require('sequelize').col('createdAt')), 'createdAt'],
        [require('sequelize').fn('MAX', require('sequelize').col('updatedAt')), 'updatedAt'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'messageCount']
      ],
      group: ['session_id'],
      order: [[require('sequelize').fn('MAX', require('sequelize').col('updatedAt')), 'DESC']],
      raw: true
    });

    // Get titles for each session
    const sessionsWithTitles = await Promise.all(
      sessions.map(async (session) => {
        const titleMessage = await chat_history.findOne({
          where: {
            user_id: userId,
            session_id: session.session_id,
            sender: 'system',
            message: { [require('sequelize').Op.like]: 'SESSION_TITLE:%' }
          },
          order: [['createdAt', 'DESC']]
        });

        let title = `Chat ${new Date(session.createdAt).toLocaleDateString()}`;
        if (titleMessage) {
          title = titleMessage.message.replace('SESSION_TITLE:', '');
        }

        return {
          ...session,
          title
        };
      })
    );

    res.json(sessionsWithTitles);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Get chat history for a specific session
router.get('/:sessionId', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const messages = await chat_history.findAll({
      where: { user_id: userId, session_id: sessionId },
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Delete a chat session
router.delete('/session/:sessionId', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    await chat_history.destroy({
      where: { user_id: userId, session_id: sessionId }
    });

    res.json({ message: 'Chat session deleted' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

// Delete all chat sessions for the user
router.delete('/sessions', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    await chat_history.destroy({
      where: { user_id: userId }
    });

    res.json({ message: 'All chat sessions deleted' });
  } catch (error) {
    console.error('Error deleting all chat sessions:', error);
    res.status(500).json({ error: 'Failed to delete all chat sessions' });
  }
});

// Update chat session name
router.put('/session/:sessionId', authMiddleware.authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { title } = req.body;

    // For now, we'll store the title in a simple way
    // In a more complex implementation, you might want a separate sessions table
    // For this implementation, we'll use a special system message to store the title
    const titleMessage = await chat_history.findOne({
      where: { 
        user_id: userId, 
        session_id: sessionId,
        sender: 'system',
        message: { [require('sequelize').Op.like]: 'SESSION_TITLE:%' }
      }
    });

    if (titleMessage) {
      // Update existing title
      await titleMessage.update({ message: `SESSION_TITLE:${title}` });
    } else {
      // Create new title message
      await chat_history.create({
        user_id: userId,
        session_id: sessionId,
        message: `SESSION_TITLE:${title}`,
        sender: 'system'
      });
    }

    res.json({ message: 'Session title updated', title });
  } catch (error) {
    console.error('Error updating session title:', error);
    res.status(500).json({ error: 'Failed to update session title' });
  }
});

module.exports = router;